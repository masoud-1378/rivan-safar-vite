-- مایگریشن 0019 — قفل RLS روی ۲۴ جدول بدون Row Level Security (یافتهٔ SEC-01، بحرانی)
--
-- مسئله: از ۲۹ جدول مایگریشن‌ها فقط ۵ جدول RLS داشتند (admin_users، guides،
-- guide_links، exhibitions، media — مایگریشن ۰۰۰۲). ۲۴ جدول دیگر بدون RLS بودند
-- و کلید anon عمومی (NEXT_PUBLIC_SUPABASE_ANON_KEY داخل باندل کلاینت) می‌توانست
-- مستقیم از PostgREST آن‌ها را بخواند و بنویسد — از جمله lead_requests
-- (نام و موبایل واقعی مشتریان) و site_settings.
--
-- راه‌حل: همان الگوی deny-all مایگریشن ۰۰۰۲ — فقط
--   ALTER TABLE <t> ENABLE ROW LEVEL SECURITY
-- بدون هیچ پالیسی permissive. هیچ CREATE POLICY / GRANT در کار نیست.
--
-- چرا این امن و بی‌خطر است (راستی‌آزمایی استاتیک کامل):
-- - هیچ کوئری مرورگری (کلاینت) با anon key به جدول‌ها نمی‌زند:
--   * src/lib/supabase-client.ts فقط در LoginForm.tsx (auth.signInWithPassword)
--     و SignOut.tsx (auth.signOut) استفاده می‌شود — هر دو فقط Auth API، بدون
--     حتی یک کوئری PostgREST به جدول‌ها.
--   * src/lib/supabase-rest.ts با SUPABASE_SERVICE_ROLE_KEY کار می‌کند و فقط
--     سمت سرور است (مصرف‌کننده‌ها: db-content.ts و site-contact.ts که فقط از
--     کامپوننت‌های سرور صدا زده می‌شوند؛ contact-context.tsx فقط type ایمپورت
--     می‌کند که در کامپایل پاک می‌شود).
--   * src/lib/supabase-server.ts (anon key سرورساید) فقط در admin-auth.ts و
--     فقط برای auth.getUser() است؛ خواندن admin_users با service_role انجام
--     می‌شود (createAdminDb) که RLS را دور می‌زند.
-- - همهٔ خواندن/نوشتن‌های اپ از سرور است: service_role (دورزنندهٔ RLS) یا
--   اتصال مستقیم Postgres با DATABASE_URL (نقش postgres، خارج از RLS).
-- - پس فعال‌سازی RLS هیچ مسیر خواندن/نوشتنِ مشروعی را نمی‌شکند.
--
-- کاملاً idempotent: اجرای دوبارهٔ ENABLE ROW LEVEL SECURITY خطا نمی‌دهد.
-- ⚠️ روی دیتابیس واقعی اعمال نشده است (در این مأموریت دسترسی زنده ممنوع بود)؛
-- بعد از اعمال، با anon key روی staging تست شود که خواندن/نوشتن مستقیم بسته
-- شده و مسیرهای سرور (فرم لید، صفحات عمومی، پنل) سالم‌اند.

ALTER TABLE accommodation_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE accommodations ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE carriers ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE offer_price_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE origin_cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE place_aliases ENABLE ROW LEVEL SECURITY;
ALTER TABLE places ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_origin_cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE route_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_internal_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_landing_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_landings ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_tours ENABLE ROW LEVEL SECURITY;
ALTER TABLE terminals ENABLE ROW LEVEL SECURITY;
ALTER TABLE tour_departures ENABLE ROW LEVEL SECURITY;
ALTER TABLE tour_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE tour_stops ENABLE ROW LEVEL SECURITY;

-- هیچ پالیسی permissive ساخته نمی‌شود → نقش‌های anon/authenticated از طریق
-- PostgREST هیچ دسترسی مستقیمی به این جدول‌ها ندارند.
-- خواندن عمومی سایت و همهٔ عملیات پنل فقط از لایهٔ سرور (service_role یا
-- اتصال مستقیم Postgres) انجام می‌شود که RLS را دور می‌زند.
