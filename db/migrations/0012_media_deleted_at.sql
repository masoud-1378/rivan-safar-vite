-- مایگریشن 0012 — ستون گمشدهٔ deleted_at جدول media
-- ⚠️ پیش‌نیاز دیپلوی: پیش از انتشار کد، روی Supabase (SQL Editor) اجرا شود.
-- دستی و idempotent؛ اجرای دوباره بی‌ضرر است.
--
-- مسئله (گشت، ایراد ۳): db/schema.ts برای جدول media ستون deletedAt اعلام
-- می‌کند ولی هیچ مایگریشنی آن را نساخته بود (0002_cms.sql این ستون را ندارد).
-- نتیجه: هر کوئری listHotelPhotos/deleteHotelPhoto با خطای Postgres 42703
-- (ستون ناموجود) می‌مرد و آپلود/فهرست/حذف عکس هتل از کار افتاده بود.
-- راه‌حل: افزودن ستون deleted_at (حذف نرم، هم‌خانوادهٔ بقیهٔ جدول‌ها).

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'media'
      AND column_name = 'deleted_at'
  ) THEN
    ALTER TABLE media ADD COLUMN deleted_at TIMESTAMPTZ;
  END IF;
END $$;
