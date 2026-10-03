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

/**
 * متن صادقانهٔ «درجه هتل‌ها» برای صفحهٔ تور (میز ۳ — ایراد ۱۴).
 *
 * مشکل قبلی: `hotelStars` فقط «حداکثر» ستاره بود (Math.max در saveTour) ولی
 * سایت «X ستاره و بالاتر» می‌نوشت؛ با هتل‌های ۳★ و ۵★، «۵ ستاره و بالاتر»
 * هتل ۳★ را انکار می‌کرد.
 *
 * حالا از ترکیب واقعی گزینه‌ها می‌گوید:
 * - همه یک درجه → «۵ ستاره»
 * - بازه → «۳ تا ۵ ستاره»
 * - گزینه‌ای با ستاره نیست و فقط سقفِ ذخیره‌شده هست → «تا ۵ ستاره»
 * - هیچ‌کدام → «—»
 */
export function formatHotelStarsRange(
  optionStars: Array<number | null | undefined>,
  maxStars: number | null | undefined,
): string {
  const distinct = [...new Set(optionStars.filter((s): s is number => Number.isInteger(s) && (s as number) > 0))].sort(
    (a, b) => a - b,
  );
  if (distinct.length === 1) return `${fa(distinct[0])} ستاره`;
  if (distinct.length > 1) return `${fa(distinct[0])} تا ${fa(distinct[distinct.length - 1])} ستاره`;
  if (maxStars != null && maxStars > 0) return `تا ${fa(maxStars)} ستاره`;
  return '—';
}
