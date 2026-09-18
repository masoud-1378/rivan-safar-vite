'use server';

import { revalidatePath } from 'next/cache';
import { getDb } from '@/db/client';
import { adminUsers } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requireAdmin } from '@/src/lib/admin-auth';

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
  return db.select().from(adminUsers).orderBy(adminUsers.createdAt);
}

export async function inviteAdmin(email: string, role: 'owner' | 'editor') {
  const session = await requireAdmin(['owner']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  // کاربر باید در Supabase Auth وجود داشته باشد
  // این تابع فقط رکورد admin_users را می‌سازد/به‌روزرسانی می‌کند
  await db
    .insert(adminUsers)
    .values({ userId: '', email: email.toLowerCase(), role, active: true })
    .onConflictDoUpdate({
      target: adminUsers.email,
      set: { role, active: true },
    });
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
  await requireAdmin(['owner']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  await db.delete(adminUsers).where(eq(adminUsers.id, userId));
  revalidatePath('/admin/users');
  return { ok: true };
}