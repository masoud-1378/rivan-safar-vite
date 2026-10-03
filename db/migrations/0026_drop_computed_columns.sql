-- فاز C موج ۲ (۱۴۰۵/۰۷/۱۱): حذف ستون‌های «حساب‌شدنی» که خواننده‌شان در فاز B
-- به محاسبه در کد سوییچ کرد و روی پیش‌نمایش راستی‌آزمایی زنده شد.
-- type_label / status_label / category_label عمداً حذف نمی‌شوند (B1/B2/B7 رد شد:
-- لیبل‌های قدیمی داده با ثابت‌های فعلی فرق دارند).
ALTER TABLE site_tours DROP COLUMN IF EXISTS formatted_price;
ALTER TABLE site_tours DROP COLUMN IF EXISTS hotel_stars;
ALTER TABLE site_tours DROP COLUMN IF EXISTS price_note;
ALTER TABLE site_destinations DROP COLUMN IF EXISTS active_tours_count;
