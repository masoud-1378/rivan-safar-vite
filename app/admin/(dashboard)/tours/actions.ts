'use server';

import { revalidatePath } from 'next/cache';
import { getDb } from '@/db/client';
import { siteTours } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';
import { requireAdmin } from '@/src/lib/admin-auth';

export interface TourInput {
  slug: string;
  title: string;
  type: string;
  typeLabel: string;
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

function asStringArray(v: unknown): string[] {
  if (Array.isArray(v)) return v.map((x) => String(x)).filter((x) => x.trim() !== '');
  return [];
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

export async function saveTour(id: string | undefined | null, data: TourInput) {
  await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');
  const slug = (data.slug || '').trim();
  const title = (data.title || '').trim();
  if (!slug) throw new Error('نامک (slug) لازم است.');
  if (title.length < 2) throw new Error('عنوان تور لازم است.');

  const values = {
    slug,
    title,
    type: data.type || 'foreign',
    typeLabel: data.typeLabel || '',
    destination: data.destination || '',
    origin: data.origin || '',
    route: data.route || '',
    duration: data.duration || '',
    nights: Math.max(0, Number(data.nights) || 0),
    closestDeparture: data.closestDeparture || '',
    price: String(Math.max(0, Number(data.price) || 0)),
    formattedPrice: data.formattedPrice || '',
    priceNote: data.priceNote || '',
    status: data.status || 'pending',
    statusLabel: data.statusLabel || '',
    image: data.image || '',
    badge: data.badge || null,
    features: data.features ?? [],
    visaRequired: Boolean(data.visaRequired),
    hotelStars: Math.max(0, Number(data.hotelStars) || 0),
    airline: data.airline || '',
    includedServices: data.includedServices ?? [],
    excludedServices: data.excludedServices ?? [],
    hotelOptions: data.hotelOptions ?? [],
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
