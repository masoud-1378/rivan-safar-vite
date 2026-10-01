'use server';

import { revalidatePath } from 'next/cache';
import { getDb } from '@/db/client';
import { accommodations } from '@/db/schema';
import { and, desc, eq, isNull, ne } from 'drizzle-orm';
import { requireAdmin } from '@/src/lib/admin-auth';

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
  // یافتهٔ ۱۵: ستاره می‌تواند NULL بماند (دست‌نخورده) — سرور فقط مقدار داده‌شده را اعتبارسنجی می‌کند.
  stars: number | null;
  placeSlug: string;
}

export async function listHotels(): Promise<HotelRow[]> {
  await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  const rows = await db.select().from(accommodations).orderBy(desc(accommodations.createdAt)).limit(500);
  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    nameFa: r.nameFa,
    stars: r.stars,
    placeSlug: r.placeSlug ?? '',
  }));
}

export async function saveHotel(data: HotelInput) {
  await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  // یافتهٔ ۷: نرمال‌سازی نام (trim + یکی‌کردن فاصله‌ها) پیش از ساخت slug،
  // تا «هتل  اسپیناس» و «هتل اسپیناس» یک slug نگیرند.
  const nameFa = (data.nameFa || '').replace(/\s+/g, ' ').trim();
  if (nameFa.length < 2) throw new Error('نام هتل لازم است.');
  // یافتهٔ ۱۵: NULL یعنی «دست‌نخورده» — اعتبارسنجی فقط روی مقدار واقعی.
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
  const dupWhere = placeSlug
    ? and(eq(accommodations.nameFa, nameFa), eq(accommodations.placeSlug, placeSlug))
    : and(eq(accommodations.nameFa, nameFa), isNull(accommodations.placeSlug));
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
  await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  await db.delete(accommodations).where(eq(accommodations.id, id));
  revalidatePath('/admin/hotels');
  revalidatePath('/admin/tours');
  return { ok: true };
}
