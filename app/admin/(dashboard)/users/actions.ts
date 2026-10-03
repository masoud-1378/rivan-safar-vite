'use server';

import { revalidatePath } from 'next/cache';
import { getDb, type AppDb } from '@/db/client';
import { adminUsers, auditLogs } from '@/db/schema';
import { and, eq, isNull } from 'drizzle-orm';
import { requireAdmin, createAdminDb } from '@/src/lib/admin-auth';
import { archiveOne } from '@/src/lib/archive';
import { assertUserChangeAllowed } from '@/src/lib/user-guards';

export interface AdminUserRow {
  id: string;
  userId: string;
  email: string;
  username: string | null;
  role: 'owner' | 'editor';
  active: boolean;
  createdAt: string;
}

export async function listAdminUsers() {
  await requireAdmin(['owner']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  return db.select().from(adminUsers).where(isNull(adminUsers.deletedAt)).orderBy(adminUsers.createdAt);
}

async function auditUser(db: AppDb, actor: string, action: string, entityId: string, reasonFa: string) {
  await db.insert(auditLogs).values({ actor, action, entity: 'admin_users', entityId, reasonFa });
}

type CreateAdminUserInput = {
  email: string;
  username: string;
  password: string;
  role: 'owner' | 'editor';
};

type CreateAdminUserResult =
  | { ok: true }
  | { ok: false; field?: 'email' | 'username' | 'password' | 'role'; message: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// نام کاربری سبک وردپرس: حروف کوچک لاتین، عدد، نقطه، آندرلاین، خط‌تیره
const USERNAME_RE = /^[a-z0-9._-]{3,60}$/;

/**
 * افزودن مستقیم کاربر پنل توسط مالک — بدون ایمیل دعوت.
 * Auth و admin_users با هم ساخته می‌شوند؛ اگر ثبت در دیتابیس شکست خورد،
 * کاربر یتیمِ Auth جبراناً پاک می‌شود تا پنل و Auth ناهماهنگ نمانند.
 */
export async function createAdminUser(input: CreateAdminUserInput): Promise<CreateAdminUserResult> {
  const session = await requireAdmin(['owner']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');

  const email = input.email.trim().toLowerCase();
  const username = input.username.trim().toLowerCase();
  const { password, role } = input;

  // اعتبارسنجی ورودی‌ها
  if (!EMAIL_RE.test(email)) {
    return { ok: false, field: 'email', message: 'ایمیل معتبر نیست.' };
  }
  if (!USERNAME_RE.test(username)) {
    return {
      ok: false,
      field: 'username',
      message: 'نام کاربری باید ۳ تا ۶۰ نویسه و فقط از حروف کوچک لاتین، عدد، نقطه، آندرلاین یا خط‌تیره باشد.',
    };
  }
  if (!password || password.length < 10) {
    return { ok: false, field: 'password', message: 'رمز حداقل ۱۰ نویسه باشد.' };
  }
  if (role !== 'owner' && role !== 'editor') {
    return { ok: false, field: 'role', message: 'نقش معتبر نیست.' };
  }

  // کنترل تکراری روی ردیف‌های زنده (بایگانی‌نشده) admin_users
  const emailDup = await db
    .select({ id: adminUsers.id })
    .from(adminUsers)
    .where(and(eq(adminUsers.email, email), isNull(adminUsers.deletedAt)))
    .limit(1);
  if (emailDup.length > 0) {
    return { ok: false, field: 'email', message: 'این ایمیل از قبل در پنل ثبت شده است.' };
  }
  const usernameDup = await db
    .select({ id: adminUsers.id })
    .from(adminUsers)
    .where(and(eq(adminUsers.username, username), isNull(adminUsers.deletedAt)))
    .limit(1);
  if (usernameDup.length > 0) {
    return { ok: false, field: 'username', message: 'این نام کاربری قبلاً گرفته شده است.' };
  }

  // نکته: گاردهای assertUserChangeAllowed به رکورد موجودِ هدف نیاز دارند و روی «ساخت»
  // صدق نمی‌کنند — ردیف تازه نه حسابِ عامل است و نه با افزودنش پنل بی‌مالک می‌شود.

  // ۱) ساخت کاربر در Supabase Auth با service_role (بدون ایمیل دعوت)
  const admin = createAdminDb();
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { username },
  });
  if (error || !data.user) {
    console.error('[createAdminUser] خطای Supabase هنگام ساخت کاربر:', error);
    const msg = String(error?.message ?? '');
    if (error?.code === 'email_exists' || /already|registered|exists/i.test(msg)) {
      return { ok: false, field: 'email', message: 'این ایمیل از قبل در سیستم احراز هویت ثبت شده است.' };
    }
    return { ok: false, message: 'ساخت کاربر ناموفق بود؛ دوباره تلاش کنید.' };
  }
  const userId = data.user.id;

  // ۲) ثبت در admin_users؛ در صورت شکست، کاربر یتیمِ Auth جبراناً پاک می‌شود
  try {
    const inserted = await db
      .insert(adminUsers)
      .values({ userId, email, username, role, active: true })
      .returning({ id: adminUsers.id });
    await auditUser(
      db,
      session.email,
      'user.create',
      inserted[0].id,
      `افزودن کاربر «${username}» با نقش ${role === 'owner' ? 'مالک' : 'ویراستار'}`,
    );
  } catch (e) {
    console.error('[createAdminUser] ساخت در Auth موفق شد ولی ثبت در admin_users شکست خورد؛ حذف جبرانی:', e);
    await admin.auth.admin
      .deleteUser(userId)
      .catch((delErr) => console.error('[createAdminUser] حذف جبرانی کاربر یتیم شکست خورد:', userId, delErr));
    return { ok: false, message: 'ثبت کاربر در پایگاه داده ناموفق بود.' };
  }

  revalidatePath('/admin/users');
  return { ok: true };
}

export async function setUserRole(userId: string, role: 'owner' | 'editor') {
  const session = await requireAdmin(['owner']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  await assertUserChangeAllowed(db, userId, session.email, {
    wouldBeOwner: role === 'owner',
    wouldBeActive: true,
    verb: 'تنزل نقش',
  });
  await db.update(adminUsers).set({ role }).where(eq(adminUsers.id, userId));
  await auditUser(db, session.email, 'user.role', userId, `تغییر نقش به ${role === 'owner' ? 'مالک' : 'ویراستار'}`);
  revalidatePath('/admin/users');
  return { ok: true };
}

export async function toggleUserActive(userId: string, active: boolean) {
  const session = await requireAdmin(['owner']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  await assertUserChangeAllowed(db, userId, session.email, {
    wouldBeOwner: true,
    wouldBeActive: active,
    verb: active ? 'فعال‌سازی' : 'غیرفعال‌سازی',
  });
  await db.update(adminUsers).set({ active }).where(eq(adminUsers.id, userId));
  await auditUser(db, session.email, 'user.active', userId, active ? 'فعال‌سازی کاربر' : 'غیرفعال‌سازی کاربر');
  revalidatePath('/admin/users');
  return { ok: true };
}

export async function removeAdmin(userId: string) {
  const session = await requireAdmin(['owner']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  await assertUserChangeAllowed(db, userId, session.email, {
    wouldBeOwner: false,
    wouldBeActive: false,
    verb: 'بایگانی',
  });
  const rows = await db
    .select({ email: adminUsers.email })
    .from(adminUsers)
    .where(eq(adminUsers.id, userId))
    .limit(1);
  await archiveOne(db, adminUsers, userId, {
    actor: session.email,
    entity: 'admin_users',
    reasonFa: `بایگانی کاربر «${rows[0]?.email ?? userId}»`,
  });
  revalidatePath('/admin/users');
  return { ok: true };
}
