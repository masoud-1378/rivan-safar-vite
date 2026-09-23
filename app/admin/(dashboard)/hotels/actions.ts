'use server';

import { revalidatePath } from 'next/cache';
import { getDb } from '@/db/client';
import { accommodations } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';
import { requireAdmin } from '@/src/lib/admin-auth';

export interface HotelRow extends Record<string, unknown> {
  id: string;
  slug: string;
  nameFa: string;
  stars: number;
  placeSlug: string;
}

export interface HotelInput {
  id?: string;
  slug: string;
  nameFa: string;
  stars: number;
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
    stars: r.stars ?? 0,
    placeSlug: r.placeSlug ?? '',
  }));
}

export async function saveHotel(data: HotelInput) {
  await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  const nameFa = (data.nameFa || '').trim();
  if (nameFa.length < 2) throw new Error('نام هتل لازم است.');
  const slug =
    (data.slug || '').trim() ||
    nameFa.replace(/\s+/g, '-').slice(0, 120) ||
    `hotel-${Date.now()}`;
  const values = {
    slug,
    nameFa,
    stars: Math.max(0, Math.min(7, Number(data.stars) || 0)),
    placeSlug: data.placeSlug || null,
  };
  if (data.id) {
    await db.update(accommodations).set(values).where(eq(accommodations.id, data.id));
  } else {
    const existing = await db.select().from(accommodations).where(eq(accommodations.slug, slug)).limit(1);
    if (existing.length > 0) {
      await db.update(accommodations).set(values).where(eq(accommodations.slug, slug));
    } else {
      await db.insert(accommodations).values(values);
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
