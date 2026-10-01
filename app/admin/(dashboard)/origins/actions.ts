'use server';

import { revalidatePath } from 'next/cache';
import { getDb } from '@/db/client';
import { originCities, siteTours } from '@/db/schema';
import { and, asc, count, eq, isNull, ne, or } from 'drizzle-orm';
import { requireAdmin } from '@/src/lib/admin-auth';
import { archiveOne } from '@/src/lib/archive';

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
  const rows = await db.select().from(originCities).where(isNull(originCities.deletedAt)).orderBy(asc(originCities.nameFa)).limit(500);
  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    nameFa: r.nameFa,
    type: r.type,
    parentSlug: r.parentSlug ?? '',
  }));
}

export async function countOrigins(): Promise<number> {
  await requireAdmin(['owner', 'editor']); // SEC-09: اکشن exportشده — بدون احراز هویت قابل صدا زدن از هر کلاینت بود
  const db = getDb();
  if (!db) return 0;
  const [r] = await db.select({ n: count() }).from(originCities).where(isNull(originCities.deletedAt));
  return r?.n ?? 0;
}

export async function saveOrigin(data: { id?: string; slug: string; nameFa: string; type: string; parentSlug: string }) {
  await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  const nameFa = (data.nameFa || '').trim();
  if (nameFa.length < 2) throw new Error('نام مبدأ لازم است.');
  const slug = (data.slug || '').trim() || nameFa.replace(/\s+/g, '-').slice(0, 120);
  const type = data.type || 'city';
  // کلید تکراری مبدأ: نام + نوع. ردیف‌های بایگانی‌شده نام را اشغال نمی‌کنند.
  const dupWhere = and(eq(originCities.nameFa, nameFa), eq(originCities.type, type), isNull(originCities.deletedAt));
  const dup = await db
    .select({ id: originCities.id })
    .from(originCities)
    .where(data.id ? and(dupWhere, ne(originCities.id, data.id)) : dupWhere)
    .limit(1);
  if (dup.length > 0) throw new Error('این نام قبلاً ثبت شده');
  const values = {
    slug,
    nameFa,
    type,
    parentSlug: data.parentSlug || null,
  };
  if (data.id) {
    await db.update(originCities).set(values).where(eq(originCities.id, data.id));
  } else {
    try {
      await db.insert(originCities).values(values);
    } catch (e) {
      // یافتهٔ ۸: مسابقهٔ هم‌زمان — خطای یکتایی هم همان پیام فارسی را می‌گیرد (مثل مقصد).
      if (e instanceof Error && 'code' in e && (e as { code?: string }).code === '23505') {
        throw new Error('این نام قبلاً ثبت شده');
      }
      throw e;
    }
  }
  revalidatePath('/admin/origins');
  revalidatePath('/admin/tours');
  return { ok: true };
}

/** چند تورِ فعال این مبدأ را دارند (origin در تور، نام فارسی ذخیره می‌شود؛ اسلاگ هم برای رکوردهای قدیمی چک می‌شود). */
export async function countOriginTours(slug: string, nameFa: string): Promise<number> {
  await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  const rows = await db
    .select({ n: count() })
    .from(siteTours)
    .where(and(isNull(siteTours.deletedAt), or(eq(siteTours.origin, nameFa), eq(siteTours.origin, slug))));
  return rows[0]?.n ?? 0;
}

export async function deleteOrigin(id: string) {
  const session = await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  const rows = await db
    .select({ nameFa: originCities.nameFa })
    .from(originCities)
    .where(eq(originCities.id, id))
    .limit(1);
  await archiveOne(db, originCities, id, {
    actor: session.email,
    entity: 'origin_cities',
    reasonFa: `بایگانی مبدأ «${rows[0]?.nameFa ?? id}»`,
  });
  revalidatePath('/admin/origins');
  revalidatePath('/admin/tours');
  return { ok: true };
}

/** قلم ۶ کتابچه: کپی یک مبدأ — نام + « (کپی)» و نامک یکتای تازه. */
export async function copyOrigin(id: string) {
  const session = await requireAdmin(['owner', 'editor']);
  void session;
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  const src = await db
    .select()
    .from(originCities)
    .where(and(eq(originCities.id, id), isNull(originCities.deletedAt)))
    .limit(1);
  const row = src[0];
  if (!row) throw new Error('ORIGIN_NOT_FOUND');
  const alive = and(isNull(originCities.deletedAt));
  // نام یکتا: «نام (کپی)»، بعد «نام (کپی ۲)»…
  let nameFa = `${row.nameFa} (کپی)`;
  for (let n = 2; ; n += 1) {
    const dup = await db
      .select({ id: originCities.id })
      .from(originCities)
      .where(and(alive, eq(originCities.nameFa, nameFa), eq(originCities.type, row.type)))
      .limit(1);
    if (dup.length === 0) break;
    nameFa = `${row.nameFa} (کپی ${n})`;
  }
  // نامک یکتا: «slug-copy»، بعد «slug-copy-2»…
  let slug = `${row.slug}-copy`;
  for (let n = 2; ; n += 1) {
    const dup = await db
      .select({ id: originCities.id })
      .from(originCities)
      .where(and(alive, eq(originCities.slug, slug)))
      .limit(1);
    if (dup.length === 0) break;
    slug = `${row.slug}-copy-${n}`;
  }
  await db.insert(originCities).values({
    slug,
    nameFa,
    type: row.type,
    parentSlug: row.parentSlug,
  });
  revalidatePath('/admin/catalog');
  revalidatePath('/admin/origins');
  return { ok: true, nameFa };
}
