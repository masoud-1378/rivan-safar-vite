'use server';

import { revalidatePath } from 'next/cache';
import { getDb } from '@/db/client';
import { guides } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';
import { requireAdmin } from '@/src/lib/admin-auth';

export type GuideStatus = 'draft' | 'review' | 'published' | 'paused' | 'archived';

export interface GuideInput {
  slug: string;
  titleFa: string;
  category: string;
  categoryLabel: string;
  readTime: string;
  author: string;
  reviewer: string;
  summary: string;
  heroImage: string;
  directAnswer: string;
  sections: unknown;
  faqs: unknown;
  relatedDestinationSlug: string;
  relatedTourId: string;
  status: GuideStatus;
}

function asJsonArray(v: unknown): unknown[] {
  return Array.isArray(v) ? v : [];
}

export async function listGuides() {
  await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  const rows = await db.select().from(guides).orderBy(desc(guides.updatedAt)).limit(300);
  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    titleFa: r.titleFa,
    category: r.category,
    categoryLabel: r.categoryLabel ?? '',
    readTime: r.readTime ?? '',
    author: r.author ?? '',
    reviewer: r.reviewer ?? '',
    summary: r.summary ?? '',
    heroImage: r.heroImage ?? '',
    directAnswer: r.directAnswer ?? '',
    sections: asJsonArray(r.sections),
    faqs: asJsonArray(r.faqs),
    relatedDestinationSlug: r.relatedDestinationSlug ?? '',
    relatedTourId: r.relatedTourId ?? '',
    status: r.status as GuideStatus,
    lastReviewedAt: r.lastReviewedAt ? r.lastReviewedAt.toISOString() : null,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }));
}

export type GuideRow = Awaited<ReturnType<typeof listGuides>>[number];

export async function getGuide(id: string) {
  await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  const rows = await db.select().from(guides).where(eq(guides.id, id)).limit(1);
  const r = rows[0];
  if (!r) throw new Error('یافت نشد.');
  return {
    id: r.id,
    slug: r.slug,
    titleFa: r.titleFa,
    category: r.category,
    categoryLabel: r.categoryLabel ?? '',
    readTime: r.readTime ?? '',
    author: r.author ?? '',
    reviewer: r.reviewer ?? '',
    summary: r.summary ?? '',
    heroImage: r.heroImage ?? '',
    directAnswer: r.directAnswer ?? '',
    sections: asJsonArray(r.sections),
    faqs: asJsonArray(r.faqs),
    relatedDestinationSlug: r.relatedDestinationSlug ?? '',
    relatedTourId: r.relatedTourId ?? '',
    status: r.status as GuideStatus,
    lastReviewedAt: r.lastReviewedAt ? r.lastReviewedAt.toISOString() : null,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}

const VALID_STATUS: GuideStatus[] = ['draft', 'review', 'published', 'paused', 'archived'];

export async function saveGuide(id: string | null | undefined, data: GuideInput) {
  await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  const slug = (data.slug || '').trim();
  const titleFa = (data.titleFa || '').trim();
  if (!slug) throw new Error('نامک (slug) لازم است.');
  if (titleFa.length < 2) throw new Error('عنوان مقاله لازم است.');
  const status: GuideStatus = VALID_STATUS.includes(data.status) ? data.status : 'draft';
  const values = {
    slug,
    titleFa,
    category: data.category || 'general',
    categoryLabel: data.categoryLabel || null,
    readTime: data.readTime || null,
    author: data.author || null,
    reviewer: data.reviewer || null,
    summary: data.summary || null,
    heroImage: data.heroImage || null,
    directAnswer: data.directAnswer || null,
    sections: asJsonArray(data.sections),
    faqs: asJsonArray(data.faqs),
    relatedDestinationSlug: data.relatedDestinationSlug || null,
    relatedTourId: data.relatedTourId || null,
    status,
    updatedAt: new Date(),
  };
  if (id) {
    await db.update(guides).set(values).where(eq(guides.id, id));
  } else {
    await db.insert(guides).values(values);
  }
  revalidatePath('/admin/guides');
  return { ok: true };
}

export async function deleteGuide(id: string) {
  await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  await db.delete(guides).where(eq(guides.id, id));
  revalidatePath('/admin/guides');
  return { ok: true };
}

export async function setGuideStatus(id: string, status: GuideStatus) {
  await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  if (!VALID_STATUS.includes(status)) throw new Error('وضعیت نامعتبر است.');
  await db.update(guides).set({ status, updatedAt: new Date() }).where(eq(guides.id, id));
  revalidatePath('/admin/guides');
  return { ok: true };
}
