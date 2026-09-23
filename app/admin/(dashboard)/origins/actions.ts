'use server';

import { revalidatePath } from 'next/cache';
import { getDb } from '@/db/client';
import { originCities } from '@/db/schema';
import { asc, eq } from 'drizzle-orm';
import { requireAdmin } from '@/src/lib/admin-auth';

export interface OriginRow extends Record<string, unknown> {
  id: string;
  slug: string;
  nameFa: string;
  type: string;
  parentSlug: string;
}

export async function listOriginsAdmin(): Promise<OriginRow[]> {
  await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  const rows = await db.select().from(originCities).orderBy(asc(originCities.nameFa)).limit(500);
  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    nameFa: r.nameFa,
    type: r.type,
    parentSlug: r.parentSlug ?? '',
  }));
}

export async function saveOrigin(data: { id?: string; slug: string; nameFa: string; type: string; parentSlug: string }) {
  await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  const nameFa = (data.nameFa || '').trim();
  if (nameFa.length < 2) throw new Error('نام مبدأ لازم است.');
  const slug = (data.slug || '').trim() || nameFa.replace(/\s+/g, '-').slice(0, 120);
  const values = {
    slug,
    nameFa,
    type: data.type || 'city',
    parentSlug: data.parentSlug || null,
  };
  if (data.id) {
    await db.update(originCities).set(values).where(eq(originCities.id, data.id));
  } else {
    const existing = await db.select().from(originCities).where(eq(originCities.slug, slug)).limit(1);
    if (existing.length > 0) {
      await db.update(originCities).set(values).where(eq(originCities.slug, slug));
    } else {
      await db.insert(originCities).values(values);
    }
  }
  revalidatePath('/admin/origins');
  revalidatePath('/admin/tours');
  return { ok: true };
}

export async function deleteOrigin(id: string) {
  await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  await db.delete(originCities).where(eq(originCities.id, id));
  revalidatePath('/admin/origins');
  revalidatePath('/admin/tours');
  return { ok: true };
}
