/**
 * تشخیص «داخلی بودن» مقصد — منبع یگانه برای حدس خودکار نیاز به ویزا (ایراد ۹).
 * هم اکشن سرور (tours/actions.ts) و هم فرم تورساز (TourForm.tsx) از همین‌جا می‌خوانند
 * تا حدس کلاینت و سرور از هم دور نشوند.
 */

/** نامک‌هایی که همیشه داخلی حساب می‌شوند. */
export const DOMESTIC_SLUGS = [
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

/** نام‌هایی که داخلی‌بودن را لو می‌دهند (برای رکوردهایی که در درخت نیستند). */
export const DOMESTIC_NAME_RE =
  /کیش|مشهد|قشم|شیراز|اصفهان|یزد|تبریز|چابهار|کرمان|اهواز|رشت|همدان|ایران/;

/**
 * حدس نیاز به ویزا از روی نامک مقصدها:
 * اگر همهٔ مقصدها داخلی باشند ویزا لازم نیست، وگرنه لازم است.
 * فهرست خالی یعنی «نمی‌دانم» و false برمی‌گرداند تا تیک بی‌جهت روشن نشود.
 */
export function guessVisaRequired(
  slugs: string[],
  isDomestic: (slug: string) => boolean,
): boolean {
  if (slugs.length === 0) return false;
  return !slugs.every(isDomestic);
}
