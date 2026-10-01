'use server';

import { revalidatePath } from 'next/cache';
import { getDb } from '@/db/client';
import {
  seoLandings,
  contentBlocks,
  seoInternalLinks,
  seoLandingProducts,
  siteSettings,
  auditLogs,
} from '@/db/schema';
import { desc, eq, and, isNull } from 'drizzle-orm';
import { requireAdmin } from '@/src/lib/admin-auth';
import { archiveOne } from '@/src/lib/archive';
import { fa } from '@/lib/utils';

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
  return db.select().from(seoLandings).where(isNull(seoLandings.deletedAt)).orderBy(desc(seoLandings.updatedAt)).limit(200);
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
  // لینک‌های ورودی به این صفحه (فقط‌خواندنی برای دیالوگ «محتوا») — همان‌هایی
  // که چک «لینک ورودی» گیت را سبز می‌کنند.
  const inLinks = await db
    .select()
    .from(seoInternalLinks)
    .where(eq(seoInternalLinks.toPath, rows[0].urlPath));
  return { ...rows[0], blocks, links, inLinks };
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
    throw new Error('فیلدهای ضروری: کد یکتای صفحه، مسیر URL، عنوان سئو، تیتر صفحه');
  }
  // ساخت همیشه پیش‌نویس است؛ انتشار فقط از مسیر بازبینی با گیت کامل انجام می‌شود.
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
      workflow: 'draft',
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
  // یافتهٔ ۱۲: شناسهٔ ناموجود دیگر بی‌صدا ok نمی‌گیرد.
  const current = await db.select().from(seoLandings).where(eq(seoLandings.id, id)).limit(1);
  if (!current[0]) throw new Error('لندینگ یافت نشد.');
  const wasPublished = current[0].workflow === 'published';
  const urlPathChanged = input.urlPath != null && input.urlPath.trim() !== current[0].urlPath;
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
  if (input.workflow) {
    // یافتهٔ ۳: گیت کامل فقط برای «گذار» به published لازم است، نه وقتی
    // لندینگ از قبل published است (حذف گیت‌شکنِ بلوک/لینک خودش به draft برمی‌گرداند).
    if (input.workflow === 'published' && !wasPublished) {
      const gate = await checkQualityGate(id);
      if (!gate.canPublish) throw new Error('شرایط انتشار کامل نیست: ' + gate.reasons.join(' '));
    }
    data.workflow = input.workflow;
  }
  if (input.indexStatus) data.indexStatus = input.indexStatus;
  if (input.nextReviewAt !== undefined) data.nextReviewAt = input.nextReviewAt ? new Date(input.nextReviewAt) : null;
  // یافتهٔ ۴: تغییر مسیر لندینگ منتشرشده، لینک‌های ورودی‌اش را یتیم می‌کند —
  // سرور آن را به پیش‌نویس برمی‌گرداند (فرم هم پیشاپیش هشدار می‌دهد).
  const demotedToDraft = urlPathChanged && wasPublished;
  if (demotedToDraft) data.workflow = 'draft';
  if (Object.keys(data).length <= 1) return { ok: true, demotedToDraft: false };
  try {
    await db.update(seoLandings).set(data).where(eq(seoLandings.id, id));
  } catch (e) {
    // یافتهٔ ۵: خطای یکتایی مسیر/کد یکتا به پیام فارسی.
    if (e instanceof Error && 'code' in e && (e as { code?: string }).code === '23505') {
      const constraint = (e as { constraint_name?: string }).constraint_name ?? '';
      if (constraint.includes('url')) throw new Error('این مسیر URL قبلاً برای لندینگ دیگری ثبت شده است.');
      if (constraint.includes('query')) throw new Error('این کد یکتای صفحه قبلاً ثبت شده است.');
      throw new Error('این نام قبلاً ثبت شده');
    }
    throw e;
  }
  // بازبینی مجدد: ویرایش فیلدهای گیت‌حساس (مثلاً پاک‌شدن متا) روی لندینگ
  // منتشرشده نباید آن را گیت‌شکسته و منتشر رها کند.
  let demoted = demotedToDraft;
  if (!demoted && wasPublished && (input.workflow ?? current[0].workflow) === 'published') {
    if (await demoteIfGateBroken(id)) demoted = true;
  }
  revalidatePath('/admin/seo');
  return { ok: true, demotedToDraft: demoted };
}

export async function deleteLanding(id: string) {
  const session = await requireAdmin(['owner']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  const rows = await db
    .select({ titleFa: seoLandings.titleFa })
    .from(seoLandings)
    .where(eq(seoLandings.id, id))
    .limit(1);
  const title = rows[0]?.titleFa ?? id;
  // بلوک‌ها، لینک‌ها و محصولاتِ لندینگ بیرون از آن معنایی ندارند؛
  // با بایگانی والد برای همیشه پاک می‌شوند (حتی آن‌هایی که قبلاً تکی بایگانی شده‌اند)
  // و با «بازیابی» برنمی‌گردند. همه‌چیز در یک تراکنش تا حذف نصفه نماند.
  await db.transaction(async (tx) => {
    const [blocks, links, products] = await Promise.all([
      tx.delete(contentBlocks).where(eq(contentBlocks.landingId, id)).returning({ id: contentBlocks.id }),
      tx.delete(seoInternalLinks).where(eq(seoInternalLinks.fromLandingId, id)).returning({ id: seoInternalLinks.id }),
      tx.delete(seoLandingProducts).where(eq(seoLandingProducts.landingId, id)).returning({ id: seoLandingProducts.id }),
    ]);
    await tx.update(seoLandings).set({ deletedAt: new Date() }).where(eq(seoLandings.id, id));
    await tx.insert(auditLogs).values({
      actor: session.email,
      action: 'hard_delete',
      entity: 'seo_landings',
      entityId: id,
      reasonFa: `حذف دائمی فرزندهای لندینگ «${title}»: ${fa(blocks.length)} بلوک، ${fa(links.length)} لینک داخلی و ${fa(products.length)} محصول.`,
    });
    await tx.insert(auditLogs).values({
      actor: session.email,
      action: 'archive',
      entity: 'seo_landings',
      entityId: id,
      reasonFa: `بایگانی لندینگ «${title}»؛ بخش‌ها و محصولاتش برای همیشه حذف شدند و با بازیابی برنمی‌گردند.`,
    });
  });
  revalidatePath('/admin/seo');
  return { ok: true };
}

export async function listBlocks(landingId: string) {
  await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  return db.select().from(contentBlocks).where(and(eq(contentBlocks.landingId, landingId), isNull(contentBlocks.deletedAt))).orderBy(contentBlocks.blockOrder);
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

/**
 * یافتهٔ ۱: اگر لندینگ published بود و بعد از یک تغییر، شرایط انتشار دیگر
 * رد نشد، workflow به draft برمی‌گردد. خروجی: آیا تنزل رخ داد؟
 */
async function demoteIfGateBroken(landingId: string): Promise<boolean> {
  const db = getDb();
  if (!db) return false;
  const rows = await db
    .select({ workflow: seoLandings.workflow })
    .from(seoLandings)
    .where(eq(seoLandings.id, landingId))
    .limit(1);
  if (!rows[0] || rows[0].workflow !== 'published') return false;
  const gate = await checkQualityGate(landingId);
  if (gate.canPublish) return false;
  await db
    .update(seoLandings)
    .set({ workflow: 'draft', updatedAt: new Date() })
    .where(eq(seoLandings.id, landingId));
  return true;
}

export async function deleteBlock(id: string) {
  const session = await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  const rows = await db
    .select({ landingId: contentBlocks.landingId })
    .from(contentBlocks)
    .where(eq(contentBlocks.id, id))
    .limit(1);
  if (!rows[0]) throw new Error('بلوک یافت نشد.');
  const landingId = rows[0].landingId;
  // بایگانی (نرم) — مثل همهٔ حذف‌های پنل؛ ولی چون بلوکِ لندینگ منتشرشده
  // می‌تواند گیت را بشکند، بعدش تنزل خودکار هم چک می‌شود.
  await archiveOne(db, contentBlocks, id, {
    actor: session.email,
    entity: 'content_blocks',
    reasonFa: 'بایگانی بلوک محتوایی',
  });
  const demoted = await demoteIfGateBroken(landingId);
  revalidatePath('/admin/seo');
  return { ok: true, demoted };
}

/**
 * یافتهٔ ۱: ذخیرهٔ بلوک‌ها اتمیک است — حذف همه + درج دوباره در یک تراکنش،
 * تا خطای وسط راه لندینگ منتشرشده را با صفر بلوک رها نکند.
 */
export async function replaceBlocks(
  landingId: string,
  blocks: Array<{ blockKind: string; bodyFa: string; blockOrder: number }>,
) {
  const session = await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  const exists = await db
    .select({ id: seoLandings.id })
    .from(seoLandings)
    .where(eq(seoLandings.id, landingId))
    .limit(1);
  if (!exists[0]) throw new Error('لندینگ یافت نشد.');
  await db.transaction(async (tx) => {
    await tx.delete(contentBlocks).where(eq(contentBlocks.landingId, landingId));
    let order = 1;
    for (const b of blocks) {
      await tx.insert(contentBlocks).values({
        landingId,
        blockKind: b.blockKind,
        bodyFa: b.bodyFa,
        blockOrder: b.blockOrder || order,
      });
      order += 1;
    }
  });
  const demoted = await demoteIfGateBroken(landingId);
  revalidatePath('/admin/seo');
  return { ok: true, demoted };
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
  return db.select().from(seoInternalLinks).where(and(eq(seoInternalLinks.fromLandingId, landingId), isNull(seoInternalLinks.deletedAt)));
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
  const rows = await db.select().from(seoInternalLinks).where(eq(seoInternalLinks.id, id)).limit(1);
  if (!rows[0]) throw new Error('لینک یافت نشد.');
  const { fromLandingId, toPath } = rows[0];
  // بایگانی (نرم) — مثل همهٔ حذف‌های پنل؛ بعدش گیت هر دو سمت چک می‌شود.
  await archiveOne(db, seoInternalLinks, id, {
    actor: session.email,
    entity: 'seo_internal_links',
    reasonFa: 'بایگانی لینک داخلی',
  });
  // یافتهٔ ۱: حذف لینک هم گیت را بازبینی می‌کند — هم برای لندینگ مبدأ
  // (لینک خروجی) و هم برای لندینگ مقصد (لینک ورودی، اگر مسیرش لندینگ باشد).
  const affected = new Set<string>();
  if (fromLandingId) affected.add(fromLandingId);
  if (toPath) {
    const dest = await db
      .select({ id: seoLandings.id })
      .from(seoLandings)
      .where(eq(seoLandings.urlPath, toPath))
      .limit(1);
    if (dest[0]) affected.add(dest[0].id);
  }
  let demoted = false;
  for (const landingId of affected) {
    if (await demoteIfGateBroken(landingId)) demoted = true;
  }
  revalidatePath('/admin/seo');
  return { ok: true, demoted };
}

/** چک‌لیست انتشار (سند ۰۱) — تعریف نهایی: همین ۶ چک. */
export interface QualityCheck {
  hasQueryOwner: boolean;
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
  const blocks = await db.select().from(contentBlocks).where(and(eq(contentBlocks.landingId, landingId), isNull(contentBlocks.deletedAt)));
  if (blocks.length === 0) reasons.push('هیچ بلوک محتوایی ندارد.');
  const links = await db.select().from(seoInternalLinks).where(and(eq(seoInternalLinks.fromLandingId, landingId), isNull(seoInternalLinks.deletedAt)));
  if (links.length === 0) reasons.push('هیچ لینک داخلی خروجی ندارد.');
  const inLinks = await db.select().from(seoInternalLinks).where(and(eq(seoInternalLinks.toPath, landing[0].urlPath), isNull(seoInternalLinks.deletedAt)));
  if (inLinks.length === 0) reasons.push('هیچ لینک ورودی داخلی ندارد (صفحه یتیم).');
  return {
    hasQueryOwner: !!landing[0].queryOwner,
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