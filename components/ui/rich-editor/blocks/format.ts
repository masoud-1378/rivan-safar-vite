/**
 * blocks/format.ts — قالب‌بندی قیمت فارسی؛ بدون وابستگی تا هم در
 * ویرایشگر (کلاینت) و هم در رندر عمومی (سرور) استفاده شود.
 */

const FA_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

/** عدد تومان → «۱۲٬۵۰۰٬۰۰۰»؛ ورودی نامعتبر/صفر → null (یعنی استعلام قیمت). */
export function formatFaPrice(n: number | null | undefined): string | null {
  if (n == null || !Number.isFinite(n) || n <= 0) return null;
  return Math.round(n)
    .toLocaleString('en-US')
    .replace(/\d/g, (d) => FA_DIGITS[Number(d)])
    .replace(/,/g, '٬');
}
