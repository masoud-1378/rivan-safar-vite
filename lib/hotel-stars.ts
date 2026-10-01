import { fa } from './utils';

/**
 * تنها مرجع رندر «ستارهٔ هتل» در کل پروژه (کتابچه §۳: باگ نمایشی ستاره).
 * عدد ↔ متن فقط از این‌جا می‌گذرد تا همه‌جا یک‌شکل دیده شود.
 * رکوردهای قدیمیِ stars=NULL با «—» نمایش داده می‌شوند، نه صفر.
 */
export function formatHotelStars(stars: number | null | undefined): string {
  if (stars == null) return '—';
  return `${fa(stars)} ستاره`;
}
