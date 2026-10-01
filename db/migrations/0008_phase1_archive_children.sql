-- مایگریشن فاز ۱، میز ۲ — قلم ۴ کتابچه: حذف منطقی برای جدول‌های فرزند لندینگ
-- دستی و idempotent؛ اجرا روی Supabase (SQL Editor) یا: DATABASE_URL=<redacted> pnpm db:migrate
-- content_blocks و seo_internal_links ستون deleted_at می‌گیرند تا حذف تکی بلوک/لینک هم
-- مثل بقیهٔ حذف‌ها «بایگانی» شود و در audit_logs ثبت شود.

ALTER TABLE content_blocks ADD COLUMN IF NOT EXISTS deleted_at timestamp;
ALTER TABLE seo_internal_links ADD COLUMN IF NOT EXISTS deleted_at timestamp;
