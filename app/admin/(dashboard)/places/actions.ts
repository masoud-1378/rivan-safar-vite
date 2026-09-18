'use server';

import { revalidatePath } from 'next/cache';
import { getDb } from '@/db/client';
import { siteDestinations } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';
import { requireAdmin } from '@/src/lib/admin-auth';

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
  parentCountryName: string;
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
  const rows = await db.select().from(siteDestinations).orderBy(desc(siteDestinations.updatedAt)).limit(300);
  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    name: r.name,
    nameEn: r.nameEn,
    type: r.type,
    parentCountrySlug: r.parentCountrySlug ?? '',
    parentCountryName: r.parentCountryName ?? '',
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

export async function saveDestination(id: string | undefined | null, data: DestinationInput) {
  await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  const slug = (data.slug || '').trim();
  const name = (data.name || '').trim();
  if (!slug) throw new Error('نامک (slug) لازم است.');
  if (name.length < 2) throw new Error('نام مقصد لازم است.');

  const values = {
    slug,
    name,
    nameEn: data.nameEn || '',
    type: data.type || 'city',
    parentCountrySlug: data.parentCountrySlug || null,
    parentCountryName: data.parentCountryName || null,
    category: data.category || '',
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

  if (id) {
    await db.update(siteDestinations).set(values).where(eq(siteDestinations.id, id));
  } else {
    await db.insert(siteDestinations).values(values);
  }
  revalidatePath('/admin/places');
  return { ok: true };
}

export async function deleteDestination(id: string) {
  await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  await db.delete(siteDestinations).where(eq(siteDestinations.id, id));
  revalidatePath('/admin/places');
  return { ok: true };
}
