'use server';

import { revalidatePath } from 'next/cache';
import { getDb, type AppDb } from '@/db/client';
import { guideLinks, guides, auditLogs } from '@/db/schema';
import { desc, eq, isNull, sql } from 'drizzle-orm';
import { requireAdmin } from '@/src/lib/admin-auth';
import { archiveOne } from '@/src/lib/archive';
import { fa } from '@/lib/utils';
import { assertRenderableImageUrl } from '@/src/lib/site-image-hosts';
import { assertLatinSlug } from '@/src/lib/slug-format';
import {
  cleanRichValue,
  normalizeRichValue,
  type JSONContent,
} from '@/lib/rich-text';
import { checkColumnsExist } from '@/lib/column-guard';

export type GuideStatus = 'draft' | 'review' | 'published' | 'paused' | 'archived';

/** قالب ذخیرهٔ ستون‌های jsonb آرایه‌ای — برای حفظ قالب رشته-کدشده‌های قدیمی. */
export type GuideJsonFormat = 'array' | 'string';

export interface GuideInput {
  slug: string;
  titleFa: string;
  category: string;
  categoryLabel: string;
  readTime: string;
  author: string;
  reviewer: string;
  /** متن غنی خلاصه (ستون summary_rich)؛ null یعنی خالی. */
  summaryRich: JSONContent | null;
  heroImage: string;
  /** متن غنی پاسخ مستقیم (ستون direct_answer_rich)؛ null یعنی خالی. */
  directAnswerRich: JSONContent | null;
  sections: unknown;
  faqs: unknown;
  /** قالب فعلی sections در دیتابیس — روی ذخیره حفظ می‌شود (تصمیم تیم داده). */
  sectionsFormat?: GuideJsonFormat;
  /** قالب فعلی faqs در دیتابیس — روی ذخیره حفظ می‌شود. */
  faqsFormat?: GuideJsonFormat;
  relatedDestinationSlug: string;
  // F8: نام ویژگی «نامک» است چون مقدار ذخیره‌شده نامک تور است، نه شناسه؛ ستون دیتابیس دست نمی‌خورد.
  relatedTourSlug: string;
  status: GuideStatus;
  /** ۴-۱۰: تاریخ بازبینی دوره‌ای؛ ISO string یا null. */
  lastReviewedAt: string | null;
}

/**
 * ستون‌های `*_rich` راهنما از مایگریشن 0030 می‌آیند که هنوز اجرا نشده است.
 * نگهبان مشترک (`lib/column-guard.ts`) با یک کوئری سبک و کش کوتاه‌مدت روی
 * `information_schema` می‌پرسد ستون‌ها واقعاً هستند یا نه؛ خواندن/نوشتن آن‌ها
 * فقط وقتی انجام می‌شود که «هر دو» ستون باشند. قبل از اجرای مایگریشن، فرم
 * کنار همان دو فیلد یک اطلاع صادقانه نشان می‌دهد تا ویرایش بی‌صدا گم نشود.
 * (بعد از اجرای مایگریشن، حداکثر یک دقیقه طول می‌کشد تا کش تازه شود.)
 */
const GUIDE_RICH_COLS = ['summary_rich', 'direct_answer_rich'] as const;
async function guideRichColsReady(db: AppDb): Promise<boolean> {
  const { ready } = await checkColumnsExist(db, 'guides', GUIDE_RICH_COLS);
  return ready;
}

/**
 * وضعیت ستون‌های `*_rich` برای فرم (سمت کلاینت): true یعنی هر دو ستون هستند
 * و اطلاع لازم نیست؛ false یعنی فرم باید اطلاع نشان بدهد.
 */
export async function checkGuideRichCols(): Promise<boolean> {
  await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) return false;
  return guideRichColsReady(db);
}

/**
 * خوانش دفاعی ستون‌های jsonb آرایه‌ای: رشته-کدشده‌ها (یافتهٔ تیم داده)
 * اول JSON.parse می‌شوند؛ قالب اصلی هم برمی‌گردد تا روی ذخیره حفظ شود.
 */
function parseJsonArray(v: unknown): { items: unknown[]; format: GuideJsonFormat } {
  if (Array.isArray(v)) return { items: v, format: 'array' };
  if (typeof v === 'string' && v.trim()) {
    try {
      const parsed: unknown = JSON.parse(v);
      if (Array.isArray(parsed)) return { items: parsed, format: 'string' };
    } catch {
      // رشتهٔ خراب → آرایهٔ خالی، ولی قالب رشته حفظ می‌شود
    }
    return { items: [], format: 'string' };
  }
  return { items: [], format: 'array' };
}

function encodeJsonArray(items: unknown[], format: GuideJsonFormat | undefined): unknown {
  return format === 'string' ? JSON.stringify(items) : items;
}

/** خوانش دفاعی یک مقدار `*_rich`: JSON تایپ‌تپ، رشتهٔ تخت، یا null. */
function asRich(v: unknown): JSONContent | null {
  return normalizeRichValue(v as JSONContent | string | null | undefined);
}

type GuideDbRow = typeof guides.$inferSelect;

function toGuideRow(
  r: GuideDbRow,
  rich: { summaryRich: JSONContent | null; directAnswerRich: JSONContent | null },
) {
  const sections = parseJsonArray(r.sections);
  const faqs = parseJsonArray(r.faqs);
  return {
    id: r.id,
    slug: r.slug,
    titleFa: r.titleFa,
    category: r.category,
    categoryLabel: r.categoryLabel ?? '',
    readTime: r.readTime ?? '',
    author: r.author ?? '',
    reviewer: r.reviewer ?? '',
    // متن‌های تخت قدیمی: فقط-خواندنی (fallback) — روی ذخیره دست نمی‌خورند.
    summary: r.summary ?? '',
    heroImage: r.heroImage ?? '',
    directAnswer: r.directAnswer ?? '',
    summaryRich: rich.summaryRich,
    directAnswerRich: rich.directAnswerRich,
    sections: sections.items,
    sectionsFormat: sections.format,
    faqs: faqs.items,
    faqsFormat: faqs.format,
    relatedDestinationSlug: r.relatedDestinationSlug ?? '',
    relatedTourSlug: r.relatedTourId ?? '',
    status: r.status as GuideStatus,
    lastReviewedAt: r.lastReviewedAt ? r.lastReviewedAt.toISOString() : null,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}

export async function listGuides() {
  await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  const rows = await db.select().from(guides).where(isNull(guides.deletedAt)).orderBy(desc(guides.updatedAt)).limit(300);
  const richColsReady = await guideRichColsReady(db);
  const richById = new Map<string, { summaryRich: JSONContent | null; directAnswerRich: JSONContent | null }>();
  if (richColsReady && rows.length > 0) {
    const ids = rows.map((r) => r.id);
    const res = await db.execute(sql`
      select id, summary_rich, direct_answer_rich from guides where id in ${ids}
    `);
    for (const row of res as unknown as Array<{ id: string; summary_rich: unknown; direct_answer_rich: unknown }>) {
      richById.set(row.id, {
        summaryRich: asRich(row.summary_rich),
        directAnswerRich: asRich(row.direct_answer_rich),
      });
    }
  }
  const empty = { summaryRich: null, directAnswerRich: null };
  return rows.map((r) => toGuideRow(r, richById.get(r.id) ?? empty));
}

export type GuideRow = Awaited<ReturnType<typeof listGuides>>[number];

export async function getGuide(id: string) {
  await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  const rows = await db.select().from(guides).where(eq(guides.id, id)).limit(1);
  const r = rows[0];
  if (!r) throw new Error('یافت نشد.');
  const richColsReady = await guideRichColsReady(db);
  let rich = { summaryRich: null as JSONContent | null, directAnswerRich: null as JSONContent | null };
  if (richColsReady) {
    const res = await db.execute(sql`
      select summary_rich, direct_answer_rich from guides where id = ${id}::uuid limit 1
    `);
    const row = (res as unknown as Array<{ summary_rich: unknown; direct_answer_rich: unknown }>)[0];
    if (row) rich = { summaryRich: asRich(row.summary_rich), directAnswerRich: asRich(row.direct_answer_rich) };
  }
  return toGuideRow(r, rich);
}

const VALID_STATUS: GuideStatus[] = ['draft', 'review', 'published', 'paused', 'archived'];

export async function saveGuide(id: string | null | undefined, data: GuideInput) {
  await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  const slug = (data.slug || '').trim();
  const titleFa = (data.titleFa || '').trim();
  if (!slug) throw new Error('نامک (slug) لازم است.');
  // میز ۳ — ایراد ۱۰: نامک فارسی روی روت‌های سایت ۴۰۴ِ زنده می‌دهد؛ این‌جا رد می‌شود.
  assertLatinSlug(slug);
  if (titleFa.length < 2) throw new Error('عنوان راهنما لازم است.');
  // تصویر اصلی راهنما آدرس دستی است؛ باید همان هاست‌هایی باشد که سایت می‌تواند رندر کند.
  assertRenderableImageUrl(data.heroImage || '');
  const status: GuideStatus = VALID_STATUS.includes(data.status) ? data.status : 'draft';
  // ۴-۱۰: تاریخ بازبینی؛ مقدار خراب نادیده گرفته می‌شود.
  const reviewedAt = data.lastReviewedAt ? new Date(data.lastReviewedAt) : null;
  // متن‌های غنی: JSON تمیز (خالی → null). ستون‌های متنی قدیمی (summary،
  // direct_answer) عمدا اینجا نوشته نمی‌شوند — فقط fallback می‌مانند.
  const summaryRich = cleanRichValue(data.summaryRich);
  const directAnswerRich = cleanRichValue(data.directAnswerRich);
  const values = {
    slug,
    titleFa,
    category: data.category || 'general',
    categoryLabel: data.categoryLabel || null,
    readTime: data.readTime || null,
    author: data.author || null,
    reviewer: data.reviewer || null,
    heroImage: data.heroImage || null,
    // قالب ذخیرهٔ sections/faqs حفظ می‌شود (رشته-کدشده‌ها رشته می‌مانند).
    sections: encodeJsonArray(parseJsonArray(data.sections).items, data.sectionsFormat),
    faqs: encodeJsonArray(parseJsonArray(data.faqs).items, data.faqsFormat),
    relatedDestinationSlug: data.relatedDestinationSlug || null,
    relatedTourId: data.relatedTourSlug || null,
    status,
    lastReviewedAt: reviewedAt && !Number.isNaN(reviewedAt.getTime()) ? reviewedAt : null,
    updatedAt: new Date(),
  };
  let rowId = id ?? null;
  if (id) {
    await db.update(guides).set(values).where(eq(guides.id, id));
  } else {
    const inserted = await db.insert(guides).values(values).returning({ id: guides.id });
    rowId = inserted[0]?.id ?? null;
  }
  // ستون‌های *_rich فقط وقتی نوشته می‌شوند که «هر دو» در دیتابیس باشند
  // (مایگریشن 0030)؛ وگرنه فرم کنار همان فیلدها اطلاع نشان می‌دهد.
  const richColsReady = await guideRichColsReady(db);
  if (rowId && richColsReady) {
    await db.execute(sql`
      update guides
      set summary_rich = ${summaryRich ? JSON.stringify(summaryRich) : null}::jsonb,
          direct_answer_rich = ${directAnswerRich ? JSON.stringify(directAnswerRich) : null}::jsonb
      where id = ${rowId}::uuid
    `);
  }
  revalidatePath('/admin/guides');
  return { ok: true };
}

export async function deleteGuide(id: string) {
  const session = await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  const rows = await db
    .select({ titleFa: guides.titleFa })
    .from(guides)
    .where(eq(guides.id, id))
    .limit(1);
  // لینک‌های مقاله بیرون از مقاله معنایی ندارند؛ با بایگانی والد برای همیشه پاک می‌شوند
  // (حتی آن‌هایی که قبلاً تکی بایگانی شده‌اند) و با «بازیابی» برنمی‌گردند.
  const links = await db.delete(guideLinks).where(eq(guideLinks.guideId, id)).returning({ id: guideLinks.id });
  const title = rows[0]?.titleFa ?? id;
  await db.insert(auditLogs).values({
    actor: session.email,
    action: 'hard_delete',
    entity: 'guides',
    entityId: id,
    reasonFa: `حذف دائمی فرزندهای راهنمای «${title}»: ${fa(links.length)} لینک.`,
  });
  await archiveOne(db, guides, id, {
    actor: session.email,
    entity: 'guides',
    reasonFa: `بایگانی راهنمای «${title}»؛ لینک‌های متصلش برای همیشه حذف شدند و با بازیابی برنمی‌گردند.`,
  });
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
