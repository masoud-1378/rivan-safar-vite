/**
 * tour-live.ts — ابزارهای مشترک بسته C (سایت‌نما و فرم‌ها/لید)
 *
 * این ماژول پل بین «تایپ قدیمی TourItem» و فیلدهای تازه‌ای است که بسته A
 * (فرم تورساز پنل) به تور اضافه می‌کند. همه‌چیز دفاعی نوشته شده: اگر فیلد
 * تازه‌ای روی آبجکت تور نباشد، رفتار قبلی سایت حفظ می‌شود و هیچ‌چیز
 * کرش نمی‌کند — پس قبل و بعد از تغییر بسته A کار می‌کند.
 */
import type { TourItem } from '../data/toursData';
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
