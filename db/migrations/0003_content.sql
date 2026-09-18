-- Migration 0003: جداول site_tours و site_destinations برای مدیریت مستقیم محتوای سایت

CREATE TABLE IF NOT EXISTS site_tours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(160) NOT NULL UNIQUE,
  title VARCHAR(260) NOT NULL,
  type VARCHAR(60) NOT NULL,
  type_label VARCHAR(120) NOT NULL,
  destination VARCHAR(120) NOT NULL,
  origin VARCHAR(120) NOT NULL,
  route VARCHAR(260) NOT NULL,
  duration VARCHAR(120) NOT NULL,
  nights INTEGER NOT NULL,
  closest_departure VARCHAR(120) NOT NULL,
  price NUMERIC(15,0) NOT NULL,
  formatted_price VARCHAR(60) NOT NULL,
  price_note VARCHAR(260) NOT NULL,
  status VARCHAR(60) NOT NULL,
  status_label VARCHAR(120) NOT NULL,
  image TEXT NOT NULL,
  badge VARCHAR(120),
  features JSONB NOT NULL DEFAULT '[]',
  visa_required BOOLEAN NOT NULL DEFAULT FALSE,
  hotel_stars INTEGER NOT NULL,
  airline VARCHAR(120) NOT NULL,
  included_services JSONB NOT NULL DEFAULT '[]',
  excluded_services JSONB NOT NULL DEFAULT '[]',
  hotel_options JSONB NOT NULL DEFAULT '[]',
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_site_tours_slug ON site_tours(slug);

CREATE TABLE IF NOT EXISTS site_destinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(160) NOT NULL UNIQUE,
  name VARCHAR(160) NOT NULL,
  name_en VARCHAR(160) NOT NULL,
  type VARCHAR(60) NOT NULL,
  parent_country_slug VARCHAR(160),
  parent_country_name VARCHAR(160),
  category VARCHAR(120) NOT NULL,
  image TEXT NOT NULL,
  hero_tagline VARCHAR(300) NOT NULL,
  description TEXT NOT NULL,
  best_season VARCHAR(300) NOT NULL,
  visa_required BOOLEAN NOT NULL DEFAULT FALSE,
  visa_type VARCHAR(160),
  flight_duration VARCHAR(160),
  currency VARCHAR(160) NOT NULL,
  starting_price VARCHAR(160) NOT NULL,
  starting_price_note VARCHAR(300) NOT NULL,
  last_verified_at VARCHAR(160) NOT NULL,
  active_tours_count INTEGER NOT NULL DEFAULT 0,
  popular_districts JSONB NOT NULL DEFAULT '[]',
  key_highlights JSONB NOT NULL DEFAULT '[]',
  travel_tips JSONB NOT NULL DEFAULT '[]',
  faqs JSONB NOT NULL DEFAULT '[]',
  related_guides JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_site_destinations_slug ON site_destinations(slug);