'use server';

import { revalidatePath } from 'next/cache';
import { getDb } from '@/db/client';
import { accommodations, originCities, siteDestinations, siteTours } from '@/db/schema';
import { asc, desc, eq, isNull } from 'drizzle-orm';
import { requireAdmin } from '@/src/lib/admin-auth';
import { archiveOne } from '@/src/lib/archive';

export type HotelBookingType = 'guarantee' | 'semi_charter' | 'on_request';

export interface TourHotelOptionItem {
  name?: string;
  stars?: number;
  board?: string;
  /**
   * نوع رزرو هتل در این تور (کتابچه §۳، فاز ۲): راهنمای ترتیبِ فیلدهای نرخ.
   * اختیاری است تا ردیف‌های قدیمی بی‌نوع هم معتبر بمانند.
   * مقدار ذخیره‌شده کد لاتین است؛ برچسب فارسی در UI.
   */
  bookingType?: HotelBookingType;
  pricePerPerson?: string;
  priceDouble?: string;
  priceSingle?: string;
  priceChildWithBed?: string;
  priceChildNoBed?: string;
  locationNote?: string;
  /** اتصال به رکورد جدول هتل‌ها (accommodations.id)؛ قیمت‌ها همیشه ویژهٔ این تور دستی وارد می‌شوند */
  hotelId?: string;
}

export interface TourItineraryDayItem {
  day: number;
  title: string;
  city: string;
  description: string;
  activityType: 'guided' | 'free' | 'transit' | 'departure' | string;
  meals?: string;
}

export interface TourTrustSpecsItem {
  returnGuarantee?: string;
  cityTax?: string;
  tipsNote?: string;
  luggageKg?: number;
  activityLevel?: 'easy' | 'moderate' | 'demanding' | string;
  requiredDocs?: string[];
}

export interface TourConsultantSpecItem {
  name?: string;
  title?: string;
  phone?: string;
  audioUrl?: string;
  emergencyPhone?: string;
}

export interface TourInput {
  slug: string;
  title: string;
  type: string;
  typeLabel: string;
  destinationSlugs: string[];
  destination: string;
  origin: string;
  route: string;
  duration: string;
  nights: number;
  closestDeparture: string;
  price: number;
  formattedPrice: string;
  priceNote: string;
  status: string;
  statusLabel: string;
  /** گیت انتشار (مایگریشن 0011): 'draft' پیش‌نویس، 'published' منتشرشده */
  publishStatus: 'draft' | 'published';
  image: string;
  badge: string;
  features: string[];
  visaRequired: boolean;
  hotelStars: number;
  airline: string;
  includedServices: string[];
  excludedServices: string[];
  hotelOptions: TourHotelOptionItem[];
  description: string;
  transportKind?: 'air' | 'rail' | 'land' | 'mixed' | string;
  carrierName?: string;
  guaranteedDeparture?: boolean;
  splitPriceCurrency?: string;
  splitPriceAmount?: string;
  splitFlightPrice?: string;
  itineraryDays?: TourItineraryDayItem[];
  trustSpecs?: TourTrustSpecsItem;
  consultantSpec?: TourConsultantSpecItem;
}

export interface DestinationTreeCity {
  slug: string;
  name: string;
}

export interface DestinationTreeCountry {
  slug: string;
  name: string;
  cities: DestinationTreeCity[];
}

export interface DestinationTreeRegion {
  slug: string;
  name: string;
  countries: DestinationTreeCountry[];
}

export interface DestinationTree {
  regions: DestinationTreeRegion[];
  all: Array<{ slug: string; name: string; type: string; parent: string }>;
}

export type OriginRow = {
  slug: string;
  nameFa: string;
  type: string;
  parentSlug: string;
};

export interface HotelRow extends Record<string, unknown> {
  id: string;
  slug: string;
  nameFa: string;
  stars: number;
  placeSlug: string;
}

function asStringArray(v: unknown): string[] {
  if (Array.isArray(v)) return v.map((x) => String(x)).filter((x) => x.trim() !== '');
  return [];
}

const FA_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

function faPrice(n: unknown): string {
  const grouped = Math.max(0, Math.round(Number(n) || 0)).toLocaleString('en-US');
  return grouped.replace(/\d/g, (d) => FA_DIGITS[Number(d)]).replace(/,/g, '٬');
}

const DOMESTIC_SLUGS = [
  'iran',
  'kish',
  'mashhad',
  'qeshm',
  'qeshm-island',
  'shiraz',
  'isfahan',
  'yazd',
  'tabriz',
  'chabahar',
  'kerman',
  'ahvaz',
  'rasht',
  'hamedan',
];

const DOMESTIC_NAME_RE = /کیش|مشهد|قشم|شیراز|اصفهان|یزد|تبریز|چابهار|کرمان|اهواز|رشت|همدان|ایران/;

type DestRecord = typeof siteDestinations.$inferSelect;

function isDomesticSlug(slug: string, bySlug: Map<string, DestRecord>): boolean {
  if (DOMESTIC_SLUGS.includes(slug)) return true;
  let cur = bySlug.get(slug);
  if (!cur) return false;
  if (DOMESTIC_NAME_RE.test(cur.name)) return true;
  for (let i = 0; i < 10 && cur; i++) {
    if (cur.slug === 'iran') return true;
    const p = cur.parentCountrySlug ?? '';
    if (!p) return false;
    if (p === 'iran' || DOMESTIC_SLUGS.includes(p)) return true;
    cur = bySlug.get(p);
    if (cur && DOMESTIC_NAME_RE.test(cur.name)) return true;
  }
  return false;
}

type SiteTourRow = typeof siteTours.$inferSelect;

function toTourRow(r: SiteTourRow) {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    type: r.type,
    typeLabel: r.typeLabel,
    destinationSlugs: asStringArray(r.destinationSlugs),
    destination: r.destination,
    origin: r.origin,
    route: r.route,
    duration: r.duration,
    nights: r.nights,
    closestDeparture: r.closestDeparture,
    price: Number(r.price),
    formattedPrice: r.formattedPrice,
    priceNote: r.priceNote,
    status: r.status,
    statusLabel: r.statusLabel,
    publishStatus: (r.publishStatus ?? 'draft') as 'draft' | 'published',
    image: r.image,
    badge: r.badge ?? '',
    features: asStringArray(r.features),
    visaRequired: r.visaRequired,
    hotelStars: r.hotelStars,
    airline: r.airline,
    includedServices: asStringArray(r.includedServices),
    excludedServices: asStringArray(r.excludedServices),
    hotelOptions: Array.isArray(r.hotelOptions) ? r.hotelOptions : [],
    description: r.description,
    itineraryDays: Array.isArray(r.itineraryDays) ? (r.itineraryDays as TourItineraryDayItem[]) : [],
    trustSpecs: (r.trustSpecs as TourTrustSpecsItem | null) ?? null,
    consultantSpec: (r.consultantSpec as TourConsultantSpecItem | null) ?? null,
  };
}

export async function listTours() {
  await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  const rows = await db.select().from(siteTours).where(isNull(siteTours.deletedAt)).orderBy(desc(siteTours.updatedAt)).limit(300);
  return rows.map(toTourRow);
}

export type TourRow = Awaited<ReturnType<typeof listTours>>[number];

/** خواندن یک تور برای صفحهٔ ویرایش؛ بایگانی‌شده‌ها null برمی‌گردانند (→ صفحه ۴۰۴). */
export async function getTourById(id: string): Promise<TourRow | null> {
  await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  const rows = await db.select().from(siteTours).where(eq(siteTours.id, id)).limit(1);
  const r = rows[0];
  if (!r || r.deletedAt) return null;
  return toTourRow(r);
}

/** خواندن یک تور با نامک (برای تکثیر از روی تور موجود). */
export async function getTourBySlug(slug: string): Promise<TourRow | null> {
  await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  const s = (slug || '').trim();
  if (!s) return null;
  const rows = await db.select().from(siteTours).where(eq(siteTours.slug, s)).limit(1);
  const r = rows[0];
  if (!r || r.deletedAt) return null;
  return toTourRow(r);
}

export async function listDestinationTree(): Promise<DestinationTree> {
  await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  const rows = await db.select().from(siteDestinations).where(isNull(siteDestinations.deletedAt)).orderBy(asc(siteDestinations.name)).limit(1000);
  const all = rows.map((r) => ({
    slug: r.slug,
    name: r.name,
    type: r.type,
    parent: r.parentCountrySlug ?? '',
  }));
  const regions = new Map<string, DestinationTreeRegion>();
  const countries = new Map<string, DestinationTreeCountry>();
  for (const r of rows) {
    if (r.type === 'region') regions.set(r.slug, { slug: r.slug, name: r.name, countries: [] });
  }
  const orphanCountries: DestinationTreeCountry[] = [];
  for (const r of rows) {
    if (r.type !== 'country') continue;
    const node: DestinationTreeCountry = { slug: r.slug, name: r.name, cities: [] };
    countries.set(r.slug, node);
    const region = regions.get(r.parentCountrySlug ?? '');
    if (region) region.countries.push(node);
    else orphanCountries.push(node);
  }
  const orphanCities: DestinationTreeCity[] = [];
  for (const r of rows) {
    if (r.type !== 'city') continue;
    const country = countries.get(r.parentCountrySlug ?? '');
    if (country) {
      country.cities.push({ slug: r.slug, name: r.name });
    } else if (regions.has(r.parentCountrySlug ?? '')) {
      const pseudo: DestinationTreeCountry = { slug: r.slug, name: r.name, cities: [] };
      countries.set(r.slug, pseudo);
      regions.get(r.parentCountrySlug ?? '')!.countries.push(pseudo);
    } else {
      orphanCities.push({ slug: r.slug, name: r.name });
    }
  }
  for (const c of orphanCities) {
    const pseudo: DestinationTreeCountry = { slug: c.slug, name: c.name, cities: [] };
    countries.set(c.slug, pseudo);
    orphanCountries.push(pseudo);
  }
  const list = [...regions.values()];
  if (orphanCountries.length > 0) {
    list.push({ slug: '__other', name: 'سایر مقصدها', countries: orphanCountries });
  }
  return { regions: list, all };
}

export async function listOrigins(): Promise<OriginRow[]> {
  await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  const rows = await db.select().from(originCities).where(isNull(originCities.deletedAt)).orderBy(asc(originCities.nameFa)).limit(500);
  return rows.map((r) => ({
    slug: r.slug,
    nameFa: r.nameFa,
    type: r.type,
    parentSlug: r.parentSlug ?? '',
  }));
}

export async function saveTour(id: string | undefined | null, data: TourInput) {
  await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  const slug = (data.slug || '').trim();
  const title = (data.title || '').trim();
  if (!slug) throw new Error('نامک (slug) لازم است.');
  if (title.length < 2) throw new Error('عنوان تور لازم است.');

  const destSlugs = asStringArray(data.destinationSlugs);
  const [destRows, originRows] = await Promise.all([
    db.select().from(siteDestinations).where(isNull(siteDestinations.deletedAt)).limit(2000),
    db.select().from(originCities).where(isNull(originCities.deletedAt)).limit(2000),
  ]);
  const destBySlug = new Map(destRows.map((r) => [r.slug, r]));
  const originBySlug = new Map(originRows.map((r) => [r.slug, r.nameFa]));
  const names = destSlugs.map((s) => destBySlug.get(s)?.name ?? s).filter(Boolean);
  const destination = names[0] ?? (data.destination || '');
  const originName = originBySlug.get(data.origin) ?? (data.origin || '');
  const route =
    names.length > 0
      ? originName
        ? `${originName} به ${names.join(' و ')}`
        : names.join(' و ')
      : data.route || '';

  const price = Math.max(0, Number(data.price) || 0);
  const hotelOptions = Array.isArray(data.hotelOptions) ? data.hotelOptions : [];
  const hotelStars = hotelOptions.reduce((m, h) => Math.max(m, Number(h?.stars) || 0), 0);

  let visaRequired = Boolean(data.visaRequired);
  if (destSlugs.length > 0) {
    visaRequired = !destSlugs.every((s) => isDomesticSlug(s, destBySlug));
  }

  const carrier = (data.carrierName || data.airline || '').trim();
  const badge = data.badge || (data.guaranteedDeparture ? 'حرکت تضمین‌شده' : null);
  const normalizedHotels = hotelOptions.map((h) => {
    // ستارهٔ خالی یا نامعتبر هرگز حدس زده نمی‌شود؛ نبودن کلید یعنی «بدون درجه» و سایت «—» نشان می‌دهد.
    const starNum = Number(h.stars);
    const validStars = Number.isFinite(starNum) && starNum >= 0 && starNum <= 7 ? Math.round(starNum) : undefined;
    return {
      hotelId: h.hotelId ?? null,
      name: h.name ?? '',
      ...(validStars !== undefined ? { stars: validStars } : {}),
      board: h.board ?? 'BB',
    bookingType: h.bookingType === 'guarantee' || h.bookingType === 'semi_charter' || h.bookingType === 'on_request' ? h.bookingType : undefined,
    pricePerPerson: h.pricePerPerson || h.priceDouble || '',
    priceDouble: h.priceDouble || h.pricePerPerson || '',
    priceSingle: h.priceSingle || '',
    priceChildWithBed: h.priceChildWithBed || '',
    priceChildNoBed: h.priceChildNoBed || '',
    locationNote: h.locationNote || '',
    };
  });

  // مرحله‌های ۳ تا ۵ ویزارد: برنامه روزبه‌روز، سپر اعتماد و مشخصات کارشناس.
  // هر سه ستون jsonb روی site_tours آماده‌اند؛ این‌جا واقعاً نوشته می‌شوند.
  const normalizedItinerary: TourItineraryDayItem[] = Array.isArray(data.itineraryDays)
    ? data.itineraryDays.map((d, i) => {
        const o = (d ?? {}) as Partial<TourItineraryDayItem>;
        return {
          day: Number(o.day) || i + 1,
          title: String(o.title ?? ''),
          city: String(o.city ?? ''),
          description: String(o.description ?? ''),
          activityType: String(o.activityType ?? 'guided'),
          meals: o.meals ? String(o.meals) : undefined,
        };
      })
    : [];

  const rawTrust = (data.trustSpecs ?? {}) as Partial<TourTrustSpecsItem>;
  const normalizedTrust: TourTrustSpecsItem = {
    returnGuarantee: String(rawTrust.returnGuarantee ?? ''),
    cityTax: String(rawTrust.cityTax ?? ''),
    tipsNote: String(rawTrust.tipsNote ?? ''),
    luggageKg: Number(rawTrust.luggageKg) || 0,
    activityLevel: String(rawTrust.activityLevel ?? 'easy'),
    requiredDocs: asStringArray(rawTrust.requiredDocs),
  };

  const rawConsultant = (data.consultantSpec ?? {}) as Partial<TourConsultantSpecItem>;
  const normalizedConsultant: TourConsultantSpecItem = {
    name: String(rawConsultant.name ?? ''),
    title: String(rawConsultant.title ?? ''),
    phone: String(rawConsultant.phone ?? ''),
    audioUrl: String(rawConsultant.audioUrl ?? ''),
    emergencyPhone: String(rawConsultant.emergencyPhone ?? ''),
  };

  const values = {
    slug,
    title,
    type: data.type || 'foreign',
    typeLabel: data.typeLabel || '',
    destinationSlugs: destSlugs,
    destination,
    origin: originName,
    route,
    duration: data.duration || '',
    nights: Math.max(0, Number(data.nights) || 0),
    closestDeparture: data.closestDeparture || '',
    price: String(price),
    formattedPrice: faPrice(price),
    priceNote: 'برای هر بزرگسال در اتاق دو تخته',
    status: data.status || 'pending',
    statusLabel: data.statusLabel || '',
    // گیت انتشار (مایگریشن 0011): تور تازه همیشه پیش‌نویس است، مگر این‌که صراحتاً «انتشار» زده شود.
    publishStatus: (data.publishStatus === 'published' ? 'published' : 'draft') as 'draft' | 'published',
    image: data.image || '',
    badge,
    features: data.features ?? [],
    visaRequired,
    hotelStars,
    airline: carrier,
    includedServices: data.includedServices ?? [],
    excludedServices: data.excludedServices ?? [],
    hotelOptions: normalizedHotels,
    description: data.description || '',
    itineraryDays: normalizedItinerary,
    trustSpecs: normalizedTrust,
    consultantSpec: normalizedConsultant,
    updatedAt: new Date(),
  };

  if (id) {
    await db.update(siteTours).set(values).where(eq(siteTours.id, id));
  } else {
    const inserted = await db.insert(siteTours).values(values).returning({ id: siteTours.id });
    id = inserted[0]?.id ?? id;
  }
  revalidatePath('/admin/tours');
  if (id) revalidatePath(`/admin/tours/${id}`);
  return { ok: true, id: id ?? null };
}

/**
 * تغییر وضعیت انتشار یک تور (گیت انتشار، مایگریشن 0011).
 * 'published' یعنی تور واقعاً روی سایت دیده می‌شود؛ 'draft' یعنی پنهان است.
 */
export async function setTourPublishStatus(id: string, next: 'draft' | 'published') {
  await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  if (next !== 'draft' && next !== 'published') throw new Error('وضعیت انتشار نامعتبر است.');
  const cleanId = (id || '').trim();
  if (!cleanId) throw new Error('شناسهٔ تور نامعتبر است.');
  await db
    .update(siteTours)
    .set({ publishStatus: next, updatedAt: new Date() })
    .where(eq(siteTours.id, cleanId));
  revalidatePath('/admin/tours');
  revalidatePath(`/admin/tours/${cleanId}`);
  return { ok: true, publishStatus: next };
}

/**
 * قلم بخش ۲ کتابچه: ویرایش در جای «قیمت پایه» از جدول تورها.
 * فقط قیمت تومانی (همان که مشتری می‌بیند) را عوض می‌کند؛ بقیهٔ فیلدها دست نمی‌خورند.
 */
export async function updateTourPrice(id: string, price: number) {
  await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  const cleanId = (id || '').trim();
  if (!cleanId) throw new Error('تور مشخص نیست.');
  const amount = Math.round(Number(price));
  if (!Number.isFinite(amount) || amount < 0) throw new Error('قیمت باید عددی نامنفی باشد.');
  const rows = await db.select({ id: siteTours.id }).from(siteTours).where(eq(siteTours.id, cleanId)).limit(1);
  if (rows.length === 0) throw new Error('تور پیدا نشد.');
  const formatted = faPrice(amount);
  await db
    .update(siteTours)
    .set({ price: String(amount), formattedPrice: formatted, updatedAt: new Date() })
    .where(eq(siteTours.id, cleanId));
  revalidatePath('/admin/tours');
  return { ok: true, price: amount, formattedPrice: formatted };
}

export async function deleteTour(id: string) {
  const session = await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  const rows = await db
    .select({ title: siteTours.title })
    .from(siteTours)
    .where(eq(siteTours.id, id))
    .limit(1);
  await archiveOne(db, siteTours, id, {
    actor: session.email,
    entity: 'site_tours',
    reasonFa: `بایگانی تور «${rows[0]?.title ?? id}»`,
  });
  revalidatePath('/admin/tours');
  return { ok: true };
}

export async function checkSlugUnique(slug: string, excludeId?: string | null) {
  await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  const s = (slug || '').trim();
  if (!s) return { unique: false };
  const rows = await db.select().from(siteTours).where(eq(siteTours.slug, s)).limit(2);
  const taken = rows.some((r) => r.id !== excludeId);
  return { unique: !taken };
}
