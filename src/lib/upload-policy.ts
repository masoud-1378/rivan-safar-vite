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
 * - رد سه‌لایهٔ SVG: پسوند، content-type (تمیزشده از پارامتر)، و امضای بایت‌ها
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

/**
 * امضای چند بایت اولِ فرمت‌های مجاز (magic number) — جایگزین سبکِ بازکد با sharp.
 * `evil.svg.png` با content-type جعلیِ `image/png` همین‌جا لو می‌رود:
 * بایت‌های واقعی‌اش با هیچ‌کدام از این امضاها نمی‌خواند.
 */
const MAGIC_SIGNATURES: Record<string, (b: Uint8Array) => boolean> = {
  png: (b) =>
    b.length >= 8 &&
    b[0] === 0x89 &&
    b[1] === 0x50 &&
    b[2] === 0x4e &&
    b[3] === 0x47 &&
    b[4] === 0x0d &&
    b[5] === 0x0a &&
    b[6] === 0x1a &&
    b[7] === 0x0a,
  jpg: (b) => b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  jpeg: (b) => b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  webp: (b) =>
    b.length >= 12 &&
    b[0] === 0x52 &&
    b[1] === 0x49 &&
    b[2] === 0x46 &&
    b[3] === 0x46 && // RIFF
    b[8] === 0x57 &&
    b[9] === 0x45 &&
    b[10] === 0x42 &&
    b[11] === 0x50, // WEBP
  gif: (b) =>
    b.length >= 6 &&
    b[0] === 0x47 &&
    b[1] === 0x49 &&
    b[2] === 0x46 && // GIF
    b[3] === 0x38 &&
    (b[4] === 0x37 || b[4] === 0x39) &&
    b[5] === 0x61, // 87a یا 89a
};

/** فقط چند بایت اول فایل خوانده می‌شود؛ برای چک امضا کل فایل لازم نیست. */
async function headBytes(file: File, n: number): Promise<Uint8Array> {
  return new Uint8Array(await file.slice(0, n).arrayBuffer());
}

/**
 * نامک تمیزشده برای مسیر استوریج (همان قرارداد بنر تور):
 * فقط حروف کوچک انگلیسی، عدد و خط تیره؛ اگر چیزی نماند همان fallback.
 */
export function cleanStorageSlug(slug: string, fallback: string): string {
  return (slug || fallback).toLowerCase().replace(/[^a-z0-9-]/g, '') || fallback;
}

/**
 * سیاست آپلود تصویر را روی فایل اعمال می‌کند؛ نامعتبر بود خطای فارسی می‌دهد.
 * async است چون امضای بایت‌ها را از خودِ فایل می‌خواند، نه از ادعای مرورگر.
 */
export async function assertUploadImage(file: File): Promise<void> {
  if (!(file instanceof File) || file.size === 0) {
    throw new Error('فایلی انتخاب نشده است.');
  }
  // content-type ممکن است پارامتر داشته باشد (image/svg+xml;charset=utf-8)؛
  // مقایسه با همانِ تمیزشده انجام می‌شود تا رد SVG دور زده نشود.
  const baseType = file.type.split(';')[0].trim().toLowerCase();
  if (!baseType.startsWith('image/')) {
    throw new Error('فقط فایل تصویری مجاز است.');
  }
  if (file.size > IMAGE_UPLOAD_MAX_BYTES) {
    throw new Error('حجم عکس نباید از ۵ مگابایت بیشتر باشد.');
  }
  const ext = extOf(file.name);
  // رد دو‌لایهٔ SVG: نه پسوندش، نه content-typeش. هر کدام به‌تنهایی کافی است.
  if (baseType === SVG_MIME || ext === 'svg') {
    throw new Error('فرمت SVG مجاز نیست؛ فقط jpg، png، webp یا gif.');
  }
  if (!(ALLOWED_IMAGE_EXTS as readonly string[]).includes(ext)) {
    throw new Error('فرمت عکس مجاز نیست؛ فقط jpg، png، webp یا gif.');
  }
  // لایهٔ سوم: بایت‌های واقعی فایل باید با همان فرمتی بخواند که ادعا شده؛
  // پسوند و content-type هر دو از مرورگر می‌آیند و جعل‌شدنی‌اند.
  const check = MAGIC_SIGNATURES[ext];
  if (!check || !check(await headBytes(file, 12))) {
    throw new Error('این فایل عکس واقعی نیست؛ فایل دیگری انتخاب کنید.');
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
