'use server';

import { revalidatePath } from 'next/cache';
import { getDb, type AppDb } from '@/db/client';
import { accommodations, auditLogs, originCities, siteDestinations, siteTours } from '@/db/schema';
import { and, asc, count, desc, eq, inArray, isNull, sql } from 'drizzle-orm';
import { requireAdmin } from '@/src/lib/admin-auth';
import { archiveOne } from '@/src/lib/archive';
import { assertRenderableImageUrl } from '@/src/lib/site-image-hosts';
import { DOMESTIC_SLUGS, DOMESTIC_NAME_RE } from '@/src/lib/domestic';
import { getSettingsMap } from '../settings/actions';
import { assertLatinSlug } from '@/src/lib/slug-format';
import { cleanupReplacedBanner } from './banner-upload';
import { checkPublishReadiness, type PublishGateInput } from './publish-gate';
import { buildDurationFromNights } from '@/src/lib/tour-format';
// تیم «فرم تورها» (۱۴۰۵/۰۷/۱۱): الگوی «نگهبان + اطلاع» برای ستون‌های تازهٔ
// *_rich / faqs / why_this_tour (مایگریشن 0030) و ستون‌های سئوی سطح تور
// (مایگریشن 0033) — هر دو مایگریشن هنوز اجرا نشده‌اند؛ قرارداد در
// lib/column-guard.ts مستند است.
import { checkColumnsExist } from '@/lib/column-guard';
import {
  cleanRichValue,
  normalizeRichValue,
  richToPlainText,
  type JSONContent,
} from '@/lib/rich-text';

export type HotelBookingType = 'guarantee' | 'semi_charter' | 'on_request';

export interface TourHotelOptionItem {
  name?: string;
  stars?: number;
  board?: string;
  /**
   * نوع رزرو هتل در این تور (کتابچه §۳، فاز ۲): راهنمای ترتیبِ فیلدهای نرخ.
   * اختیاری است تا ردیف‌های قدیمی بی‌نوع هم معتبر بمانند.
   * مقدار ذخیره‌شده کد لاتین است؛ برچسب فارسی در UI.
   */
  bookingType?: HotelBookingType;
  pricePerPerson?: string;
  priceDouble?: string;
  priceSingle?: string;
  priceChildWithBed?: string;
  priceChildNoBed?: string;
  /** اتصال به رکورد جدول هتل‌ها (accommodations.id)؛ قیمت‌ها همیشه ویژهٔ این تور دستی وارد می‌شوند */
  hotelId?: string;
}

export interface TourItineraryDayItem {
  day: number;
  title: string;
  city: string;
  description: string;
  meals?: string;
  /**
   * متن غنی همان روز (کلید description_rich داخل آبجکت روز در ستون
   * itinerary_days — قرارداد content-editor/data/NOTES.md). ویرایشگر سبک.
   * متن تختِ `description` از همین ساخته می‌شود تا کد قدیمی/گیت انتشار بی‌متن نمانند.
   */
  descriptionRich?: JSONContent | null;
}

/**
 * قلم «سوالات پرتکرار» سطح تور (ستون faqs؛ مایگریشن 0030، اجرا نشده).
 * از روز اول روی ویرایشگر: پاسخ با ویرایشگر سبک در answer_rich (JSON تایپ‌تپ)
 * و نسخهٔ تختِ answer از همان ساخته می‌شود (برای fallback سایت و JSON-LD).
 */
export interface TourFaqItem {
  question: string;
  answer: string;
  /** پاسخ غنی (کلید answer_rich داخل آبجکت؛ قرارداد تیم داده) */
  answerRich?: JSONContent | null;
}

export interface TourTrustSpecsItem {
  returnGuarantee?: string;
  cityTax?: string;
  tipsNote?: string;
  luggageKg?: number;
  activityLevel?: 'easy' | 'moderate' | 'demanding' | string;
  requiredDocs?: string[];
}

export interface TourConsultantSpecItem {
  name?: string;
  title?: string;
  phone?: string;
  audioUrl?: string;
  emergencyPhone?: string;
}

/**
 * ورودی ذخیرهٔ تور.
 */
export interface TourInput {
  slug: string;
  title: string;
  type: string;
  typeLabel: string;
  destinationSlugs: string[];
  destination: string;
  origin: string;
  route: string;
  duration: string;
  nights: number;
  closestDeparture: string;
  price: number;
  status: string;
  statusLabel: string;
  /** شرایط انتشار (مایگریشن 0011): 'draft' پیش‌نویس، 'published' منتشرشده */
  publishStatus: 'draft' | 'published';
  image: string;
  badge: string;
  visaRequired: boolean;
  /**
   * ایراد ۹: مدیر تیک «نیاز به دریافت ویزا» را دستی عوض کرده؟
   * اگر true باشد، حدس خودکارِ داخلی/خارجی بودن مقصد اعمال نمی‌شود و انتخاب مدیر می‌ماند.
   * در دیتابیس ذخیره نمی‌شود؛ فقط پرچم همین فرم است.
   */
  visaRequiredManual?: boolean;
  airline: string;
  includedServices: string[];
  excludedServices: string[];
  hotelOptions: TourHotelOptionItem[];
  description: string;
  /**
   * متن غنی توضیحات تور (ستون description_rich؛ مایگریشن 0030، اجرا نشده).
   * متن تختِ `description` (notNull قدیمی) از همین ساخته می‌شود تا باگ
   * «ذخیره با ویرایشگر، متن تخت خالی» پیش نیاید.
   */
  descriptionRich?: JSONContent | null;
  /** «سوالات پرتکرار» سطح تور (ستون faqs؛ مایگریشن 0030، اجرا نشده). */
  faqs?: TourFaqItem[];
  /**
   * «چرا همین تور» (ستون why_this_tour؛ مایگریشن 0030، اجرا نشده).
   * سند JSON تایپ‌تپ (ویرایشگر کامل).
   */
  whyThisTourRich?: JSONContent | null;
  /** متای سئوی سطح تور (ستون‌های meta_title / meta_description؛ مایگریشن 0033، اجرا نشده). */
  metaTitle?: string;
  /** متای سئوی سطح تور (ستون‌های meta_title / meta_description؛ مایگریشن 0033، اجرا نشده). */
  metaDescription?: string;
  transportKind?: 'air' | 'land' | 'rail' | 'sea' | 'mixed';
  carrierName?: string;
  guaranteedDeparture?: boolean;
  itineraryDays?: TourItineraryDayItem[];
  trustSpecs?: TourTrustSpecsItem;
  consultantSpec?: TourConsultantSpecItem;
}

export interface DestinationTreeCity {
  slug: string;
  name: string;
}

export interface DestinationTreeCountry {
  slug: string;
  name: string;
  cities: DestinationTreeCity[];
}

export interface DestinationTreeRegion {
  slug: string;
  name: string;
  countries: DestinationTreeCountry[];
}

export interface DestinationTree {
  regions: DestinationTreeRegion[];
  all: Array<{ slug: string; name: string; type: string; parent: string }>;
}

export type OriginRow = {
  slug: string;
  nameFa: string;
  type: string;
  parentSlug: string;
};

function asStringArray(v: unknown): string[] {
  if (Array.isArray(v)) return v.map((x) => String(x)).filter((x) => x.trim() !== '');
  return [];
}

const FA_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

function faPrice(n: unknown): string {
  const grouped = Math.max(0, Math.round(Number(n) || 0)).toLocaleString('en-US');
  return grouped.replace(/\d/g, (d) => FA_DIGITS[Number(d)]).replace(/,/g, '٬');
}

type DestRecord = typeof siteDestinations.$inferSelect;

function isDomesticSlug(slug: string, bySlug: Map<string, DestRecord>): boolean {
  if (DOMESTIC_SLUGS.includes(slug)) return true;
  let cur = bySlug.get(slug);
  if (!cur) return false;
  if (DOMESTIC_NAME_RE.test(cur.name)) return true;
  for (let i = 0; i < 10 && cur; i++) {
    if (cur.slug === 'iran') return true;
    const p = cur.parentCountrySlug ?? '';
    if (!p) return false;
    if (p === 'iran' || DOMESTIC_SLUGS.includes(p)) return true;
    cur = bySlug.get(p);
    if (cur && DOMESTIC_NAME_RE.test(cur.name)) return true;
  }
  return false;
}

type SiteTourRow = typeof siteTours.$inferSelect;

function toTourRow(r: SiteTourRow) {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    type: r.type,
    typeLabel: r.typeLabel,
    destinationSlugs: asStringArray(r.destinationSlugs),
    destination: r.destination,
    origin: r.origin,
    route: r.route,
    transportKind: r.transportKind ?? 'air',
    duration: r.duration,
    nights: r.nights,
    closestDeparture: r.closestDeparture,
    price: Number(r.price),
    status: r.status,
    statusLabel: r.statusLabel,
    publishStatus: (r.publishStatus ?? 'draft') as 'draft' | 'published',
    image: r.image,
    badge: r.badge ?? '',
    visaRequired: r.visaRequired,
    airline: r.airline,
    includedServices: asStringArray(r.includedServices),
    excludedServices: asStringArray(r.excludedServices),
    hotelOptions: Array.isArray(r.hotelOptions) ? r.hotelOptions : [],
    description: r.description,
    // کلید description_rich داخل آبجکت روز (ستون itinerary_days از قبل هست؛
    // نگهبان لازم ندارد) — خوانش دفاعی و فقط وقتی متن خوانا دارد.
    itineraryDays: Array.isArray(r.itineraryDays)
      ? (r.itineraryDays as TourItineraryDayItem[]).map((d) => {
          const rich = asRich((d ?? {}).descriptionRich);
          return { ...d, ...(rich ? { descriptionRich: rich } : {}) };
        })
      : [],
    trustSpecs: (r.trustSpecs as TourTrustSpecsItem | null) ?? null,
    consultantSpec: (r.consultantSpec as TourConsultantSpecItem | null) ?? null,
    // گشت: برای اینکه فرم ویرایش بعد از ذخیره حتماً مقادیر تازهٔ دیتابیس را نشان بدهد
    // (کلید ریمونت در EditTourClient)، مهر زمانی به‌روزرسانی هم برمی‌گردد.
    updatedAt: r.updatedAt ? r.updatedAt.toISOString() : null,
  };
}

export async function listTours() {
  await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  const rows = await db.select().from(siteTours).where(isNull(siteTours.deletedAt)).orderBy(desc(siteTours.updatedAt)).limit(300);
  return rows.map(toTourRow);
}

export type TourRow = Awaited<ReturnType<typeof listTours>>[number];

/* ── تیم «فرم تورها»: نگهبان + خوانش/نوشتن ستون‌های تازه (0030/0033) ── */

/**
 * فیلدهای غنی/سئوی تور که از مایگریشن‌های هنوز-اجرانشده (0030/0033) می‌آیند.
 * عمداً در db/schema.ts نیستند: select(*)ِ دریزل با ستونِ اجرا-نشده می‌شکند؛
 * پس این‌ها فقط با SQL خامِ نگهبان‌دار خوانده/نوشته می‌شوند (همان الگوی
 * guides/actions.ts — GUIDE_RICH_COLS).
 */
export interface TourRichFields {
  descriptionRich: JSONContent | null;
  faqs: TourFaqItem[];
  whyThisTourRich: JSONContent | null;
  metaTitle: string;
  metaDescription: string;
}

/** ستون‌های غنی تور (مایگریشن 0030 — هنوز اجرا نشده). */
const TOUR_RICH_COLS = ['description_rich', 'faqs', 'why_this_tour'] as const;
/** ستون‌های سئوی تور (مایگریشن 0033 — هنوز اجرا نشده). */
const TOUR_META_COLS = ['meta_title', 'meta_description'] as const;

async function tourRichColsReady(db: AppDb): Promise<boolean> {
  const { ready } = await checkColumnsExist(db, 'site_tours', TOUR_RICH_COLS);
  return ready;
}

async function tourMetaColsReady(db: AppDb): Promise<boolean> {
  const { ready } = await checkColumnsExist(db, 'site_tours', TOUR_META_COLS);
  return ready;
}

/**
 * وضعیت ستون‌های غنی برای فرم (سمت کلاینت): true یعنی ستون‌ها هستند و
 * اطلاع لازم نیست؛ false یعنی فرم باید کنار فیلدها اطلاع صادقانه نشان بدهد
 * تا ویرایش بی‌صدا گم نشود.
 */
export async function checkTourRichCols(): Promise<boolean> {
  await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) return false;
  return tourRichColsReady(db);
}

/** وضعیت ستون‌های سئوی سطح تور برای فرم (همان قرارداد بالا). */
export async function checkTourMetaCols(): Promise<boolean> {
  await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) return false;
  return tourMetaColsReady(db);
}

/** خوانش دفاعی یک مقدار `*_rich`: JSON تایپ‌تپ، رشتهٔ تخت، یا null. */
function asRich(v: unknown): JSONContent | null {
  return normalizeRichValue(v as JSONContent | string | null | undefined);
}

/** خوانش دفاعی آرایهٔ FAQ از jsonb (رشته-کدشده هم ممکن است). */
function asFaqs(v: unknown): TourFaqItem[] {
  let arr: unknown[] = [];
  if (Array.isArray(v)) arr = v;
  else if (typeof v === 'string' && v.trim()) {
    try {
      const parsed: unknown = JSON.parse(v);
      if (Array.isArray(parsed)) arr = parsed;
    } catch {
      // رشتهٔ خراب → آرایهٔ خالی
    }
  }
  return arr
    .filter((x) => x && typeof x === 'object')
    .map((x) => {
      const o = x as Record<string, unknown>;
      const question = typeof o.question === 'string' ? o.question : '';
      // خوانش دوسویه: قرارداد answer_rich است؛ دادهٔ آزمایشی قدیمی با
      // کلید camelCase هم خوانده می‌شود (QA ترک تورها، ایراد ۱).
      const answerRich = normalizeRichValue(
        (o.answer_rich ?? o.answerRich) as JSONContent | string | null | undefined,
      );
      const answer = typeof o.answer === 'string' && o.answer.trim()
        ? o.answer
        : richToPlainText(answerRich);
      return {
        question,
        answer,
        ...(answerRich ? { answerRich } : {}),
      } as TourFaqItem;
    })
    .filter((f) => f.question.trim() !== '');
}

function asMetaStr(v: unknown): string {
  return typeof v === 'string' ? v : '';
}

const EMPTY_RICH_FIELDS: TourRichFields = {
  descriptionRich: null,
  faqs: [],
  whyThisTourRich: null,
  metaTitle: '',
  metaDescription: '',
};

/**
 * خوانش ستون‌های تازهٔ یک تور با SQL خام — فقط وقتی نگهبان می‌گوید ستون‌ها
 * هستند (وگرنه selectِ دریزل/خام می‌شکند). فهرست ستون‌ها از آرایه‌های ثابت
 * خودمان ساخته می‌شود؛ شناسه پارامتری است.
 */
async function readTourRichFields(db: AppDb, id: string): Promise<TourRichFields> {
  const [richReady, metaReady] = await Promise.all([
    tourRichColsReady(db),
    tourMetaColsReady(db),
  ]);
  if (!richReady && !metaReady) return { ...EMPTY_RICH_FIELDS };
  // ستون‌ها از const خودمان می‌آیند (whitelist ثابت)؛ id پارامتری است.
  const cols = sql.raw(
    [
      ...(richReady ? ['description_rich', 'faqs', 'why_this_tour'] : []),
      ...(metaReady ? ['meta_title', 'meta_description'] : []),
    ].join(', '),
  );
  const res = await db.execute(
    sql`select ${cols} from site_tours where id = ${id}::uuid limit 1`,
  );
  const row = (res as unknown as Array<Record<string, unknown>>)[0];
  if (!row) return { ...EMPTY_RICH_FIELDS };
  return {
    descriptionRich: richReady ? asRich(row.description_rich) : null,
    faqs: richReady ? asFaqs(row.faqs) : [],
    whyThisTourRich: richReady ? asRich(row.why_this_tour) : null,
    metaTitle: metaReady ? asMetaStr(row.meta_title) : '',
    metaDescription: metaReady ? asMetaStr(row.meta_description) : '',
  };
}

/** نرمالایز FAQ برای ذخیره: پرسش خالی رد می‌شود؛ answer از پاسخ غنی ساخته می‌شود. */
function normalizeFaqs(items: unknown): TourFaqItem[] {
  if (!Array.isArray(items)) return [];
  return items
    .filter((x) => x && typeof x === 'object')
    .map((x) => {
      const o = x as Record<string, unknown>;
      const question = typeof o.question === 'string' ? o.question.trim() : '';
      // ورودی هم می‌تواند شکل فرم تور ({answerRich}) باشد هم شکل خام DB
      // ({answer_rich}) — هر دو خوانده می‌شود و یکدستِ snake_case ذخیره می‌شود.
      const answerRich = cleanRichValue(
        normalizeRichValue(
          (o.answer_rich ?? o.answerRich) as JSONContent | string | null | undefined,
        ),
      );
      const answer =
        typeof o.answer === 'string' && o.answer.trim()
          ? o.answer.trim()
          : richToPlainText(answerRich);
      return { question, answer, ...(answerRich ? { answer_rich: answerRich } : {}) } as TourFaqItem;
    })
    .filter((f) => f.question !== '');
}

/**
 * نوشتن ستون‌های تازهٔ تور با SQL خام — فقط وقتی نگهبان می‌گوید ستون‌ها
 * هستند. هر گروه (غنی / سئو) مستقل است چون مایگریشن‌هایشان (0030/0033)
 * ممکن است در زمان‌های جدا اجرا شوند.
 */
async function writeTourRichFields(
  db: AppDb,
  id: string,
  data: TourInput,
): Promise<void> {
  const [richReady, metaReady] = await Promise.all([
    tourRichColsReady(db),
    tourMetaColsReady(db),
  ]);
  if (!richReady && !metaReady) return;
  if (richReady) {
    const descriptionRich = cleanRichValue(data.descriptionRich);
    const whyThisTourRich = cleanRichValue(data.whyThisTourRich);
    const faqs = normalizeFaqs(data.faqs);
    await db.execute(sql`
      update site_tours set
        description_rich = ${descriptionRich ? JSON.stringify(descriptionRich) : null}::jsonb,
        faqs = ${faqs.length > 0 ? JSON.stringify(faqs) : null}::jsonb,
        why_this_tour = ${whyThisTourRich ? JSON.stringify(whyThisTourRich) : null}::jsonb
      where id = ${id}::uuid
    `);
  }
  if (metaReady) {
    const mt = (data.metaTitle ?? '').trim();
    const md = (data.metaDescription ?? '').trim();
    await db.execute(sql`
      update site_tours set
        meta_title = ${mt || null},
        meta_description = ${md || null}
      where id = ${id}::uuid
    `);
  }
}

/** خواندن یک تور برای صفحهٔ ویرایش؛ بایگانی‌شده‌ها null برمی‌گردانند (→ صفحه ۴۰۴). */
export async function getTourById(id: string): Promise<(TourRow & Partial<TourRichFields>) | null> {
  await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  const rows = await db.select().from(siteTours).where(eq(siteTours.id, id)).limit(1);
  const r = rows[0];
  if (!r || r.deletedAt) return null;
  const row = toTourRow(r);
  // ستون‌های تازه (0030/0033): فقط وقتی نگهبان می‌گوید هستند خوانده می‌شوند.
  const rich = await readTourRichFields(db, r.id);
  return { ...row, ...rich };
}

/** خواندن یک تور با نامک (برای تکثیر از روی تور موجود). */
export async function getTourBySlug(slug: string): Promise<(TourRow & Partial<TourRichFields>) | null> {
  await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  const s = (slug || '').trim();
  if (!s) return null;
  const rows = await db.select().from(siteTours).where(eq(siteTours.slug, s)).limit(1);
  const r = rows[0];
  if (!r || r.deletedAt) return null;
  const row = toTourRow(r);
  // تکثیر، متن‌های غنی را هم با خودش می‌برد تا ویرایش بی‌صدا گم نشود.
  const rich = await readTourRichFields(db, r.id);
  return { ...row, ...rich };
}

export async function listDestinationTree(): Promise<DestinationTree> {
  await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  const rows = await db.select().from(siteDestinations).where(isNull(siteDestinations.deletedAt)).orderBy(asc(siteDestinations.name)).limit(1000);
  const all = rows.map((r) => ({
    slug: r.slug,
    name: r.name,
    type: r.type,
    parent: r.parentCountrySlug ?? '',
  }));
  const regions = new Map<string, DestinationTreeRegion>();
  const countries = new Map<string, DestinationTreeCountry>();
  for (const r of rows) {
    if (r.type === 'region') regions.set(r.slug, { slug: r.slug, name: r.name, countries: [] });
  }
  const orphanCountries: DestinationTreeCountry[] = [];
  for (const r of rows) {
    if (r.type !== 'country') continue;
    const node: DestinationTreeCountry = { slug: r.slug, name: r.name, cities: [] };
    countries.set(r.slug, node);
    const region = regions.get(r.parentCountrySlug ?? '');
    if (region) region.countries.push(node);
    else orphanCountries.push(node);
  }
  const orphanCities: DestinationTreeCity[] = [];
  for (const r of rows) {
    if (r.type !== 'city') continue;
    const country = countries.get(r.parentCountrySlug ?? '');
    if (country) {
      country.cities.push({ slug: r.slug, name: r.name });
    } else if (regions.has(r.parentCountrySlug ?? '')) {
      const pseudo: DestinationTreeCountry = { slug: r.slug, name: r.name, cities: [] };
      countries.set(r.slug, pseudo);
      regions.get(r.parentCountrySlug ?? '')!.countries.push(pseudo);
    } else {
      orphanCities.push({ slug: r.slug, name: r.name });
    }
  }
  for (const c of orphanCities) {
    const pseudo: DestinationTreeCountry = { slug: c.slug, name: c.name, cities: [] };
    countries.set(c.slug, pseudo);
    orphanCountries.push(pseudo);
  }
  const list = [...regions.values()];
  if (orphanCountries.length > 0) {
    list.push({ slug: '__other', name: 'سایر مقصدها', countries: orphanCountries });
  }
  return { regions: list, all };
}

/**
 * محتوای نمایشی یک مقصد برای پیشنهادهای هوشمند مرحلهٔ ۱ تورساز
 * (موج ۱، قلم ۶: بنر و توضیحات پیشنهادی از مقصد).
 * فقط خواندن؛ هیچ تغییری در دیتابیس نمی‌دهد.
 */
export async function getDestinationContent(
  slug: string
): Promise<{ name: string; image: string; heroTagline: string; description: string } | null> {
  await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  const s = (slug || '').trim();
  if (!s) return null;
  const rows = await db.select().from(siteDestinations).where(eq(siteDestinations.slug, s)).limit(1);
  const r = rows[0];
  if (!r || r.deletedAt) return null;
  return {
    name: r.name,
    image: r.image || '',
    heroTagline: r.heroTagline || '',
    description: r.description || '',
  };
}

/**
 * پیشنهادهای هوشمند موج ۲ — همه فقط-خواندنی‌اند؛ هیچ‌کدام خودشان چیزی را در
 * فرم عوض نمی‌کنند. قانون طلایی: پیشنهاد با دکمه‌های «پذیرفتن»/«رد» دیده
 * می‌شود و تا مدیر تأیید نکند هیچ فیلدی دست نمی‌خورد.
 */

/** نگاشت category مقصد (اسلاگ تمیز دیتابیس) به type فرم تور. */
const DEST_CATEGORY_TO_TOUR_TYPE: Record<string, string> = {
  domestic: 'domestic',
  exhibition: 'exhibition',
};

export interface TourCategorySuggestion {
  destName: string;
  category: string;
  suggestedType: string;
}

/**
 * قلم ۱ موج ۲: دسته‌بندی تور از روی category مقصد.
 * توجه: ستون category دیتابیس اسلاگ تمیز دارد (asia/domestic/exhibition/…) و
 * مقدار قدیمی مثل «پکیج آماده» در آن نیست — آن مقدارها فقط در type_label
 * تورهای قدیمی دیده می‌شود که منبع این قلم نیست. اگر category خوانا/قابل‌نگاشت
 * نباشد (مثلاً 'region' یا مقصد ناشناس)، null برمی‌گردد و پیشنهادی داده نمی‌شود.
 */
export async function getTourCategorySuggestion(
  destSlug: string
): Promise<TourCategorySuggestion | null> {
  await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  const s = (destSlug || '').trim();
  if (!s) return null;
  const rows = await db.select().from(siteDestinations).where(eq(siteDestinations.slug, s)).limit(1);
  const r = rows[0];
  if (!r || r.deletedAt) return null;
  const category = (r.category || '').trim().toLowerCase();
  if (!category || category === 'region') return null;
  const suggestedType = DEST_CATEGORY_TO_TOUR_TYPE[category] ?? 'foreign';
  return { destName: r.name, category, suggestedType };
}

/** خواندنِ تحمل‌پذیر destination_slugs (گاهی ردیف‌های قدیمی رشتهٔ JSONِ دوباره‌کدشده‌اند). */
function destSlugsOf(v: unknown): string[] {
  if (Array.isArray(v)) return v.map((x) => String(x)).filter((x) => x.trim() !== '');
  if (typeof v === 'string') {
    try {
      const p = JSON.parse(v);
      return Array.isArray(p) ? p.map((x) => String(x)).filter((x) => String(x).trim() !== '') : [];
    } catch {
      return [];
    }
  }
  return [];
}

/** خواندنِ تحمل‌پذیر ستون‌های jsonb که گاهی رشته‌اند (trust_specs/consultant_spec). */
function jsonObjectOf(v: unknown): Record<string, unknown> {
  if (v && typeof v === 'object' && !Array.isArray(v)) return v as Record<string, unknown>;
  if (typeof v === 'string') {
    try {
      return jsonObjectOf(JSON.parse(v));
    } catch {
      return {};
    }
  }
  return {};
}

interface DestTourRow {
  id: string;
  title: string;
  price: number;
  departure: string;
  trustDocs: string[];
  consultantName: string;
  consultantTitle: string;
  consultantPhone: string;
}

/** تورهای زنده‌ای که مقصد داده‌شده را دارند؛ تازه‌ترین‌ها اول. فقط خواندن. */
async function liveToursForDest(destSlug: string, excludeId?: string | null): Promise<DestTourRow[]> {
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  const s = (destSlug || '').trim();
  if (!s) return [];
  const rows = await db
    .select({
      id: siteTours.id,
      title: siteTours.title,
      price: siteTours.price,
      destinationSlugs: siteTours.destinationSlugs,
      closestDeparture: siteTours.closestDeparture,
      trustSpecs: siteTours.trustSpecs,
      consultantSpec: siteTours.consultantSpec,
    })
    .from(siteTours)
    .where(isNull(siteTours.deletedAt))
    .orderBy(desc(siteTours.createdAt))
    .limit(300);
  return rows
    .filter((r) => r.id !== excludeId && destSlugsOf(r.destinationSlugs).includes(s))
    .map((r) => {
      const trust = jsonObjectOf(r.trustSpecs);
      const consultant = jsonObjectOf(r.consultantSpec);
      const docsRaw = trust.requiredDocs;
      return {
        id: r.id,
        title: r.title,
        price: Number(r.price) || 0,
        departure: r.closestDeparture || '',
        trustDocs: Array.isArray(docsRaw)
          ? docsRaw.map((d) => String(d).trim()).filter(Boolean)
          : [],
        consultantName: String(consultant.name || '').trim(),
        consultantTitle: String(consultant.title || '').trim(),
        consultantPhone: String(consultant.phone || '').trim(),
      };
    });
}

export interface TourPriceSuggestion {
  price: number;
  title: string;
  departure: string;
}

/**
 * قلم ۲ موج ۲: آخرین نرخ ثبت‌شده برای همان مقصد (نقطهٔ شروع قیمت).
 * منبع با عنوان تور ذکر می‌شود. نرخ هتلی جدا نداریم چون hotelId در داده‌های
 * فعلی همیشه خالی است و نام هتل‌ها متن آزاد است — پس سطح مقصد.
 */
export async function getTourPriceSuggestion(
  destSlug: string,
  excludeId?: string | null
): Promise<TourPriceSuggestion | null> {
  await requireAdmin(['owner', 'editor']);
  const withPrice = (await liveToursForDest(destSlug, excludeId)).filter((t) => t.price > 0);
  const latest = withPrice[0];
  if (!latest) return null;
  return { price: latest.price, title: latest.title, departure: latest.departure };
}

export interface TourDocsSuggestion {
  docs: string[];
  title: string;
}

/** قلم ۳ موج ۲: مدارک تور قبلی همین مقصد — مدیر انتخاب می‌کند کدام‌ها بیایند. */
export async function getTourDocsSuggestion(
  destSlug: string,
  excludeId?: string | null
): Promise<TourDocsSuggestion | null> {
  await requireAdmin(['owner', 'editor']);
  const withDocs = (await liveToursForDest(destSlug, excludeId)).filter((t) => t.trustDocs.length > 0);
  const latest = withDocs[0];
  if (!latest) return null;
  return { docs: latest.trustDocs, title: latest.title };
}

export interface TourConsultantSuggestion {
  name: string;
  title: string;
  phone: string;
  tourCount: number;
}

/**
 * قلم ۴ موج ۲: کارشناسی که در تورهای قبلی همین مقصد بیشتر تکرار شده.
 * اگر هیچ تور قبلی‌ای نام کارشناس نداشته باشد، null (پیشنهادی نمی‌دهیم).
 */
export async function getTourConsultantSuggestion(
  destSlug: string,
  excludeId?: string | null
): Promise<TourConsultantSuggestion | null> {
  await requireAdmin(['owner', 'editor']);
  const tours = await liveToursForDest(destSlug, excludeId);
  const byName = new Map<string, DestTourRow[]>();
  for (const t of tours) {
    if (!t.consultantName) continue;
    const list = byName.get(t.consultantName) ?? [];
    list.push(t);
    byName.set(t.consultantName, list);
  }
  let best: DestTourRow[] | null = null;
  for (const list of byName.values()) {
    if (!best || list.length > best.length) best = list;
  }
  if (!best) return null;
  // تازه‌ترین رکورد همان کارشناس، کامل‌ترین مشخصات را دارد.
  const freshest = best[0];
  return {
    name: freshest.consultantName,
    title: freshest.consultantTitle,
    phone: freshest.consultantPhone,
    tourCount: best.length,
  };
}

export async function listOrigins(): Promise<OriginRow[]> {
  await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  const rows = await db.select().from(originCities).where(isNull(originCities.deletedAt)).orderBy(asc(originCities.nameFa)).limit(500);
  // گشت (ایراد ۸): ردیف‌های هم‌نام (دادهٔ تکراری یا نوع متفاوت) در کمبوباکس مبدأ
  // دو بار دیده می‌شدند؛ تور فقط «نام» را ذخیره می‌کند، پس هم‌نام‌ها یکی می‌شوند.
  const seen = new Set<string>();
  return rows
    .map((r) => ({
      slug: r.slug,
      nameFa: r.nameFa,
      type: r.type,
      parentSlug: r.parentSlug ?? '',
    }))
    .filter((r) => {
      if (seen.has(r.nameFa)) return false;
      seen.add(r.nameFa);
      return true;
    });
}

/**
 * نتیجهٔ saveTour — خطاهای قابل‌پیش‌بینی (اعتبارسنجی، دیتابیس) به‌جای throw
 * به‌صورت مقدار برمی‌گردند، چون در بیلد پروداکشن پیامِ throw به کلاینت نمی‌رسد
 * و کاربر فقط «Minified React error #441» می‌بیند (ریشهٔ مشترک bugfix-441).
 */
export type SaveTourResult =
  | { ok: true; id: string | null; publishedRemaining: number }
  | { ok: false; error: string };

export async function saveTour(
  id: string | undefined | null,
  data: TourInput,
  /**
   * نیت صداکننده — گیت انتشار فقط روی همین قفل می‌شود، نه روی وضعیت ذخیره‌شده.
   * (رفع باگ بحرانی موج ۱، ۱۴۰۵/۰۷/۱۱: قبلاً گیت با `data.publishStatus==='published'`
   * سنجیده می‌شد؛ پس «ذخیره تغییرات» روی تورِ منتشرشده هم گیت می‌خورد و هر ویرایشی
   * که تور را موقتاً ناقص می‌کرد — مثل حذف هتل — کل ذخیره را رد می‌کرد و بعد از
   * ریلود تغییرات گم می‌شد. گیت مالِ «کنشِ انتشار» است، نه «ذخیره».)
   */
  intent: 'draft' | 'published' | 'keep' = 'keep',
): Promise<SaveTourResult> {
  await requireAdmin(['owner', 'editor']);
  const db = getDb();
  // ایراد D19: پیام فنی خام به کاربر نمی‌رسد؛ فارسیِ قابل‌فهم برمی‌گردد.
  if (!db) return { ok: false, error: 'اتصال به دیتابیس برقرار نیست؛ چند دقیقه دیگر تلاش کنید.' };
  const slug = (data.slug || '').trim();
  const title = (data.title || '').trim();
  if (!slug) return { ok: false, error: 'آدرس اینترنتی تور لازم است.' };
  // میز ۳ — ایراد ۱۰: نامک فارسی روی روت‌های سایت ۴۰۴ِ زنده می‌دهد؛ این‌جا رد می‌شود.
  try {
    assertLatinSlug(slug);
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'آدرس اینترنتی معتبر نیست.' };
  }
  if (title.length < 2) return { ok: false, error: 'عنوان تور لازم است.' };
  // بنر: آدرس دستی هم باید روی سایت باز شود، وگرنه پیش‌نمایش پنل دروغ می‌گوید.
  // پیام واقعی باید به کاربر برسد (نه #441) — پس throw این‌جا گرفته و به مقدار تبدیل می‌شود.
  try {
    assertRenderableImageUrl(data.image || '');
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'آدرس بنر معتبر نیست.' };
  }

  const destSlugs = asStringArray(data.destinationSlugs);
  const [destRows, originRows] = await Promise.all([
    db.select().from(siteDestinations).where(isNull(siteDestinations.deletedAt)).limit(2000),
    db.select().from(originCities).where(isNull(originCities.deletedAt)).limit(2000),
  ]);
  const destBySlug = new Map(destRows.map((r) => [r.slug, r]));
  const originBySlug = new Map(originRows.map((r) => [r.slug, r.nameFa]));
  const names = destSlugs.map((s) => destBySlug.get(s)?.name ?? s).filter(Boolean);
  const destination = names[0] ?? (data.destination || '');
  const originName = originBySlug.get(data.origin) ?? (data.origin || '');
  const route =
    names.length > 0
      ? originName
        ? `${originName} به ${names.join(' و ')}`
        : names.join(' و ')
      : data.route || '';

  const price = Math.max(0, Number(data.price) || 0);
  const hotelOptions = Array.isArray(data.hotelOptions) ? data.hotelOptions : [];

  // میز ۳ — ایراد ۱۲: هتل بایگانی‌شده را نمی‌شود به تور اضافه کرد؛
  // وگرنه روی سایت می‌ماند چون سایت snapshot را مستقیم رندر می‌کند.
  const hotelIds = [
    ...new Set(
      hotelOptions
        .map((h) => h?.hotelId)
        .filter((id): id is string => typeof id === 'string' && id.length > 0),
    ),
  ];
  if (hotelIds.length > 0) {
    const hotelStates = await db
      .select({ nameFa: accommodations.nameFa, deletedAt: accommodations.deletedAt })
      .from(accommodations)
      .where(inArray(accommodations.id, hotelIds));
    // شناسه‌ای که به هیچ ردیفی نرسید بی‌صدا رد نمی‌شود.
    if (hotelStates.length !== hotelIds.length) {
      return { ok: false, error: 'هتل پیدا نشد.' };
    }
    const archived = hotelStates.find((r) => r.deletedAt != null);
    if (archived) {
      return {
        ok: false,
        error: `هتل «${archived.nameFa}» بایگانی شده است؛ اول از صفحهٔ بایگانی بازیابیش کنید، بعد تور را ذخیره کنید.`,
      };
    }
  }
  let visaRequired = Boolean(data.visaRequired);
  // ایراد ۹: حدس خودکار (داخلی/خارجی بودن مقصد) فقط وقتی اعمال می‌شود که مدیر
  // تیک «نیاز به دریافت ویزا» را دستی لمس نکرده باشد؛ انتخاب دستی مدیر همیشه می‌ماند.
  // تورساز همین حدس را هنگام تغییر مقصد روی فرم اعمال می‌کند؛ این‌جا تورِ امنِ سمت سرور است.
  if (!data.visaRequiredManual && destSlugs.length > 0) {
    visaRequired = !destSlugs.every((s) => isDomesticSlug(s, destBySlug));
  }

  const carrier = (data.carrierName || data.airline || '').trim();
  // موج ۲، تیم تکراری‌ها: فرم یک کنترل واحد برای نشان می‌فرستد و data.badge همان
  // مقدار نهایی است؛ تیک دستی و متن دیگر جدا نیستند. fallbackِ تیک فقط برای ورودی‌های
  // قدیمی/خارجی است — هیچ بازنویسی بی‌صدایی در کار نیست.
  const badge = (data.badge || '').trim() || (data.guaranteedDeparture ? 'حرکت تضمین‌شده' : null);
  const normalizedHotels = hotelOptions.map((h) => {
    // ستارهٔ خالی یا نامعتبر هرگز حدس زده نمی‌شود؛ نبودن کلید یعنی «بدون درجه» و سایت «—» نشان می‌دهد.
    const starNum = Number(h.stars);
    const validStars = Number.isFinite(starNum) && starNum >= 0 && starNum <= 7 ? Math.round(starNum) : undefined;
    return {
      hotelId: h.hotelId ?? null,
      name: h.name ?? '',
      ...(validStars !== undefined ? { stars: validStars } : {}),
      board: h.board ?? 'BB',
    bookingType: h.bookingType === 'guarantee' || h.bookingType === 'semi_charter' || h.bookingType === 'on_request' ? h.bookingType : undefined,
    pricePerPerson: h.pricePerPerson || h.priceDouble || '',
    priceDouble: h.priceDouble || h.pricePerPerson || '',
    priceSingle: h.priceSingle || '',
    priceChildWithBed: h.priceChildWithBed || '',
    priceChildNoBed: h.priceChildNoBed || '',
    };
  });

  // مرحله‌های ۳ تا ۵ ویزارد: برنامه روزبه‌روز، سپر اعتماد و مشخصات کارشناس.
  // هر سه ستون jsonb روی site_tours آماده‌اند؛ این‌جا واقعاً نوشته می‌شوند.
  const normalizedItinerary: TourItineraryDayItem[] = Array.isArray(data.itineraryDays)
    ? data.itineraryDays.map((d, i) => {
        const o = (d ?? {}) as Partial<TourItineraryDayItem>;
        const descriptionRich = cleanRichValue(o.descriptionRich);
        // پشتیبان سرور: اگر متن تخت خالی است و غنی متن دارد، از همان ساخته
        // می‌شود تا ستون قدیمی/گیت انتشار/کد main بی‌متن نمانند.
        const plainDesc = String(o.description ?? '').trim();
        return {
          day: Number(o.day) || i + 1,
          title: String(o.title ?? ''),
          city: String(o.city ?? ''),
          description: plainDesc || richToPlainText(descriptionRich),
          ...(descriptionRich ? { descriptionRich } : {}),
          meals: o.meals ? String(o.meals) : undefined,
        };
      })
    : [];

  const rawTrust = (data.trustSpecs ?? {}) as Partial<TourTrustSpecsItem>;
  const normalizedTrust: TourTrustSpecsItem = {
    returnGuarantee: String(rawTrust.returnGuarantee ?? ''),
    cityTax: String(rawTrust.cityTax ?? ''),
    tipsNote: String(rawTrust.tipsNote ?? ''),
    luggageKg: Number(rawTrust.luggageKg) || 0,
    activityLevel: String(rawTrust.activityLevel ?? 'easy'),
    requiredDocs: asStringArray(rawTrust.requiredDocs),
  };

  const rawConsultant = (data.consultantSpec ?? {}) as Partial<TourConsultantSpecItem>;
  const normalizedConsultant: TourConsultantSpecItem = {
    name: String(rawConsultant.name ?? ''),
    title: String(rawConsultant.title ?? ''),
    phone: String(rawConsultant.phone ?? ''),
    audioUrl: String(rawConsultant.audioUrl ?? ''),
    emergencyPhone: String(rawConsultant.emergencyPhone ?? ''),
  };

  // گیت سرورِ انتشار (موج ۱، قلم ۲ — رفع ایراد QA سایه): فقط وقتی که نیتِ این
  // صدا واقعاً «انتشار» است. ذخیرهٔ ساده (keep) یا پیش‌نویس (draft) — حتی روی
  // تورِ منتشرشده — گیت نمی‌خورد؛ وگرنه مدیر نمی‌توانست ویرایشی را ذخیره کند که
  // تور را موقتاً ناقص می‌کند (باگ بحرانی موج ۱، ۱۴۰۵/۰۷/۱۱).
  // همان منطق خالص `checkPublishReadiness` این‌جا هم اجرا می‌شود تا منبع حقیقت
  // یکی بماند. خطای قابل‌پیش‌بینی throw نمی‌شود (قرارداد bugfix-441).
  if (intent === 'published') {
    const gateInput: PublishGateInput = {
      title,
      price,
      image: data.image || '',
      destinationSlugs: destSlugs,
      hotelOptions: normalizedHotels,
      itineraryDays: normalizedItinerary,
      trustSpecs: normalizedTrust,
      consultantSpec: normalizedConsultant,
    };
    const gate = checkPublishReadiness(gateInput);
    if (!gate.ready) {
      return {
        ok: false,
        error: `انتشار «${title}» ممکن نیست؛ این قلم‌ها ناقص‌اند: ${gate.missing.map((c) => c.label).join('، ')}.`,
      };
    }
  }

  const values = {
    slug,
    title,
    type: data.type || 'foreign',
    typeLabel: data.typeLabel || '',
    destinationSlugs: destSlugs,
    destination,
    origin: originName,
    route,
    // شیوهٔ سفر از انتخاب کاربر ذخیره می‌شود؛ بج جدول از همین خوانده می‌شود (T9).
    transportKind: data.transportKind || 'air',
    // موج ۲، تیم تکراری‌ها + رفع QA: duration مرجع است و از nights ساخته می‌شود؛
    // ولی اگر nights چیزی نساخت، متن قدیمیِ ذخیره‌شده حفظ می‌شود تا با یک
    // ذخیرهٔ ساده، دادهٔ دستیِ تورهای قدیمی بی‌صدا پاک نشود (آینهٔ منطق فرم).
    duration: buildDurationFromNights(Math.max(0, Number(data.nights) || 0)) || (data.duration || ''),
    nights: Math.max(0, Number(data.nights) || 0),
    closestDeparture: data.closestDeparture || '',
    price: String(price),
    status: data.status || 'pending',
    statusLabel: data.statusLabel || '',
    // شرایط انتشار (مایگریشن 0011): تور تازه همیشه پیش‌نویس است، مگر این‌که صراحتاً «انتشار» زده شود.
    publishStatus: (data.publishStatus === 'published' ? 'published' : 'draft') as 'draft' | 'published',
    image: data.image || '',
    badge,
    visaRequired,
    airline: carrier,
    includedServices: data.includedServices ?? [],
    excludedServices: data.excludedServices ?? [],
    hotelOptions: normalizedHotels,
    // پشتیبان سرور (تیم «فرم تورها»): متن تخت توضیحات تور اگر خالی است و نسخهٔ
    // غنی متن دارد، از همان ساخته می‌شود — ستون description قدیمی notNull است
    // و گیت انتشار/سایت/کد main روی همین متن تخت حساب می‌کنند.
    description: (data.description || '').trim() || richToPlainText(cleanRichValue(data.descriptionRich)),
    itineraryDays: normalizedItinerary,
    trustSpecs: normalizedTrust,
    consultantSpec: normalizedConsultant,
    updatedAt: new Date(),
  };

  // میز ۳ — ایراد ۲۶: بنر قبلیِ تور را فقط وقتی از باکت پاک می‌کنیم که رکورد
  // دیگر به آن اشاره نکند (یعنی همین ذخیره، image را عوض کرده باشد).
  let previousImage: string | null = null;
  if (id) {
    const [prev] = await db
      .select({ image: siteTours.image })
      .from(siteTours)
      .where(eq(siteTours.id, id))
      .limit(1);
    previousImage = prev?.image ?? null;
  }
  if (id) {
    await db.update(siteTours).set(values).where(eq(siteTours.id, id));
  } else {
    const inserted = await db.insert(siteTours).values(values).returning({ id: siteTours.id });
    id = inserted[0]?.id ?? id;
  }
  // ستون‌های تازه (0030/0033): فقط وقتی نگهبان می‌گوید هستند نوشته می‌شوند؛
  // قبل از اجرای مایگریشن، فرم کنار فیلدها اطلاع نشان می‌دهد و چیزی گم نمی‌شود.
  if (id) {
    await writeTourRichFields(db, id, data);
  }
  const oldImage = (previousImage || '').trim();
  const newImage = (values.image || '').trim();
  if (oldImage && newImage && oldImage !== newImage) {
    // فقط همین باکت و همین پیشوند (tours/)؛ بقیهٔ آدرس‌ها دست نمی‌خورند.
    await cleanupReplacedBanner(oldImage);
  }
  revalidatePath('/admin/tours');
  if (id) revalidatePath(`/admin/tours/${id}`);
  // قلم ۴ موج ۱: باقی‌ماندهٔ منتشرشده‌ها تا UI بفهمد «به صفر رسید» یا نه.
  return { ok: true, id: id ?? null, publishedRemaining: await countPublishedTours(db) };
}

/**
 * قلم ۴ موج ۱ (تصمیم ۴): تعداد تورهای منتشرشدهٔ زنده (حذف‌نشده).
 * تعریف «منتشرشده» دقیقاً همان گیت سایت است (مایگریشن 0011): فقط
 * publish_status='published'. ستون notNull است و مایگریشن همهٔ ردیف‌های قدیمی
 * را 'published' بک‌فیل کرده، پس حالت undefined عملاً پیش نمی‌آید.
 */
async function countPublishedTours(db: AppDb): Promise<number> {
  const rows = await db
    .select({ n: count() })
    .from(siteTours)
    .where(and(isNull(siteTours.deletedAt), eq(siteTours.publishStatus, 'published')));
  return rows[0]?.n ?? 0;
}

/** تعداد تورهای منتشرشده — برای بنر «همه پیش‌نویس» در صفحهٔ تورها. */
export async function getPublishedToursCount(): Promise<number> {
  await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  return countPublishedTours(db);
}

/**
 * قلم بخش ۲ کتابچه: ویرایش در جای «قیمت پایه» از جدول تورها.
 * فقط قیمت تومانی (همان که مشتری می‌بیند) را عوض می‌کند؛ بقیهٔ فیلدها دست نمی‌خورند.
 */
export async function updateTourPrice(id: string, price: number) {
  await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  const cleanId = (id || '').trim();
  if (!cleanId) throw new Error('تور مشخص نیست.');
  const amount = Math.round(Number(price));
  if (!Number.isFinite(amount) || amount < 0) throw new Error('قیمت باید عددی نامنفی باشد.');
  const rows = await db.select({ id: siteTours.id }).from(siteTours).where(eq(siteTours.id, cleanId)).limit(1);
  if (rows.length === 0) throw new Error('تور پیدا نشد.');
  const formatted = faPrice(amount);
  await db
    .update(siteTours)
    .set({ price: String(amount), updatedAt: new Date() })
    .where(eq(siteTours.id, cleanId));
  revalidatePath('/admin/tours');
  return { ok: true, price: amount, formattedPrice: formatted };
}

export async function deleteTour(id: string) {
  const session = await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  const rows = await db
    .select({ title: siteTours.title })
    .from(siteTours)
    .where(eq(siteTours.id, id))
    .limit(1);
  await archiveOne(db, siteTours, id, {
    actor: session.email,
    entity: 'site_tours',
    reasonFa: `بایگانی تور «${rows[0]?.title ?? id}»`,
  });
  revalidatePath('/admin/tours');
  // قلم ۴ موج ۱: باقی‌ماندهٔ منتشرشده‌ها تا UI بفهمد «به صفر رسید» یا نه.
  return { ok: true, publishedRemaining: await countPublishedTours(db) };
}

export async function checkSlugUnique(slug: string, excludeId?: string | null) {
  await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  const s = (slug || '').trim();
  if (!s) return { unique: false };
  const rows = await db.select().from(siteTours).where(eq(siteTours.slug, s)).limit(2);
  const taken = rows.some((r) => r.id !== excludeId);
  return { unique: !taken };
}

/**
 * عملیات گروهی تورها (T15): انتشار / لغو انتشار / بایگانی برای چند تور با هم.
 * - انتشار گروهی: گیت انتشار کامل روی هر تور اجرا می‌شود (موج ۱، قلم ۲ — بخش ۴
 *   پلن: «انتشار گروهی بدون گیت» ممنوع است). تورهای ناقص منتشر نمی‌شوند و در
 *   `skipped` با نامِ قلم‌های ناقص برمی‌گردند تا پنل به مدیر نشان بدهد.
 * - لغو انتشار گروهی: تورها از سایت پنهان می‌شوند ولی در فهرست می‌مانند.
 * - بایگانی گروهی: مستقیم انجام می‌شود (حتی برای تور منتشرشده)؛ تورها از سایت
 *   و فهرست‌ها پنهان می‌شوند و بعداً از صفحهٔ بایگانی برمی‌گردند.
 */
export async function setToursPublishStatusBulk(
  ids: string[],
  next: 'draft' | 'published',
): Promise<{ ok: true; count: number; skipped: Array<{ id: string; title: string; missing: string[] }>; publishedRemaining: number }> {
  const session = await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  if (next !== 'draft' && next !== 'published') throw new Error('وضعیت انتشار نامعتبر است.');
  const clean = [...new Set((ids || []).map((i) => (i || '').trim()).filter(Boolean))];
  if (clean.length === 0) throw new Error('توری انتخاب نشده است.');
  const skipped: Array<{ id: string; title: string; missing: string[] }> = [];
  let count = 0;
  if (next === 'published') {
    // گیت انتشار گروهی: هر تور جداگانه با همان چک‌لیست واحد سنجیده می‌شود.
    const rows = await db
      .select()
      .from(siteTours)
      .where(inArray(siteTours.id, clean));
    for (const r of rows) {
      const gate = checkPublishReadiness(toTourRow(r));
      if (!gate.ready) {
        skipped.push({ id: r.id, title: r.title, missing: gate.missing.map((c) => c.label) });
        continue;
      }
      await db
        .update(siteTours)
        .set({ publishStatus: next, updatedAt: new Date() })
        .where(eq(siteTours.id, r.id));
      count++;
    }
  } else {
    for (const id of clean) {
      await db
        .update(siteTours)
        .set({ publishStatus: next, updatedAt: new Date() })
        .where(eq(siteTours.id, id));
    }
    count = clean.length;
  }
  // F2: رکورد جمعی حسابرسی، مثل bulkUpdateLeads.
  await db.insert(auditLogs).values({
    actor: session.email,
    action: 'tour.publish_status',
    entity: 'site_tours',
    entityId: `${clean.length} تور`,
    reasonFa: `عملیات گروهی (${next === 'published' ? 'انتشار' : 'لغو انتشار'})`,
  });
  revalidatePath('/admin/tours');
  // قلم ۴ موج ۱: باقی‌ماندهٔ منتشرشده‌ها تا UI بفهمد «به صفر رسید» یا نه.
  return { ok: true, count, skipped, publishedRemaining: await countPublishedTours(db) };
}

export async function archiveToursBulk(ids: string[]): Promise<{ ok: true; count: number; publishedRemaining: number }> {
  const session = await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  const clean = [...new Set((ids || []).map((i) => (i || '').trim()).filter(Boolean))];
  if (clean.length === 0) throw new Error('توری انتخاب نشده است.');
  for (const id of clean) {
    const rows = await db
      .select({ title: siteTours.title })
      .from(siteTours)
      .where(eq(siteTours.id, id))
      .limit(1);
    if (rows.length === 0) continue;
    await archiveOne(db, siteTours, id, {
      actor: session.email,
      entity: 'site_tours',
      reasonFa: `بایگانی گروهی تور «${rows[0]?.title ?? id}»`,
    });
  }
  revalidatePath('/admin/tours');
  // قلم ۴ موج ۱: باقی‌ماندهٔ منتشرشده‌ها تا UI بفهمد «به صفر رسید» یا نه.
  return { ok: true, count: clean.length, publishedRemaining: await countPublishedTours(db) };
}
