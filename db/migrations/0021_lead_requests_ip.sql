-- مایگریشن 0021 — ستون ip روی lead_requests برای rate limit دیتابیسی (یافتهٔ SEC-04)
--
-- مسئله: محدودیت «یک لید در ۶۰ ثانیه برای هر شماره» با Map درون‌حافظه‌ای بود که
-- در سرورلس (Vercel) با هر نمونه/cold-start پاک می‌شد.
--
-- راه‌حل: شمارش لیدهای ۶۰ ثانیهٔ گذشتهٔ همان شماره و همان IP از دیتابیس، پیش از
-- insert. برای همین ستون ip لازم است.
--
-- کاملاً idempotent (ADD COLUMN IF NOT EXISTS).
-- ⚠️ روی دیتابیس واقعی اعمال نشده است (در این مأموریت دسترسی زنده ممنوع بود).

ALTER TABLE lead_requests ADD COLUMN IF NOT EXISTS ip VARCHAR(64);
