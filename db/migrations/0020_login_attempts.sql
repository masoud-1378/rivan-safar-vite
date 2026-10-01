-- مایگریشن 0020 — جدول login_attempts برای throttling ورود ادمین (یافتهٔ SEC-08)
--
-- مسئله: ورود ادمین هیچ rate limit سطح اپ نداشت؛ تنها دفاع محدودیت داخلی
-- Supabase Auth بود که در کد دیده نمی‌شود.
--
-- راه‌حل: هر تلاش ورود (موفق/ناموفق) با ایمیل و IP در این جدول لاگ می‌شود و
-- Server Action ِ checkLoginAllowed (app/admin/login/actions.ts) پیش از
-- signInWithPassword سقف‌ها را چک می‌کند: ۱۰ تلاش در ۱۵ دقیقه برای هر ایمیل،
-- ۳۰ تلاش در ۱۵ دقیقه برای هر IP.
--
-- کاملاً idempotent (IF NOT EXISTS). RLS هم این‌جا فعال می‌شود (deny-all؛
-- خواندن/نوشتن فقط از سرور با service_role یا اتصال مستقیم Postgres).
-- ⚠️ روی دیتابیس واقعی اعمال نشده است (در این مأموریت دسترسی زنده ممنوع بود).

CREATE TABLE IF NOT EXISTS login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(320) NOT NULL,
  ip VARCHAR(64) NOT NULL DEFAULT 'unknown',
  succeeded BOOLEAN NOT NULL DEFAULT false,
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_login_attempts_email_at
  ON login_attempts (email, attempted_at DESC);
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip_at
  ON login_attempts (ip, attempted_at DESC);

ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;
-- بدون پالیسی permissive: دسترسی مستقیم anon/authenticated بسته است.
