/**
 * اسکیمای Drizzle برای ریوان سفر — عین سند 05_DATABASE_STRATEGY.
 *
 * اصل کلیدی: Product / Departure / Route / Offer از هم جدا هستند تا
 * قیمت، ظرفیت، مسیر و صفحه سئو قاطی نشوند و ادعای جعلی
 * (مثل «پرواز مستقیم از شیراز») ساخته نشود.
 */
import {
  pgTable,
  uuid,
  text,
  varchar,
  integer,
  boolean,
  timestamp,
  numeric,
  pgEnum,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';

// ---------- Enumها ----------

export const placeTypeEnum = pgEnum('place_type', [
  'region',
  'country',
  'city',
  'island',
]);

export const departureStatusEnum = pgEnum('departure_status', [
  'scheduled',
  'confirmed',
  'limited',
  'full',
  'cancelled',
]);

export const priceStatusEnum = pgEnum('price_status', [
  'confirmed',
  'on_request',
  'under_review',
  'expired',
]);

export const publishStatusEnum = pgEnum('publish_status', [
  'draft',
  'review',
  'published',
  'paused',
  'archived',
]);

export const indexStatusEnum = pgEnum('index_status', [
  'index',
  'noindex',
]);

export const transportKindEnum = pgEnum('transport_kind', [
  'air',
  'land',
  'rail',
  'sea',
  'mixed',
]);

// ---------- کاتالوگ مرجع ----------

export const places = pgTable(
  'places',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    slug: varchar('slug', { length: 120 }).notNull(),
    nameFa: varchar('name_fa', { length: 120 }).notNull(),
    nameEn: varchar('name_en', { length: 120 }),
    type: placeTypeEnum('type').notNull(),
    parentId: uuid('parent_id'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => [uniqueIndex('places_slug_uidx').on(t.slug)],
);

export const placeAliases = pgTable('place_aliases', {
  id: uuid('id').primaryKey().defaultRandom(),
  placeId: uuid('place_id')
    .notNull()
    .references(() => places.id),
  aliasFa: varchar('alias_fa', { length: 120 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const originCities = pgTable(
  'origin_cities',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    slug: varchar('slug', { length: 120 }).notNull(),
    nameFa: varchar('name_fa', { length: 120 }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => [uniqueIndex('origin_cities_slug_uidx').on(t.slug)],
);

export const terminals = pgTable('terminals', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: varchar('slug', { length: 120 }).notNull(),
  nameFa: varchar('name_fa', { length: 160 }).notNull(),
  kind: varchar('kind', { length: 40 }).notNull().default('airport'),
  citySlug: varchar('city_slug', { length: 120 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const carriers = pgTable('carriers', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: varchar('slug', { length: 120 }).notNull(),
  nameFa: varchar('name_fa', { length: 160 }).notNull(),
  kind: varchar('kind', { length: 40 }).notNull().default('airline'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const accommodations = pgTable('accommodations', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: varchar('slug', { length: 160 }).notNull(),
  nameFa: varchar('name_fa', { length: 200 }).notNull(),
  stars: integer('stars'),
  placeSlug: varchar('place_slug', { length: 120 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const services = pgTable('services', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: varchar('slug', { length: 120 }).notNull(),
  nameFa: varchar('name_fa', { length: 160 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ---------- محصول و فروش ----------

export const tourProducts = pgTable(
  'tour_products',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    slug: varchar('slug', { length: 160 }).notNull(),
    titleFa: varchar('title_fa', { length: 220 }).notNull(),
    tourKind: varchar('tour_kind', { length: 40 }).notNull().default('foreign'),
    status: publishStatusEnum('status').notNull().default('draft'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => [uniqueIndex('tour_products_slug_uidx').on(t.slug)],
);

export const tourStops = pgTable('tour_stops', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id')
    .notNull()
    .references(() => tourProducts.id),
  placeSlug: varchar('place_slug', { length: 120 }).notNull(),
  stopOrder: integer('stop_order').notNull().default(1),
  nights: integer('nights').notNull().default(0),
});

export const productOriginCities = pgTable('product_origin_cities', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id')
    .notNull()
    .references(() => tourProducts.id),
  originSlug: varchar('origin_slug', { length: 120 }).notNull(),
  noteFa: text('note_fa'),
});

export const productServices = pgTable('product_services', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id')
    .notNull()
    .references(() => tourProducts.id),
  serviceSlug: varchar('service_slug', { length: 120 }).notNull(),
  included: boolean('included').notNull().default(true),
});

export const tourDepartures = pgTable(
  'tour_departures',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    productId: uuid('product_id')
      .notNull()
      .references(() => tourProducts.id),
    departsAt: timestamp('departs_at'),
    returnsAt: timestamp('returns_at'),
    originSlug: varchar('origin_slug', { length: 120 }),
    capacityStatus: departureStatusEnum('capacity_status')
      .notNull()
      .default('scheduled'),
    capacityTotal: integer('capacity_total'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => [index('tour_departures_product_idx').on(t.productId)],
);

export const routeSegments = pgTable('route_segments', {
  id: uuid('id').primaryKey().defaultRandom(),
  departureId: uuid('departure_id')
    .notNull()
    .references(() => tourDepartures.id),
  segmentOrder: integer('segment_order').notNull().default(1),
  transportKind: transportKindEnum('transport_kind').notNull().default('air'),
  fromTerminalSlug: varchar('from_terminal_slug', { length: 120 }),
  toTerminalSlug: varchar('to_terminal_slug', { length: 120 }),
  carrierSlug: varchar('carrier_slug', { length: 120 }),
  serviceNo: varchar('service_no', { length: 60 }),
  departsAt: timestamp('departs_at'),
  arrivesAt: timestamp('arrives_at'),
  isNonstop: boolean('is_nonstop').notNull().default(false),
});

export const accommodationOffers = pgTable('accommodation_offers', {
  id: uuid('id').primaryKey().defaultRandom(),
  departureId: uuid('departure_id')
    .notNull()
    .references(() => tourDepartures.id),
  accommodationSlug: varchar('accommodation_slug', { length: 160 }),
  roomBasis: varchar('room_basis', { length: 80 }),
  board: varchar('board', { length: 80 }),
  nights: integer('nights').notNull().default(0),
  priceStatus: priceStatusEnum('price_status').notNull().default('on_request'),
  priceAmount: numeric('price_amount', { precision: 15, scale: 0 }),
  priceCurrency: varchar('price_currency', { length: 10 })
    .notNull()
    .default('IRT'),
  reviewedAt: timestamp('reviewed_at'),
  validUntil: timestamp('valid_until'),
});

export const offerPriceComponents = pgTable('offer_price_components', {
  id: uuid('id').primaryKey().defaultRandom(),
  offerId: uuid('offer_id')
    .notNull()
    .references(() => accommodationOffers.id),
  labelFa: varchar('label_fa', { length: 160 }).notNull(),
  amount: numeric('amount', { precision: 15, scale: 0 }).notNull(),
  currency: varchar('currency', { length: 10 }).notNull().default('IRT'),
});

// ---------- سئو و مدیریت سایت ----------

export const seoLandings = pgTable(
  'seo_landings',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    queryOwner: varchar('query_owner', { length: 220 }).notNull(),
    urlPath: varchar('url_path', { length: 300 }).notNull(),
    canonicalPath: varchar('canonical_path', { length: 300 }).notNull(),
    pageType: varchar('page_type', { length: 60 }).notNull(),
    titleFa: varchar('title_fa', { length: 220 }).notNull(),
    metaDescriptionFa: varchar('meta_description_fa', { length: 320 }),
    h1Fa: varchar('h1_fa', { length: 220 }).notNull(),
    workflow: publishStatusEnum('workflow').notNull().default('draft'),
    indexStatus: indexStatusEnum('index_status').notNull().default('noindex'),
    nextReviewAt: timestamp('next_review_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex('seo_landings_url_uidx').on(t.urlPath),
    uniqueIndex('seo_landings_query_uidx').on(t.queryOwner),
  ],
);

export const seoLandingProducts = pgTable('seo_landing_products', {
  id: uuid('id').primaryKey().defaultRandom(),
  landingId: uuid('landing_id')
    .notNull()
    .references(() => seoLandings.id),
  productSlug: varchar('product_slug', { length: 160 }).notNull(),
});

export const contentBlocks = pgTable('content_blocks', {
  id: uuid('id').primaryKey().defaultRandom(),
  landingId: uuid('landing_id')
    .notNull()
    .references(() => seoLandings.id),
  blockOrder: integer('block_order').notNull().default(1),
  blockKind: varchar('block_kind', { length: 60 }).notNull().default('text'),
  bodyFa: text('body_fa'),
});

export const seoInternalLinks = pgTable('seo_internal_links', {
  id: uuid('id').primaryKey().defaultRandom(),
  fromLandingId: uuid('from_landing_id').references(() => seoLandings.id),
  fromPath: varchar('from_path', { length: 300 }),
  toPath: varchar('to_path', { length: 300 }).notNull(),
  anchorFa: varchar('anchor_fa', { length: 220 }).notNull(),
});

export const siteSettings = pgTable('site_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  settingKey: varchar('setting_key', { length: 120 }).notNull(),
  settingValue: text('setting_value').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  actor: varchar('actor', { length: 160 }).notNull(),
  action: varchar('action', { length: 120 }).notNull(),
  entity: varchar('entity', { length: 120 }).notNull(),
  entityId: varchar('entity_id', { length: 120 }),
  reasonFa: text('reason_fa'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
