'use server';

import { revalidatePath } from 'next/cache';
import { getDb, type AppDb } from '@/db/client';
import { siteDestinations, siteTours } from '@/db/schema';
import { and, asc, count, desc, eq, isNull, ne, sql } from 'drizzle-orm';
import { requireAdmin } from '@/src/lib/admin-auth';
import { archiveOne } from '@/src/lib/archive';
import { isValidDestinationCategory } from './categories';
import { assertRenderableImageUrl } from '@/src/lib/site-image-hosts';
import { invalidateDestinationsCache } from '@/src/lib/db-content';
import { assertLatinSlug } from '@/src/lib/slug-format';
import {
  cleanRichValue,
  isRichEmpty,
  normalizeRichValue,
  richToPlainText,
  type JSONContent,
} from '@/lib/rich-text';
import { checkColumnsExist } from '@/lib/column-guard';

export interface FaqItem {
  question: string;
  answer: string;
  /** پاسخ غنی (کلید answer_rich داخل آبجکت؛ قرارداد تیم داده) */
  answerRich?: JSONContent | string | null;
}

/** یک عکس گالری مقصد: همان قرارداد PickedImage کتابخانهٔ رسانه. */
export interface GalleryImage {
  url: string;
  caption: string;
  alt: string;
}

/** قالب ذخیرهٔ ستون faqs (یافتهٔ تیم داده: بعضی ردیف‌ها رشته-کدشده‌اند). */
export type FaqsFormat = 'array' | 'string';

export interface DestinationInput {
  slug: string;
  name: string;
  nameEn: string;
  type: string;
  parentCountrySlug: string;
  category: string;
  image: string;
  heroTagline: string;
  /** توضیحات غنی (ستون description_rich؛ مایگریشن 0030) */
  descriptionRich: JSONContent | null;
  /** سئو (ستون‌های meta_title/meta_description؛ مایگریشن 0032) */
  metaTitle: string;
  metaDescription: string;
  /** گالری چندعکسی (ستون gallery؛ مایگریشن 0032) */
  gallery: GalleryImage[];
  /** قالب ذخیرهٔ faqs تا رشته-کدشده‌ها رشته بمانند (یادداشت تیم داده، بخش ۶) */
  faqsFormat: FaqsFormat;
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

function toFaqItem(x: unknown): FaqItem {
  const o = (x ?? {}) as Record<string, unknown>;
  return {
    question: String(o.question ?? ''),
    answer: String(o.answer ?? ''),
    answerRich: normalizeRichValue(o.answer_rich as JSONContent | string | null | undefined),
  };
}

/**
 * خوانش دفاعی faqs با حفظ قالب ذخیره (آرایه یا رشته-کدشده) — همان تصمیم
 * آگاهانهٔ تیم داده: قالب عوض نمی‌شود، فقط خوانده می‌شود.
 */
function parseFaqs(v: unknown): { items: FaqItem[]; format: FaqsFormat } {
  const clean = (items: unknown[]): FaqItem[] =>
    items
      .filter((x) => x && typeof x === 'object')
      .map(toFaqItem)
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

function encodeFaqs(items: unknown, format: FaqsFormat | undefined): unknown {
  // ورودی هم می‌تواند شکل فرم مقصد ({answerRich}) باشد هم شکل BlockEditor
  // ({answer_rich}) — هر دو خوانده می‌شود و یکدستِ snake_case ذخیره می‌شود.
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
        // پاسخ غنیِ خالی ذخیره نمی‌شود تا JSON باد نکند
        ...(rich ? { answer_rich: rich } : {}),
      };
    });
  return format === 'string' ? JSON.stringify(cleaned) : cleaned;
}

function asGallery(v: unknown): GalleryImage[] {
  const arr = Array.isArray(v) ? v : [];
  return arr
    .filter((x) => x && typeof x === 'object')
    .map((x) => {
      const o = x as Record<string, unknown>;
      return {
        url: String(o.url ?? ''),
        caption: String(o.caption ?? ''),
        alt: String(o.alt ?? ''),
      };
    })
    .filter((g) => g.url.trim() !== '');
}

/**
 * نگهبان مشترک ستون‌های تازه (الگوی مصوب QA): ستون‌های `*_rich`/سئو/گالری
 * فقط وقتی خوانده/نوشته می‌شوند که مایگریشن‌های 0030/0032 اجرا شده باشند؛
 * فرم با اکشن‌های check* کنار همان فیلد اطلاع صادقانه نشان می‌دهد.
 */
const DEST_RICH_WANT = ['description_rich', 'meta_title', 'meta_description', 'gallery'] as const;

/** ستون‌های تازه‌ای که هنوز در دیتابیس نیستند (مجموعهٔ خالی = همه هستند). */
async function destinationMissingCols(db: AppDb): Promise<Set<string>> {
  const { missing } = await checkColumnsExist(db, 'site_destinations', DEST_RICH_WANT);
  return new Set(missing);
}

/**
 * وضعیت ستون‌ها برای فرم (سمت کلاینت): true یعنی ستون هست و اطلاع لازم
 * نیست؛ false یعنی فرم باید اطلاع «فعلاً اعمال نمی‌شود» نشان بدهد.
 */
export async function checkDestinationDescriptionCol(): Promise<boolean> {
  await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) return false;
  return !(await destinationMissingCols(db)).has('description_rich');
}

export async function checkDestinationSeoCols(): Promise<boolean> {
  await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) return false;
  const missing = await destinationMissingCols(db);
  return !missing.has('meta_title') && !missing.has('meta_description');
}

export async function checkDestinationGalleryCol(): Promise<boolean> {
  await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) return false;
  return !(await destinationMissingCols(db)).has('gallery');
}

export async function listDestinations() {
  await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  // قلم ۳ کتابچه: ترتیب و سقف یکسان با listDestinationTree (توی tours/actions.ts)
  // تا هیچ مقصدی در یکی از دو فهرست دیده شود و در دیگری نه.
  const rows = await db.select().from(siteDestinations).where(isNull(siteDestinations.deletedAt)).orderBy(asc(siteDestinations.name)).limit(1000);
  // ستون‌های غنی/سئو/گالری فقط وقتی خوانده می‌شوند که در دیتابیس باشند
  // (مایگریشن‌های 0030 و 0032) — نگهبان مشترک lib/column-guard.
  const missingCols = await destinationMissingCols(db);
  const richById = new Map<
    string,
    { descriptionRich: JSONContent | null; metaTitle: string; metaDescription: string; gallery: GalleryImage[] }
  >();
  const wantCols = DEST_RICH_WANT.filter((c) => !missingCols.has(c));
  if (wantCols.length > 0 && rows.length > 0) {
    const ids = rows.map((r) => r.id);
    const res = await db.execute(sql`
      select id, ${sql.raw(wantCols.map((c) => `"${c}"`).join(', '))}
      from site_destinations where id = any(${ids})
    `);
    for (const row of res as unknown as Array<Record<string, unknown>>) {
      richById.set(String(row.id), {
        descriptionRich: normalizeRichValue(
          (row.description_rich ?? null) as JSONContent | string | null | undefined,
        ),
        metaTitle: typeof row.meta_title === 'string' ? row.meta_title : '',
        metaDescription: typeof row.meta_description === 'string' ? row.meta_description : '',
        gallery: asGallery(row.gallery),
      });
    }
  }
  const emptyRich = { descriptionRich: null, metaTitle: '', metaDescription: '', gallery: [] as GalleryImage[] };
  // فاز B6 موج ۲: «تور فعال» از ستون خوانده نمی‌شود (حذف شد، مایگریشن 0026)؛
  // از روی تورهای منتشرشده حساب می‌شود — همان منطق سمت سایت (db-content.ts).
  let slugCounts = new Map<string, number>();
  try {
    const tours = await db
      .select({ slugs: siteTours.destinationSlugs, publishStatus: siteTours.publishStatus })
      .from(siteTours)
      .where(and(isNull(siteTours.deletedAt), eq(siteTours.publishStatus, 'published')));
    for (const t of tours) {
      const slugs = Array.isArray(t.slugs) ? t.slugs : [];
      for (const s of slugs) {
        const key = String(s || '').trim();
        if (key) slugCounts.set(key, (slugCounts.get(key) ?? 0) + 1);
      }
    }
  } catch {
    // خطا در شمارش → صفر می‌ماند؛ ستون «وضعیت سایت» خالی نشان می‌دهد نه عدد دروغ.
  }
  return rows.map((r) => {
    const faqsParsed = parseFaqs(r.faqs);
    const rich = richById.get(r.id) ?? emptyRich;
    return {
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
    // توضیحات غنی: خوانش اول از description_rich، اگر نبود متن تخت قدیمی.
    descriptionRich: rich.descriptionRich,
    metaTitle: rich.metaTitle,
    metaDescription: rich.metaDescription,
    gallery: rich.gallery,
    bestSeason: r.bestSeason,
    visaRequired: r.visaRequired,
    visaType: r.visaType ?? '',
    flightDuration: r.flightDuration ?? '',
    currency: r.currency,
    startingPrice: r.startingPrice,
    startingPriceNote: r.startingPriceNote,
    lastVerifiedAt: r.lastVerifiedAt,
    activeToursCount: slugCounts.get(r.slug) ?? 0,
    // گیت انتشار مقصد (مایگریشن 0023، قلم ۳ موج ۱): ردیف‌های قدیمی‌تر از
    // ستون هم draft حساب می‌شوند (پیش‌فرض DB).
    publishStatus: (r.publishStatus ?? 'draft') as 'draft' | 'published',
    popularDistricts: asStringArray(r.popularDistricts),
    keyHighlights: asStringArray(r.keyHighlights),
    travelTips: asStringArray(r.travelTips),
    faqs: faqsParsed.items,
    faqsFormat: faqsParsed.format,
    relatedGuides: asStringArray(r.relatedGuides),
  };
  });
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
  // گالری هم فقط از کتابخانهٔ رسانه می‌آید؛ همان سنجش هاست.
  const gallery = (data.gallery ?? [])
    .filter((g) => g && g.url.trim() !== '')
    .map((g) => ({ url: g.url.trim(), caption: (g.caption || '').trim(), alt: (g.alt || '').trim() }));
  for (const g of gallery) assertRenderableImageUrl(g.url);
  // توضیحات غنی: JSON تمیز (خالی → null). ستون متنی قدیمی description عمداً
  // روی به‌روزرسانی نوشته نمی‌شود — فقط fallback می‌ماند (الگوی ترک راهنماها).
  // ولی ستون NOT NULL است، پس موقع «درج» از متن تختِ نسخهٔ غنی پر می‌شود.
  const descriptionRich = cleanRichValue(data.descriptionRich);

  // ایراد ۱۸: نامکِ قبلی را نگه می‌داریم تا اگر عوض شد، destination_slugs
  // تورهای متصل هم به‌روز شود و تورها یتیم نمانند.
  let previousSlug: string | null = null;
  if (id) {
    const [row] = await db
      .select({ slug: siteDestinations.slug })
      .from(siteDestinations)
      .where(eq(siteDestinations.id, id))
      .limit(1);
    previousSlug = row?.slug ?? null;
  }

  const values = {
    slug,
    name,
    nameEn: data.nameEn || '',
    type: data.type || 'city',
    parentCountrySlug: data.parentCountrySlug || null,
    category,
    image: data.image || '',
    heroTagline: data.heroTagline || '',
    // ستون متنی قدیمی description روی به‌روزرسانی نوشته نمی‌شود (فقط fallback)؛
    // موقع «درج» چون NOT NULL است، از متن تختِ نسخهٔ غنی پر می‌شود تا هیچ
    // محتوایی حتی پیش از اجرای مایگریشن 0030 گم نشود.
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
    // قالب ذخیرهٔ faqs حفظ می‌شود (رشته-کدشده‌ها رشته می‌مانند).
    faqs: encodeFaqs(data.faqs ?? [], data.faqsFormat),
    relatedGuides: data.relatedGuides ?? [],
    updatedAt: new Date(),
  };

  let rowId = id ?? null;
  try {
    if (id) {
      await db.update(siteDestinations).set(values).where(eq(siteDestinations.id, id));
    } else {
      const inserted = await db
        .insert(siteDestinations)
        .values({ ...values, description: richToPlainText(descriptionRich) || '' })
        .returning({ id: siteDestinations.id });
      rowId = inserted[0]?.id ?? null;
    }
  } catch (e) {
    // مسابقهٔ هم‌زمان: خطای یکتایی نامک هم همان پیام فارسی را می‌گیرد.
    if (e instanceof Error && 'code' in e && (e as { code?: string }).code === '23505') {
      throw new Error('این نامک قبلاً ثبت شده است.');
    }
    throw e;
  }

  // ستون‌های غنی/سئو/گالری فقط وقتی نوشته می‌شوند که در دیتابیس باشند
  // (مایگریشن‌های 0030 و 0032) — تا پیش از اجرا، ذخیرهٔ همان فیلد رد می‌شود
  // و فرم کنارش اطلاع صادقانه نشان می‌دهد (الگوی مصوب QA).
  const missingCols = await destinationMissingCols(db);
  if (rowId && missingCols.size < DEST_RICH_WANT.length) {
    if (!missingCols.has('description_rich')) {
      await db.execute(sql`
        update site_destinations
        set description_rich = ${descriptionRich ? JSON.stringify(descriptionRich) : null}::jsonb
        where id = ${rowId}::uuid
      `);
    }
    if (!missingCols.has('meta_title') && !missingCols.has('meta_description')) {
      const metaTitle = (data.metaTitle || '').trim() || null;
      const metaDescription = (data.metaDescription || '').trim() || null;
      await db.execute(sql`
        update site_destinations
        set meta_title = ${metaTitle}, meta_description = ${metaDescription}
        where id = ${rowId}::uuid
      `);
    }
    if (!missingCols.has('gallery')) {
      await db.execute(sql`
        update site_destinations
        set gallery = ${JSON.stringify(gallery)}::jsonb
        where id = ${rowId}::uuid
      `);
    }
  }

  // ایراد ۱۸: اگر نامک عوض شده، همان نامکِ تازه را در destination_slugs همهٔ
  // تورهای متصل بنشان (وگرنه فهرست «تورهای فعال» صفحهٔ مقصد و شمارش خودکار
  // می‌شکنند). updated_at تورها دست نمی‌خورد تا ترتیب ویجت‌ها به‌هم نریزد.
  let updatedTours = 0;
  const slugChanged = Boolean(previousSlug && previousSlug !== slug);
  if (slugChanged && previousSlug) {
    const tourRows = await db
      .select({ id: siteTours.id, destinationSlugs: siteTours.destinationSlugs })
      .from(siteTours)
      .where(isNull(siteTours.deletedAt));
    for (const t of tourRows) {
      const slugs = asStringArray(t.destinationSlugs);
      if (!slugs.includes(previousSlug)) continue;
      const next = slugs.map((s) => (s === previousSlug ? slug : s));
      await db.update(siteTours).set({ destinationSlugs: next }).where(eq(siteTours.id, t.id));
      updatedTours += 1;
    }
  }

  // ایراد ۲۰: کش ماژولی مقصدهای سایت را همین‌جا باطل کن تا تغییر بلافاصله دیده شود.
  invalidateDestinationsCache();
  revalidatePath('/admin/places');
  return { ok: true, slugChanged, updatedTours };
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

/**
 * شمار تورهای منتشرشدهٔ هر مقصد — برای ستون «وضعیت سایت» تب مقصدها (ایراد ۲۱).
 * همان تعریف «منتشرشده» که getTours در db-content دارد: بایگانی‌نشده و
 * (publish_status برابر 'published' یا خالیِ قدیمی‌تر از ستون).
 */
export async function getDestinationTourCounts(): Promise<Record<string, number>> {
  await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  const rows = await db
    .select({ publishStatus: siteTours.publishStatus, destinationSlugs: siteTours.destinationSlugs })
    .from(siteTours)
    .where(isNull(siteTours.deletedAt));
  const counts: Record<string, number> = {};
  for (const r of rows) {
    const ps = r.publishStatus as string | null | undefined;
    if (ps !== 'published' && ps != null && ps !== '') continue;
    for (const s of asStringArray(r.destinationSlugs)) {
      counts[s] = (counts[s] ?? 0) + 1;
    }
  }
  return counts;
}

/**
 * گیت انتشار جدا برای مقصد (قلم ۳ موج ۱، تصمیم ۶ ثبت‌شدهٔ ۱۴۰۵/۰۷/۱۱).
 *
 * - 'published' یعنی مقصد واقعاً روی سایت دیده می‌شود؛ 'draft' یعنی پنهان است.
 * - انتشار فقط وقتی انجام می‌شود که «شرایط گیت» برقرار باشد؛ وگرنه خطا با
 *   فهرست دقیقِ مواردِ ناقص برمی‌گردد تا ادمین همان‌ها را کامل کند.
 *
 * شرایط گیت (فقط از مدل مقصد؛ چیزی حدس زده نشده):
 *  ۱. نام فارسی دست‌کم ۲ نویسه (همان قانون saveDestination).
 *  ۲. کشور/ناحیه: نوع باید «country» یا «city» باشد (همان دو نوعی که فرم
 *     می‌سازد)؛ اگر «city» است، «کشور مادر» باید به یک رکورد زندهٔ نوع
 *     «country» اشاره کند.
 *  ۳. توضیح (description) یا تصویر (image) — دست‌کم یکی پر باشد.
 */
export async function setDestinationPublishStatus(id: string, next: 'draft' | 'published') {
  await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  if (next !== 'draft' && next !== 'published') throw new Error('وضعیت انتشار نامعتبر است.');
  const cleanId = (id || '').trim();
  if (!cleanId) throw new Error('مقصد مشخص نیست.');
  const [row] = await db.select().from(siteDestinations).where(eq(siteDestinations.id, cleanId)).limit(1);
  if (!row) throw new Error('مقصد پیدا نشد.');
  const displayName = row.name || cleanId;

  if (next === 'published') {
    const missing: string[] = [];
    if ((row.name || '').trim().length < 2) missing.push('نام');
    if (row.type === 'city') {
      const parent = (row.parentCountrySlug || '').trim();
      if (!parent) {
        missing.push('کشور مادر');
      } else {
        const [country] = await db
          .select({ id: siteDestinations.id })
          .from(siteDestinations)
          .where(
            and(
              eq(siteDestinations.slug, parent),
              eq(siteDestinations.type, 'country'),
              isNull(siteDestinations.deletedAt),
            ),
          )
          .limit(1);
        if (!country) missing.push('کشور مادر (مقصدِ مادرِ معتبر پیدا نشد)');
      }
    } else if (row.type !== 'country') {
      // نوع‌های قدیمی (مثل region) در مدل فعلی فرم نیستند؛ انتشارشان نیازمند
      // تعیین نوع «کشور» یا «شهر» است.
      missing.push('نوع (باید «کشور» یا «شهر» باشد)');
    }
    if (!(row.description || '').trim() && !(row.image || '').trim()) missing.push('توضیح یا تصویر');
    if (missing.length > 0) {
      throw new Error(`انتشار «${displayName}» ممکن نیست؛ اول این‌ها را کامل کنید: ${missing.join('، ')}.`);
    }
  }

  await db
    .update(siteDestinations)
    .set({ publishStatus: next, updatedAt: new Date() })
    .where(eq(siteDestinations.id, cleanId));
  // ایراد ۲۰: انتشار/لغو انتشار هم کش مقصدهای سایت را باطل می‌کند.
  invalidateDestinationsCache();
  revalidatePath('/admin/places');
  return { ok: true, publishStatus: next };
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
  // ایراد ۲۰: بایگانی هم کش مقصدهای سایت را باطل می‌کند.
  invalidateDestinationsCache();
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
