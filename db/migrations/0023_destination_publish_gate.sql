-- مایگریشن 0023 — گیت انتشار مقصد (قلم ۳ موج ۱)
--
-- مسئله (تصمیم ۶ ثبت‌شدهٔ ۱۴۰۵/۰۷/۱۱): جدول site_destinations گیت انتشار جدا
-- نداشت؛ هر مقصد بایگانی‌نشده روی سایت دیده می‌شد.
--
-- راه‌حل: ستون publish_status از همان enum آمادهٔ publish_status که مایگریشن
-- 0011 برای تورها ساخت؛ هیچ تایپ جدیدی لازم نیست.
--
-- ⚠️ رفتار: رکوردهای موجود همگی 'draft' می‌گیرند (طبق دستور قلم: پیش‌فرض
-- draft برای رکوردهای موجود، بدون UPDATE و بدون تغییر داده‌های فعلی). پس از
-- استقرار کدِ گیت، هیچ مقصدی روی سایت دیده نمی‌شود تا ادمین آن را از مسیر
-- گیت (نام + کشور/ناحیه + توضیح یا تصویر) منتشر کند.
--
-- فقط و فقط additive: ADD COLUMN IF NOT EXISTS + ایندکس جزئی. اجرای دوباره
-- بی‌ضرر است؛ چون UPDATE‌ای در کار نیست، اجرای دوباره هیچ رکوردی را از
-- published به draft برنمی‌گرداند.

ALTER TABLE site_destinations
  ADD COLUMN IF NOT EXISTS publish_status publish_status NOT NULL DEFAULT 'draft';

CREATE INDEX IF NOT EXISTS idx_site_destinations_publish_status
  ON site_destinations (publish_status) WHERE deleted_at IS NULL;
