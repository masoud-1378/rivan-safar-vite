'use server';

import { revalidatePath } from 'next/cache';
import { getDb } from '@/db/client';
import { exhibitions } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';
import { requireAdmin } from '@/src/lib/admin-auth';

export type ExhibitionStatus = 'draft' | 'review' | 'published' | 'paused' | 'archived';

export interface ExhibitionInput {
  slug: string;
  titleFa: string;
  titleEn: string;
  country: string;
  countrySlug: string;
  city: string;
  citySlug: string;
  venue: string;
  officialWebsite: string;
  industry: string;
  industrySlug: string;
  heroTagline: string;
  description: string;
  image: string;
  editionSlug: string;
  solarDate: string;
  gregorianDate: string;
  phases: unknown;
  visaDeadline: string;
  hotelArea: string;
  startingPrice: string;
  startingPriceNote: string;
  servicesIncluded: unknown;
  businessTips: unknown;
  faqs: unknown;
  status: ExhibitionStatus;
}

function asJsonArray(v: unknown): unknown[] {
  return Array.isArray(v) ? v : [];
}

function optional(v: string): string | null {
  const t = (v || '').trim();
  return t === '' ? null : t;
}

export async function listExhibitions() {
  await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  const rows = await db.select().from(exhibitions).orderBy(desc(exhibitions.updatedAt)).limit(300);
  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    titleFa: r.titleFa,
    titleEn: r.titleEn ?? '',
    country: r.country ?? '',
    countrySlug: r.countrySlug ?? '',
    city: r.city ?? '',
    citySlug: r.citySlug ?? '',
    venue: r.venue ?? '',
    officialWebsite: r.officialWebsite ?? '',
    industry: r.industry ?? '',
    industrySlug: r.industrySlug ?? '',
    heroTagline: r.heroTagline ?? '',
    description: r.description ?? '',
    image: r.image ?? '',
    editionSlug: r.editionSlug ?? '',
    solarDate: r.solarDate ?? '',
    gregorianDate: r.gregorianDate ?? '',
    phases: asJsonArray(r.phases),
    visaDeadline: r.visaDeadline ?? '',
    hotelArea: r.hotelArea ?? '',
    startingPrice: r.startingPrice ?? '',
    startingPriceNote: r.startingPriceNote ?? '',
    servicesIncluded: asJsonArray(r.servicesIncluded),
    businessTips: asJsonArray(r.businessTips),
    faqs: asJsonArray(r.faqs),
    status: r.status as ExhibitionStatus,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }));
}

export type ExhibitionRow = Awaited<ReturnType<typeof listExhibitions>>[number];

const VALID_STATUS: ExhibitionStatus[] = ['draft', 'review', 'published', 'paused', 'archived'];

export async function saveExhibition(id: string | null | undefined, data: ExhibitionInput) {
  await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  const slug = (data.slug || '').trim();
  const titleFa = (data.titleFa || '').trim();
  if (!slug) throw new Error('نامک (slug) لازم است.');
  if (titleFa.length < 2) throw new Error('عنوان نمایشگاه لازم است.');
  const status: ExhibitionStatus = VALID_STATUS.includes(data.status) ? data.status : 'draft';
  const values = {
    slug,
    titleFa,
    titleEn: optional(data.titleEn),
    country: optional(data.country),
    countrySlug: optional(data.countrySlug),
    city: optional(data.city),
    citySlug: optional(data.citySlug),
    venue: optional(data.venue),
    officialWebsite: optional(data.officialWebsite),
    industry: optional(data.industry),
    industrySlug: optional(data.industrySlug),
    heroTagline: optional(data.heroTagline),
    description: optional(data.description),
    image: optional(data.image),
    editionSlug: optional(data.editionSlug),
    solarDate: optional(data.solarDate),
    gregorianDate: optional(data.gregorianDate),
    phases: asJsonArray(data.phases),
    visaDeadline: optional(data.visaDeadline),
    hotelArea: optional(data.hotelArea),
    startingPrice: optional(data.startingPrice),
    startingPriceNote: optional(data.startingPriceNote),
    servicesIncluded: asJsonArray(data.servicesIncluded),
    businessTips: asJsonArray(data.businessTips),
    faqs: asJsonArray(data.faqs),
    status,
    updatedAt: new Date(),
  };
  if (id) {
    await db.update(exhibitions).set(values).where(eq(exhibitions.id, id));
  } else {
    await db.insert(exhibitions).values(values);
  }
  revalidatePath('/admin/exhibitions');
  return { ok: true };
}

export async function deleteExhibition(id: string) {
  await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  await db.delete(exhibitions).where(eq(exhibitions.id, id));
  revalidatePath('/admin/exhibitions');
  return { ok: true };
}

export async function setExhibitionStatus(id: string, status: ExhibitionStatus) {
  await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  if (!VALID_STATUS.includes(status)) throw new Error('وضعیت نامعتبر است.');
  await db.update(exhibitions).set({ status, updatedAt: new Date() }).where(eq(exhibitions.id, id));
  revalidatePath('/admin/exhibitions');
  return { ok: true };
}
