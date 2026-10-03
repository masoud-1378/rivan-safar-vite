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
// مسیر مجاز روی هاست سوپابیس — آینهٔ `pathname: '/storage/v1/object/public/**'`
// از `next.config.ts`. فقط فایل‌های عمومی استوریج روی سایت رندر می‌شوند؛
// بقیهٔ مسیرهای همین هاست (مثل /functions/v1/...) در `next/image` رد می‌شوند.
const SUPABASE_STORAGE_PATH_PREFIX = '/storage/v1/object/public/';

/** آدرس خالی یعنی «فیلد اختیاری پر نشده» — برای اعتبارسنجی رد نمی‌شود. */
export function isRenderableImageUrl(raw: string): boolean {
  const url = (raw || '').trim();
  if (!url) return true;
  // «//evil.com/x» هم با «/» شروع می‌شود ولی لوکال نیست (پروتکل‌نسبی)؛ رد می‌شود.
  if (url.startsWith('/') && !url.startsWith('//')) return true; // تصویر لوکالِ خود سایت
  let parsed: URL;
  try {
    parsed = new URL(url);
    if (parsed.protocol !== 'https:') return false;
  } catch {
    return false;
  }
  const host = parsed.hostname.toLowerCase();
  if (ALLOWED_HOSTS.includes(host)) return true;
  if (!ALLOWED_HOST_SUFFIXES.some((suffix) => host.endsWith(suffix))) return false;
  // هاست سوپابیس است ولی next/image فقط مسیر استوریج عمومی را قبول می‌کند.
  return parsed.pathname.startsWith(SUPABASE_STORAGE_PATH_PREFIX);
}

/** پیام خطای اعتبارسنجی آدرس تصویر (هم‌خوان با persian-ui-copy: چه چیزی را عوض کند). */
export const UNSUPPORTED_IMAGE_HOST_ERROR =
  'این آدرس روی سایت نمایش داده نمی‌شود؛ از لینک Unsplash استفاده کنید.';

/** آدرس را می‌سنجد و اگر سازگار نبود، با پیام فارسی خطا می‌دهد. */
export function assertRenderableImageUrl(raw: string): void {
  if (!isRenderableImageUrl(raw)) throw new Error(UNSUPPORTED_IMAGE_HOST_ERROR);
}
