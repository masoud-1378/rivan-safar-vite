/**
 * شش دسته‌بندی معتبر مقصد — همان یونیون تایپ Place['category'] در
 * src/data/destinationsData.ts. برچسب‌ها با چیپ‌های فیلتر هاب مقصدهای سایت
 * یکی‌اند تا ادمین ببیند مقصد زیر کدام فیلتر می‌نشیند.
 * نکته: سایت برای europe چیپ ندارد (فعلاً فقط زیر «همه» دیده می‌شود).
 */
export const DESTINATION_CATEGORIES = [
  { value: 'domestic', label: 'تورهای داخلی' },
  { value: 'turkey', label: 'ترکیه و مقاصد نزدیک' },
  { value: 'middle_east', label: 'امارات و خاورمیانه' },
  { value: 'asia', label: 'شرق آسیا' },
  { value: 'europe', label: 'اروپا' },
  { value: 'exhibition', label: 'مقاصد تجاری و نمایشگاهی' },
] as const;

export type DestinationCategory = (typeof DESTINATION_CATEGORIES)[number]['value'];

const VALID = new Set<string>(DESTINATION_CATEGORIES.map((c) => c.value));

/** true یعنی مقدار، یکی از شش دسته‌بندی معتبر است. */
export function isValidDestinationCategory(v: string | null | undefined): boolean {
  return typeof v === 'string' && VALID.has(v);
}
