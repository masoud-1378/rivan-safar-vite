/**
 * قرارداد مشترک آپلود تصویر (میز ۳ — ایراد ۲۷)
 *
 * دو آپلودر پنل (بنر تور و عکس هتل) پیش از این هر کدام سیاستِ خودشان را
 * داشتند: بنر تور SVG را رد می‌کرد ولی آپلودر هتل فقط `image/*` را چک
 * می‌کرد و `image/svg+xml` از آن رد می‌شد — وکتوری که با content-type
 * `image/svg+xml` عمومی سرو شود، اسکریپت اجرا می‌کند (XSS ذخیره‌شده).
 *
 * از این‌جا به بعد هر دو آپلودر از همین‌جا می‌خوانند:
 * - باکت و سقف حجم یک‌جا
 * - allowlist پسوند — SVG عمداً بیرون است
 * - رد دو‌لایهٔ SVG: هم پسوند، هم content-type
 *
 * پیام‌های خطا فارسی‌اند و می‌گویند چه چیزی را باید عوض کرد (persian-ui-copy).
 */

export const IMAGE_UPLOAD_BUCKET = 'hotel-photos';
export const IMAGE_UPLOAD_MAX_BYTES = 5 * 1024 * 1024;
/** فقط فرمت‌های عکسیِ امن؛ SVG به‌خاطر ریسک اسکریپتِ ذخیره‌شده نیست. */
export const ALLOWED_IMAGE_EXTS = ['jpg', 'jpeg', 'png', 'webp', 'gif'] as const;

const SVG_MIME = 'image/svg+xml';

function extOf(fileName: string): string {
  return (fileName.split('.').pop() || '').toLowerCase();
}

/** سیاست آپلود تصویر را روی فایل اعمال می‌کند؛ نامعتبر بود خطای فارسی می‌دهد. */
export function assertUploadImage(file: File): void {
  if (!(file instanceof File) || file.size === 0) {
    throw new Error('فایلی انتخاب نشده است.');
  }
  if (!file.type.startsWith('image/')) {
    throw new Error('فقط فایل تصویری مجاز است.');
  }
  if (file.size > IMAGE_UPLOAD_MAX_BYTES) {
    throw new Error('حجم عکس نباید از ۵ مگابایت بیشتر باشد.');
  }
  const ext = extOf(file.name);
  // رد دو‌لایهٔ SVG: نه پسوندش، نه content-typeش. هر کدام به‌تنهایی کافی است.
  if (file.type === SVG_MIME || ext === 'svg') {
    throw new Error('فرمت SVG مجاز نیست؛ فقط jpg، png، webp یا gif.');
  }
  if (!(ALLOWED_IMAGE_EXTS as readonly string[]).includes(ext)) {
    throw new Error('فرمت عکس مجاز نیست؛ فقط jpg، png، webp یا gif.');
  }
}

/**
 * مسیر فایل داخل باکت را از URL عمومی استخراج می‌کند.
 * فقط وقتی مسیر برمی‌گرداند که URL واقعاً به همین باکت و همین پیشوند
 * (زیرمسیرِ خودِ آپلودر) اشاره کند — نه هیچ جای دیگر.
 */
export function storagePathInBucket(
  publicUrl: string,
  bucket: string,
  prefix: string,
): string | null {
  let parsed: URL;
  try {
    parsed = new URL((publicUrl || '').trim());
  } catch {
    return null;
  }
  if (parsed.protocol !== 'https:') return null;
  if (!parsed.hostname.toLowerCase().endsWith('.supabase.co')) return null;
  const marker = `/storage/v1/object/public/${bucket}/`;
  if (!parsed.pathname.startsWith(marker)) return null;
  const path = decodeURIComponent(parsed.pathname.slice(marker.length));
  if (!path || !path.startsWith(prefix)) return null;
  if (path.includes('..')) return null;
  return path;
}
