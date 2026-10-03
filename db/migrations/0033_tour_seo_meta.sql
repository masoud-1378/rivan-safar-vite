-- 0033_tour_seo_meta.sql — فیلدهای سئوی سطح تور (تیم «فرم تورها»، ۱۴۰۵/۰۷/۱۱)
--
-- فقط-افزایشی: دو ستون nullable روی site_tours. هیچ DROP/ALTER مخربی نیست؛
-- کد قدیمی main بی‌صدا کار می‌کند (ستون‌های تازه را نمی‌خواند).
-- اجرا نشده — هماهنگ‌کننده پیش از استقرار panel-rebuild-editor اجرا می‌کند.
--
-- قرارداد ذخیره (همان قرارداد 0032 برای مقصدها/نمایشگاه‌ها):
--   meta_title / meta_description : text، nullable
-- شمارندهٔ نرم فقط راهنماست (دستور مسعود: بدون سقف سختی).
--
-- ⚠️ چرا 0033؟ 0030/0031/0032 در درختِ کاری موجودند (ستون‌های *_rich و
-- سئوی مقصد/نمایشگاه)؛ برای جلوگیری از تداخل نام، شمارهٔ ما 0033 است.

alter table site_tours
  add column if not exists meta_title text,
  add column if not exists meta_description text;

-- راستی‌آزمایی پس از اجرا:
-- select column_name, data_type, is_nullable
--   from information_schema.columns
--  where table_schema = 'public'
--    and table_name = 'site_tours'
--    and column_name in ('meta_title', 'meta_description');
