import { cache } from 'react';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
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
 * دریافت نشست ادمین با React.cache برای جلوگیری از ارسال مکرر درخواست‌های شبکه در یک رندر سرور
 */
export const getAdminSession = cache(async (): Promise<AdminSession> => {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) throw new Error('UNAUTHORIZED');

  const { data: adminUser, error: adminError } = await createAdminDb()
    .from('admin_users')
    .select('user_id, email, role, active')
    .eq('user_id', user.id)
    .maybeSingle();
  if (adminError || !adminUser || !adminUser.active) {
    throw new Error(adminError ? 'ADMIN_LOOKUP_FAILED' : 'FORBIDDEN');
  }
  return { userId: user.id, email: user.email, role: adminUser.role as AdminRole };
});

/**
 * نشست ادمین جاری: کاربر سوپابیس + نقش فعال از جدول admin_users.
 * null یعنی «حق ورود به /admin نیست». هر Server Action مدیریتی باید همین را صدا بزند.
 */
export async function requireAdmin(
  allowed: AdminRole[] = ['owner', 'editor'],
): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!allowed.includes(session.role)) {
    throw new Error('FORBIDDEN');
  }
  return session;
}
