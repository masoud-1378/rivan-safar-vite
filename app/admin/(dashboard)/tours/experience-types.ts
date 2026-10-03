/**
 * موج ۴ — تایپ‌ها و نرمالایزرهای خالص تجربهٔ سفر (تورلیدر/نظر/گالری).
 * این فایل 'use server' ندارد تا هم کلاینت و هم سرور بتوانند استفاده کنند.
 */

export type LeaderJoinMode = 'from_origin' | 'at_destination';

export interface TourLeaderItem {
  id: string;
  name: string;
  photo: string;
  bio: string;
  languages: string;
  joinMode: LeaderJoinMode;
}

export interface TourReviewItem {
  /** undefined یعنی تازه است و هنوز در دیتابیس نیست */
  id?: string;
  name: string;
  rating: number;
  text: string;
  isVisible: boolean;
}

export interface TourGalleryItem {
  url: string;
  caption: string;
  /**
   * نوع آیتم — موج ۶ (گالری ترکیبی): غایب یعنی عکس. آیتم‌های قدیمیِ بدون این
   * فیلد (فقط {url, caption}) همچنان عکس محسوب می‌شوند و نمی‌شکنند.
   */
  type?: TourGalleryMediaType;
  /**
   * نسبت تصویر ویدیو: ۱۶:۹ افقی / مربعی / ۹:۱۶ عمودی. فقط برای ویدیو
   * معنادار است؛ برای عکس بی‌اثر می‌ماند.
   */
  aspect?: TourGalleryAspect;
}

/** موج ۶ — نوع رسانه و نسبت تصویر آیتم‌های گالری ترکیبی. */
export type TourGalleryMediaType = 'photo' | 'video';
export type TourGalleryAspect = 'landscape' | 'square' | 'portrait';

export interface LeaderInput {
  name: string;
  photo: string;
  bio: string;
  languages: string;
  joinMode: LeaderJoinMode;
}

/* ── نرمالایزرهای خالص (برای saveTour) ── */

export function normalizeGalleryItems(v: unknown): TourGalleryItem[] {
  if (!Array.isArray(v)) return [];
  const out: TourGalleryItem[] = [];
  for (const item of v) {
    const o = (item ?? {}) as Partial<TourGalleryItem>;
    const url = String(o.url || '').trim();
    if (!url) continue;
    const caption = String(o.caption || '').trim();
    // موج ۶: ویدیو بودن و نسبتش عبور می‌کند؛ بقیهٔ مقادیر (از جمله
    // آیتم‌های قدیمیِ بدون type) عکس می‌مانند و نمی‌شکنند.
    const next: TourGalleryItem = { url, caption };
    if (o.type === 'video') {
      next.type = 'video';
      next.aspect =
        o.aspect === 'square' ? 'square' : o.aspect === 'portrait' ? 'portrait' : 'landscape';
    }
    out.push(next);
    if (out.length >= 30) break;
  }
  return out;
}

export function normalizeReviewItems(v: unknown): TourReviewItem[] {
  if (!Array.isArray(v)) return [];
  const out: TourReviewItem[] = [];
  for (const item of v) {
    const o = (item ?? {}) as Partial<TourReviewItem>;
    const name = String(o.name || '').trim();
    const text = String(o.text || '').trim();
    if (!name || !text) continue;
    const rating = Math.min(5, Math.max(1, Number(o.rating) || 5));
    out.push({
      ...(typeof o.id === 'string' && o.id ? { id: o.id } : {}),
      name,
      rating,
      text,
      isVisible: o.isVisible !== false,
    });
    if (out.length >= 50) break;
  }
  return out;
}
