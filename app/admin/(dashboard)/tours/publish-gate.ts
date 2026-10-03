/**
 * گیت انتشار تور (موج ۱، قلم ۲ — تصمیم ۳ پلن بازطراحی: گیت انتشار «همه‌چیز»).
 *
 * این ماژول عمداً خالص (pure) و بدون هیچ import است تا هم از کلاینت
 * (TourForm، برای تیک‌های واقعی مرحله‌ها و دیالوگ پیش از انتشار) و هم از
 * سرور (actions.ts، برای گیت انتشار گروهی) استفاده شود — بدون ورود به
 * مرز 'use client' / 'use server'.
 *
 * قاعدهٔ صداقت داده (اصل ۵ پلن): قیمت/تاریخ/ظرفیت هرگز حدس زده نمی‌شوند؛
 * هرچه نیست، «ناقص» است.
 *
 * برای «ایستگاه پایانی» (مرحلهٔ ۷ ویزاردِ آینده): همین
 * `checkPublishReadiness` را صدا بزنید؛ نیازی به گیت دوم نیست.
 */

export type PublishCheckKey =
  | 'banner'
  | 'price'
  | 'destination'
  | 'hotel'
  | 'itinerary'
  | 'visaDocs'
  | 'consultant';

/** ورودی گیت — TourRow و TourInput هر دو ساختاری به این می‌خورند. */
export interface PublishGateInput {
  title?: string | null;
  price?: number | string | null;
  image?: string | null;
  destinationSlugs?: Array<string | null | undefined> | null;
  hotelOptions?: Array<{
    name?: string | null;
    priceDouble?: string | null;
    pricePerPerson?: string | null;
  }> | null;
  itineraryDays?: Array<{
    title?: string | null;
    description?: string | null;
  }> | null;
  trustSpecs?: {
    requiredDocs?: Array<string | null | undefined> | null;
  } | null;
  consultantSpec?: {
    name?: string | null;
  } | null;
}

export interface PublishCheck {
  key: PublishCheckKey;
  ok: boolean;
  /** نام کوتاه قلم — در دیالوگ ناقصی‌ها و پیام‌ها. */
  label: string;
  /** پیام فارسی وضعیت (کامل یا ناقص). */
  message: string;
  /** شمارهٔ مرحله‌ای که این قلم در آن کامل می‌شود (ویزارد فعلی: ۵ مرحله). */
  stageId: number;
}

export interface PublishReadinessResult {
  ready: boolean;
  checks: PublishCheck[];
  missing: PublishCheck[];
}

function nonEmpty(v: unknown): boolean {
  return typeof v === 'string' && v.trim().length > 0;
}

export function checkPublishReadiness(tour: PublishGateInput): PublishReadinessResult {
  const t = tour ?? {};
  const checks: PublishCheck[] = [];

  // بنر — مرحلهٔ ۱
  const bannerOk = nonEmpty(t.image);
  checks.push({
    key: 'banner',
    ok: bannerOk,
    label: 'بنر',
    message: bannerOk ? 'بنر تور انتخاب شده است.' : 'بنر تور انتخاب نشده است.',
    stageId: 1,
  });

  // قیمت پایه — مرحلهٔ ۱. هرگز حدس زده نمی‌شود: صفر یا خالی یعنی ناقص.
  const priceNum = typeof t.price === 'string' ? Number(t.price) : Number(t.price ?? 0);
  const priceOk = Number.isFinite(priceNum) && priceNum > 0;
  checks.push({
    key: 'price',
    ok: priceOk,
    label: 'قیمت پایه',
    message: priceOk ? 'قیمت پایه ثبت شده است.' : 'قیمت پایه ثبت نشده است.',
    stageId: 1,
  });

  // مقصد — مرحلهٔ ۱
  const destCount = Array.isArray(t.destinationSlugs)
    ? t.destinationSlugs.filter((s) => nonEmpty(s)).length
    : 0;
  const destinationOk = destCount > 0;
  checks.push({
    key: 'destination',
    ok: destinationOk,
    label: 'مقصد',
    message: destinationOk ? 'مقصد تور انتخاب شده است.' : 'مقصد تور انتخاب نشده است.',
    stageId: 1,
  });

  // دست‌کم یک هتل — مرحلهٔ ۲
  const hotelOk = Array.isArray(t.hotelOptions) && t.hotelOptions.some((h) => nonEmpty(h?.name));
  checks.push({
    key: 'hotel',
    ok: hotelOk,
    label: 'هتل',
    message: hotelOk ? 'دست‌کم یک هتل ثبت شده است.' : 'هنوز هتلی برای تور ثبت نشده است.',
    stageId: 2,
  });

  // برنامهٔ روزبه‌روز: دست‌کم یک روز با محتوا (عنوان + شرح) — مرحلهٔ ۳
  const itineraryOk =
    Array.isArray(t.itineraryDays) &&
    t.itineraryDays.some((d) => nonEmpty(d?.title) && nonEmpty(d?.description));
  checks.push({
    key: 'itinerary',
    ok: itineraryOk,
    label: 'برنامهٔ روزبه‌روز',
    message: itineraryOk
      ? 'برنامهٔ روزبه‌روز کامل است.'
      : 'برنامهٔ روزبه‌روز خالی است؛ دست‌کم یک روز با عنوان و شرح لازم است.',
    stageId: 3,
  });

  // مدارک ویزا — مرحلهٔ ۴
  const docs = Array.isArray(t.trustSpecs?.requiredDocs)
    ? t.trustSpecs!.requiredDocs!.filter((d) => nonEmpty(d))
    : [];
  const visaDocsOk = docs.length > 0;
  checks.push({
    key: 'visaDocs',
    ok: visaDocsOk,
    label: 'مدارک ویزا',
    message: visaDocsOk ? 'مدارک ویزا ثبت شده است.' : 'مدارک ویزا ثبت نشده است.',
    stageId: 4,
  });

  // کارشناس/راهنمای فروش — مرحلهٔ ۵
  const consultantOk = nonEmpty(t.consultantSpec?.name);
  checks.push({
    key: 'consultant',
    ok: consultantOk,
    label: 'کارشناس پاسخ‌گو',
    message: consultantOk
      ? 'کارشناس پاسخ‌گو مشخص است.'
      : 'کارشناس پاسخ‌گوی تور مشخص نیست.',
    stageId: 5,
  });

  return {
    ready: checks.every((c) => c.ok),
    checks,
    missing: checks.filter((c) => !c.ok),
  };
}

/**
 * تیک‌های واقعی مرحله‌های ویزارد — از همین چک‌های گیت، نه از محاسبه‌ای جدا.
 * نگاشت قلم → مرحله برای ویزارد ۵مرحله‌ای فعلی:
 *   ۱ (هویت و نرخ): بنر، قیمت پایه، مقصد
 *   ۲ (هتل و اتاق): هتل
 *   ۳ (برنامه سفر): برنامهٔ روزبه‌روز
 *   ۴ (ویزا و مدارک): مدارک ویزا
 *   ۵ (کارشناس): کارشناس پاسخ‌گو
 *
 * با بازنویسی ویزارد به ۷ مرحله (موج ۲)، فقط همین نگاشت عوض می‌شود.
 */
export const CHECKS_BY_STAGE: Record<number, PublishCheckKey[]> = {
  1: ['banner', 'price', 'destination'],
  2: ['hotel'],
  3: ['itinerary'],
  4: ['visaDocs'],
  5: ['consultant'],
};

/** عنوان کوتاه مرحله‌ها — برای ارجاع «رفتن به مرحله» در دیالوگ ناقصی‌ها. */
export const STAGE_SHORT_TITLES: Record<number, string> = {
  1: 'هویت و نرخ',
  2: 'هتل و اتاق',
  3: 'برنامه سفر',
  4: 'ویزا و مدارک',
  5: 'کارشناس',
};

/**
 * تیک هر مرحله: true فقط وقتی که همهٔ چک‌های گیتِ همان مرحله کامل باشند.
 * خروجی به ترتیب شمارهٔ مرحله (اندیس ۰ = مرحلهٔ ۱).
 */
export function stageTicksFromGate(readiness: PublishReadinessResult): boolean[] {
  const byKey = new Map(readiness.checks.map((c) => [c.key, c.ok]));
  const maxStage = Math.max(...Object.keys(CHECKS_BY_STAGE).map(Number));
  const ticks: boolean[] = [];
  for (let s = 1; s <= maxStage; s++) {
    const keys = CHECKS_BY_STAGE[s] ?? [];
    ticks.push(keys.length > 0 && keys.every((k) => byKey.get(k) === true));
  }
  return ticks;
}
