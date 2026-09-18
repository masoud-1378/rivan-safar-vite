'use server';

import { revalidatePath } from 'next/cache';
import { getDb } from '@/db/client';
import {
  seoLandings,
  contentBlocks,
  seoInternalLinks,
  siteSettings,
  auditLogs,
} from '@/db/schema';
import { desc, eq, and } from 'drizzle-orm';
import { requireAdmin } from '@/src/lib/admin-auth';

export interface LandingInput {
  queryOwner: string;
  urlPath: string;
  pageType: string;
  titleFa: string;
  metaDescriptionFa?: string;
  h1Fa: string;
  workflow?: 'draft' | 'review' | 'published' | 'paused' | 'archived';
  indexStatus?: 'index' | 'noindex';
  nextReviewAt?: string;
}

export async function listLandings() {
  await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  return db.select().from(seoLandings).orderBy(desc(seoLandings.updatedAt)).limit(200);
}

export async function getLanding(id: string) {
  await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  const rows = await db.select().from(seoLandings).where(eq(seoLandings.id, id)).limit(1);
  if (!rows[0]) return null;
  const blocks = await db
    .select()
    .from(contentBlocks)
    .where(eq(contentBlocks.landingId, id))
    .orderBy(contentBlocks.blockOrder);
  const links = await db
    .select()
    .from(seoInternalLinks)
    .where(eq(seoInternalLinks.fromLandingId, id));
  return { ...rows[0], blocks, links };
}

async function audit(actor: string, action: string, entity: string, entityId: string, reasonFa: string) {
  const db = getDb();
  if (!db) return;
  await db.insert(auditLogs).values({ actor, action, entity, entityId, reasonFa });
}

export async function createLanding(input: LandingInput) {
  const session = await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  if (!input.queryOwner.trim() || !input.urlPath.trim() || !input.titleFa.trim() || !input.h1Fa.trim()) {
    throw new Error('فیلدهای ضروری: queryOwner, urlPath, titleFa, h1Fa');
  }
  const [row] = await db
    .insert(seoLandings)
    .values({
      queryOwner: input.queryOwner.trim(),
      urlPath: input.urlPath.trim(),
      canonicalPath: input.urlPath.trim(),
      pageType: input.pageType || 'landing',
      titleFa: input.titleFa.trim(),
      metaDescriptionFa: input.metaDescriptionFa?.trim() || null,
      h1Fa: input.h1Fa.trim(),
      workflow: input.workflow || 'draft',
      indexStatus: input.indexStatus || 'noindex',
      nextReviewAt: input.nextReviewAt ? new Date(input.nextReviewAt) : null,
    })
    .returning({ id: seoLandings.id });
  revalidatePath('/admin/seo');
  return { id: row.id };
}

export async function updateLanding(id: string, input: Partial<LandingInput>) {
  const session = await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  const data: Record<string, unknown> = { updatedAt: new Date() };
  if (input.queryOwner) data.queryOwner = input.queryOwner.trim();
  if (input.urlPath) {
    data.urlPath = input.urlPath.trim();
    data.canonicalPath = input.urlPath.trim();
  }
  if (input.pageType) data.pageType = input.pageType;
  if (input.titleFa) data.titleFa = input.titleFa.trim();
  if (input.metaDescriptionFa !== undefined) data.metaDescriptionFa = input.metaDescriptionFa?.trim() || null;
  if (input.h1Fa) data.h1Fa = input.h1Fa.trim();
  if (input.workflow) data.workflow = input.workflow;
  if (input.indexStatus) data.indexStatus = input.indexStatus;
  if (input.nextReviewAt !== undefined) data.nextReviewAt = input.nextReviewAt ? new Date(input.nextReviewAt) : null;
  if (Object.keys(data).length <= 1) return { ok: true };
  await db.update(seoLandings).set(data).where(eq(seoLandings.id, id));
  revalidatePath('/admin/seo');
  return { ok: true };
}

export async function deleteLanding(id: string) {
  const session = await requireAdmin(['owner']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  await db.delete(seoLandings).where(eq(seoLandings.id, id));
  revalidatePath('/admin/seo');
  return { ok: true };
}

export async function listBlocks(landingId: string) {
  await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  return db.select().from(contentBlocks).where(eq(contentBlocks.landingId, landingId)).orderBy(contentBlocks.blockOrder);
}

export interface BlockInput {
  landingId: string;
  blockKind: string;
  bodyFa: string;
  blockOrder: number;
}

export async function createBlock(input: BlockInput) {
  const session = await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  const [row] = await db
    .insert(contentBlocks)
    .values({ landingId: input.landingId, blockKind: input.blockKind, bodyFa: input.bodyFa, blockOrder: input.blockOrder })
    .returning({ id: contentBlocks.id });
  revalidatePath('/admin/seo');
  return { id: row.id };
}

export async function updateBlock(id: string, bodyFa: string) {
  const session = await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  await db.update(contentBlocks).set({ bodyFa }).where(eq(contentBlocks.id, id));
  revalidatePath('/admin/seo');
  return { ok: true };
}

export async function deleteBlock(id: string) {
  const session = await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  await db.delete(contentBlocks).where(eq(contentBlocks.id, id));
  revalidatePath('/admin/seo');
  return { ok: true };
}

export async function reorderBlocks(blocks: Array<{ id: string; blockOrder: number }>) {
  const session = await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  for (const b of blocks) {
    await db.update(contentBlocks).set({ blockOrder: b.blockOrder }).where(eq(contentBlocks.id, b.id));
  }
  revalidatePath('/admin/seo');
  return { ok: true };
}

export async function listLinks(landingId: string) {
  await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  return db.select().from(seoInternalLinks).where(eq(seoInternalLinks.fromLandingId, landingId));
}

export interface LinkInput {
  fromLandingId?: string;
  fromPath?: string;
  toPath: string;
  anchorFa: string;
}

export async function createLink(input: LinkInput) {
  const session = await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  if (!input.toPath.trim() || !input.anchorFa.trim()) throw new Error('toPath و anchorFa ضروری است.');
  const [row] = await db
    .insert(seoInternalLinks)
    .values({
      fromLandingId: input.fromLandingId || null,
      fromPath: input.fromPath?.trim() || null,
      toPath: input.toPath.trim(),
      anchorFa: input.anchorFa.trim(),
    })
    .returning({ id: seoInternalLinks.id });
  revalidatePath('/admin/seo');
  return { id: row.id };
}

export async function deleteLink(id: string) {
  const session = await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  await db.delete(seoInternalLinks).where(eq(seoInternalLinks.id, id));
  revalidatePath('/admin/seo');
  return { ok: true };
}

/** چک‌لیست انتشار (سند ۰۱) */
export interface QualityCheck {
  hasQueryOwner: boolean;
  hasDemand: boolean;
  hasInventory: boolean;
  contentReady: boolean;
  canPublish: boolean;
  reasons: string[];
}

export async function checkQualityGate(landingId: string): Promise<QualityCheck> {
  await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  const landing = await db.select().from(seoLandings).where(eq(seoLandings.id, landingId)).limit(1);
  if (!landing[0]) throw new Error('لندینگ یافت نشد.');
  const reasons: string[] = [];
  if (!landing[0].queryOwner) reasons.push('queryOwner خالی است.');
  if (!landing[0].metaDescriptionFa) reasons.push('metaDescriptionFa خالی است.');
  if (!landing[0].h1Fa) reasons.push('h1Fa خالی است.');
  const blocks = await db.select().from(contentBlocks).where(eq(contentBlocks.landingId, landingId));
  if (blocks.length === 0) reasons.push('هیچ بلوک محتوایی ندارد.');
  const links = await db.select().from(seoInternalLinks).where(eq(seoInternalLinks.fromLandingId, landingId));
  if (links.length === 0) reasons.push('هیچ لینک داخلی خروجی ندارد.');
  const inLinks = await db.select().from(seoInternalLinks).where(eq(seoInternalLinks.toPath, landing[0].urlPath));
  if (inLinks.length === 0) reasons.push('هیچ لینک ورودی داخلی ندارد (صفحه یتیم).');
  return {
    hasQueryOwner: !!landing[0].queryOwner,
    hasDemand: true, // در آینده از seoLandings.demand بررسی می‌شود
    hasInventory: true, // در آینده از محصولات متصل بررسی می‌شود
    contentReady: blocks.length > 0 && !!landing[0].metaDescriptionFa && !!landing[0].h1Fa,
    canPublish: reasons.length === 0,
    reasons,
  };
}

export async function setLandingWorkflow(id: string, workflow: 'draft' | 'review' | 'published' | 'paused' | 'archived') {
  await requireAdmin(['owner', 'editor']);
  if (workflow === 'published') {
    const gate = await checkQualityGate(id);
    if (!gate.canPublish) throw new Error('Gate انتشار پاس نشد: ' + gate.reasons.join(' '));
  }
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  await db.update(seoLandings).set({ workflow, updatedAt: new Date() }).where(eq(seoLandings.id, id));
  revalidatePath('/admin/seo');
  return { ok: true };
}