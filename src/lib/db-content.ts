/**
 * لایه دسترسی به محتوای سایت از دیتابیس واقعی.
 * - هر تابع ابتدا از DB می‌خواند؛ اگر DB در دسترس نبود یا خالی بود،
 *   به همان دیتای استاتیک پشتیبان برمی‌گردد تا سایت هرگز خالی نشود.
 * - همه توابع فقط سمت سرور قابل استفاده‌اند.
 */
import { getDb } from '@/db/client';
import { siteTours, siteDestinations, guides, exhibitions } from '@/db/schema';
import { asc, desc } from 'drizzle-orm';
import { SAMPLE_TOURS, type TourItem } from '@/src/data/toursData';
import { COUNTRIES, CITIES, type Place } from '@/src/data/destinationsData';
import { GUIDES, type GuideItem } from '@/src/data/guidesData';
import { EXHIBITION_SERIES, type ExhibitionSeries } from '@/src/data/exhibitionsData';

/**
 * استخر دیتابیس روی سرورلس با max:1 ساخته شده، پس کوئری‌های هم‌زمان پشت
 * سر هم در صفِ اتصال می‌مانند و connect_timeout روی انتظار در صف اعمال
 * نمی‌شود. این نگهبان تضمین می‌کند هر خواندن کوچک بماند و در نبودِ
 * پاسخ سریع، به داده‌ی استاتیک پشتیبان برگردد به‌جای آنکه کل رندر تا
 * سقف ۳۰۰ ثانیه‌ی Vercel معلق بماند.
 */
const DB_READ_TIMEOUT_MS = 6000;

function withDbTimeout<T>(promise: Promise<T>, label: string): Promise<T | null> {
  return new Promise<T | null>((resolve) => {
    let settled = false;
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      console.error(`[db-content] timeout reading ${label}; falling back to static data`);
      resolve(null);
    }, DB_READ_TIMEOUT_MS);
    promise.then(
      (value) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        console.error(`[db-content] failed reading ${label}:`, error);
        resolve(null);
      },
    );
  });
}

/* ------------------------------------------------------------------ */
/* تورها                                                               */
/* ------------------------------------------------------------------ */

function rowToTour(row: typeof siteTours.$inferSelect): TourItem {
  return {
    id: row.slug,
    title: row.title,
    type: row.type as TourItem['type'],
    typeLabel: row.typeLabel,
    destination: row.destination,
    origin: row.origin,
    route: row.route,
    duration: row.duration,
    nights: row.nights,
    closestDeparture: row.closestDeparture,
    price: Number(row.price),
    formattedPrice: row.formattedPrice,
    priceNote: row.priceNote,
    status: row.status as TourItem['status'],
    statusLabel: row.statusLabel,
    updatedAt: (row.updatedAt instanceof Date ? row.updatedAt : new Date()).toISOString(),
    image: row.image,
    badge: row.badge ?? undefined,
    features: (row.features as string[]) ?? [],
    visaRequired: row.visaRequired,
    hotelStars: row.hotelStars,
    airline: row.airline,
    includedServices: (row.includedServices as string[]) ?? [],
    excludedServices: (row.excludedServices as string[]) ?? [],
    hotelOptions: (row.hotelOptions as TourItem['hotelOptions']) ?? [],
    description: row.description,
  };
}

export async function getTours(): Promise<TourItem[]> {
  const db = getDb();
  if (!db) return SAMPLE_TOURS;
  const rows = await withDbTimeout(
    db.select().from(siteTours).orderBy(asc(siteTours.createdAt)),
    'tours',
  );
  if (!rows || rows.length === 0) return SAMPLE_TOURS;
  return rows.map(rowToTour);
}

export async function getTour(slug: string): Promise<TourItem | null> {
  const all = await getTours();
  return all.find((t) => t.id === slug) ?? null;
}

/* ------------------------------------------------------------------ */
/* مقصدها (کشور و شهر)                                                 */
/* ------------------------------------------------------------------ */

function rowToPlace(row: typeof siteDestinations.$inferSelect): Place {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    nameEn: row.nameEn,
    type: row.type as Place['type'],
    parentCountrySlug: row.parentCountrySlug ?? undefined,
    parentCountryName: row.parentCountryName ?? undefined,
    category: row.category as Place['category'],
    image: row.image,
    heroTagline: row.heroTagline,
    description: row.description,
    bestSeason: row.bestSeason,
    visaRequired: row.visaRequired,
    visaType: row.visaType ?? undefined,
    flightDuration: row.flightDuration ?? undefined,
    currency: row.currency,
    startingPrice: row.startingPrice,
    startingPriceNote: row.startingPriceNote,
    lastVerifiedAt: row.lastVerifiedAt,
    activeToursCount: row.activeToursCount,
    popularDistricts: (row.popularDistricts as string[]) ?? [],
    keyHighlights: (row.keyHighlights as string[]) ?? [],
    travelTips: (row.travelTips as string[]) ?? [],
    faqs: (row.faqs as Place['faqs']) ?? [],
    relatedGuides: (row.relatedGuides as string[]) ?? [],
  };
}

export async function getDestinations(): Promise<Place[]> {
  const db = getDb();
  if (!db) return [...Object.values(COUNTRIES), ...Object.values(CITIES)];
  const rows = await withDbTimeout(
    db.select().from(siteDestinations).orderBy(asc(siteDestinations.createdAt)),
    'destinations',
  );
  if (!rows || rows.length === 0) return [...Object.values(COUNTRIES), ...Object.values(CITIES)];
  return rows.map(rowToPlace);
}

/** یک بار خوانده می‌شود و هر دو فهرست از همان نتیجه ساخته می‌شوند؛
 *  فراخوانی جداگانه‌ی هرکدام کوئری تکراری روی استخر تک‌اتصالی می‌ساخت. */
let destinationsCache: Promise<Place[]> | null = null;

export function getDestinationsOnce(): Promise<Place[]> {
  if (!destinationsCache) destinationsCache = getDestinations();
  return destinationsCache;
}

export async function getCountries(): Promise<Record<string, Place>> {
  const all = await getDestinationsOnce();
  const countries = all.filter((p) => p.type === 'country');
  if (countries.length === 0) return COUNTRIES;
  return Object.fromEntries(countries.map((c) => [c.slug, c]));
}

export async function getCities(): Promise<Record<string, Place>> {
  const all = await getDestinationsOnce();
  const cities = all.filter((p) => p.type === 'city');
  if (cities.length === 0) return CITIES;
  return Object.fromEntries(cities.map((c) => [c.slug, c]));
}

/* ------------------------------------------------------------------ */
/* راهنماها                                                            */
/* ------------------------------------------------------------------ */

function rowToGuide(row: typeof guides.$inferSelect): GuideItem {
  const sections = (row.sections as GuideItem['sections']) ?? [];
  const faqs = (row.faqs as GuideItem['faqs']) ?? [];
  const lastReviewed = row.lastReviewedAt
    ? new Intl.DateTimeFormat('fa-IR', { dateStyle: 'long' }).format(new Date(row.lastReviewedAt))
    : '';
  return {
    id: row.id,
    slug: row.slug,
    title: row.titleFa,
    category: row.category as GuideItem['category'],
    categoryLabel: row.categoryLabel ?? '',
    readTime: row.readTime ?? '',
    author: row.author ?? '',
    reviewer: row.reviewer ?? '',
    lastReviewedAt: lastReviewed,
    summary: row.summary ?? '',
    heroImage: row.heroImage ?? '',
    directAnswer: row.directAnswer ?? '',
    sections,
    relatedDestinationSlug: row.relatedDestinationSlug ?? undefined,
    relatedTourId: row.relatedTourId ?? undefined,
    faqs,
  };
}

export async function getGuides(): Promise<Record<string, GuideItem>> {
  const db = getDb();
  if (!db) return GUIDES;
  const rows = await withDbTimeout(
    db.select().from(guides).orderBy(desc(guides.updatedAt)),
    'guides',
  );
  if (!rows || rows.length === 0) return GUIDES;
  return Object.fromEntries(rows.map((r) => [r.slug, rowToGuide(r)]));
}

export async function getGuide(slug: string): Promise<GuideItem | null> {
  const all = await getGuides();
  return all[slug] ?? null;
}

/* ------------------------------------------------------------------ */
/* نمایشگاه‌ها                                                          */
/* ------------------------------------------------------------------ */

function rowToExhibition(row: typeof exhibitions.$inferSelect): ExhibitionSeries {
  return {
    id: row.id,
    slug: row.slug,
    title: row.titleFa,
    titleEn: row.titleEn ?? '',
    country: row.country ?? '',
    countrySlug: row.countrySlug ?? '',
    city: row.city ?? '',
    citySlug: row.citySlug ?? '',
    venue: row.venue ?? '',
    officialWebsite: row.officialWebsite ?? '',
    industry: row.industry ?? '',
    industrySlug: row.industrySlug ?? '',
    heroTagline: row.heroTagline ?? '',
    description: row.description ?? '',
    image: row.image ?? '',
    upcomingEdition: {
      editionSlug: row.editionSlug ?? '',
      solarDate: row.solarDate ?? '',
      gregorianDate: row.gregorianDate ?? '',
      phases: (row.phases as ExhibitionSeries['upcomingEdition']['phases']) ?? [],
      visaDeadline: row.visaDeadline ?? '',
      hotelArea: row.hotelArea ?? '',
      startingPrice: row.startingPrice ?? '',
      startingPriceNote: row.startingPriceNote ?? '',
    },
    servicesIncluded: (row.servicesIncluded as string[]) ?? [],
    businessTips: (row.businessTips as string[]) ?? [],
    faqs: (row.faqs as ExhibitionSeries['faqs']) ?? [],
  };
}

export async function getExhibitions(): Promise<Record<string, ExhibitionSeries>> {
  const db = getDb();
  if (!db) return EXHIBITION_SERIES;
  const rows = await withDbTimeout(
    db.select().from(exhibitions).orderBy(desc(exhibitions.updatedAt)),
    'exhibitions',
  );
  if (!rows || rows.length === 0) return EXHIBITION_SERIES;
  return Object.fromEntries(rows.map((r) => [r.slug, rowToExhibition(r)]));
}

export async function getExhibition(slug: string): Promise<ExhibitionSeries | null> {
  const all = await getExhibitions();
  return all[slug] ?? null;
}

export async function getLiveContent(): Promise<{
  tours: TourItem[];
  countries: Record<string, Place>;
  cities: Record<string, Place>;
  guides: Record<string, GuideItem>;
  exhibitions: Record<string, ExhibitionSeries>;
}> {
  // ترتیبی، نه هم‌زمان: استخر روی سرورلس max:1 است و کوئری‌های موازی فقط
  // پشت هم در صفِ یک اتصال می‌مانند. مقصدها یک‌بار خوانده و مشتق می‌شود.
  const tours = await getTours();
  const allPlaces = await getDestinationsOnce();
  const countries =
    allPlaces.filter((p) => p.type === 'country').length > 0
      ? Object.fromEntries(allPlaces.filter((p) => p.type === 'country').map((c) => [c.slug, c]))
      : COUNTRIES;
  const cities =
    allPlaces.filter((p) => p.type === 'city').length > 0
      ? Object.fromEntries(allPlaces.filter((p) => p.type === 'city').map((c) => [c.slug, c]))
      : CITIES;
  const guides = await getGuides();
  const exhibitions = await getExhibitions();
  return { tours, countries, cities, guides, exhibitions };
}