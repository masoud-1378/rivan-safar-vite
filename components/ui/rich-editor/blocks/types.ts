/**
 * blocks/types.ts — شکل attrهای بلوک‌های تخصصی ریوان سفر.
 *
 * قانون: فقط دادهٔ سادهٔ JSON (رشته، عدد، آرایه، آبجکت تخت) تا خروجی
 * ویرایشگر تمیز در ستون jsonb ذخیره شود. هیچ‌چیز غیرقابل‌سریالایز این‌جا نیست.
 */

/** نمایی فشردهٔ تور که هنگام درج، داخل attr بلوک ذخیره می‌شود. */
export interface TourCardSnapshot {
  title: string;
  image: string;
  duration: string;
  destination: string;
  /** قیمت عددی (تومان)؛ null یعنی «استعلام قیمت». قالب‌بندی هنگام نمایش است. */
  price: number | null;
  badge: string | null;
  statusLabel: string | null;
}

export interface TourCardAttrs {
  /** نامک تور در دیتابیس (کلید زنده) */
  tourSlug: string;
  /** نمای ذخیره‌شده برای نمایش دفاعی وقتی تور حذف شده است */
  snapshot: TourCardSnapshot | null;
}

/** نتیجهٔ جست‌وجوی تور برای دیالوگ انتخاب — خروجی اکشن سرور. */
export interface TourPickerHit {
  slug: string;
  title: string;
  destination: string;
  duration: string;
  image: string;
  price: number | null;
  badge: string | null;
  statusLabel: string | null;
}

export interface PriceRow {
  label: string;
  price: string;
}

export interface PriceTableAttrs {
  title: string | null;
  rows: PriceRow[];
}

export interface FaqItem {
  question: string;
  /** متن ساده؛ پاراگراف‌ها با خط خالی از هم جدا می‌شوند */
  answer: string;
}

export interface FaqBlockAttrs {
  title: string | null;
  items: FaqItem[];
}

export interface GalleryImage {
  url: string;
  caption: string | null;
  alt: string | null;
}

export interface PhotoGalleryAttrs {
  images: GalleryImage[];
}

export interface CallCtaAttrs {
  heading: string | null;
  /** متن روی دکمه، مثلاً «درخواست تماس» */
  label: string;
  /** نشانی tel: مثل tel:02633350139 */
  phoneHref: string;
  /** نمایش فارسی شماره، مثلاً ۰۲۶-۳۳۳۵۰۱۳۹ */
  phoneDisplay: string;
  note: string | null;
}

/** نام نودهای بلوک — تنها جایی که رشته‌های تایپ‌تپ متمرکز شده‌اند. */
export const BLOCK_NODE_TYPES = {
  tourCard: 'tourCard',
  priceTable: 'priceTable',
  faqBlock: 'faqBlock',
  photoGallery: 'photoGallery',
  callCta: 'callCta',
} as const;
