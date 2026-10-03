/**
 * قرارداد مشترک فرمت نامک (میز ۳ — ایراد ۱۰)
 *
 * روت‌های سایت نامک را فقط با رجکس `[a-zA-Z0-9_-]+` می‌پذیرند؛ نامک فارسیِ
 * دستی (که اعتبارسنجی سرور فقط trimش می‌کرد) روی صفحهٔ زنده بدنهٔ ۲۰۰ ولی
 * title «پیدا نشد» + noindex می‌داد. این قرارداد همان قانون روت را سمت سرور
 * اعمال می‌کند تا چنین نامکی اصلاً ذخیره نشود.
 *
 * هر چهار ذخیره‌کننده (تور، مقصد، راهنما، نمایشگاه) از همین‌جا می‌خوانند.
 * پیام خطا فارسی و روشن است: چه چیزی را باید عوض کرد (persian-ui-copy).
 */

const LATIN_SLUG_RE = /^[A-Za-z0-9_-]+$/;

/** نامک فارسی/نامعتبر را true برمی‌گرداند. */
export function isInvalidSlugFormat(slug: string): boolean {
  return !LATIN_SLUG_RE.test(slug);
}

export const INVALID_SLUG_ERROR =
  'آدرس اینترنتی فقط حروف انگلیسی، عدد، خط تیره و آندرلاین می‌پذیرد؛ آدرس فارسی روی سایت باز نمی‌شود.';

/**
 * نامک trimشده را برمی‌گرداند و اگر فرمتش با روت‌های سایت نخواند خطای فارسی می‌دهد.
 * چک «خالی بودن» با خودِ صداکننده است (پیام «نامک لازم است» سر جایش می‌ماند).
 */
export function assertLatinSlug(raw: string): string {
  const slug = (raw || '').trim();
  if (slug && isInvalidSlugFormat(slug)) throw new Error(INVALID_SLUG_ERROR);
  return slug;
}
