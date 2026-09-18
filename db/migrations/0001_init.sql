-- Migration 0001: اسکیمای اولیه ریوان سفر (عین سند 05_DATABASE_STRATEGY)
-- اجرا فقط یک‌بار و قبل از Release. حذف فیزیکی نداریم؛ Archive/Cancel.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$ BEGIN CREATE TYPE place_type AS ENUM ('region','country','city','island'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE departure_status AS ENUM ('scheduled','confirmed','limited','full','cancelled'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE price_status AS ENUM ('confirmed','on_request','under_review','expired'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE publish_status AS ENUM ('draft','review','published','paused','archived'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE index_status AS ENUM ('index','noindex'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE transport_kind AS ENUM ('air','land','rail','sea','mixed'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS places (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(120) NOT NULL UNIQUE,
  name_fa VARCHAR(120) NOT NULL,
  name_en VARCHAR(120),
  type place_type NOT NULL,
  parent_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS place_aliases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id UUID NOT NULL REFERENCES places(id),
  alias_fa VARCHAR(120) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS origin_cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(120) NOT NULL UNIQUE,
  name_fa VARCHAR(120) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS terminals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(120) NOT NULL,
  name_fa VARCHAR(160) NOT NULL,
  kind VARCHAR(40) NOT NULL DEFAULT 'airport',
  city_slug VARCHAR(120),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS carriers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(120) NOT NULL,
  name_fa VARCHAR(160) NOT NULL,
  kind VARCHAR(40) NOT NULL DEFAULT 'airline',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS accommodations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(160) NOT NULL,
  name_fa VARCHAR(200) NOT NULL,
  stars INT,
  place_slug VARCHAR(120),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(120) NOT NULL,
  name_fa VARCHAR(160) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tour_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(160) NOT NULL UNIQUE,
  title_fa VARCHAR(220) NOT NULL,
  tour_kind VARCHAR(40) NOT NULL DEFAULT 'foreign',
  status publish_status NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tour_stops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES tour_products(id),
  place_slug VARCHAR(120) NOT NULL,
  stop_order INT NOT NULL DEFAULT 1,
  nights INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS product_origin_cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES tour_products(id),
  origin_slug VARCHAR(120) NOT NULL,
  note_fa TEXT
);

CREATE TABLE IF NOT EXISTS product_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES tour_products(id),
  service_slug VARCHAR(120) NOT NULL,
  included BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS tour_departures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES tour_products(id),
  departs_at TIMESTAMPTZ,
  returns_at TIMESTAMPTZ,
  origin_slug VARCHAR(120),
  capacity_status departure_status NOT NULL DEFAULT 'scheduled',
  capacity_total INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS tour_departures_product_idx ON tour_departures(product_id);

CREATE TABLE IF NOT EXISTS route_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  departure_id UUID NOT NULL REFERENCES tour_departures(id),
  segment_order INT NOT NULL DEFAULT 1,
  transport_kind transport_kind NOT NULL DEFAULT 'air',
  from_terminal_slug VARCHAR(120),
  to_terminal_slug VARCHAR(120),
  carrier_slug VARCHAR(120),
  service_no VARCHAR(60),
  departs_at TIMESTAMPTZ,
  arrives_at TIMESTAMPTZ,
  is_nonstop BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS accommodation_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  departure_id UUID NOT NULL REFERENCES tour_departures(id),
  accommodation_slug VARCHAR(160),
  room_basis VARCHAR(80),
  board VARCHAR(80),
  nights INT NOT NULL DEFAULT 0,
  price_status price_status NOT NULL DEFAULT 'on_request',
  price_amount NUMERIC(15,0),
  price_currency VARCHAR(10) NOT NULL DEFAULT 'IRT',
  reviewed_at TIMESTAMPTZ,
  valid_until TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS offer_price_components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id UUID NOT NULL REFERENCES accommodation_offers(id),
  label_fa VARCHAR(160) NOT NULL,
  amount NUMERIC(15,0) NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'IRT'
);

CREATE TABLE IF NOT EXISTS seo_landings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query_owner VARCHAR(220) NOT NULL UNIQUE,
  url_path VARCHAR(300) NOT NULL UNIQUE,
  canonical_path VARCHAR(300) NOT NULL,
  page_type VARCHAR(60) NOT NULL,
  title_fa VARCHAR(220) NOT NULL,
  meta_description_fa VARCHAR(320),
  h1_fa VARCHAR(220) NOT NULL,
  workflow publish_status NOT NULL DEFAULT 'draft',
  index_status index_status NOT NULL DEFAULT 'noindex',
  next_review_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS seo_landing_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  landing_id UUID NOT NULL REFERENCES seo_landings(id),
  product_slug VARCHAR(160) NOT NULL
);

CREATE TABLE IF NOT EXISTS content_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  landing_id UUID NOT NULL REFERENCES seo_landings(id),
  block_order INT NOT NULL DEFAULT 1,
  block_kind VARCHAR(60) NOT NULL DEFAULT 'text',
  body_fa TEXT
);

CREATE TABLE IF NOT EXISTS seo_internal_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_landing_id UUID REFERENCES seo_landings(id),
  from_path VARCHAR(300),
  to_path VARCHAR(300) NOT NULL,
  anchor_fa VARCHAR(220) NOT NULL
);

CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key VARCHAR(120) NOT NULL,
  setting_value TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor VARCHAR(160) NOT NULL,
  action VARCHAR(160) NOT NULL,
  entity VARCHAR(120) NOT NULL,
  entity_id VARCHAR(120),
  reason_fa TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
