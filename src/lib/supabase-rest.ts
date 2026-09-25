import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * کلاینت REST سرورساید برای خواندن محتوای عمومی.
 * چرا REST و نه pooler؟ اتصال مستقیم Postgres از داخل lambdaهای سرورلس
 * (max:1، handshake روی هر cold start) ناپایدار بود و یک اتصالِ نیم‌مرده
 * کل رندر صفحه را معطل می‌کرد. REST فقط HTTPS است: بدون اتصال ماندگار،
 * بدون استخر مشترک، بدون مسموم‌شدن. نوشتن‌ها همچنان از Drizzle/pooler
 * در اکشن‌های ادمین انجام می‌شود.
 *
 * فقط سمت سرور. کلید service-role هرگز به کلاینت نمی‌رسد.
 */

let cached: SupabaseClient | null | undefined;

export function getRest(): SupabaseClient | null {
  if (cached !== undefined) return cached;
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || '';
  if (!url || !key) {
    cached = null;
    return null;
  }
  try {
    cached = createClient(url, key, { auth: { persistSession: false } });
  } catch {
    cached = null;
  }
  return cached;
}
