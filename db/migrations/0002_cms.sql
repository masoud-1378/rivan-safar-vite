-- Migration 0002: جداول CMS (مدیران، راهنماها، نمایشگاه‌ها، رسانه)
-- اجرا بعد از 0001_init.sql. فقط افزودنی؛ هیچ جدولی تغییر ساختار نمی‌دهد.

DO $$ BEGIN CREATE TYPE admin_role AS ENUM ('owner','editor'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- مدیران پنل: اتصال به auth.users سوپابیس (بدون FK سخت برای تحمل حذف کاربر)
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  email VARCHAR(200) NOT NULL,
  role admin_role NOT NULL DEFAULT 'editor',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- راهنماهای سفر (مهاجرت از src/data/guidesData.ts)
CREATE TABLE IF NOT EXISTS guides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(160) NOT NULL UNIQUE,
  title_fa VARCHAR(260) NOT NULL,
  category VARCHAR(60) NOT NULL DEFAULT 'general',
  category_label VARCHAR(120),
  read_time VARCHAR(40),
  author VARCHAR(160),
  reviewer VARCHAR(160),
  summary TEXT,
  hero_image TEXT,
  direct_answer TEXT,
  sections JSONB NOT NULL DEFAULT '[]',
  faqs JSONB NOT NULL DEFAULT '[]',
  status publish_status NOT NULL DEFAULT 'draft',
  last_reviewed_at DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- اتصال راهنما به Money Page (سند ۰۳: هر راهنما یک صفحه فروش)
CREATE TABLE IF NOT EXISTS guide_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guide_id UUID NOT NULL REFERENCES guides(id) ON DELETE CASCADE,
  to_path VARCHAR(300) NOT NULL,
  anchor_fa VARCHAR(220) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- نمایشگاه‌ها (مهاجرت از src/data/exhibitionsData.ts)
CREATE TABLE IF NOT EXISTS exhibitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(160) NOT NULL UNIQUE,
  title_fa VARCHAR(260) NOT NULL,
  title_en VARCHAR(260),
  country VARCHAR(120),
  city VARCHAR(120),
  venue VARCHAR(220),
  official_website TEXT,
  industry VARCHAR(220),
  hero_tagline TEXT,
  description TEXT,
  image TEXT,
  edition_slug VARCHAR(120),
  solar_date VARCHAR(120),
  gregorian_date VARCHAR(120),
  phases JSONB NOT NULL DEFAULT '[]',
  visa_deadline TEXT,
  hotel_area TEXT,
  starting_price_note TEXT,
  services_included JSONB NOT NULL DEFAULT '[]',
  business_tips JSONB NOT NULL DEFAULT '[]',
  faqs JSONB NOT NULL DEFAULT '[]',
  status publish_status NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- رسانه: فقط URL معتبر + alt + منبع (بدون آپلودر سنگین در فاز اول)
CREATE TABLE IF NOT EXISTS media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  alt_fa VARCHAR(260) NOT NULL,
  source VARCHAR(260),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- RLS: پیش‌فرض بستن همه‌چیز؛ دسترسی فقط از سرور ----------
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE guide_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE exhibitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;

-- هیچ پالیسی permissive ساخته نمی‌شود → نقش anon/authenticated هیچ دسترسی مستقیمی ندارند.
-- خواندن عمومی سایت فقط از لایه سرور (service_role) انجام می‌شود.

-- خواندن عمومی راهنماها و نمایشگاه‌های منتشرشده برای API ناشناس (اختیاری، امن):
-- عمداً غیرفعال است تا همه خواندن‌ها از Server Action/Route سرور عبور کنند.
