/**
 * لایه دسترسی به محتوای سایت از دیتابیس واقعی.
 * - هر تابع ابتدا از REST امن Supabase می‌خواند؛ اگر در دسترس نبود یا خالی
 *   بود، به همان دیتای استاتیک پشتیبان برمی‌گردد تا سایت هرگز خالی نشود.
 * - همه توابع فقط سمت سرور قابل استفاده‌اند.
 */
import { getRest } from './supabase-rest';
import { SAMPLE_TOURS, type TourItem, type TourItineraryDay } from '@/src/data/toursData';
import { COUNTRIES, CITIES, type Place } from '@/src/data/destinationsData';
import { GUIDES, type GuideItem } from '@/src/data/guidesData';
import { EXHIBITION_SERIES, type ExhibitionSeries } from '@/src/data/exhibitionsData';

type Row = Record<string, unknown>;

const str = (v: unknown, fallback = ''): string =>
  typeof v === 'string' ? v : v == null ? fallback : String(v);
const num = (v: unknown, fallback = 0): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};
const arr = <T>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);
const iso = (v: unknown): string => {
  if (typeof v === 'string' && v) return v;
  if (v instanceof Date) return v.toISOString();
  return new Date().toISOString();
};

/* ------------------------------------------------------------------ */
/* تورها                                                               */
/* ------------------------------------------------------------------ */

function restToTour(r: Row): TourItem {
  return {
    id: str(r.slug),
    title: str(r.title),
    type: r.type as TourItem['type'],
    typeLabel: str(r.type_label),
    destination: str(r.destination),
    origin: str(r.origin),
    route: str(r.route),
    duration: str(r.duration),
    nights: num(r.nights),
    closestDeparture: str(r.closest_departure),
    price: num(r.price),
    formattedPrice: str(r.formatted_price),
    priceNote: str(r.price_note),
    status: r.status as TourItem['status'],
    statusLabel: str(r.status_label),
    // گیت انتشار تور (مایگریشن 0011)؛ ستون ممکن است هنوز روی دیتابیس نباشد.
    publishStatus: (r.publish_status as TourItem['publishStatus']) ?? undefined,
    updatedAt: iso(r.updated_at),
    image: str(r.image),
    badge: (r.badge as string) ?? undefined,
    features: arr<string>(r.features),
    visaRequired: Boolean(r.visa_required),
    hotelStars: num(r.hotel_stars),
    airline: str(r.airline),
    includedServices: arr<string>(r.included_services),
    excludedServices: arr<string>(r.excluded_services),
    hotelOptions: arr<TourItem['hotelOptions'][number]>(r.hotel_options),
    description: str(r.description),
    // پنج ستون جاافتاده (ردیف ۲-۱)؛ jsonbها خام عبور می‌کنند، نرمالایز با کامپوننت.
    destinationSlugs: arr<string>(r.destination_slugs),
    // transport_kind از مایگریشن 0014 می‌آید که ممکن است هنوز روی دیتابیس واقعی
    // اجرا نشده باشد؛ نبود کلید در ردیف فقط undefined می‌دهد و هیچ‌چیز نمی‌شکند.
    transportKind: (r.transport_kind as TourItem['transportKind']) ?? undefined,
    itineraryDays: arr<TourItineraryDay>(r.itinerary_days),
    trustSpecs: (r.trust_specs as TourItem['trustSpecs']) ?? undefined,
    consultantSpec: (r.consultant_spec as TourItem['consultantSpec']) ?? undefined,
  };
}

/**
 * میز P-A فاز ۲: کش پرومیس تورها (همان الگوی PB-05 میز P-B برای مقصدها).
 * getDestinations برای شمارش «تور فعال» دوباره getTours را صدا می‌زند و
 * getLiveContent هم چند فراخوان موازی دارد؛ بدون این کش، هر ریکوئست دو بار
 * کل جدول site_tours را می‌خواند. TTL پنج‌دقیقه‌ای روی نمونهٔ گرم سرورلس
 * کهنه‌ماندن ابدی را می‌گیرد؛ تصمیم امنیتی/انتشاری نمی‌گیرد (فقط خواندن).
 */
const TOURS_TTL_MS = 5 * 60 * 1000;
let toursCache: { promise: Promise<TourItem[]>; at: number } | null = null;

export function getTours(): Promise<TourItem[]> {
  const now = Date.now();
  if (!toursCache || now - toursCache.at > TOURS_TTL_MS) {
    toursCache = { promise: fetchTours(), at: now };
  }
  return toursCache.promise;
}

async function fetchTours(): Promise<TourItem[]> {
  try {
    const rest = getRest();
    if (!rest) return SAMPLE_TOURS;
    const { data, error } = await rest
      .from('site_tours')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: true });
    if (error) throw error;
    if (!data || data.length === 0) return SAMPLE_TOURS;
    const tours = (data as Row[]).map(restToTour);
    // گیت انتشار تور (مایگریشن 0011): فقط «منتشرشده»ها روی سایت دیده می‌شوند.
    // ردیف‌های قدیمی‌تر از ستون publish_status (undefined) منتشرشده حساب می‌شوند
    // تا پیش از اجرای مایگریشن، رفتار سایت عوض نشود.
    return tours.filter((t) => t.publishStatus === undefined || t.publishStatus === 'published');
  } catch (error) {
    console.error('[db-content] tours read failed:', (error as Error).message);
    return SAMPLE_TOURS;
  }
}

export async function getTour(slug: string): Promise<TourItem | null> {
  const all = await getTours();
  return all.find((t) => t.id === slug) ?? null;
}

/* ------------------------------------------------------------------ */
/* مقصدها (کشور و شهر)                                                 */
/* ------------------------------------------------------------------ */

function restToPlace(r: Row): Place {
  return {
    id: str(r.id),
    slug: str(r.slug),
    name: str(r.name),
    nameEn: str(r.name_en),
    type: r.type as Place['type'],
    parentCountrySlug: (r.parent_country_slug as string) ?? undefined,
    // ردیف ۳-۴: ستون parent_country_name از DB حذف شد؛ نام کشور از روی
    // parentCountrySlug در getDestinations resolve می‌شود (پایین‌تر).
    parentCountryName: undefined,
    category: r.category as Place['category'],
    image: str(r.image),
    heroTagline: str(r.hero_tagline),
    description: str(r.description),
    bestSeason: str(r.best_season),
    visaRequired: Boolean(r.visa_required),
    visaType: (r.visa_type as string) ?? undefined,
    flightDuration: (r.flight_duration as string) ?? undefined,
    currency: str(r.currency),
    startingPrice: str(r.starting_price),
    startingPriceNote: str(r.starting_price_note),
    lastVerifiedAt: str(r.last_verified_at),
    activeToursCount: num(r.active_tours_count),
    popularDistricts: arr<string>(r.popular_districts),
    keyHighlights: arr<string>(r.key_highlights),
    travelTips: arr<string>(r.travel_tips),
    faqs: arr<Place['faqs'][number]>(r.faqs),
    relatedGuides: arr<string>(r.related_guides),
  };
}

export async function getDestinations(): Promise<Place[]> {
  try {
    const rest = getRest();
    if (!rest) return [...Object.values(COUNTRIES), ...Object.values(CITIES)];
    const { data, error } = await rest
      .from('site_destinations')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: true });
    if (error) throw error;
    if (!data || data.length === 0) return [...Object.values(COUNTRIES), ...Object.values(CITIES)];
    const places = (data as Row[]).map(restToPlace);
    // ردیف ۳-۴: نام کشورِ شهرها از روی parentCountrySlug و از همین فهرست
    // resolve می‌شود (ستون parent_country_name از DB حذف شد).
    try {
      const countryNames = new Map(
        places.filter((p) => p.type === 'country').map((c) => [c.slug, c.name] as const),
      );
      for (const p of places) {
        if (!p.parentCountryName && p.parentCountrySlug) {
          p.parentCountryName = countryNames.get(p.parentCountrySlug);
        }
      }
    } catch {
      // خطا در resolve نام کشور → فیلد خالی می‌ماند؛ کامپوننت‌ها fallback دارند.
    }
    // ردیف ۳-۳ («محاسبه هنگام خواندن»): شمارش خودکار «تور فعال» —
    // تعداد تورهای منتشرشده‌ای که destinationSlugsشان شامل نامک مقصد است.
    // فقط وقتی اعمال می‌شود که فهرست تورها واقعاً از DB آمده باشد؛
    // در حالت fallback استاتیک (getTours همان SAMPLE_TOURS را برگرداند) عدد دستی
    // ذخیره‌شدهٔ رکورد سر جایش می‌ماند تا صفحه با صفر کاذب نمایش داده نشود.
    try {
      const tours = await getTours();
      if (tours !== SAMPLE_TOURS) {
        for (const p of places) {
          p.activeToursCount = tours.filter((t) => t.destinationSlugs?.includes(p.slug)).length;
        }
      }
    } catch {
      // خطا در خواندن تورها → عدد دستی رکورد حفظ می‌شود.
    }
    return places;
  } catch (error) {
    console.error('[db-content] destinations read failed:', (error as Error).message);
    return [...Object.values(COUNTRIES), ...Object.values(CITIES)];
  }
}

/** یک بار خوانده می‌شود و هر دو فهرست از همان نتیجه ساخته می‌شوند.
 * میز P-B فاز ۲ (PB-05): کش ماژول‌اسکوپ بدون TTL در نمونهٔ گرم سرورلس برای
 * همیشه کهنه می‌ماند؛ پس هر ۵ دقیقه تازه‌سازی می‌شود. تصمیم امنیتی نمی‌گیرد
 * (فقط فهرست مقصد)، پس همین TTL کافی است و نیازی به استور خارجی نیست. */
const DESTINATIONS_TTL_MS = 5 * 60 * 1000;
let destinationsCache: { promise: Promise<Place[]>; at: number } | null = null;

export function getDestinationsOnce(): Promise<Place[]> {
  const now = Date.now();
  if (!destinationsCache || now - destinationsCache.at > DESTINATIONS_TTL_MS) {
    destinationsCache = { promise: getDestinations(), at: now };
  }
  return destinationsCache.promise;
}

export async function getCountries(): Promise<Record<string, Place>> {
  const all = await getDestinationsOnce();
  const countries = all.filter((p) => p.type === 'country');
  if (countries.length === 0) return COUNTRIES;
  return Object.fromEntries(countries.map((c) => [c.slug, c]));
}

export async function getCities(): Promise<Record<string, Place>> {
  const all = await getDestinationsOnce();
  // P1-10: جزیره‌ها (kish/phuket) هم جزو مقصدهای سطح شهرند — در دیتای
  // استاتیک هم داخل همان نگاشت CITIES نگه‌داری می‌شوند.
  const cities = all.filter((p) => p.type === 'city' || p.type === 'island');
  if (cities.length === 0) return CITIES;
  return Object.fromEntries(cities.map((c) => [c.slug, c]));
}

/* ------------------------------------------------------------------ */
/* راهنماها                                                            */
/* ------------------------------------------------------------------ */

function restToGuide(r: Row): GuideItem {
  const lastReviewed = r.last_reviewed_at
    ? new Intl.DateTimeFormat('fa-IR', { dateStyle: 'long' }).format(new Date(String(r.last_reviewed_at)))
    : '';
  return {
    id: str(r.id),
    slug: str(r.slug),
    title: str(r.title_fa),
    category: r.category as GuideItem['category'],
    categoryLabel: str(r.category_label),
    readTime: str(r.read_time),
    author: str(r.author),
    reviewer: str(r.reviewer),
    lastReviewedAt: lastReviewed,
    summary: str(r.summary),
    heroImage: str(r.hero_image),
    directAnswer: str(r.direct_answer),
    sections: arr<GuideItem['sections'][number]>(r.sections),
    relatedDestinationSlug: (r.related_destination_slug as string) ?? undefined,
    relatedTourSlug: (r.related_tour_id as string) ?? undefined,
    faqs: arr<GuideItem['faqs'][number]>(r.faqs),
  };
}

export async function getGuides(): Promise<Record<string, GuideItem>> {
  try {
    const rest = getRest();
    if (!rest) return GUIDES;
    const { data, error } = await rest
      .from('guides')
      .select('*')
      .is('deleted_at', null)
      .order('updated_at', { ascending: false });
    if (error) throw error;
    if (!data || data.length === 0) return GUIDES;
    // گیت انتشار (ردیف ۱-۱): فقط «منتشرشده»ها روی سایت دیده می‌شوند.
    // مقادیر ستون status از ExhibitionForm/GuideForm:
    // draft | review | published | paused | archived (پیش‌فرض دیتابیس: draft).
    // ردیف بدون status (قدیمی‌تر از ستون) منتشرشده حساب می‌شود تا رفتار قدیمی حفظ شود.
    // شرط deleted_at همچنان سر جایش است (حذف منطقی پنهان می‌ماند).
    const published = (data as Row[]).filter((r) => {
      const s = str(r.status);
      return s === '' || s === 'published';
    });
    return Object.fromEntries(published.map((r) => [str(r.slug), restToGuide(r)]));
  } catch (error) {
    console.error('[db-content] guides read failed:', (error as Error).message);
    return GUIDES;
  }
}

export async function getGuide(slug: string): Promise<GuideItem | null> {
  const all = await getGuides();
  return all[slug] ?? null;
}

/* ------------------------------------------------------------------ */
/* نمایشگاه‌ها                                                          */
/* ------------------------------------------------------------------ */

function restToExhibition(r: Row): ExhibitionSeries {
  return {
    id: str(r.id),
    slug: str(r.slug),
    title: str(r.title_fa),
    titleEn: str(r.title_en),
    country: str(r.country),
    countrySlug: str(r.country_slug),
    city: str(r.city),
    citySlug: str(r.city_slug),
    venue: str(r.venue),
    officialWebsite: str(r.official_website),
    industry: str(r.industry),
    industrySlug: str(r.industry_slug),
    heroTagline: str(r.hero_tagline),
    description: str(r.description),
    image: str(r.image),
    upcomingEdition: {
      editionSlug: str(r.edition_slug),
      solarDate: str(r.solar_date),
      gregorianDate: str(r.gregorian_date),
      phases: arr<ExhibitionSeries['upcomingEdition']['phases'][number]>(r.phases),
      visaDeadline: str(r.visa_deadline),
      hotelArea: str(r.hotel_area),
      startingPrice: str(r.starting_price),
      startingPriceNote: str(r.starting_price_note),
    },
    servicesIncluded: arr<string>(r.services_included),
    businessTips: arr<string>(r.business_tips),
    faqs: arr<ExhibitionSeries['faqs'][number]>(r.faqs),
  };
}

export async function getExhibitions(): Promise<Record<string, ExhibitionSeries>> {
  try {
    const rest = getRest();
    if (!rest) return EXHIBITION_SERIES;
    const { data, error } = await rest
      .from('exhibitions')
      .select('*')
      .is('deleted_at', null)
      .order('updated_at', { ascending: false });
    if (error) throw error;
    if (!data || data.length === 0) return EXHIBITION_SERIES;
    // گیت انتشار (ردیف ۱-۱): فقط «منتشرشده»ها روی سایت دیده می‌شوند.
    // مقادیر ستون status از ExhibitionForm/GuideForm:
    // draft | review | published | paused | archived (پیش‌فرض دیتابیس: draft).
    // ردیف بدون status (قدیمی‌تر از ستون) منتشرشده حساب می‌شود تا رفتار قدیمی حفظ شود.
    // شرط deleted_at همچنان سر جایش است (حذف منطقی پنهان می‌ماند).
    const published = (data as Row[]).filter((r) => {
      const s = str(r.status);
      return s === '' || s === 'published';
    });
    return Object.fromEntries(published.map((r) => [str(r.slug), restToExhibition(r)]));
  } catch (error) {
    console.error('[db-content] exhibitions read failed:', (error as Error).message);
    return EXHIBITION_SERIES;
  }
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
  // میز P-A فاز ۲: خواندن‌های مستقل موازی شدند (قبلاً چهار راندتریپ ترتیبی).
  // getTours کش پرومیس دارد، پس فراخوان تودرتوی getDestinations کوئری تازه نمی‌زند.
  const [tours, allPlaces, guides, exhibitions] = await Promise.all([
    getTours(),
    getDestinationsOnce(),
    getGuides(),
    getExhibitions(),
  ]);
  const countries =
    allPlaces.filter((p) => p.type === 'country').length > 0
      ? Object.fromEntries(allPlaces.filter((p) => p.type === 'country').map((c) => [c.slug, c]))
      : COUNTRIES;
  const cities =
    allPlaces.filter((p) => p.type === 'city' || p.type === 'island').length > 0
      ? Object.fromEntries(
          allPlaces
            .filter((p) => p.type === 'city' || p.type === 'island')
            .map((c) => [c.slug, c]),
        )
      : CITIES;
  return { tours, countries, cities, guides, exhibitions };
}

/* ------------------------------------------------------------------ */
/* پروجکشن‌های سبک مسیرها (میز P-A فاز ۲)                               */
/* ------------------------------------------------------------------ */
/**
 * چرا این‌ها هستند: هر صفحه کل آبجکت محتوا را از طریق ContentProvider به
 * کلاینت می‌دهد و همان در فلایت RSC (بدنهٔ HTML) سریالایز می‌شود. ولی هر
 * مسیر فقط زیرمجموعه‌ای از فیلدها را واقعاً می‌خواند. این پروجکشن‌ها
 * فیلدهای سنگینِ خوانده‌نشده را صفر می‌کنند تا وزن HTML کم شود.
 *
 * قرارداد هر تابع = دقیقاً فیلدهایی که کامپوننت‌های همان مسیر می‌خوانند
 * (با grep راستی‌آزمایی شده)؛ خروجی همان تایپ کامل است تا هیچ کامپوننتی
 * از نظر تایپ نشکند، و رندر/سئو هیچ تغییری نمی‌کند. اگر سکشنی به مسیری
 * اضافه شد که فیلد تازه‌ای می‌خواند، پروجکشن همان مسیر را به‌روز کن.
 */

/**
 * خانه (`/`): فقط OriginCities از تورها استفاده می‌کند و آن هم فقط
 * `t.origin` را می‌خواند (uniqueOrigins در tour-live.ts). بقیهٔ سکشن‌های
 * خانه یا استاتیک‌اند یا فقط راهنماها را می‌خوانند.
 */
export function slimTourForOriginList(t: TourItem): TourItem {
  return {
    id: t.id,
    title: '',
    type: t.type,
    typeLabel: '',
    destination: '',
    origin: t.origin,
    route: '',
    duration: '',
    nights: 0,
    closestDeparture: '',
    price: 0,
    formattedPrice: '',
    priceNote: '',
    status: t.status,
    statusLabel: '',
    publishStatus: undefined,
    updatedAt: '',
    image: '',
    badge: undefined,
    features: [],
    visaRequired: false,
    hotelStars: 0,
    airline: '',
    includedServices: [],
    excludedServices: [],
    hotelOptions: [],
    description: '',
    destinationSlugs: [],
    transportKind: undefined,
    itineraryDays: [],
    trustSpecs: undefined,
    consultantSpec: undefined,
  };
}

/**
 * فهرست تورها (`/tours`): کارت‌ها + فیلترها + مودال جزئیات.
 * مودال description و included/excludedServices و hotelOptions را می‌خواند،
 * ولی itineraryDays و trustSpecs/consultantSpec و features و
 * destinationSlugs را هیچ‌جا نمی‌خواند.
 */
export function slimTourForCardList(t: TourItem): TourItem {
  return {
    ...t,
    itineraryDays: [],
    trustSpecs: undefined,
    consultantSpec: undefined,
    features: [],
    destinationSlugs: [],
  };
}

/**
 * کارت راهنما (خانه و `/tours`): فقط id/slug/title/summary/heroImage/
 * categoryLabel/readTime/lastReviewedAt خوانده می‌شود؛ sections و faqs و
 * directAnswer فقط در صفحهٔ جزئیات راهنما لازم‌اند.
 */
export function slimGuideForCard(g: GuideItem): GuideItem {
  return { ...g, directAnswer: '', sections: [], faqs: [] };
}

function slimGuideRecord(
  guides: Record<string, GuideItem>,
): Record<string, GuideItem> {
  return Object.fromEntries(
    Object.entries(guides).map(([k, g]) => [k, slimGuideForCard(g)] as const),
  );
}

/** محتوای خانه: مبدأهای تور + کارت‌های راهنما (بدون مقصد/نمایشگاه). */
export async function getHomeContent(): Promise<{
  tours: TourItem[];
  guides: Record<string, GuideItem>;
}> {
  const [tours, guides] = await Promise.all([getTours(), getGuides()]);
  return {
    tours: tours.map(slimTourForOriginList),
    guides: slimGuideRecord(guides),
  };
}

/** محتوای `/tours`: تورهای سبک‌شده + کارت‌های راهنما (بدون مقصد/نمایشگاه). */
export async function getToursPageContent(): Promise<{
  tours: TourItem[];
  guides: Record<string, GuideItem>;
}> {
  const [tours, guides] = await Promise.all([getTours(), getGuides()]);
  return {
    tours: tours.map(slimTourForCardList),
    guides: slimGuideRecord(guides),
  };
}

/**
 * محتوای `/tour/[slug]`: فقط تورها (کامل — صفحهٔ جزئیات و تورهای مرتبط و
 * اسکیمای tourJsonLd همهٔ فیلدها را می‌خواهند). مقصد/راهنما/نمایشگاه را
 * TourDetailPage اصلاً نمی‌خواند؛ در provider به فالبک استاتیک می‌روند که
 * همان دیتای باندل‌شدهٔ کلاینت است و در HTML تکرار نمی‌شود.
 */
export async function getTourDetailContent(): Promise<{
  tours: TourItem[];
}> {
  return { tours: await getTours() };
}
