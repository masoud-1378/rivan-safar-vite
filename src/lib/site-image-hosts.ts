/**
 * میزبان‌های تصویرِ سازگار با سایت
 *
 * تصاویر سایت با `next/image` رندر می‌شوند و فقط هاست‌هایی که در
 * `images.remotePatterns`ِ `next.config.ts` سفید شده‌اند روی سایت باز می‌شوند.
 * این فایل همان قرارداد را یک‌جا نگه می‌دارد:
 * - `next.config.ts` هاست(ها) را برای بهینه‌ساز Next سفید می‌کند.
 * - اکشن‌های ذخیرهٔ پنل (تور، مقصد، راهنما، نمایشگاه) آدرس دستی را با
 *   `isRenderableImageUrl` می‌سنجند تا آدرسی ذخیره نشود که روی سایت نمی‌آید.
 *
 * هر وقت هاست تازه‌ای سفید شد، هر دو جا باید با هم به‌روز شوند.
 */

// هاست‌های دقیق
const ALLOWED_HOSTS = ['images.unsplash.com'];
// پسوندهای مجاز (وایلدکارد تک‌سطحی): هاست ذخیره‌سازی پروژهٔ سوپابیس،
// یعنی همان هاستی که `getPublicUrl` در آپلودر بنر تور و عکس هتل می‌سازد
// (https://<ref>.supabase.co/storage/v1/object/public/...).
const ALLOWED_HOST_SUFFIXES = ['.supabase.co'];

/** آدرس خالی یعنی «فیلد اختیاری پر نشده» — برای اعتبارسنجی رد نمی‌شود. */
export function isRenderableImageUrl(raw: string): boolean {
  const url = (raw || '').trim();
  if (!url) return true;
  if (url.startsWith('/')) return true; // تصویر لوکالِ خود سایت
  let host: string;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:') return false;
    host = parsed.hostname.toLowerCase();
  } catch {
    return false;
  }
  if (ALLOWED_HOSTS.includes(host)) return true;
  return ALLOWED_HOST_SUFFIXES.some((suffix) => host.endsWith(suffix));
}

/** پیام خطای اعتبارسنجی آدرس تصویر (هم‌خوان با persian-ui-copy: چه چیزی را عوض کند). */
export const UNSUPPORTED_IMAGE_HOST_ERROR =
  'این آدرس روی سایت نمایش داده نمی‌شود؛ از لینک Unsplash استفاده کنید.';

/** آدرس را می‌سنجد و اگر سازگار نبود، با پیام فارسی خطا می‌دهد. */
export function assertRenderableImageUrl(raw: string): void {
  if (!isRenderableImageUrl(raw)) throw new Error(UNSUPPORTED_IMAGE_HOST_ERROR);
}
