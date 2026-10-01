'use server';

import { revalidatePath } from 'next/cache';
import { getDb } from '@/db/client';
import { adminUsers } from '@/db/schema';
import { eq, isNull } from 'drizzle-orm';
import { requireAdmin, createAdminDb } from '@/src/lib/admin-auth';
import { archiveOne } from '@/src/lib/archive';

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

export async function inviteAdmin(email: string, role: 'owner' | 'editor') {
  await requireAdmin(['owner']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  const normalized = email.trim().toLowerCase();
  if (!normalized || !normalized.includes('@')) throw new Error('ایمیل معتبر نیست.');

  // ۱) ساخت کاربر در Supabase Auth و ارسال ایمیل دعوت (با service_role).
  //    اگر کاربر از قبل وجود داشته باشد، فقط ایمیل دعوت دوباره فرستاده می‌شود.
  const { data, error } = await createAdminDb().auth.admin.inviteUserByEmail(normalized);
  if (error) throw new Error('ارسال دعوت ناموفق بود.');
  const userId = data.user?.id;
  if (!userId) throw new Error('ساخت کاربر ناموفق بود.');

  // ۲) ثبت/به‌روزرسانی نقش در admin_users (بدون تکیه بر unique بودن ایمیل در دیتابیس).
  const existing = await db
    .select({ id: adminUsers.id })
    .from(adminUsers)
    .where(eq(adminUsers.email, normalized))
    .limit(1);
  if (existing.length > 0) {
    await db
      .update(adminUsers)
      .set({ userId, role, active: true })
      .where(eq(adminUsers.id, existing[0].id));
  } else {
    await db.insert(adminUsers).values({ userId, email: normalized, role, active: true });
  }
  revalidatePath('/admin/users');
  return { ok: true };
}

export async function setUserRole(userId: string, role: 'owner' | 'editor') {
  await requireAdmin(['owner']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  await db.update(adminUsers).set({ role }).where(eq(adminUsers.id, userId));
  revalidatePath('/admin/users');
  return { ok: true };
}

export async function toggleUserActive(userId: string, active: boolean) {
  await requireAdmin(['owner']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  await db.update(adminUsers).set({ active }).where(eq(adminUsers.id, userId));
  revalidatePath('/admin/users');
  return { ok: true };
}

export async function removeAdmin(userId: string) {
  const session = await requireAdmin(['owner']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
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