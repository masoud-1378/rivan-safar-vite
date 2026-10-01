'use server';

import { revalidatePath } from 'next/cache';
import { getDb, type AppDb } from '@/db/client';
import { adminUsers, auditLogs } from '@/db/schema';
import { eq, isNull } from 'drizzle-orm';
import { requireAdmin, createAdminDb } from '@/src/lib/admin-auth';
import { archiveOne } from '@/src/lib/archive';
import { assertUserChangeAllowed } from '@/src/lib/user-guards';

export interface AdminUserRow {
  id: string;
  userId: string;
  email: string;
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

export async function inviteAdmin(email: string, role: 'owner' | 'editor') {
  const session = await requireAdmin(['owner']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  const normalized = email.trim().toLowerCase();
  if (!normalized || !normalized.includes('@')) throw new Error('ایمیل معتبر نیست.');

  // ۰) اگر این ایمیل از قبل در admin_users هست، اول گاردها را رد کن —
  //    دعوتِ دوباره نباید بی‌سروصدا نقش را بازنویسی کند و نباید آخرین مالک فعال را از مالکی بیندازد.
  const existing = await db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.email, normalized))
    .limit(1);
  if (existing.length > 0) {
    await assertUserChangeAllowed(db, existing[0].id, session.email, {
      wouldBeOwner: role === 'owner',
      wouldBeActive: true,
      verb: 'دعوت مجدد',
    });
  }

  // ۱) ساخت کاربر در Supabase Auth و ارسال ایمیل دعوت (با service_role).
  //    اگر کاربر از قبل وجود داشته باشد، فقط ایمیل دعوت دوباره فرستاده می‌شود.
  const { data, error } = await createAdminDb().auth.admin.inviteUserByEmail(normalized);
  if (error) {
    console.error('[inviteAdmin] خطای Supabase هنگام دعوت:', normalized, error);
    throw new Error('ارسال دعوت ناموفق بود.');
  }
  const userId = data.user?.id;
  if (!userId) {
    console.error('[inviteAdmin] پاسخ Supabase بدون شناسهٔ کاربر برگشت:', normalized, data);
    throw new Error('ساخت کاربر ناموفق بود.');
  }

  // ۲) ثبت/به‌روزرسانی نقش در admin_users (بدون تکیه بر unique بودن ایمیل در دیتابیس).
  try {
    if (existing.length > 0) {
      const target = existing[0];
      await db
        .update(adminUsers)
        .set({ userId, role, active: true, deletedAt: null })
        .where(eq(adminUsers.id, target.id));
      await auditUser(db, session.email, 'user.invite', target.id, `دعوت مجدد «${normalized}» با نقش ${role === 'owner' ? 'مالک' : 'ویراستار'}`);
    } else {
      const inserted = await db
        .insert(adminUsers)
        .values({ userId, email: normalized, role, active: true })
        .returning({ id: adminUsers.id });
      await auditUser(db, session.email, 'user.invite', inserted[0].id, `دعوت «${normalized}» با نقش ${role === 'owner' ? 'مالک' : 'ویراستار'}`);
    }
  } catch (e) {
    // دعوت در Auth موفق شده ولی ثبت در admin_users نه — کاربر در Auth یتیم می‌ماند.
    console.error('[inviteAdmin] دعوت در Auth موفق شد ولی ثبت در admin_users شکست خورد:', normalized, e);
    throw e instanceof Error ? e : new Error('ثبت کاربر در پایگاه داده ناموفق بود.');
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