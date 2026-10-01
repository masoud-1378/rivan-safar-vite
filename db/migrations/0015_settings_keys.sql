-- مایگریشن 0015 — seed سه کلید جاافتادهٔ تنظیمات (ردیف ۳-۶)
--
-- مسئله: مایگریشن 0005 این سه کلید را seed نکرده، ولی رجیستری تنظیمات
-- (src/lib/settings.ts) برایشان مقدار پیش‌فرض دارد:
--   site.url ،business.phone ،business.address
-- راه‌حل: درج همان مقادیر پیش‌فرض برای نصب‌هایی که ردیف ندارند.
--
-- کاملاً idempotent (الگوی WHERE NOT EXISTS مثل مایگریشن 0005)؛ اجرای دوباره بی‌ضرر است.
-- رفتار زنده را عوض نمی‌کند، چون رجیستری پیش‌فرض الان همین مقادیر را پوشش می‌دهد.
-- ⚠️ روی دیتابیس واقعی اجرا نشود (دستور بسته A: فقط فایل ساخته می‌شود).

INSERT INTO site_settings (setting_key, setting_value)
SELECT k, v FROM (VALUES
  ('site.url', 'https://rivansafar.ir'),
  ('business.phone', '02633350139'),
  ('business.address', 'کرج، مهرشهر، بلوار شهرداری، نبش ۲۰۸، ساختمان آماتیس، واحد ۷')
) AS seed(k, v)
WHERE NOT EXISTS (SELECT 1 FROM site_settings s WHERE s.setting_key = seed.k);
