'use server';

import { revalidatePath } from 'next/cache';
import { getDb, type AppDb } from '@/db/client';
import { exhibitions } from '@/db/schema';
import { desc, eq, isNull, sql } from 'drizzle-orm';
import { requireAdmin } from '@/src/lib/admin-auth';
import { archiveOne } from '@/src/lib/archive';
import { assertRenderableImageUrl } from '@/src/lib/site-image-hosts';
import { assertLatinSlug } from '@/src/lib/slug-format';
import {
  cleanRichValue,
  isRichEmpty,
  normalizeRichValue,
  richToPlainText,
  type JSONContent,
} from '@/lib/rich-text';
import { checkColumnsExist } from '@/lib/column-guard';

export type ExhibitionStatus = 'draft' | 'review' | 'published' | 'paused' | 'archived';

/** قالب ذخیرهٔ ستون faqs (یافتهٔ تیم داده: هر ۳ ردیف رشته-کدشده‌اند). */
export type ExhibitionFaqsFormat = 'array' | 'string';

export interface ExhibitionFaqItem {
  question: string;
  answer: string;
  /** پاسخ غنی (کلید answer_rich داخل آبجکت؛ قرارداد تیم داده) */
  answerRich?: JSONContent | string | null;
}

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
  /** توضیحات کامل غنی (ستون description_rich؛ مایگریشن 0030) */
  descriptionRich: JSONContent | null;
  /** سئو (ستون‌های meta_title/meta_description؛ مایگریشن 0032) */
  metaTitle: string;
  metaDescription: string;
  /** قالب ذخیرهٔ faqs تا رشته-کدشده‌ها رشته بمانند (یادداشت تیم داده، بخش ۶) */
  faqsFormat: ExhibitionFaqsFormat;
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

/**
 * خوانش دفاعی faqs با حفظ قالب ذخیره (آرایه یا رشته-کدشده) — همان تصمیم
 * آگاهانهٔ تیم داده: قالب عوض نمی‌شود، فقط خوانده می‌شود.
 */
function parseFaqs(v: unknown): { items: ExhibitionFaqItem[]; format: ExhibitionFaqsFormat } {
  const clean = (items: unknown[]): ExhibitionFaqItem[] =>
    items
      .filter((x) => x && typeof x === 'object')
      .map((x) => {
        const o = x as Record<string, unknown>;
        return {
          question: String(o.question ?? ''),
          answer: String(o.answer ?? ''),
          answerRich: normalizeRichValue(o.answer_rich as JSONContent | string | null | undefined),
        };
      })
      .filter(
        (f) =>
          f.question.trim() !== '' ||
          f.answer.trim() !== '' ||
          !isRichEmpty(normalizeRichValue(f.answerRich ?? null)),
      );
  if (Array.isArray(v)) return { items: clean(v), format: 'array' };
  if (typeof v === 'string' && v.trim()) {
    try {
      const parsed: unknown = JSON.parse(v);
      if (Array.isArray(parsed)) return { items: clean(parsed), format: 'string' };
    } catch {
      // رشتهٔ خراب → آرایهٔ خالی، ولی قالب رشته حفظ می‌شود
    }
    return { items: [], format: 'string' };
  }
  return { items: [], format: 'array' };
}

function encodeFaqs(items: unknown, format: ExhibitionFaqsFormat | undefined): unknown {
  // ورودی شکل BlockEditor است ({answer_rich})؛ اگر camelCase هم آمد خوانده می‌شود.
  const cleaned = (Array.isArray(items) ? items : [])
    .filter((x) => x && typeof x === 'object')
    .map((x) => {
      const o = x as Record<string, unknown>;
      const rich = cleanRichValue(
        (o.answer_rich ?? o.answerRich) as JSONContent | string | null | undefined,
      );
      return {
        question: String(o.question ?? ''),
        answer: String(o.answer ?? ''),
        ...(rich ? { answer_rich: rich } : {}),
      };
    });
  return format === 'string' ? JSON.stringify(cleaned) : cleaned;
}

/**
 * نگهبان مشترک ستون‌های تازه (الگوی مصوب QA): ستون‌های `*_rich`/سئو فقط
 * وقتی خوانده/نوشته می‌شوند که مایگریشن‌های 0030/0032 اجرا شده باشند؛
 * فرم با اکشن‌های check* کنار همان فیلد اطلاع صادقانه نشان می‌دهد.
 */
const EXH_RICH_WANT = ['description_rich', 'meta_title', 'meta_description'] as const;

/** ستون‌های تازه‌ای که هنوز در دیتابیس نیستند (مجموعهٔ خالی = همه هستند). */
async function exhibitionMissingCols(db: AppDb): Promise<Set<string>> {
  const { missing } = await checkColumnsExist(db, 'exhibitions', EXH_RICH_WANT);
  return new Set(missing);
}

/**
 * وضعیت ستون‌ها برای فرم (سمت کلاینت): true یعنی ستون هست و اطلاع لازم
 * نیست؛ false یعنی فرم باید اطلاع «فعلاً اعمال نمی‌شود» نشان بدهد.
 */
export async function checkExhibitionDescriptionCol(): Promise<boolean> {
  await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) return false;
  return !(await exhibitionMissingCols(db)).has('description_rich');
}

export async function checkExhibitionSeoCols(): Promise<boolean> {
  await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) return false;
  const missing = await exhibitionMissingCols(db);
  return !missing.has('meta_title') && !missing.has('meta_description');
}

function optional(v: string): string | null {
  const t = (v || '').trim();
  return t === '' ? null : t;
}

export async function listExhibitions() {
  await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  const rows = await db.select().from(exhibitions).where(isNull(exhibitions.deletedAt)).orderBy(desc(exhibitions.updatedAt)).limit(300);
  // ستون‌های غنی/سئو فقط وقتی خوانده می‌شوند که در دیتابیس باشند
  // (مایگریشن‌های 0030 و 0032) — نگهبان مشترک lib/column-guard.
  const missingCols = await exhibitionMissingCols(db);
  const richById = new Map<
    string,
    { descriptionRich: JSONContent | null; metaTitle: string; metaDescription: string }
  >();
  const wantCols = EXH_RICH_WANT.filter((c) => !missingCols.has(c));
  if (wantCols.length > 0 && rows.length > 0) {
    const ids = rows.map((r) => r.id);
    const res = await db.execute(sql`
      select id, ${sql.raw(wantCols.map((c) => `"${c}"`).join(', '))}
      from exhibitions where id = any(${ids}::uuid[])
    `);
    for (const row of res as unknown as Array<Record<string, unknown>>) {
      richById.set(String(row.id), {
        descriptionRich: normalizeRichValue(
          (row.description_rich ?? null) as JSONContent | string | null | undefined,
        ),
        metaTitle: typeof row.meta_title === 'string' ? row.meta_title : '',
        metaDescription: typeof row.meta_description === 'string' ? row.meta_description : '',
      });
    }
  }
  const emptyRich = { descriptionRich: null, metaTitle: '', metaDescription: '' };
  return rows.map((r) => {
    const faqsParsed = parseFaqs(r.faqs);
    const rich = richById.get(r.id) ?? emptyRich;
    return {
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
    // توضیحات کامل غنی: خوانش اول از description_rich، اگر نبود متن تخت قدیمی.
    descriptionRich: rich.descriptionRich,
    metaTitle: rich.metaTitle,
    metaDescription: rich.metaDescription,
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
    faqs: faqsParsed.items,
    faqsFormat: faqsParsed.format,
    status: r.status as ExhibitionStatus,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
  });
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
  // میز ۳ — ایراد ۱۰: نامک فارسی روی روت‌های سایت ۴۰۴ِ زنده می‌دهد؛ این‌جا رد می‌شود.
  assertLatinSlug(slug);
  if (titleFa.length < 2) throw new Error('عنوان نمایشگاه لازم است.');
  // تصویر نمایشگاه آدرس دستی است؛ باید همان هاست‌هایی باشد که سایت می‌تواند رندر کند.
  assertRenderableImageUrl(data.image || '');
  const status: ExhibitionStatus = VALID_STATUS.includes(data.status) ? data.status : 'draft';
  // توضیحات کامل غنی: JSON تمیز (خالی → null). ستون متنی قدیمی description
  // عمداً این‌جا نوشته نمی‌شود — فقط fallback می‌ماند (الگوی ترک راهنماها).
  // ستون nullable است پس روی درج هم نیازی به مقدار نیست.
  const descriptionRich = cleanRichValue(data.descriptionRich);
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
    // قالب ذخیرهٔ faqs حفظ می‌شود (رشته-کدشده‌ها رشته می‌مانند).
    faqs: encodeFaqs(data.faqs, data.faqsFormat),
    status,
    updatedAt: new Date(),
  };
  let rowId = id ?? null;
  if (id) {
    // به‌روزرسانی: ستون متنی قدیمی description دست نمی‌خورد (فقط fallback).
    await db.update(exhibitions).set(values).where(eq(exhibitions.id, id));
  } else {
    // درجِ تازه: متن تختِ نسخهٔ غنی در ستون قدیمی هم می‌نشیند تا هیچ محتوایی
    // حتی پیش از اجرای مایگریشن 0030 گم نشود (ستون nullable است).
    const inserted = await db
      .insert(exhibitions)
      .values({ ...values, description: optional(richToPlainText(descriptionRich)) })
      .returning({ id: exhibitions.id });
    rowId = inserted[0]?.id ?? null;
  }
  // ستون‌های غنی/سئو فقط وقتی نوشته می‌شوند که در دیتابیس باشند
  // (مایگریشن‌های 0030 و 0032) — تا پیش از اجرا، ذخیرهٔ همان فیلد رد می‌شود
  // و فرم کنارش اطلاع صادقانه نشان می‌دهد (الگوی مصوب QA).
  const missingCols = await exhibitionMissingCols(db);
  if (rowId && missingCols.size < EXH_RICH_WANT.length) {
    if (!missingCols.has('description_rich')) {
      await db.execute(sql`
        update exhibitions
        set description_rich = ${descriptionRich ? JSON.stringify(descriptionRich) : null}::jsonb
        where id = ${rowId}::uuid
      `);
    }
    if (!missingCols.has('meta_title') && !missingCols.has('meta_description')) {
      const metaTitle = (data.metaTitle || '').trim() || null;
      const metaDescription = (data.metaDescription || '').trim() || null;
      await db.execute(sql`
        update exhibitions
        set meta_title = ${metaTitle}, meta_description = ${metaDescription}
        where id = ${rowId}::uuid
      `);
    }
  }
  revalidatePath('/admin/exhibitions');
  return { ok: true };
}

export async function deleteExhibition(id: string) {
  const session = await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  const rows = await db
    .select({ titleFa: exhibitions.titleFa })
    .from(exhibitions)
    .where(eq(exhibitions.id, id))
    .limit(1);
  await archiveOne(db, exhibitions, id, {
    actor: session.email,
    entity: 'exhibitions',
    reasonFa: `بایگانی نمایشگاه «${rows[0]?.titleFa ?? id}»`,
  });
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
