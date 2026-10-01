-- 0009_phase1_d3_fixes.sql — اصلاحات میز ۳ (فاز ۱).
-- Idempotent: همه‌چیز با IF NOT EXISTS محافظت شده تا اجرای دوباره بی‌خطر باشد.
-- توجه: مایگریشن 0007 هنوز روی دیتابیس واقعی اجرا نشده؛ این فایل جدا و مستقل است.

-- قید یکتای slug جدول اقامتگاه‌ها (یافتهٔ ۷: مسابقهٔ هم‌زمان نام/نامک هتل).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'accommodations_slug_uidx'
  ) THEN
    ALTER TABLE accommodations
      ADD CONSTRAINT accommodations_slug_uidx UNIQUE (slug);
  END IF;
END $$;
