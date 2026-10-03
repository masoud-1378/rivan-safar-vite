-- 0032_content_seo_gallery.sql — فیلدهای سئو و گالری مقصد/نمایشگاه (تیم مقصدها و نمایشگاه‌ها)
--
-- فقط-افزایشی: سه ستون nullable روی site_destinations و دو ستون nullable روی
-- exhibitions. هیچ DROP/ALTER مخربی نیست؛ کد قدیمی main بی‌صدا کار می‌کند.
-- اجرا نشده — هماهنگ‌کننده پیش از استقرار panel-rebuild اجرا می‌کند.
--
-- قرارداد ذخیره:
--   meta_title / meta_description : text، nullable
--   gallery (فقط site_destinations): jsonb، آرایهٔ { url, caption, alt }

alter table site_destinations
  add column if not exists meta_title text,
  add column if not exists meta_description text,
  add column if not exists gallery jsonb not null default '[]';

alter table exhibitions
  add column if not exists meta_title text,
  add column if not exists meta_description text;

-- راستی‌آزمایی پس از اجرا:
-- select column_name, data_type, is_nullable
--   from information_schema.columns
--  where table_schema = 'public'
--    and ((table_name = 'site_destinations' and column_name in ('meta_title', 'meta_description', 'gallery'))
--      or (table_name = 'exhibitions' and column_name in ('meta_title', 'meta_description')));
