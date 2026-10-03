/**
 * لایه دسترسی به محتوای سایت از دیتابیس واقعی.
 * - هر تابع ابتدا از REST امن Supabase می‌خواند؛ اگر در دسترس نبود یا خالی
 *   بود، به همان دیتای استاتیک پشتیبان برمی‌گردد تا سایت هرگز خالی نشود.
 * - همه توابع فقط سمت سرور قابل استفاده‌اند.
 */
import { getRest } from './supabase-rest';
import { cache } from 'react';
import { SAMPLE_TOURS, type TourItem, type TourItineraryDay } from '@/src/data/toursData';
import { COUNTRIES, CITIES, type Place } from '@/src/data/destinationsData';
import { GUIDES, type GuideItem } from '@/src/data/guidesData';
import type { JSONContent } from '@/lib/rich-text';
import { faqRichAnswer } from '@/lib/rich-text';
import { EXHIBITION_SERIES, type ExhibitionSeries } from '@/src/data/exhibitionsData';

type Row = Record<string, unknown>;

const str = (v: unknown, fallback = ''): string =>
  typeof v === 'string' ? v : v == null ? fallback : String(v);
const num = (v: unknown, fallback = 0): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};
const arr = <T>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);
/**
 * مثل arr ولی رشته-کدشده را هم می‌فهمد: چند ستون jsonb در دیتابیس واقعی به‌جای
 * آرایه، رشتهٔ حاوی JSON ذخیره شده‌اند (مثلاً hotel_options در ۱۱ از ۱۲ تور و
 * travel_tips برخی مقصدها). این فقط خواندن سمت سرور است و رکوردها دست نمی‌خورند؛
 * تمیزکاری ریشه‌ایِ دیتابیس کار موج دیگری است.
 */
const arrParsed = <T>(v: unknown): T[] => {
  if (Array.isArray(v)) return v as T[];
  if (typeof v === 'string' && v.trim()) {
    try {
      const parsed: unknown = JSON.parse(v);
      return Array.isArray(parsed) ? (parsed as T[]) : [];
    } catch {
      return [];
    }
  }
  return [];
};
/**
 * یکدست‌سازی پاسخ غنی FAQها روی prop تایپ‌شدهٔ answerRich: قرارداد تیم داده
 * کلید answer_rich است؛ دادهٔ قدیمی با answerRich هم خوانده می‌شود
 * (QA ترک تورها، ایراد ۱). آبجکت‌ها همان می‌مانند، فقط prop پر می‌شود.
 */
const faqsRich = <T extends { answerRich?: JSONContent | string | null }>(items: T[]): T[] =>
  (items ?? []).map((f) => ({ ...f, answerRich: faqRichAnswer(f) }));
const iso = (v: unknown): string => {
  if (typeof v === 'string' && v) return v;
  if (v instanceof Date) return v.toISOString();
  // تنها مصرف‌کننده: updatedAt تور. نال/ناشناخته یعنی «قدیمی»، نه «الان»؛
  // رشتهٔ خالی در مرتب‌سازیِ تازه‌ترین‌ها (Date.parse → NaN → ۰) آخر می‌ایستد
  // و در نمایش تاریخ (faDateTime → null → «—») تاریخ جعلی نمی‌سازد.
  return '';
};
/**
 * ستون غنی (`*_rich`): خودِ مقدار (JSON یا رشته) یا null — تا fallback متن
 * تخت قدیمی خوانده شود. jsonb از REST آبجکت برمی‌گرداند؛ دفاعی رشته را هم
 * می‌پذیریم.
 */
const richCol = (v: unknown): JSONContent | string | null =>
  v === null || v === undefined ? null : (v as JSONContent | string);
/** گالری مقصد: آرایهٔ {url, caption, alt} — ورودی خراب → آرایهٔ خالی. */
const asGallery = (v: unknown): Array<{ url: string; caption: string; alt: string }> => {
  if (!Array.isArray(v)) return [];
  return v
    .filter((x) => x && typeof x === 'object')
    .map((x) => {
      const o = x as Record<string, unknown>;
      return {
        url: typeof o.url === 'string' ? o.url : '',
        caption: typeof o.caption === 'string' ? o.caption : '',
        alt: typeof o.alt === 'string' ? o.alt : '',
      };
    })
    .filter((g) => g.url.trim() !== '');
};

/* ------------------------------------------------------------------ */
/* تورها                                                               */
/* ------------------------------------------------------------------ */

/**
 * فاز B3 موج ۲: منبع کانونی قیمت نمایشی — همان منطق faPrice در
 * app/admin/(dashboard)/tours/actions.ts (جداکنندهٔ هزارگان + ارقام فارسی).
 * این‌جا تکرار شده چون آن فایل 'use server' اکشن‌هاست و این ماژول نباید به آن
 * وابسته شود؛ هر تغییری در فرمت باید در هر دو جا اعمال شود.
 */
const FA_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
const faPrice = (n: unknown): string => {
  const grouped = Math.max(0, Math.round(Number(n) || 0)).toLocaleString('en-US');
  return grouped.replace(/\d/g, (d) => FA_DIGITS[Number(d)]).replace(/,/g, '٬');
};

/** فاز B5 موج ۲: یادداشت پیش‌فرض قیمت از تنظیمات (خوانش عمومی، بدون نیاز به ادمین). */
const DEFAULT_PRICE_NOTE_FALLBACK = 'برای هر بزرگسال در اتاق دو تخته';
async function getPublicPriceNoteDefault(): Promise<string> {
  try {
    const rest = getRest();
    if (!rest) return DEFAULT_PRICE_NOTE_FALLBACK;
    const { data, error } = await rest
      .from('site_settings')
      .select('setting_value')
      .eq('setting_key', 'tours.default_price_note')
      .maybeSingle();
    if (error) throw error;
    const v = (data as { setting_value?: unknown } | null)?.setting_value;
    return typeof v === 'string' && v.trim() ? v : DEFAULT_PRICE_NOTE_FALLBACK;
  } catch {
    return DEFAULT_PRICE_NOTE_FALLBACK;
  }
}

function restToTour(r: Row, priceNoteDefault?: string): TourItem {
  // فاز B4 موج ۲: گزینه‌های هتل یک‌بار این‌جا پارس می‌شوند تا درجهٔ نمایشی
  // از همان snapshot حساب شود (max ستاره‌ها) — دیگر از ستون خوانده نمی‌شود.
  const hotelOptions = arrParsed<TourItem['hotelOptions'][number]>(r.hotel_options);
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
    // فاز B3: محاسبه از price — ستون formatted_price دیگر خوانده نمی‌شود.
    formattedPrice: faPrice(num(r.price)),
    // فاز B5: از تنظیم tours.default_price_note — ستون price_note دیگر خوانده نمی‌شود.
    priceNote: priceNoteDefault ?? str(r.price_note),
    status: r.status as TourItem['status'],
    statusLabel: str(r.status_label),
    // گیت انتشار تور (مایگریشن 0011)؛ ستون ممکن است هنوز روی دیتابیس نباشد.
    publishStatus: (r.publish_status as TourItem['publishStatus']) ?? undefined,
    updatedAt: iso(r.updated_at),
    image: str(r.image),
    badge: (r.badge as string) ?? undefined,
    visaRequired: Boolean(r.visa_required),
    // فاز B4: max ستاره‌های گزینه‌های هتل.
    hotelStars: hotelOptions.reduce((m, o) => Math.max(m, Number((o as { stars?: unknown })?.stars) || 0), 0),
    airline: str(r.airline),
    includedServices: arr<string>(r.included_services),
    excludedServices: arr<string>(r.excluded_services),
    hotelOptions,
    description: str(r.description),
    // پنج ستون جاافتاده (ردیف ۲-۱)؛ jsonbها خام عبور می‌کنند، نرمالایز با کامپوننت.
    destinationSlugs: arr<string>(r.destination_slugs),
    // transport_kind از مایگریشن 0014 می‌آید که ممکن است هنوز روی دیتابیس واقعی
    // اجرا نشده باشد؛ نبود کلید در ردیف فقط undefined می‌دهد و هیچ‌چیز نمی‌شکند.
    transportKind: (r.transport_kind as TourItem['transportKind']) ?? undefined,
    itineraryDays: arr<TourItineraryDay>(r.itinerary_days),
    trustSpecs: (r.trust_specs as TourItem['trustSpecs']) ?? undefined,
    consultantSpec: (r.consultant_spec as TourItem['consultantSpec']) ?? undefined,
    // بلوک مالی واقعی (مایگریشن 0027) ممکن است هنوز روی دیتابیس واقعی نباشد؛
    // نبود کلید در ردیف فقط undefined می‌دهد و هیچ‌چیز نمی‌شکند (همان الگوی
    // transport_kind). هیچ پیش‌فرض حدسی این‌جا نیست: خالی = نمایش داده نمی‌شود.
    financialSpecs: (r.financial_specs as TourItem['financialSpecs']) ?? undefined,
    // متن‌های غنی تور (مایگریشن 0030) ممکن است هنوز روی دیتابیس واقعی نباشند؛
    // نبود کلید فقط undefined می‌دهد و متن تخت قدیمی چاپ می‌شود (همان الگو).
    descriptionRich: richCol(r.description_rich) ?? undefined,
    faqs: faqsRich(arrParsed<TourItem['faqs'][number]>(r.faqs)),
    whyThisTourRich: richCol(r.why_this_tour) ?? undefined,
    // موج ۴ (مایگریشن 0034): گالری واقعی و شناسهٔ لیدر — ستون نباشد فقط
    // undefined می‌دهد و هیچ‌چیز نمی‌شکند (همان الگوی transport_kind).
    gallery: galleryCol(r.gallery),
    leaderId: str(r.leader_id) || undefined,
  };
}

/** نرمالایز گالری: فقط آیتم‌های دارای آدرس می‌مانند. */
function galleryCol(v: unknown): TourItem['gallery'] {
  if (!Array.isArray(v) || v.length === 0) return undefined;
  const out: Array<{ url: string; caption?: string }> = [];
  for (const item of v) {
    const o = (item ?? {}) as { url?: unknown; caption?: unknown };
    const url = typeof o.url === 'string' ? o.url.trim() : '';
    if (!url) continue;
    const caption = typeof o.caption === 'string' ? o.caption.trim() : '';
    out.push(caption ? { url, caption } : { url });
  }
  return out.length > 0 ? out : undefined;
}

/**
 * موج ۴: اتصال تورلیدر و نظرهای مسافران به تورها — دو کوئری دسته‌ای، نه
 * N+1. هر خطایی → نقشه‌های خالی و بخش‌ها روی سایت نمایش داده نمی‌شوند
 * (رفتار قبلی می‌ماند).
 */
async function attachTourExperience(
  rest: ReturnType<typeof getRest>,
  tours: TourItem[],
  uuidBySlug: Map<string, string>,
): Promise<void> {
  if (!rest || tours.length === 0) return;
  try {
    const leaderIds = [...new Set(tours.map((t) => t.leaderId).filter((x): x is string => !!x))];
    const leadersById = new Map<string, NonNullable<TourItem['leader']>>();
    if (leaderIds.length > 0) {
      const { data } = await rest
        .from('tour_leaders')
        .select('id,name,photo,bio,languages,join_mode')
        .in('id', leaderIds);
      for (const l of (data as Row[]) ?? []) {
        const id = str(l.id);
        if (!id) continue;
        leadersById.set(id, {
          name: str(l.name),
          photo: str(l.photo) || undefined,
          bio: str(l.bio) || undefined,
          languages: str(l.languages) || undefined,
          joinMode: str(l.join_mode) || undefined,
        });
      }
    }
    const uuids = [...new Set(uuidBySlug.values())].filter(Boolean);
    const reviewsByUuid = new Map<string, NonNullable<TourItem['reviews']>>();
    if (uuids.length > 0) {
      const { data } = await rest
        .from('tour_reviews')
        .select('tour_id,name,rating,text,created_at')
        .in('tour_id', uuids)
        .eq('is_visible', true)
        .order('created_at', { ascending: false })
        .limit(500);
      for (const v of (data as Row[]) ?? []) {
        const tid = str(v.tour_id);
        if (!tid) continue;
        const arr = reviewsByUuid.get(tid) ?? [];
        arr.push({
          name: str(v.name),
          rating: Math.min(5, Math.max(1, Number(v.rating) || 5)),
          text: str(v.text),
          createdAt: iso(v.created_at),
        });
        reviewsByUuid.set(tid, arr);
      }
    }
    for (const t of tours) {
      if (t.leaderId && leadersById.has(t.leaderId)) t.leader = leadersById.get(t.leaderId);
      const revs = reviewsByUuid.get(uuidBySlug.get(t.id) ?? '') ?? [];
      if (revs.length > 0) {
        t.reviews = revs;
        const avg = revs.reduce((s, r) => s + r.rating, 0) / revs.length;
        t.ratingSummary = { avg: Math.round(avg * 10) / 10, count: revs.length };
      }
    }
  } catch (error) {
    console.error('[db-content] tour experience read failed:', (error as Error).message);
  }
}

/**
 * فرادادهٔ هتل‌های کاتالوگ برای رندر سایت (میز ۳ — ایراد ۱۱ و ۱۲):
 * - archived: هتل بایگانی‌شده (deleted_at) نباید روی تور منتشرشده دیده شود.
 * - photoUrl: اولین عکس ثبت‌شدهٔ هتل در جدول media (source = 'hotel:<slug>').
 *
 * یک‌بار برای همهٔ تورها خوانده می‌شود؛ خطا → نقشهٔ خالی (رفتار قبلی می‌ماند).
 */
async function getHotelMeta(): Promise<Map<string, { archived: boolean; photoUrl: string }>> {
  const empty = new Map<string, { archived: boolean; photoUrl: string }>();
  try {
    const rest = getRest();
    if (!rest) return empty;
    const [accRes, mediaRes] = await Promise.all([
      rest.from('accommodations').select('id, slug, deleted_at'),
      rest.from('media').select('source, url').like('source', 'hotel:%').is('deleted_at', null).order('created_at', { ascending: false }),
    ]);
    if (accRes.error) throw accRes.error;
    if (mediaRes.error) throw mediaRes.error;
    const slugById = new Map<string, string>();
    const archivedIds = new Set<string>();
    for (const r of (accRes.data as Row[]) ?? []) {
      const id = str(r.id);
      if (!id) continue;
      slugById.set(id, str(r.slug));
      if (r.deleted_at != null) archivedIds.add(id);
    }
    // اولین عکس هر هتل (تازه‌ترین، چون نزولی مرتب شده).
    const photoBySlug = new Map<string, string>();
    for (const m of (mediaRes.data as Row[]) ?? []) {
      const source = str(m.source);
      const slug = source.startsWith('hotel:') ? source.slice('hotel:'.length) : '';
      const url = str(m.url);
      if (slug && url && !photoBySlug.has(slug)) photoBySlug.set(slug, url);
    }
    const meta = new Map<string, { archived: boolean; photoUrl: string }>();
    for (const [id, slug] of slugById) {
      meta.set(id, { archived: archivedIds.has(id), photoUrl: photoBySlug.get(slug) ?? '' });
    }
    return meta;
  } catch (error) {
    console.error('[db-content] hotel meta read failed:', (error as Error).message);
    return empty;
  }
}

/**
 * قلم ۴ موج ۱ (تصمیم ۴، ۱۴۰۵/۰۷/۱۱): حالت فالبک «همه پیش‌نویس» از تنظیمات سایت.
 * 'empty' یعنی مدیر انتخاب کرده وقتی هیچ تور منتشرشده‌ای نیست صفحه خالی بماند؛
 * هر مقدار دیگر (یا نبود ردیف/خطا) یعنی رفتار قدیمی: تور نمونه.
 * خواندن عمومی است (مثل getContactInfo) و نیاز به نشست ادمین ندارد.
 */
export const getToursFallbackMode = cache(async (): Promise<'sample' | 'empty'> => {
  try {
    const rest = getRest();
    if (!rest) return 'sample';
    const { data, error } = await rest
      .from('site_settings')
      .select('setting_value')
      .eq('setting_key', 'tours.all_draft_fallback')
      .limit(1);
    if (error) throw error;
    const v = (data as Array<{ setting_value: string }> | null)?.[0]?.setting_value;
    return v === 'empty' ? 'empty' : 'sample';
  } catch {
    return 'sample';
  }
});

/**
 * با `cache()` ری‌اکت: در یک ریکوئست یک‌بار خوانده می‌شود (مثلاً layout هم
 * getNavLinks را می‌خواهد هم getToursِ داخلش را) — فراخوانی REST تکراری نه.
 */
export const getTours = cache(async (): Promise<TourItem[]> => {
  try {
    const rest = getRest();
    if (!rest) return SAMPLE_TOURS;
    const { data, error } = await rest
      .from('site_tours')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: true });
    if (error) throw error;
    // قلم ۴ موج ۱: جدول کاملاً خالی (نصب تازه) هم تابع جوابِ ذخیره‌شده است؛
    // بی‌جواب یعنی رفتار قدیمی (تور نمونه).
    if (!data || data.length === 0) {
      return (await getToursFallbackMode()) === 'empty' ? [] : SAMPLE_TOURS;
    }
    const hotelMeta = await getHotelMeta();
    // فاز B5 موج ۲: یادداشت قیمت از تنظیم می‌آید، نه از ستون price_note.
    const priceNoteDefault = await getPublicPriceNoteDefault();
    const rows = data as Row[];
    const uuidBySlug = new Map(rows.map((r) => [str(r.slug), str(r.id)]));
    const tours = rows.map((r) => restToTour(r, priceNoteDefault));
    // موج ۴: تورلیدر + نظرهای مسافران (دسته‌ای).
    await attachTourExperience(rest, tours, uuidBySlug);
    // میز ۳ — ایراد ۱۲: گزینه‌ای که به هتل بایگانی‌شده اشاره می‌کند روی سایت
    // دیده نمی‌شود (snapshot لحظهٔ افزودن، ولی بایگانی تصمیمِ تازهٔ مدیر است).
    // هتل دستیِ آزاد (hotelId خالی) دست نمی‌خورد.
    for (const t of tours) {
      const options = Array.isArray(t.hotelOptions) ? t.hotelOptions : [];
      const kept = options.filter((o) => {
        const hotelId = (o as { hotelId?: string | null }).hotelId;
        if (!hotelId) return true;
        return !hotelMeta.get(hotelId)?.archived;
      });
      if (kept.length !== options.length) {
        t.hotelOptions = kept;
        // درجهٔ نمایشی از ترکیبِ باقی‌مانده حساب می‌شود، نه سقفِ قدیمی.
        t.hotelStars = kept.reduce((m, o) => Math.max(m, Number(o.stars) || 0), 0);
      }
      // میز ۳ — ایراد ۱۱: عکس هتل (اگر ثبت شده) به گزینه می‌چسبد تا جدول
      // هتل‌های صفحهٔ تور بندانگشتی نشان دهد.
      for (const o of t.hotelOptions) {
        const hotelId = (o as { hotelId?: string | null }).hotelId;
        const photo = hotelId ? hotelMeta.get(hotelId)?.photoUrl : undefined;
        if (photo) (o as { photoUrl?: string }).photoUrl = photo;
      }
    }
    // گیت انتشار تور (مایگریشن 0011): فقط «منتشرشده»ها روی سایت دیده می‌شوند.
    // ردیف‌های قدیمی‌تر از ستون publish_status (undefined) منتشرشده حساب می‌شوند
    // تا پیش از اجرای مایگریشن، رفتار سایت عوض نشود.
    const published = tours.filter((t) => t.publishStatus === undefined || t.publishStatus === 'published');
    // قلم ۴ موج ۱ (تصمیم ۴): وقتی هیچ تور منتشرشده‌ای نیست، سایت بر اساس جوابِ
    // ذخیره‌شدهٔ مدیر رفتار می‌کند — نه سیاست ثابت، نه حدس:
    // - 'empty' → فهرست خالی (پرچم toursFallback در getLiveContent جلوی
    //   جایگزینیِ خودکارِ تور نمونه در ContentProvider را می‌گیرد).
    // - 'sample' یا بی‌جواب → رفتار قدیمی: تورهای نمونه.
    if (published.length > 0) return published;
    return (await getToursFallbackMode()) === 'empty' ? [] : SAMPLE_TOURS;
  } catch (error) {
    console.error('[db-content] tours read failed:', (error as Error).message);
    return SAMPLE_TOURS;
  }
});

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
    // متن غنی مقصد (ستون description_rich؛ مایگریشن 0030) — نبود ستون فقط
    // undefined می‌دهد و هیچ‌چیز نمی‌شکند (الگوی transport_kind).
    descriptionRich: richCol(r.description_rich) ?? undefined,
    metaTitle: str(r.meta_title) || undefined,
    metaDescription: str(r.meta_description) || undefined,
    gallery: asGallery(r.gallery),
    bestSeason: str(r.best_season),
    visaRequired: Boolean(r.visa_required),
    visaType: (r.visa_type as string) ?? undefined,
    flightDuration: (r.flight_duration as string) ?? undefined,
    currency: str(r.currency),
    startingPrice: str(r.starting_price),
    startingPriceNote: str(r.starting_price_note),
    lastVerifiedAt: str(r.last_verified_at),
    // فاز B6 موج ۲: شمارش خودکار «تور فعال» چند خط پایین‌تر بازنویسی‌اش می‌کند؛
    // ستون active_tours_count دیگر خوانده نمی‌شود (۰ = پیش از بازنویسی).
    activeToursCount: 0,
    popularDistricts: arr<string>(r.popular_districts),
    keyHighlights: arr<string>(r.key_highlights),
    travelTips: arrParsed<string>(r.travel_tips),
    // arrParsed: رشته-کدشده‌های قدیمی را هم می‌فهمد (یادداشت تیم داده، بخش ۶).
    faqs: faqsRich(arrParsed<Place['faqs'][number]>(r.faqs)),
    relatedGuides: arr<string>(r.related_guides),
    // گیت انتشار مقصد (مایگریشن 0023)؛ ستون ممکن است هنوز روی دیتابیس نباشد.
    publishStatus: (r.publish_status as Place['publishStatus']) ?? undefined,
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
    // گیت انتشار مقصد (مایگریشن 0023، قلم ۳ موج ۱): فقط «منتشرشده»ها روی
    // سایت دیده می‌شوند. ردیف‌های قدیمی‌تر از ستون publish_status (undefined)
    // منتشرشده حساب می‌شوند تا پیش از اجرای مایگریشن، رفتار سایت عوض نشود.
    const places = (data as Row[]).map(restToPlace).filter(
      (p) => p.publishStatus === undefined || p.publishStatus === 'published',
    );
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

/**
 * کش مقصدها با سقف زمانی (ایراد ۲۰ اتصال پنل به سایت).
 * پیش‌تر این کش ماژولی تا بازیافت اینستنس سرور هرگز تازه نمی‌شد و ویرایش
 * مقصد در پنل ساعت‌ها روی سایت کهنه می‌ماند (و در تست زنده، مقصدِ تازه‌ساخته
 * ۴۰۴ می‌داد چون کشِ قدیمی آن را نمی‌شناخت).
 * حالا: حداکثر ۵ دقیقه کهنگی + ابطال فوری هنگام هر ذخیره/بایگانی در پنل
 * (invalidateDestinationsCache از اکشن‌های places صدا زده می‌شود؛ پنل و سایت
 * در همین پروسهٔ Next.js زندگی می‌کنند). روی چند اینستنس، سقف ۵ دقیقه
 * کهنگیِ نهایی است.
 */
const DESTINATIONS_CACHE_TTL_MS = 5 * 60 * 1000;

let destinationsCache: { at: number; promise: Promise<Place[]> } | null = null;

export function getDestinationsOnce(): Promise<Place[]> {
  const now = Date.now();
  if (!destinationsCache || now - destinationsCache.at > DESTINATIONS_CACHE_TTL_MS) {
    destinationsCache = { at: now, promise: getDestinations() };
  }
  return destinationsCache.promise;
}

/** ابطال دستی کش مقصدها — اکشن‌های پنل پس از هر ذخیره/بایگانی صدا می‌زنند. */
export function invalidateDestinationsCache(): void {
  destinationsCache = null;
}

/* ------------------------------------------------------------------ */
/* لینک‌های ناوبری دیتابیس‌محور (ایرادهای ۱۹ و ۲۳)                      */
/* ------------------------------------------------------------------ */

export interface NavDestinationLink {
  name: string;
  slug: string;
  countrySlug: string;
  category: Place['category'];
  activeTours: number;
  path: string;
}

export interface NavExhibitionLink {
  name: string;
  slug: string;
  path: string;
}

export interface NavCountryLink {
  name: string;
  slug: string;
  activeTours: number;
  path: string;
}

export interface NavLinks {
  countries: NavCountryLink[];
  destinations: NavDestinationLink[];
  exhibitions: NavExhibitionLink[];
  /** نامک تورهای منتشرشده — برای غربال لینک‌های دستی /tour/* در منو. */
  tourSlugs: string[];
}

/**
 * لینک‌های ناوبری از دیتابیس، نه هاردکد.
 * - مقصدها: فقط شهرهای دارای «تور فعال» (activeToursCount>0)؛ همان شمارش
 *   خودکاری که صفحه‌ها استفاده می‌کنند. مرتب بر اساس تعداد تور.
 * - نمایشگاه‌ها: فقط منتشرشده‌ها (گیت انتشار getExhibitions).
 * خطا یا قطعی → آرایه‌های خالی؛ صداکننده به فالبک دستی برمی‌گردد.
 * با `cache()` ری‌اکت: در یک ریکوئست یک‌بار خوانده می‌شود (layout، هدر و
 * فوتر هر سه از همین می‌خوانند) — فراخوانی REST تکراری نه.
 */
export const getNavLinks = cache(async (): Promise<NavLinks> => {
  const empty: NavLinks = { countries: [], destinations: [], exhibitions: [], tourSlugs: [] };
  try {
    const [places, exhibitions, tours] = await Promise.all([
      getDestinationsOnce(),
      getExhibitions(),
      getTours(),
    ]);
    const countries = places
      .filter((p) => p.type === 'country' && p.activeToursCount > 0)
      .sort((a, b) => b.activeToursCount - a.activeToursCount || a.name.localeCompare(b.name, 'fa'))
      .map((p) => ({
        name: p.name,
        slug: p.slug,
        activeTours: p.activeToursCount,
        path: `/destination/${p.slug}`,
      }));
    const destinations = places
      .filter((p) => p.type === 'city' && p.activeToursCount > 0)
      .sort((a, b) => b.activeToursCount - a.activeToursCount || a.name.localeCompare(b.name, 'fa'))
      .map((p) => ({
        name: p.name,
        slug: p.slug,
        countrySlug: p.parentCountrySlug || p.slug,
        category: p.category,
        activeTours: p.activeToursCount,
        path: `/destination/${p.parentCountrySlug || p.slug}/${p.slug}`,
      }));
    const exhibitionLinks = Object.values(exhibitions).map((e) => ({
      name: e.title,
      slug: e.slug,
      path: `/exhibition/${e.slug}`,
    }));
    return {
      countries,
      destinations,
      exhibitions: exhibitionLinks,
      tourSlugs: tours.map((t) => t.id),
    };
  } catch (error) {
    console.error('[db-content] nav links read failed:', (error as Error).message);
    return empty;
  }
});

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
  // متن‌های غنی: اول *_rich، اگر نبود متن تخت قدیمی (قرارداد تیم داده).
  // jsonb از REST آبجکت برمی‌گرداند؛ دفاعی رشته را هم می‌پذیریم.
  const richCol = (v: unknown): JSONContent | string | null =>
    v === null || v === undefined ? null : (v as JSONContent | string);
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
    summaryRich: richCol(r.summary_rich),
    heroImage: str(r.hero_image),
    directAnswer: str(r.direct_answer),
    directAnswerRich: richCol(r.direct_answer_rich),
    // arrParsed: رشته-کدشده‌های قدیمی را هم می‌فهمد (یادداشت تیم داده، بخش ۶).
    sections: arrParsed<GuideItem['sections'][number]>(r.sections),
    relatedDestinationSlug: (r.related_destination_slug as string) ?? undefined,
    relatedTourSlug: (r.related_tour_id as string) ?? undefined,
    faqs: faqsRich(arrParsed<GuideItem['faqs'][number]>(r.faqs)),
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
    // متن غنی نمایشگاه (ستون description_rich؛ مایگریشن 0030) — نبود ستون
    // فقط undefined می‌دهد و هیچ‌چیز نمی‌شکند (الگوی transport_kind).
    descriptionRich: richCol(r.description_rich) ?? undefined,
    metaTitle: str(r.meta_title) || undefined,
    metaDescription: str(r.meta_description) || undefined,
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
    // arrParsed: رشته-کدشده‌های قدیمی را هم می‌فهمد (یادداشت تیم داده، بخش ۶).
    faqs: faqsRich(arrParsed<ExhibitionSeries['faqs'][number]>(r.faqs)),
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
  /** قلم ۴ موج ۱: 'empty' یعنی مدیر «صفحه خالی» را انتخاب کرده — ContentProvider نباید تور نمونه جایگزین کند. */
  toursFallback: 'sample' | 'empty';
  countries: Record<string, Place>;
  cities: Record<string, Place>;
  guides: Record<string, GuideItem>;
  exhibitions: Record<string, ExhibitionSeries>;
}> {
  // ترتیبی و سبک: هر خواندن یک درخواست HTTPS بدون حالت است.
  const tours = await getTours();
  const toursFallback = await getToursFallbackMode();
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
  return { tours, toursFallback, countries, cities, guides, exhibitions };
}

/* ------------------------------------------------------------------ */
/* لندینگ‌های سئو                                                       */
/* ------------------------------------------------------------------ */

export interface DbSeoLanding {
  id: string;
  queryOwner: string;
  urlPath: string;
  canonicalPath: string;
  pageType: string;
  titleFa: string;
  metaDescriptionFa: string;
  h1Fa: string;
  workflow: string;
  indexStatus: 'index' | 'noindex';
}

export interface DbLandingBlock {
  id: string;
  blockKind: string;
  heading: string;
  content: string;
  /** متن غنی ستون body_fa_rich (مایگریشن 0030)؛ نبود ستون فقط null می‌دهد. */
  bodyFaRich: JSONContent | string | null;
  blockOrder: number;
}

export interface DbLandingLink {
  id: string;
  toPath: string;
  anchorFa: string;
}

function restToLanding(r: Row): DbSeoLanding {
  return {
    id: str(r.id),
    queryOwner: str(r.query_owner),
    urlPath: str(r.url_path),
    canonicalPath: str(r.canonical_path) || str(r.url_path),
    pageType: str(r.page_type),
    titleFa: str(r.title_fa),
    metaDescriptionFa: str(r.meta_description_fa),
    h1Fa: str(r.h1_fa),
    workflow: str(r.workflow),
    indexStatus: r.index_status === 'index' ? 'index' : 'noindex',
  };
}

/** یکدست‌سازی مسیر برای مقایسه: اسلش پایانی و کوئری حذف، اسلش اول تضمین. */
export function normalizeLandingPath(p: string): string {
  const clean = p.split('?')[0].split('#')[0].replace(/\/+$/, '') || '/';
  return clean.startsWith('/') ? clean : `/${clean}`;
}

/**
 * لندینگ‌های منتشرشده از جدول seo_landings (منبع حقیقت).
 * فقط workflow='published'؛ حذف منطقی (deleted_at) پنهان می‌ماند.
 * خطا یا قطعی → آرایه خالی؛ صداکننده‌ها خودشان به فالبک استاتیک برمی‌گردند.
 */
export async function getSeoLandings(): Promise<DbSeoLanding[]> {
  try {
    const rest = getRest();
    if (!rest) return [];
    const { data, error } = await rest
      .from('seo_landings')
      .select(
        'id, query_owner, url_path, canonical_path, page_type, title_fa, meta_description_fa, h1_fa, workflow, index_status',
      )
      .is('deleted_at', null)
      .eq('workflow', 'published')
      .order('updated_at', { ascending: false });
    if (error) throw error;
    if (!data) return [];
    // فیلتر سمت کلاینت هم هست تا ردیف ناسازگار (مثلاً enum قدیمی) نشت نکند.
    return (data as Row[]).map(restToLanding).filter((l) => l.workflow === 'published' && l.urlPath);
  } catch (error) {
    console.error('[db-content] seo landings read failed:', (error as Error).message);
    return [];
  }
}

/**
 * لندینگ منتشرشده دقیقاً روی همین مسیر؛ نبود → null (صداکننده ۴۰۴ می‌دهد).
 * با `cache()` ری‌اکت: در یک ریکوئست یک‌بار خوانده می‌شود (مثلاً در
 * [...landingPath] هم صفحه و هم متا از resolveSeoLive همان رکورد را می‌خواهند).
 */
export const getSeoLandingByPath = cache(
  async (path: string): Promise<DbSeoLanding | null> => {
    const clean = normalizeLandingPath(path);
    const all = await getSeoLandings();
    return all.find((l) => normalizeLandingPath(l.urlPath) === clean) ?? null;
  },
);

/** بلوک‌های محتوایی لندینگ به ترتیب؛ body_fa یا JSON {heading,content} است یا متن ساده قدیمی. */
export async function getLandingBlocks(landingId: string): Promise<DbLandingBlock[]> {
  try {
    const rest = getRest();
    if (!rest) return [];
    // متن غنی بلوک (ستون body_fa_rich؛ مایگریشن 0030) — با select(*) تا نبود
    // ستون خطا ندهد و فقط null برگردد (همان قرارداد راهنماها/مقصدها).
    const { data, error } = await rest
      .from('content_blocks')
      .select('*')
      .eq('landing_id', landingId)
      .is('deleted_at', null)
      .order('block_order', { ascending: true });
    if (error) throw error;
    return ((data as Row[]) ?? []).map((r) => {
      let heading = '';
      let content = '';
      const raw = str(r.body_fa);
      try {
        const parsed = JSON.parse(raw) as { heading?: unknown; content?: unknown };
        if (parsed && typeof parsed === 'object') {
          heading = str(parsed.heading);
          content = str(parsed.content);
        }
      } catch {
        content = raw; // بدنهٔ قدیمیِ متن ساده
      }
      return {
        id: str(r.id),
        blockKind: str(r.block_kind, 'section'),
        heading,
        content,
        bodyFaRich: richCol(r.body_fa_rich),
        blockOrder: num(r.block_order, 1),
      };
    });
  } catch (error) {
    console.error('[db-content] landing blocks read failed:', (error as Error).message);
    return [];
  }
}

/** لینک‌های داخلی خروجی لندینگ (مقصد + متن لینک). */
export async function getLandingLinks(landingId: string): Promise<DbLandingLink[]> {
  try {
    const rest = getRest();
    if (!rest) return [];
    const { data, error } = await rest
      .from('seo_internal_links')
      .select('id, to_path, anchor_fa')
      .eq('from_landing_id', landingId)
      .is('deleted_at', null)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return ((data as Row[]) ?? [])
      .map((r) => ({ id: str(r.id), toPath: str(r.to_path), anchorFa: str(r.anchor_fa) }))
      .filter((l) => l.toPath && l.anchorFa);
  } catch (error) {
    console.error('[db-content] landing links read failed:', (error as Error).message);
    return [];
  }
}

/** نامک تورهای متصل به لندینگ (seo_landing_products). */
export async function getLandingProductSlugs(landingId: string): Promise<string[]> {
  try {
    const rest = getRest();
    if (!rest) return [];
    const { data, error } = await rest
      .from('seo_landing_products')
      .select('product_slug')
      .eq('landing_id', landingId)
      .is('deleted_at', null);
    if (error) throw error;
    return ((data as Row[]) ?? []).map((r) => str(r.product_slug)).filter(Boolean);
  } catch (error) {
    console.error('[db-content] landing products read failed:', (error as Error).message);
    return [];
  }
}
