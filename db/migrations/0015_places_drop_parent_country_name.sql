-- مایگریشن 0015 — حذف ستون متنی parent_country_name از جدول مقصدها
-- ⚠️ پیش‌نیاز دیپلوی: پیش از اجرای این مایگریشن روی Supabase، بستهٔ A باید
-- src/lib/db-content.ts (تابع restToPlace، خط ~۱۱۲) را طوری عوض کرده باشد که
-- نام کشور مادر را از parent_country_slug resolve کند، نه از ستون حذف‌شده.
-- در غیر این صورت صفحه‌های مقصد/هاب روی سایت خطا می‌خورند.
-- دستی و idempotent؛ اجرای دوباره بی‌ضرر است.
--
-- مسئله: نام کشور مادر هم در ستون parent_country_slug بود و هم در ستون متنی
-- parent_country_name؛ تغییر نام کشور، شهرهای فرزند را بی‌خبر می‌گذاشت.
-- راه‌حل: ستون متنی حذف می‌شود؛ نام هنگام نمایش از روی نامک کشور resolve می‌شود
-- (پنل: فهرست کشورها در DestinationForm؛ سایت: restToPlace در بستهٔ A).

ALTER TABLE site_destinations DROP COLUMN IF EXISTS parent_country_name;
