-- مایگریشن فاز ۱ (ازکارافتاده‌ها) — دستی و idempotent
-- اجرا روی Supabase (SQL Editor) یا: DATABASE_URL=... npm run db:migrate
-- قلم ۱ کتابچه: ستون‌های مرحله‌های ۳ تا ۵ تورساز | قلم ۴: حذف منطقی

ALTER TABLE site_tours ADD COLUMN IF NOT EXISTS itinerary_days jsonb NOT NULL DEFAULT '[]';
ALTER TABLE site_tours ADD COLUMN IF NOT EXISTS trust_specs jsonb;
ALTER TABLE site_tours ADD COLUMN IF NOT EXISTS consultant_spec jsonb;

ALTER TABLE site_tours ADD COLUMN IF NOT EXISTS deleted_at timestamp;
ALTER TABLE site_destinations ADD COLUMN IF NOT EXISTS deleted_at timestamp;
ALTER TABLE origin_cities ADD COLUMN IF NOT EXISTS deleted_at timestamp;
ALTER TABLE accommodations ADD COLUMN IF NOT EXISTS deleted_at timestamp;
ALTER TABLE seo_landings ADD COLUMN IF NOT EXISTS deleted_at timestamp;
ALTER TABLE guides ADD COLUMN IF NOT EXISTS deleted_at timestamp;
ALTER TABLE exhibitions ADD COLUMN IF NOT EXISTS deleted_at timestamp;
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS deleted_at timestamp;
