'use server';

import { revalidatePath } from 'next/cache';
import { getDb } from '@/db/client';
import { accommodations, siteDestinations } from '@/db/schema';
import { and, asc, count, desc, eq, isNull, ne } from 'drizzle-orm';
import { requireAdmin } from '@/src/lib/admin-auth';
import { archiveOne } from '@/src/lib/archive';

export interface HotelRow extends Record<string, unknown> {
  id: string;
  slug: string;
  nameFa: string;
  stars: number | null;
  placeSlug: string;
}

export interface HotelInput {
  id?: string;
  slug: string;
  nameFa: string;
  // گشت (ایراد ۶): ستاره اختیاری است — null مجاز است و سایت «—» نشان می‌دهد.
  stars: number | null;
  placeSlug: string;
}

export async function listHotels(): Promise<HotelRow[]> {
  await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  const rows = await db.select().from(accommodations).where(isNull(accommodations.deletedAt)).orderBy(desc(accommodations.createdAt)).limit(500);
  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    nameFa: r.nameFa,
    stars: r.stars,
    placeSlug: r.placeSlug ?? '',
  }));
}

export async function countHotels(): Promise<number> {
  await requireAdmin(['owner', 'editor']); // SEC-09: اکشن exportشده — بدون احراز هویت قابل صدا زدن از هر کلاینت بود
  const db = getDb();
  if (!db) return 0;
  const [r] = await db.select({ n: count() }).from(accommodations).where(isNull(accommodations.deletedAt));
  return r?.n ?? 0;
}

export async function saveHotel(data: HotelInput) {
  await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  // یافتهٔ ۷: نرمال‌سازی نام (trim + یکی‌کردن فاصله‌ها) پیش از ساخت slug،
  // تا «هتل  اسپیناس» و «هتل اسپیناس» یک slug نگیرند.
  const nameFa = (data.nameFa || '').replace(/\s+/g, ' ').trim();
  if (nameFa.length < 2) throw new Error('نام هتل لازم است.');
  // گشت (ایراد ۶): ستاره اختیاری است؛ null یعنی «بدون درجه» و سایت «—» نشان می‌دهد.
  // فقط وقتی مقداری آمده، باید عدد صحیح بین ۰ تا ۷ باشد.
  const stars = data.stars == null ? null : Number(data.stars);
  if (stars !== null && (!Number.isInteger(stars) || stars < 0 || stars > 7)) {
    throw new Error('ستارهٔ هتل باید بین ۰ تا ۷ باشد.');
  }
  const placeSlug = data.placeSlug || null;
  const slug =
    (data.slug || '').trim() ||
    nameFa.replace(/\s+/g, '-').slice(0, 120) ||
    `hotel-${Date.now()}`;
  // کلید تکراری هتل: نام + شهر (هم‌نام در شهر دیگر مجاز است).
  // ردیف‌های بایگانی‌شده نام را اشغال نمی‌کنند (هم‌خوان با ایندکس جزئی مایگریشن 0010).
  const dupWhere = and(
    eq(accommodations.nameFa, nameFa),
    isNull(accommodations.deletedAt),
    placeSlug ? eq(accommodations.placeSlug, placeSlug) : isNull(accommodations.placeSlug),
  );
  const dup = await db
    .select({ id: accommodations.id })
    .from(accommodations)
    .where(data.id ? and(dupWhere, ne(accommodations.id, data.id)) : dupWhere)
    .limit(1);
  if (dup.length > 0) throw new Error('این نام قبلاً ثبت شده');
  const values = {
    slug,
    nameFa,
    stars,
    placeSlug,
  };
  if (data.id) {
    await db.update(accommodations).set(values).where(eq(accommodations.id, data.id));
  } else {
    try {
      await db.insert(accommodations).values(values);
    } catch (e) {
      // یافتهٔ ۸: مسابقهٔ هم‌زمان — خطای یکتایی هم همان پیام فارسی را می‌گیرد (مثل مقصد).
      if (e instanceof Error && 'code' in e && (e as { code?: string }).code === '23505') {
        throw new Error('این نام قبلاً ثبت شده');
      }
      throw e;
    }
  }
  revalidatePath('/admin/hotels');
  revalidatePath('/admin/tours');
  return { ok: true };
}

export async function deleteHotel(id: string) {
  const session = await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  const rows = await db
    .select({ nameFa: accommodations.nameFa })
    .from(accommodations)
    .where(eq(accommodations.id, id))
    .limit(1);
  await archiveOne(db, accommodations, id, {
    actor: session.email,
    entity: 'accommodations',
    reasonFa: `بایگانی هتل «${rows[0]?.nameFa ?? id}»`,
  });
  revalidatePath('/admin/hotels');
  revalidatePath('/admin/tours');
  return { ok: true };
}

/**
 * قرارداد میز T3 (فاز ۲، کتابچه §۳): فهرست خواندنی هتل‌ها برای انتخاب‌گر مرحلهٔ ۲ تور.
 *
 * امضا: `listHotelsForPicker(): Promise<HotelPickerItem[]>`
 * دسترسی: owner/editor (همان requireAdmin).
 * مرتب‌سازی: الفبای نام فارسی. سقف ۵۰۰ رکورد؛ بایگانی‌شده‌ها برمی‌گردند نه.
 *
 * نکتهٔ قراردادی: کاتالوگ هتل فقط «هویت» نگه می‌دارد (نام، ستاره، شهر).
 * «قیمت پیش‌فرض» در سطح کاتالوگ تعریف نشده و همیشه null است؛ قیمت هتل
 * ویژهٔ هر تور است و در ماتریس مرحلهٔ ۲ (hotelOptions / accommodationOffers)
 * با برچسب «ویژهٔ این تور» بازنویسی می‌شود. این همان تقسیم‌کاری است که
 * کتابچه §۳ می‌خواهد: فیلدهای «فقط برای فرم تور» در فرم هتل نیستند.
 */
export interface HotelPickerItem {
  id: string;
  slug: string;
  nameFa: string;
  /** نام شهر از روی placeSlug؛ خالی اگر شهری ثبت نشده باشد. */
  cityName: string;
  /** ستاره؛ null یعنی رکورد قدیمیِ بدون ستاره (نمایش: «—»). */
  stars: number | null;
  /** همیشه null — قیمت در سطح کاتالوگ تعریف نشده است. */
  defaultPrice: null;
  /**
   * اسلاگ مقصدِ هتل (شهر/کشور در site_destinations) — برای فیلتر «فقط هتل‌های
   * همین مقصد» در مرحلهٔ ۲ تورساز (موج ۱، قلم ۶). خالی یعنی شهری ثبت نشده.
   */
  placeSlug: string;
}

export async function listHotelsForPicker(): Promise<HotelPickerItem[]> {
  await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  const [hotels, dests] = await Promise.all([
    db
      .select()
      .from(accommodations)
      .where(isNull(accommodations.deletedAt))
      .orderBy(asc(accommodations.nameFa))
      .limit(500),
    db.select().from(siteDestinations).where(isNull(siteDestinations.deletedAt)).limit(1000),
  ]);
  const cityBySlug = new Map(dests.map((d) => [d.slug, d.name]));
  return hotels.map((r) => ({
    id: r.id,
    slug: r.slug,
    nameFa: r.nameFa,
    cityName: (r.placeSlug && cityBySlug.get(r.placeSlug)) || '',
    stars: r.stars,
    defaultPrice: null,
    placeSlug: r.placeSlug ?? '',
  }));
}
