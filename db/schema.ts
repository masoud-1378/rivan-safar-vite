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
  jsonb,
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

export const siteTours = pgTable(
  'site_tours',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    slug: varchar('slug', { length: 160 }).notNull().unique(), // e.g. "istanbul-sep"
    title: varchar('title', { length: 260 }).notNull(),
    type: varchar('type', { length: 60 }).notNull(), // 'foreign' | 'domestic' | 'exhibition'
    typeLabel: varchar('type_label', { length: 120 }).notNull(),
    destination: varchar('destination', { length: 120 }).notNull(),
    destinationSlugs: jsonb('destination_slugs').default('[]').notNull(), // string[] (چند مقصدی)
    origin: varchar('origin', { length: 120 }).notNull(),
    route: varchar('route', { length: 260 }).notNull(),
    duration: varchar('duration', { length: 120 }).notNull(),
    nights: integer('nights').notNull(),
    closestDeparture: varchar('closest_departure', { length: 120 }).notNull(),
    price: numeric('price', { precision: 15, scale: 0 }).notNull(),
    formattedPrice: varchar('formatted_price', { length: 60 }).notNull(),
    priceNote: varchar('price_note', { length: 260 }).notNull(),
    status: varchar('status', { length: 60 }).notNull(), // 'confirmed' | 'pending' | 'updating' | 'full'
    statusLabel: varchar('status_label', { length: 120 }).notNull(),
    image: text('image').notNull(),
    badge: varchar('badge', { length: 120 }),
    features: jsonb('features').default('[]').notNull(), // string[]
    visaRequired: boolean('visa_required').default(false).notNull(),
    hotelStars: integer('hotel_stars').notNull(),
    airline: varchar('airline', { length: 120 }).notNull(),
    includedServices: jsonb('included_services').default('[]').notNull(), // string[]
    excludedServices: jsonb('excluded_services').default('[]').notNull(), // string[]
    hotelOptions: jsonb('hotel_options').default('[]').notNull(), // Array<{ name, stars, board, pricePerPerson }>
    description: text('description').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    slugIdx: index('idx_site_tours_slug').on(table.slug),
  }),
);

export const siteDestinations = pgTable(
  'site_destinations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    slug: varchar('slug', { length: 160 }).notNull().unique(),
    name: varchar('name', { length: 160 }).notNull(),
    nameEn: varchar('name_en', { length: 160 }).notNull(),
    type: varchar('type', { length: 60 }).notNull(), // 'country' | 'city'
    parentCountrySlug: varchar('parent_country_slug', { length: 160 }),
    parentCountryName: varchar('parent_country_name', { length: 160 }),
    category: varchar('category', { length: 120 }).notNull(),
    image: text('image').notNull(),
    heroTagline: varchar('hero_tagline', { length: 300 }).notNull(),
    description: text('description').notNull(),
    bestSeason: varchar('best_season', { length: 300 }).notNull(),
    visaRequired: boolean('visa_required').default(false).notNull(),
    visaType: varchar('visa_type', { length: 160 }),
    flightDuration: varchar('flight_duration', { length: 160 }),
    currency: varchar('currency', { length: 160 }).notNull(),
    startingPrice: varchar('starting_price', { length: 160 }).notNull(),
    startingPriceNote: varchar('starting_price_note', { length: 300 }).notNull(),
    lastVerifiedAt: varchar('last_verified_at', { length: 160 }).notNull(),
    activeToursCount: integer('active_tours_count').default(0).notNull(),
    popularDistricts: jsonb('popular_districts').default('[]').notNull(), // string[]
    keyHighlights: jsonb('key_highlights').default('[]').notNull(), // string[]
    travelTips: jsonb('travel_tips').default('[]').notNull(), // string[]
    faqs: jsonb('faqs').default('[]').notNull(), // Array<{ question, answer }>
    relatedGuides: jsonb('related_guides').default('[]').notNull(), // string[]
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    slugIdx: index('idx_site_destinations_slug').on(table.slug),
  }),
);

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
    parentSlug: varchar('parent_slug', { length: 120 }),
    type: varchar('type', { length: 60 }).notNull().default('city'), // region | country | city
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

// ---------- CMS: مدیران، راهنماها، نمایشگاه‌ها، رسانه ----------

export const adminRoleEnum = pgEnum('admin_role', ['owner', 'editor']);

export const adminUsers = pgTable('admin_users', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().unique(),
  email: varchar('email', { length: 200 }).notNull(),
  role: adminRoleEnum('role').notNull().default('editor'),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const guides = pgTable(
  'guides',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    slug: varchar('slug', { length: 160 }).notNull().unique(),
    titleFa: varchar('title_fa', { length: 260 }).notNull(),
    category: varchar('category', { length: 60 }).notNull().default('general'),
    categoryLabel: varchar('category_label', { length: 120 }),
    readTime: varchar('read_time', { length: 40 }),
    author: varchar('author', { length: 160 }),
    reviewer: varchar('reviewer', { length: 160 }),
    summary: text('summary'),
    heroImage: text('hero_image'),
    directAnswer: text('direct_answer'),
    sections: jsonb('sections').notNull().default([]),
    faqs: jsonb('faqs').notNull().default([]),
    relatedDestinationSlug: varchar('related_destination_slug', { length: 160 }),
    relatedTourId: varchar('related_tour_id', { length: 160 }),
    status: publishStatusEnum('status').notNull().default('draft'),
    lastReviewedAt: timestamp('last_reviewed_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
);

export const guideLinks = pgTable('guide_links', {
  id: uuid('id').primaryKey().defaultRandom(),
  guideId: uuid('guide_id')
    .notNull()
    .references(() => guides.id, { onDelete: 'cascade' }),
  toPath: varchar('to_path', { length: 300 }).notNull(),
  anchorFa: varchar('anchor_fa', { length: 220 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const exhibitions = pgTable(
  'exhibitions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    slug: varchar('slug', { length: 160 }).notNull().unique(),
    titleFa: varchar('title_fa', { length: 260 }).notNull(),
    titleEn: varchar('title_en', { length: 260 }),
    country: varchar('country', { length: 120 }),
    countrySlug: varchar('country_slug', { length: 160 }),
    city: varchar('city', { length: 120 }),
    citySlug: varchar('city_slug', { length: 160 }),
    venue: varchar('venue', { length: 220 }),
    officialWebsite: text('official_website'),
    industry: varchar('industry', { length: 220 }),
    industrySlug: varchar('industry_slug', { length: 160 }),
    heroTagline: text('hero_tagline'),
    description: text('description'),
    image: text('image'),
    editionSlug: varchar('edition_slug', { length: 120 }),
    solarDate: varchar('solar_date', { length: 120 }),
    gregorianDate: varchar('gregorian_date', { length: 120 }),
    phases: jsonb('phases').notNull().default([]),
    visaDeadline: text('visa_deadline'),
    hotelArea: text('hotel_area'),
    startingPrice: varchar('starting_price', { length: 160 }),
    startingPriceNote: text('starting_price_note'),
    servicesIncluded: jsonb('services_included').notNull().default([]),
    businessTips: jsonb('business_tips').notNull().default([]),
    faqs: jsonb('faqs').notNull().default([]),
    status: publishStatusEnum('status').notNull().default('draft'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
);

export const media = pgTable('media', {
  id: uuid('id').primaryKey().defaultRandom(),
  url: text('url').notNull(),
  altFa: varchar('alt_fa', { length: 260 }).notNull(),
  source: varchar('source', { length: 260 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const leadStatusEnum = pgEnum('lead_status', [
  'new',
  'contacted',
  'qualified',
  'won',
  'lost',
  'invalid',
]);

export const leadRequests = pgTable('lead_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  fullName: varchar('full_name', { length: 160 }).notNull(),
  phone: varchar('phone', { length: 20 }).notNull(),
  sourcePath: varchar('source_path', { length: 300 }).notNull(),
  tourContext: varchar('tour_context', { length: 220 }),
  destinationHint: varchar('destination_hint', { length: 120 }),
  passengers: varchar('passengers', { length: 20 }),
  notes: text('notes'),
  status: leadStatusEnum('status').notNull().default('new'),
  assignee: varchar('assignee', { length: 160 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
