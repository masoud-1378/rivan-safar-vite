-- مایگریشن فاز ۱، میز ۲ — دور اصلاح (قلم ۲ ایرادگیر فاز ب)
-- دستی و idempotent؛ اجرا روی Supabase (SQL Editor) یا: DATABASE_URL=<redacted>
--
-- مسئله: ایندکس‌های یکتا روی نامک/مسیر، ردیف‌های بایگانی‌شده (deleted_at IS NOT NULL) را هم
-- پوشش می‌دادند؛ «بایگانی کن و با همان نامک تازه بساز» خطای duplicate key می‌خورد.
-- راه‌حل: همهٔ ایندکس‌های یکتای نامک/مسیر به partial index با شرط WHERE deleted_at IS NULL
-- تبدیل می‌شوند تا یکتا بودن فقط بین ردیف‌های فعال اعمال شود.
--
-- احتیاط نام‌گذاری: بسته به این‌که دیتابیس از مایگریشن‌های SQL ساخته شده یا از drizzle push،
-- نام‌ها فرق می‌کنند (constraint خودکار «*_key» در برابر ایندکس نام‌دار «*_uidx»).
-- هر دو حالت پوشش داده شده: اول constraint و ایندکس قدیمی (هر کدام که هست) حذف می‌شود،
-- بعد ایندکس جزئی با نام کانونیک schema.ts ساخته می‌شود.

-- site_tours.slug
ALTER TABLE site_tours DROP CONSTRAINT IF EXISTS site_tours_slug_key;
CREATE UNIQUE INDEX IF NOT EXISTS site_tours_slug_key ON site_tours (slug) WHERE deleted_at IS NULL;

-- site_destinations.slug
ALTER TABLE site_destinations DROP CONSTRAINT IF EXISTS site_destinations_slug_key;
CREATE UNIQUE INDEX IF NOT EXISTS site_destinations_slug_key ON site_destinations (slug) WHERE deleted_at IS NULL;

-- origin_cities.slug
ALTER TABLE origin_cities DROP CONSTRAINT IF EXISTS origin_cities_slug_key;
DROP INDEX IF EXISTS origin_cities_slug_uidx;
CREATE UNIQUE INDEX IF NOT EXISTS origin_cities_slug_uidx ON origin_cities (slug) WHERE deleted_at IS NULL;

-- guides.slug
ALTER TABLE guides DROP CONSTRAINT IF EXISTS guides_slug_key;
CREATE UNIQUE INDEX IF NOT EXISTS guides_slug_key ON guides (slug) WHERE deleted_at IS NULL;

-- exhibitions.slug
ALTER TABLE exhibitions DROP CONSTRAINT IF EXISTS exhibitions_slug_key;
CREATE UNIQUE INDEX IF NOT EXISTS exhibitions_slug_key ON exhibitions (slug) WHERE deleted_at IS NULL;

-- seo_landings.url_path
ALTER TABLE seo_landings DROP CONSTRAINT IF EXISTS seo_landings_url_path_key;
DROP INDEX IF EXISTS seo_landings_url_uidx;
CREATE UNIQUE INDEX IF NOT EXISTS seo_landings_url_uidx ON seo_landings (url_path) WHERE deleted_at IS NULL;

-- seo_landings.query_owner
ALTER TABLE seo_landings DROP CONSTRAINT IF EXISTS seo_landings_query_owner_key;
DROP INDEX IF EXISTS seo_landings_query_uidx;
CREATE UNIQUE INDEX IF NOT EXISTS seo_landings_query_uidx ON seo_landings (query_owner) WHERE deleted_at IS NULL;
