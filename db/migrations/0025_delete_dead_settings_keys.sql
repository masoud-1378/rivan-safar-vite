-- 0025: حذف ۸ کلید مردهٔ site_settings (موج ۲، فاز A2)
-- خواننده‌ها: صفر برای هر ۸ کلید (تأیید با grep).
-- site.robots.indexing_enabled=false با seo.indexing_enabled=true متناقض بود؛
-- حذفش تناقض را هم حل می‌کند.
-- idempotent: اجرای مجدد بی‌اثر است.
DELETE FROM site_settings WHERE setting_key IN (
  'contact.cta_label',
  'leads.notify_phones',
  'places.default_sort',
  'places.page_size',
  'seo.min_meta_length',
  'seo.review_days',
  'site.robots.indexing_enabled',
  'tours.default_currency'
);
