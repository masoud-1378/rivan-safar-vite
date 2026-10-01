-- مایگریشن 0014 — ستون شیوهٔ سفر روی جدول تورها
-- ⚠️ پیش‌نیاز دیپلوی: حتماً پیش از انتشار کد، روی Supabase (SQL Editor) اجرا شود.
-- در غیر این صورت ذخیرهٔ تور در پنل خطا می‌خورد (ستون transport_kind نیست).
-- دستی و idempotent؛ اجرای دوباره بی‌ضرر است.
--
-- مسئله: کد پنل (Stage1Identity، TourForm، toTourRow) از ستون transport_kind روی
-- site_tours استفاده می‌کند، ولی این ستون نه در اسکیما بود و نه روی دیتابیس.
-- راه‌حل: ستون از enum آمادهٔ transport_kind (قبلاً برای هتل‌ها ساخته شده بود).
--
-- معنای نهایی:
--   transport_kind = 'air' | 'land' | 'rail' | 'sea' | 'mixed'
-- مقدار پیش‌فرض: 'air' (رفتار قدیمی پنل).

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'site_tours'
      AND column_name = 'transport_kind'
  ) THEN
    ALTER TABLE site_tours
      ADD COLUMN transport_kind transport_kind NOT NULL DEFAULT 'air';
  END IF;
END $$;
