'use server';

import { revalidatePath } from 'next/cache';
import { getDb } from '@/db/client';
import { accommodations, originCities, siteDestinations, siteTours } from '@/db/schema';
import { asc, desc, eq } from 'drizzle-orm';
import { requireAdmin } from '@/src/lib/admin-auth';

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
  formattedPrice: string;
  priceNote: string;
  status: string;
  statusLabel: string;
  image: string;
  badge: string;
  features: string[];
  visaRequired: boolean;
  hotelStars: number;
  airline: string;
  includedServices: string[];
  excludedServices: string[];
  hotelOptions: Array<{ name?: string; stars?: number; board?: string; pricePerPerson?: string }>;
  description: string;
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

export interface HotelRow extends Record<string, unknown> {
  id: string;
  slug: string;
  nameFa: string;
  stars: number;
  placeSlug: string;
}

function asStringArray(v: unknown): string[] {
  if (Array.isArray(v)) return v.map((x) => String(x)).filter((x) => x.trim() !== '');
  return [];
}

const FA_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

function faPrice(n: unknown): string {
  const grouped = Math.max(0, Math.round(Number(n) || 0)).toLocaleString('en-US');
  return grouped.replace(/\d/g, (d) => FA_DIGITS[Number(d)]).replace(/,/g, '٬');
}

const DOMESTIC_SLUGS = [
  'iran',
  'kish',
  'mashhad',
  'qeshm',
  'qeshm-island',
  'shiraz',
  'isfahan',
  'yazd',
  'tabriz',
  'chabahar',
  'kerman',
  'ahvaz',
  'rasht',
  'hamedan',
];

const DOMESTIC_NAME_RE = /کیش|مشهد|قشم|شیراز|اصفهان|یزد|تبریز|چابهار|کرمان|اهواز|رشت|همدان|ایران/;

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

export async function listTours() {
  await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  const rows = await db.select().from(siteTours).orderBy(desc(siteTours.updatedAt)).limit(300);
  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    type: r.type,
    typeLabel: r.typeLabel,
    destinationSlugs: asStringArray(r.destinationSlugs),
    destination: r.destination,
    origin: r.origin,
    route: r.route,
    duration: r.duration,
    nights: r.nights,
    closestDeparture: r.closestDeparture,
    price: Number(r.price),
    formattedPrice: r.formattedPrice,
    priceNote: r.priceNote,
    status: r.status,
    statusLabel: r.statusLabel,
    image: r.image,
    badge: r.badge ?? '',
    features: asStringArray(r.features),
    visaRequired: r.visaRequired,
    hotelStars: r.hotelStars,
    airline: r.airline,
    includedServices: asStringArray(r.includedServices),
    excludedServices: asStringArray(r.excludedServices),
    hotelOptions: Array.isArray(r.hotelOptions) ? r.hotelOptions : [],
    description: r.description,
  }));
}

export type TourRow = Awaited<ReturnType<typeof listTours>>[number];

export async function listDestinationTree(): Promise<DestinationTree> {
  await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  const rows = await db.select().from(siteDestinations).orderBy(asc(siteDestinations.name)).limit(1000);
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

export async function listOrigins(): Promise<OriginRow[]> {
  await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  const rows = await db.select().from(originCities).orderBy(asc(originCities.nameFa)).limit(500);
  return rows.map((r) => ({
    slug: r.slug,
    nameFa: r.nameFa,
    type: r.type,
    parentSlug: r.parentSlug ?? '',
  }));
}

export async function saveTour(id: string | undefined | null, data: TourInput) {
  await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  const slug = (data.slug || '').trim();
  const title = (data.title || '').trim();
  if (!slug) throw new Error('نامک (slug) لازم است.');
  if (title.length < 2) throw new Error('عنوان تور لازم است.');

  const destSlugs = asStringArray(data.destinationSlugs);
  const [destRows, originRows] = await Promise.all([
    db.select().from(siteDestinations).limit(2000),
    db.select().from(originCities).limit(2000),
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
  const hotelStars = hotelOptions.reduce((m, h) => Math.max(m, Number(h?.stars) || 0), 0);

  let visaRequired = Boolean(data.visaRequired);
  if (destSlugs.length > 0) {
    visaRequired = !destSlugs.every((s) => isDomesticSlug(s, destBySlug));
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
    duration: data.duration || '',
    nights: Math.max(0, Number(data.nights) || 0),
    closestDeparture: data.closestDeparture || '',
    price: String(price),
    formattedPrice: faPrice(price),
    priceNote: 'برای هر بزرگسال در اتاق دو تخته',
    status: data.status || 'pending',
    statusLabel: data.statusLabel || '',
    image: data.image || '',
    badge: data.badge || null,
    features: data.features ?? [],
    visaRequired,
    hotelStars,
    airline: data.airline || '',
    includedServices: data.includedServices ?? [],
    excludedServices: data.excludedServices ?? [],
    hotelOptions,
    description: data.description || '',
    updatedAt: new Date(),
  };

  if (id) {
    await db.update(siteTours).set(values).where(eq(siteTours.id, id));
  } else {
    await db.insert(siteTours).values(values);
  }
  revalidatePath('/admin/tours');
  return { ok: true };
}

export async function deleteTour(id: string) {
  await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  await db.delete(siteTours).where(eq(siteTours.id, id));
  revalidatePath('/admin/tours');
  return { ok: true };
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
