'use server';

import { revalidatePath } from 'next/cache';
import { getDb } from '@/db/client';
import {
  places,
  originCities,
  terminals,
  carriers,
  accommodations,
  auditLogs,
} from '@/db/schema';
import { desc, eq } from 'drizzle-orm';
import { requireAdmin } from '@/src/lib/admin-auth';

export async function listCatalog() {
  await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  const [placeRows, originRows, terminalRows, carrierRows, hotelRows] = await Promise.all([
    db.select().from(places).orderBy(desc(places.createdAt)).limit(300),
    db.select().from(originCities).limit(100),
    db.select().from(terminals).limit(200),
    db.select().from(carriers).limit(200),
    db.select().from(accommodations).limit(300),
  ]);
  return { places: placeRows, origins: originRows, terminals: terminalRows, carriers: carrierRows, hotels: hotelRows };
}

async function audit(actor: string, action: string, entity: string, entityId: string, reasonFa: string) {
  const db = getDb();
  if (!db) return;
  await db.insert(auditLogs).values({ actor, action, entity, entityId, reasonFa });
}

export async function createPlace(input: { slug: string; nameFa: string; type: 'region' | 'country' | 'city' | 'island' }) {
  const session = await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  if (!input.slug.trim() || !input.nameFa.trim()) throw new Error('اسلاگ و نام فارسی لازم است.');
  const [row] = await db
    .insert(places)
    .values({ slug: input.slug.trim(), nameFa: input.nameFa.trim(), type: input.type })
    .returning({ id: places.id });
  await audit(session.email, 'catalog.place', 'places', row.id, `ثبت مکان: ${input.nameFa}`);
  revalidatePath('/admin/places');
  return { ok: true };
}

export async function createOrigin(input: { slug: string; nameFa: string }) {
  const session = await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  if (!input.slug.trim() || !input.nameFa.trim()) throw new Error('اسلاگ و نام فارسی لازم است.');
  const [row] = await db
    .insert(originCities)
    .values({ slug: input.slug.trim(), nameFa: input.nameFa.trim() })
    .returning({ id: originCities.id });
  await audit(session.email, 'catalog.origin', 'origin_cities', row.id, `ثبت مبدأ: ${input.nameFa}`);
  revalidatePath('/admin/places');
  return { ok: true };
}

export async function createCarrier(input: { slug: string; nameFa: string; kind: string }) {
  const session = await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  if (!input.slug.trim() || !input.nameFa.trim()) throw new Error('اسلاگ و نام فارسی لازم است.');
  const [row] = await db
    .insert(carriers)
    .values({ slug: input.slug.trim(), nameFa: input.nameFa.trim(), kind: input.kind || 'airline' })
    .returning({ id: carriers.id });
  await audit(session.email, 'catalog.carrier', 'carriers', row.id, `ثبت شرکت حمل‌ونقل: ${input.nameFa}`);
  revalidatePath('/admin/places');
  return { ok: true };
}

export async function createHotel(input: { slug: string; nameFa: string; stars?: number; placeSlug?: string }) {
  const session = await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  if (!input.slug.trim() || !input.nameFa.trim()) throw new Error('اسلاگ و نام فارسی لازم است.');
  const [row] = await db
    .insert(accommodations)
    .values({
      slug: input.slug.trim(),
      nameFa: input.nameFa.trim(),
      stars: input.stars || null,
      placeSlug: input.placeSlug || null,
    })
    .returning({ id: accommodations.id });
  await audit(session.email, 'catalog.hotel', 'accommodations', row.id, `ثبت هتل: ${input.nameFa}`);
  revalidatePath('/admin/places');
  return { ok: true };
}

export async function deletePlace(id: string) {
  const session = await requireAdmin(['owner']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  await db.delete(places).where(eq(places.id, id));
  await audit(session.email, 'catalog.place.delete', 'places', id, 'حذف مکان');
  revalidatePath('/admin/places');
  return { ok: true };
}
