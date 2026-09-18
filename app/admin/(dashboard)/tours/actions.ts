'use server';

import { revalidatePath } from 'next/cache';
import { getDb } from '@/db/client';
import {
  tourProducts,
  tourStops,
  productOriginCities,
  productServices,
  tourDepartures,
  routeSegments,
  accommodationOffers,
  auditLogs,
} from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { requireAdmin } from '@/src/lib/admin-auth';

function slugifyFa(input: string): string {
  return input
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\u0600-\u06FF\u0750-\u077Fa-zA-Z0-9-_]/g, '')
    .slice(0, 120);
}

export async function listProducts() {
  await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  return db.select().from(tourProducts).orderBy(desc(tourProducts.updatedAt)).limit(200);
}

export interface ProductInput {
  titleFa: string;
  slug?: string;
  tourKind: string;
  stops: Array<{ placeSlug: string; nights: number }>;
  originSlugs: string[];
  services: Array<{ slug: string; included: boolean }>;
}

/** مرحله ۱+۲ ویزارد: ساخت محصول با توقف‌ها، مبدأها و خدمات */
export async function createProduct(input: ProductInput) {
  const session = await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  const titleFa = input.titleFa.trim();
  if (titleFa.length < 4) throw new Error('عنوان تور حداقل ۴ نویسه باشد.');
  const slug = (input.slug || slugifyFa(titleFa)).trim();
  if (!slug) throw new Error('نامک (slug) معتبر نیست.');

  const [product] = await db
    .insert(tourProducts)
    .values({ titleFa, slug, tourKind: input.tourKind || 'foreign', status: 'draft' })
    .returning({ id: tourProducts.id });

  for (let i = 0; i < input.stops.length; i += 1) {
    const s = input.stops[i];
    if (!s.placeSlug) continue;
    await db.insert(tourStops).values({
      productId: product.id,
      placeSlug: s.placeSlug,
      stopOrder: i + 1,
      nights: Math.max(0, Number(s.nights) || 0),
    });
  }
  for (const o of input.originSlugs) {
    if (o) await db.insert(productOriginCities).values({ productId: product.id, originSlug: o });
  }
  for (const s of input.services) {
    if (s.slug) {
      await db.insert(productServices).values({
        productId: product.id,
        serviceSlug: s.slug,
        included: s.included,
      });
    }
  }
  await db.insert(auditLogs).values({
    actor: session.email,
    action: 'tour.create',
    entity: 'tour_products',
    entityId: product.id,
    reasonFa: `ساخت محصول: ${titleFa}`,
  });
  revalidatePath('/admin/tours');
  return { id: product.id, slug };
}

export interface DepartureInput {
  productId: string;
  departsAt?: string;
  returnsAt?: string;
  originSlug?: string;
  capacityTotal?: number;
}

/** مرحله ۳ ویزارد: ثبت حرکت واقعی */
export async function createDeparture(input: DepartureInput) {
  const session = await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  const [dep] = await db
    .insert(tourDepartures)
    .values({
      productId: input.productId,
      departsAt: input.departsAt ? new Date(input.departsAt) : null,
      returnsAt: input.returnsAt ? new Date(input.returnsAt) : null,
      originSlug: input.originSlug || null,
      capacityTotal: input.capacityTotal || null,
      capacityStatus: 'scheduled',
    })
    .returning({ id: tourDepartures.id });
  await db.insert(auditLogs).values({
    actor: session.email,
    action: 'tour.departure',
    entity: 'tour_departures',
    entityId: dep.id,
    reasonFa: 'ثبت حرکت',
  });
  revalidatePath('/admin/tours');
  return { id: dep.id };
}

export interface SegmentInput {
  departureId: string;
  transportKind: 'air' | 'land' | 'rail' | 'sea' | 'mixed';
  fromTerminalSlug?: string;
  toTerminalSlug?: string;
  carrierSlug?: string;
  isNonstop: boolean;
}

/** مرحله ۴ ویزارد: قطعه مسیر — مستقیم‌بودن فقط با تیک صریح */
export async function addSegment(input: SegmentInput) {
  const session = await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  const existing = await db
    .select()
    .from(routeSegments)
    .where(eq(routeSegments.departureId, input.departureId));
  const [seg] = await db
    .insert(routeSegments)
    .values({
      departureId: input.departureId,
      segmentOrder: existing.length + 1,
      transportKind: input.transportKind,
      fromTerminalSlug: input.fromTerminalSlug || null,
      toTerminalSlug: input.toTerminalSlug || null,
      carrierSlug: input.carrierSlug || null,
      isNonstop: input.isNonstop,
    })
    .returning({ id: routeSegments.id });
  await db.insert(auditLogs).values({
    actor: session.email,
    action: 'tour.segment',
    entity: 'route_segments',
    entityId: seg.id,
    reasonFa: `قطعه ${input.transportKind} ${input.isNonstop ? 'مستقیم' : 'با توقف'}`,
  });
  revalidatePath('/admin/tours');
  return { id: seg.id };
}

export interface OfferInput {
  departureId: string;
  accommodationSlug?: string;
  board?: string;
  nights: number;
  priceStatus: 'confirmed' | 'on_request' | 'under_review' | 'expired';
  priceAmount?: number;
  validUntil?: string;
}

/**
 * مرحله ۵ ویزارد: پیشنهاد اقامت و قیمت.
 * قانون سند ۰۵: قیمت confirmed بدون مبلغ و تاریخ اعتبار ثبت نمی‌شود.
 */
export async function addOffer(input: OfferInput) {
  const session = await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  if (input.priceStatus === 'confirmed') {
    if (!input.priceAmount || input.priceAmount <= 0) {
      throw new Error('قیمت قطعی بدون مبلغ معتبر ثبت نمی‌شود.');
    }
    if (!input.validUntil) {
      throw new Error('قیمت قطعی بدون تاریخ اعتبار ثبت نمی‌شود.');
    }
  }
  const [offer] = await db
    .insert(accommodationOffers)
    .values({
      departureId: input.departureId,
      accommodationSlug: input.accommodationSlug || null,
      board: input.board || null,
      nights: Math.max(0, Number(input.nights) || 0),
      priceStatus: input.priceStatus,
      priceAmount: input.priceAmount ? String(input.priceAmount) : null,
      reviewedAt: new Date(),
      validUntil: input.validUntil ? new Date(input.validUntil) : null,
    })
    .returning({ id: accommodationOffers.id });
  await db.insert(auditLogs).values({
    actor: session.email,
    action: 'tour.offer',
    entity: 'accommodation_offers',
    entityId: offer.id,
    reasonFa: `ثبت پیشنهاد با وضعیت ${input.priceStatus}`,
  });
  revalidatePath('/admin/tours');
  return { id: offer.id };
}

export interface GateCheck {
  hasDeparture: boolean;
  hasSegment: boolean;
  hasOffer: boolean;
  canPublish: boolean;
  reasons: string[];
}

/** Gate انتشار سند ۰۱: حرکت آینده + مسیر + پیشنهاد معتبر */
export async function checkPublishGate(productId: string): Promise<GateCheck> {
  await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  const reasons: string[] = [];
  const deps = await db
    .select()
    .from(tourDepartures)
    .where(eq(tourDepartures.productId, productId));
  const hasDeparture = deps.length > 0;
  if (!hasDeparture) reasons.push('حداقل یک حرکت ثبت نشده است.');
  let hasSegment = false;
  let hasOffer = false;
  for (const d of deps) {
    const segs = await db
      .select({ id: routeSegments.id })
      .from(routeSegments)
      .where(eq(routeSegments.departureId, d.id));
    if (segs.length > 0) hasSegment = true;
    const offers = await db
      .select({ id: accommodationOffers.id })
      .from(accommodationOffers)
      .where(eq(accommodationOffers.departureId, d.id));
    if (offers.length > 0) hasOffer = true;
  }
  if (hasDeparture && !hasSegment) reasons.push('هیچ قطعه مسیری ثبت نشده است.');
  if (hasDeparture && !hasOffer) reasons.push('هیچ پیشنهاد اقامت/قیمتی ثبت نشده است.');
  return { hasDeparture, hasSegment, hasOffer, canPublish: reasons.length === 0, reasons };
}

export async function setProductStatus(productId: string, status: 'draft' | 'review' | 'published' | 'paused' | 'archived') {
  const session = await requireAdmin(['owner', 'editor']);
  if (status === 'published') {
    const gate = await checkPublishGate(productId);
    if (!gate.canPublish) {
      throw new Error('Gate انتشار پاس نشد: ' + gate.reasons.join(' '));
    }
  }
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  await db.update(tourProducts).set({ status, updatedAt: new Date() }).where(eq(tourProducts.id, productId));
  await db.insert(auditLogs).values({
    actor: session.email,
    action: 'tour.status',
    entity: 'tour_products',
    entityId: productId,
    reasonFa: `تغییر وضعیت به ${status}`,
  });
  revalidatePath('/admin/tours');
  return { ok: true };
}
