-- 0017: کلیدهای شبکه‌های اجتماعی + متن بنر اطلاع‌رسانی (بسته C: سایت‌نما و فرم‌ها/لید)
-- الگو دقیقاً مانند 0005: فقط اگر کلید از قبل نباشد درج می‌شود (idempotent).
-- مقادیر خالی شبکه‌های اجتماعی عمداً خالی‌اند؛ بعد از تکمیل در پنل/دیتابیس،
-- فوتر به‌جای لینک مرده «#» همان‌ها را نشان می‌دهد.
INSERT INTO site_settings (setting_key, setting_value)
SELECT k, v FROM (VALUES
  ('social.instagram', ''),
  ('social.telegram', ''),
  ('social.whatsapp', ''),
  ('social.linkedin', ''),
  ('site.announcement_text', 'ثبت‌نام تورهای نوروزی آغاز شد.')
) AS seed(k, v)
WHERE NOT EXISTS (SELECT 1 FROM site_settings s WHERE s.setting_key = seed.k);
