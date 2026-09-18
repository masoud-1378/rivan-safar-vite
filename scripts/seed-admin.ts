import { createClient } from '@supabase/supabase-js';
import { getDb } from '@/db/client';
import { adminUsers } from '@/db/schema';

/**
 * ساخت ادمین اول (یک‌بارمصرف).
 * اجرا: $env:ADMIN_EMAIL="..." ; $env:ADMIN_PASSWORD="..." ; $env:SUPABASE_URL="..." ; $env:SUPABASE_SERVICE_ROLE_KEY="..." ; npx tsx scripts/seed-admin.ts
 * - کاربر را در Supabase Auth می‌سازد (یا اگر هست نگه می‌دارد)
 * - رکورد owner در admin_users ثبت می‌کند
 * - رمز هرگز لاگ یا کامیت نمی‌شود
 */
const email = process.env.ADMIN_EMAIL || '';
const password = process.env.ADMIN_PASSWORD || '';
const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!email || !password || !url || !serviceKey) {
  console.error('[seed-admin] ADMIN_EMAIL, ADMIN_PASSWORD, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY لازم است.');
  process.exit(1);
}
if (password.length < 10) {
  console.error('[seed-admin] رمز حداقل ۱۰ نویسه باشد.');
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data: existing } = await supabase.auth.admin.listUsers();
const found = (existing.users as Array<{ id: string; email?: string }>).find(
  (u) => u.email?.toLowerCase() === email.toLowerCase(),
);

let userId: string;
if (found) {
  userId = found.id;
  console.log('[seed-admin] user exists, reusing.');
  await supabase.auth.admin.updateUserById(userId, { password, email_confirm: true });
} else {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error || !data.user) {
    console.error('[seed-admin] createUser failed: ' + (error?.message || 'unknown'));
    process.exit(1);
  }
  userId = data.user.id;
  console.log('[seed-admin] user created.');
}

const db = getDb();
if (!db) {
  console.error('[seed-admin] DATABASE_URL تنظیم نشده.');
  process.exit(1);
}
await db
  .insert(adminUsers)
  .values({ userId, email: email.toLowerCase(), role: 'owner', active: true })
  .onConflictDoUpdate({
    target: adminUsers.userId,
    set: { email: email.toLowerCase(), role: 'owner', active: true },
  });
console.log('[seed-admin] owner granted. DONE — این اسکریپت را دوباره با همان ایمیل اجرا نکنید مگر برای ریست رمز.');
