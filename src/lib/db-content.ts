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

export async function getTours(): Promise<TourItem[]> {
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

/** یک بار خوانده می‌شود و هر دو فهرست از همان نتیجه ساخته می‌شوند. */
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
  // ترتیبی و سبک: هر خواندن یک درخواست HTTPS بدون حالت است.
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
