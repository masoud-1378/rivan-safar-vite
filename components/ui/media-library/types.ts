/**
 * کتابخانهٔ رسانه — تایپ‌ها و قراردادهای مشترک.
 *
 * این فایل عمداً هیچ وابستگی ران‌تایمی ندارد (نه ری‌اکت، نه اکشن سرور):
 * تیم ویرایشگر فقط همین فایل را ایمپورت می‌کند و چرخهٔ وابستگی ساخته نمی‌شود.
 */

/**
 * تصویری که کاربر از کتابخانه برمی‌دارد.
 * تنها قراردادی است که تیم ویرایشگر ایمپورت می‌کند.
 */
export interface PickedImage {
  url: string;
  caption?: string;
  alt?: string;
}

/** ردیف جدول `media` آن‌طور که کتابخانه نمایش می‌دهد. */
export interface MediaListItem {
  id: string;
  url: string;
  altFa: string;
  source: string | null;
  createdAt: string;
}

/** برچسب نمایشی نوع‌های شناخته‌شدهٔ رسانه. */
export const MEDIA_KIND_LABELS: Record<string, string> = {
  guide: 'راهنما',
  destination: 'مقصد',
  exhibition: 'نمایشگاه',
  tour: 'تور',
  hotel: 'هتل',
  misc: 'متفرقه',
};

/**
 * قرارداد tag روی ستون `media.source`:
 * - `guide` / `destination` / `exhibition` … — برچسب کلیِ نوع
 *   (وقتی رکورد هنوز نامک ندارد و ذخیره نشده)
 * - `guide:<slug>` / `destination:<slug>` … — برچسب رکوردِ مشخص
 *
 * ادامهٔ همان قرارداد موجود در کد است: `tour:<slug>` (بنر تور) و
 * `hotel:<slug>` (عکس هتل). فقط حروف کوچک انگلیسی، عدد و خط تیره در
 * بخش نامک می‌ماند؛ بقیه حذف می‌شود.
 */
export function mediaTag(kind: string, slug?: string | null): string {
  const k = (kind || '').trim().toLowerCase() || 'misc';
  const s = (slug || '').trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
  return s ? `${k}:${s}` : k;
}

/** بخش نوعِ tag (قبل از `:`)؛ وقتی `:` ندارد، خود tag همان نوع است. */
export function mediaKindOf(tag: string): string {
  const t = (tag || '').trim().toLowerCase();
  const i = t.indexOf(':');
  return (i === -1 ? t : t.slice(0, i)).trim() || 'misc';
}

/**
 * پیشوند استوریجِ هر tag — آینهٔ قرارداد آپلودرهای موجود:
 * بنر تور زیر `tours/<slug>/`، عکس هتل زیر `<slug>/`، بقیه زیر `<kind>s/<slug>/`.
 * حذف امنِ رسانه فقط همین پیشوند را لمس می‌کند.
 */
export function mediaStoragePrefix(tag: string): string {
  const kind = mediaKindOf(tag);
  const idx = (tag || '').indexOf(':');
  const raw = idx === -1 ? '' : tag.slice(idx + 1);
  const slug = raw.toLowerCase().replace(/[^a-z0-9-]/g, '') || 'misc';
  if (kind === 'tour') return `tours/${slug}/`;
  if (kind === 'hotel') return `${slug}/`;
  return `${kind}s/${slug}/`;
}

/** برچسب نمایشی نوعِ tag برای متن‌های رابط کاربری. */
export function mediaKindLabel(tag: string): string {
  return MEDIA_KIND_LABELS[mediaKindOf(tag)] ?? 'رسانه';
}
