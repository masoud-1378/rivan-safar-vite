import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { getDb } from '@/db/client';
import { adminUsers } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { createClient as createServerSupabase } from './supabase-server';

export type AdminRole = 'owner' | 'editor';

export interface AdminSession {
  userId: string;
  email: string;
  role: AdminRole;
}

/** کلاینت مدیریتی — فقط در سرور، با service_role (مستقیم به DB، دور از RLS) */
export function createAdminDb() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

/**
 * نشست ادمین جاری: کاربر سوپابیس + نقش فعال از جدول admin_users.
 * null یعنی «حق ورود به /admin نیست». هر Server Action مدیریتی باید همین را صدا بزند.
 */
export async function requireAdmin(
  allowed: AdminRole[] = ['owner', 'editor'],
): Promise<AdminSession> {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) throw new Error('UNAUTHORIZED');

  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  const rows = await db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.userId, user.id))
    .limit(1);
  const row = rows[0];
  if (!row || !row.active || !allowed.includes(row.role as AdminRole)) {
    throw new Error('FORBIDDEN');
  }
  return { userId: user.id, email: user.email, role: row.role as AdminRole };
}
