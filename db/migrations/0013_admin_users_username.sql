-- مایگریشن 0013 — ستون username برای admin_users (نام کاربری، تصمیم میز شناخت)
-- ⚠️ پیش‌نیاز دیپلوی: پیش از انتشار کد، روی Supabase (SQL Editor) اجرا شود.
-- دستی و idempotent؛ اجرای دوباره بی‌ضرر است.
--
-- نکته‌ها:
-- - این مایگریشن روی Production اجرا نشده؛ فقط با تأیید مسعود.
-- - برچسب audit «user.invite» در کد حذف شده ولی لاگ‌های تاریخی هنوز به آن ارجاع دارند؛
--   برچسب تازه «user.create» کنار آن نگه داشته شده (نه جایگزین).

ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS username VARCHAR(60);

CREATE UNIQUE INDEX IF NOT EXISTS admin_users_username_key
  ON admin_users (username)
  WHERE deleted_at IS NULL AND username IS NOT NULL;
