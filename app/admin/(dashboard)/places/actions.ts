'use server';

import { revalidatePath } from 'next/cache';
import { getDb } from '@/db/client';
import { siteDestinations, siteTours } from '@/db/schema';
import { and, asc, count, desc, eq, isNull, ne, sql } from 'drizzle-orm';
import { requireAdmin } from '@/src/lib/admin-auth';
import { archiveOne } from '@/src/lib/archive';
import { isValidDestinationCategory } from './categories';
import { assertRenderableImageUrl } from '@/src/lib/site-image-hosts';
import { assertLatinSlug } from '@/src/lib/slug-format';

export interface FaqItem {
  question: string;
  answer: string;
}

export interface DestinationInput {
  slug: string;
  name: string;
  nameEn: string;
  type: string;
  parentCountrySlug: string;
  category: string;
  image: string;
  heroTagline: string;
  description: string;
  bestSeason: string;
  visaRequired: boolean;
  visaType: string;
  flightDuration: string;
  currency: string;
  startingPrice: string;
  startingPriceNote: string;
  lastVerifiedAt: string;
  activeToursCount: number;
  popularDistricts: string[];
  keyHighlights: string[];
  travelTips: string[];
  faqs: FaqItem[];
  relatedGuides: string[];
}

function asStringArray(v: unknown): string[] {
  if (Array.isArray(v)) return v.map((x) => String(x)).filter((x) => x.trim() !== '');
  return [];
}

function asFaqs(v: unknown): FaqItem[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter((x) => x && typeof x === 'object')
    .map((x) => {
      const o = x as Record<string, unknown>;
      return { question: String(o.question ?? ''), answer: String(o.answer ?? '') };
    })
    .filter((f) => f.question.trim() !== '' || f.answer.trim() !== '');
}

export async function listDestinations() {
  await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  // قلم ۳ کتابچه: ترتیب و سقف یکسان با listDestinationTree (توی tours/actions.ts)
  // تا هیچ مقصدی در یکی از دو فهرست دیده شود و در دیگری نه.
  const rows = await db.select().from(siteDestinations).where(isNull(siteDestinations.deletedAt)).orderBy(asc(siteDestinations.name)).limit(1000);
  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    name: r.name,
    nameEn: r.nameEn,
    type: r.type,
    parentCountrySlug: r.parentCountrySlug ?? '',
    category: r.category,
    image: r.image,
    heroTagline: r.heroTagline,
    description: r.description,
    bestSeason: r.bestSeason,
    visaRequired: r.visaRequired,
    visaType: r.visaType ?? '',
    flightDuration: r.flightDuration ?? '',
    currency: r.currency,
    startingPrice: r.startingPrice,
    startingPriceNote: r.startingPriceNote,
    lastVerifiedAt: r.lastVerifiedAt,
    activeToursCount: r.activeToursCount,
    popularDistricts: asStringArray(r.popularDistricts),
    keyHighlights: asStringArray(r.keyHighlights),
    travelTips: asStringArray(r.travelTips),
    faqs: asFaqs(r.faqs),
    relatedGuides: asStringArray(r.relatedGuides),
  }));
}

export type DestinationRow = Awaited<ReturnType<typeof listDestinations>>[number];

export async function countDestinations(): Promise<number> {
  const db = getDb();
  if (!db) return 0;
  const [r] = await db.select({ n: count() }).from(siteDestinations).where(isNull(siteDestinations.deletedAt));
  return r?.n ?? 0;
}

export async function saveDestination(id: string | undefined | null, data: DestinationInput) {
  await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  const slug = (data.slug || '').trim().toLowerCase();
  const name = (data.name || '').trim();
  if (!slug) throw new Error('نامک (slug) لازم است.');
  // میز ۳ — ایراد ۱۰: نامک فارسی روی روت‌های سایت ۴۰۴ِ زنده می‌دهد؛ این‌جا رد می‌شود.
  assertLatinSlug(slug);
  if (name.length < 2) throw new Error('نام مقصد لازم است.');
  // ۲-۱۲: گارد سمت سرور؛ دسته‌بندیِ خالی یعنی «هنوز انتخاب نشده» (جریان افزودن
  // کشور تازه)، ولی مقدارِ پرِ خارج از شش‌تایی پذیرفته نیست.
  const category = (data.category || '').trim();
  if (category && !isValidDestinationCategory(category)) throw new Error('دسته‌بندی نامعتبر است.');

  // کلید تکراری مقصد: نامک (گارد سمت سرور؛ مسابقهٔ هم‌زمان را هم می‌گیرد).
  // ردیف‌های بایگانی‌شده نامک را اشغال نمی‌کنند (هم‌خوان با ایندکس جزئی مایگریشن 0010).
  const dup = await db
    .select({ id: siteDestinations.id })
    .from(siteDestinations)
    .where(
      id
        ? and(eq(siteDestinations.slug, slug), ne(siteDestinations.id, id), isNull(siteDestinations.deletedAt))
        : and(eq(siteDestinations.slug, slug), isNull(siteDestinations.deletedAt)),
    )
    .limit(1);
  if (dup.length > 0) throw new Error('این نامک قبلاً ثبت شده است.');
  // تصویر مقصد آدرس دستی است؛ باید همان هاست‌هایی باشد که سایت می‌تواند رندر کند.
  assertRenderableImageUrl(data.image || '');

  const values = {
    slug,
    name,
    nameEn: data.nameEn || '',
    type: data.type || 'city',
    parentCountrySlug: data.parentCountrySlug || null,
    category,
    image: data.image || '',
    heroTagline: data.heroTagline || '',
    description: data.description || '',
    bestSeason: data.bestSeason || '',
    visaRequired: Boolean(data.visaRequired),
    visaType: data.visaType || null,
    flightDuration: data.flightDuration || null,
    currency: data.currency || '',
    startingPrice: data.startingPrice || '',
    startingPriceNote: data.startingPriceNote || '',
    lastVerifiedAt: data.lastVerifiedAt || '',
    activeToursCount: Math.max(0, Number(data.activeToursCount) || 0),
    popularDistricts: data.popularDistricts ?? [],
    keyHighlights: data.keyHighlights ?? [],
    travelTips: data.travelTips ?? [],
    faqs: data.faqs ?? [],
    relatedGuides: data.relatedGuides ?? [],
    updatedAt: new Date(),
  };

  try {
    if (id) {
      await db.update(siteDestinations).set(values).where(eq(siteDestinations.id, id));
    } else {
      await db.insert(siteDestinations).values(values);
    }
  } catch (e) {
    // مسابقهٔ هم‌زمان: خطای یکتایی نامک هم همان پیام فارسی را می‌گیرد.
    if (e instanceof Error && 'code' in e && (e as { code?: string }).code === '23505') {
      throw new Error('این نامک قبلاً ثبت شده است.');
    }
    throw e;
  }
  revalidatePath('/admin/places');
  return { ok: true };
}

/** چند تورِ فعال این مقصد را در destinationSlugs دارند — برای هشدارِ پیش از بایگانی. */
export async function countDestinationTours(slug: string): Promise<number> {
  await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  const rows = await db
    .select({ n: count() })
    .from(siteTours)
    .where(and(isNull(siteTours.deletedAt), sql`${siteTours.destinationSlugs}::jsonb ? ${slug}`));
  return rows[0]?.n ?? 0;
}

export async function deleteDestination(id: string) {
  const session = await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  const rows = await db
    .select({ name: siteDestinations.name })
    .from(siteDestinations)
    .where(eq(siteDestinations.id, id))
    .limit(1);
  await archiveOne(db, siteDestinations, id, {
    actor: session.email,
    entity: 'site_destinations',
    reasonFa: `بایگانی مقصد «${rows[0]?.name ?? id}»`,
  });
  revalidatePath('/admin/places');
  return { ok: true };
}

export async function checkDestinationSlugUnique(slug: string, excludeId?: string | null) {
  await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  const s = (slug || '').trim().toLowerCase();
  if (!s) return { unique: false };
  const rows = await db.select().from(siteDestinations).where(eq(siteDestinations.slug, s)).limit(2);
  const taken = rows.some((r) => r.id !== excludeId);
  return { unique: !taken };
}
