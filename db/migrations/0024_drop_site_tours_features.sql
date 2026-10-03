-- 0024: حذف ستون بی‌خوانندهٔ site_tours.features (موج ۲، فاز A1)
-- خواننده‌ها: صفر (تأیید با grep). بک‌آپ تک‌ستونی در
-- ~/workspace/projects/rivan-admin-audit/wave-2/backups/features-2026-10-03.json
-- idempotent: اجرای مجدد بی‌اثر است.
ALTER TABLE site_tours DROP COLUMN IF EXISTS features;
