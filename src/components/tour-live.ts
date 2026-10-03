/**
 * tour-live.ts — ابزارهای مشترک بسته C (سایت‌نما و فرم‌ها/لید)
 *
 * این ماژول پل بین «تایپ قدیمی TourItem» و فیلدهای تازه‌ای است که بسته A
 * (فرم تورساز پنل) به تور اضافه می‌کند. همه‌چیز دفاعی نوشته شده: اگر فیلد
 * تازه‌ای روی آبجکت تور نباشد، رفتار قبلی سایت حفظ می‌شود و هیچ‌چیز
 * کرش نمی‌کند — پس قبل و بعد از تغییر بسته A کار می‌کند.
 */
import type { TourItem } from '../data/toursData';
import type { Place } from '../data/destinationsData';
import { faSlug, en } from '@/lib/utils';

/** فیلدهای زنده تورساز (از app/admin/(dashboard)/tours/actions.ts، خطوط ۳۲–۵۰). */
export interface TourLiveExtras {
  destinationSlugs?: string[];
  transportKind?: 'air' | 'land' | 'rail' | 'sea' | 'mixed' | string;
  itineraryDays?: Array<{
    day: number;
    title?: string;
    city?: string;
    description?: string;
    activityType?: string;
    meals?: string;
  }>;
  trustSpecs?: {
    returnGuarantee?: string;
    cityTax?: string;
    tipsNote?: string;
    luggageKg?: number;
    activityLevel?: string;
    requiredDocs?: string[];
  } | null;
  consultantSpec?: {
    name?: string;
    title?: string;
    phone?: string;
    audioUrl?: string;
    emergencyPhone?: string;
  } | null;
}

/** تور + فیلدهای اختیاری زنده؛ همه اختیاری‌اند. */
export type TourLike = TourItem & Partial<TourLiveExtras>;

/** دسترسی دفاعی به فیلدهای زنده تور. */
export function liveExtras(t: TourItem): TourLiveExtras {
  return t as TourLiveExtras;
}

/** لیبل فارسی نوع حمل‌ونقل. */
export function transportLabel(kind?: string | null): string {
  switch ((kind || '').toLowerCase()) {
    case 'rail': return 'قطار';
    case 'land': return 'اتوبوس';
    case 'sea': return 'کشتی';
    case 'mixed': return 'ترکیبی';
    case 'air':
    default: return 'پرواز';
  }
}

/** لیبل ردیف «ایرلاین / حمل‌ونقل» در مشخصات تور. */
export function transportSpecLabel(kind?: string | null): string {
  switch ((kind || '').toLowerCase()) {
    case 'rail': return 'قطار:';
    case 'land': return 'اتوبوس:';
    case 'sea': return 'کشتی:';
    case 'mixed': return 'حمل‌ونقل:';
    case 'air':
    default: return 'ایرلاین:';
  }
}

/** مقصد داخلی است؟ (type منبع اصلی است؛ fallback برای داده قدیمی) */
const LEGACY_DOMESTIC = ['کیش', 'مشهد', 'قشم'];
export function isDomesticTour(t: TourItem): boolean {
  if (t.type) return t.type === 'domestic';
  return LEGACY_DOMESTIC.includes((t.destination || '').trim());
}

/** ISO datetime → «۱۰ مهر ۱۴۰۵، ساعت ۱۴:۳۰»؛ متن آماده را دست نمی‌زند. */
export function faDateTime(value?: string | null): string | null {
  if (!value || !value.trim()) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  try {
    return new Intl.DateTimeFormat('fa-IR', { dateStyle: 'long', timeStyle: 'short' }).format(d);
  } catch {
    return value;
  }
}

/** کد وعده غذایی (BB/HB/…) → لیبل فارسی. «صبحانه (BB)» ← «صبحانه بوفه». */
const BOARD_FA: Record<string, string> = {
  BB: 'صبحانه بوفه',
  HB: 'نیم‌پنسیون',
  FB: 'تمام‌پنسیون',
  AI: 'آل‌اینکلوسیو',
  UAI: 'آل‌اینکلوسیو ویژه',
  RO: 'بدون وعده غذایی',
  SC: 'سلف‌سرویس',
};
export function boardLabel(board?: string | null): string {
  if (!board || !board.trim()) return '—';
  const code = (board.match(/\b(BB|HB|FB|UAI|AI|RO|SC)\b/i)?.[1] || '').toUpperCase();
  return BOARD_FA[code] || board;
}

/** مبدأهای یکتای تورهای زنده: [{ slug: 'tehran', label: 'تهران' }]. */
export function uniqueOrigins(tours: TourItem[]): Array<{ slug: string; label: string }> {
  const seen = new Map<string, string>();
  for (const t of tours) {
    const label = (t.origin || '').trim();
    if (!label) continue;
    const slug = faSlug(label);
    if (!seen.has(slug)) seen.set(slug, label);
  }
  return [...seen].map(([slug, label]) => ({ slug, label }));
}

/** نرمال‌سازی شماره موبایل: ارقام فارسی/عربی ← لاتین، حذف فاصله و خط تیره. */
export function normalizeMobile(input: string): string {
  return en(input).replace(/[\s\-_]/g, '');
}

/** اعتبارسنجی موبایل ایرانی (مهارت iran-validation): ۰۹ + ۹ رقم. */
export function isValidMobile(input: string): boolean {
  return /^(?:\+98|0098|0)?9\d{9}$/.test(normalizeMobile(input));
}

/* ------------------------------------------------------------------ */
/* موج ۱ قلم ۱ — نمایش دادهٔ دفن‌شده                                    */
/* ------------------------------------------------------------------ */

/** یک ردیف از تفکیک نرخ هتل: لیبل + مقدار آمادهٔ نمایش (رشتهٔ ذخیره‌شده). */
export interface HotelPriceRow {
  label: string;
  value: string;
}

type HotelOptionLike = {
  pricePerPerson?: string | null;
  priceDouble?: string | null;
  priceSingle?: string | null;
  priceChildWithBed?: string | null;
  priceChildNoBed?: string | null;
};

/**
 * تفکیک نرخ اتاق‌های هتل از دادهٔ تورساز (مرحلهٔ ۲).
 * فقط فیلدهای پر و متمایز برمی‌گردند: مقدار خالی نمایش داده نمی‌شود و مقداری
 * که با نرخ پایه یکی است تکرار نمی‌شود (پنل هنگام خالی‌بودن، نرخ دوتخته را
 * در pricePerPerson کپی می‌کند؛ نمایش دوباره‌اش اطلاعات تازه‌ای نیست).
 * اگر هیچ‌کدام پر نباشند، آرایهٔ خالی → صفحه مثل قبل فقط pricePerPerson را
 * همان‌جا که بود نشان می‌دهد و چیزی حدس زده نمی‌شود.
 */
export function hotelPriceRows(opt: HotelOptionLike): HotelPriceRow[] {
  const rows: HotelPriceRow[] = [];
  const base = (opt.priceDouble || opt.pricePerPerson || '').trim();
  const seen = new Set<string>();
  const push = (label: string, raw?: string | null) => {
    const value = (raw || '').trim();
    if (!value || seen.has(value)) return;
    seen.add(value);
    rows.push({ label, value });
  };
  push('هر نفر در اتاق دوتخته', base);
  push('هر نفر در اتاق یک‌تخته', opt.priceSingle);
  push('کودک با تخت (۶ تا ۱۲ سال)', opt.priceChildWithBed);
  push('کودک بدون تخت (۲ تا ۶ سال)', opt.priceChildNoBed);
  return rows;
}

/**
 * لیبل فارسی نوع رزرو هتل (همان واژه‌های تورساز مرحلهٔ ۲).
 * مقدار ناشناخته/خالی → null یعنی روی صفحه چیزی نشان داده نمی‌شود.
 */
export function bookingTypeLabel(bookingType?: string | null): string | null {
  switch ((bookingType || '').toLowerCase()) {
    case 'guarantee': return 'گارانتی';
    case 'semi_charter': return 'نیم‌چارتر';
    case 'on_request': return 'درخواستی';
    default: return null;
  }
}

/**
 * پیدا کردن رکورد مقصد برای بخش «اطلاعات کاربردی مقصد».
 * اول از destinationSlugs (دقیق‌ترین)، با اولویت شهر ← کشور ← ناحیه؛
 * اگر هیچ‌کدام در فهرست مقصدها نبود → null (بخش رندر نمی‌شود، حدس نه).
 */
export function findDestinationPlace(
  tour: TourItem,
  places: Record<string, Place>,
): Place | null {
  const rank = (p: Place): number =>
    p.type === 'city' ? 0 : p.type === 'country' ? 1 : 2;
  const slugs = Array.isArray(tour.destinationSlugs) ? tour.destinationSlugs : [];
  const candidates = slugs
    .map((s) => places[s])
    .filter((p): p is Place => !!p)
    .sort((a, b) => rank(a) - rank(b));
  return candidates[0] ?? null;
}

/** آیا رکورد مقصد دست‌کم یک فیلد کاربردی برای نمایش دارد؟ */
export function hasDestinationInfo(p: Place): boolean {
  return !!(
    (p.currency && p.currency.trim()) ||
    (p.bestSeason && p.bestSeason.trim()) ||
    (p.flightDuration && p.flightDuration.trim()) ||
    (p.visaType && p.visaType.trim()) ||
    (p.travelTips && p.travelTips.some((t) => t && t.trim()))
  );
}
