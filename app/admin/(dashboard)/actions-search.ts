'use server';

import { or, count, desc, ilike, gte, sql } from 'drizzle-orm';
import { getDb } from '@/db/client';
import { guides, leadRequests, siteDestinations, siteTours } from '@/db/schema';
import { requireAdmin } from '@/src/lib/admin-auth';

export interface AdminSearchHit {
  id: string;
  kind: 'tour' | 'lead' | 'destination';
  title: string;
  subtitle: string;
  href: string;
}

function norm(value: string) {
  return value.trim().replace(/[يى]/g, 'ی').replace(/ك/g, 'ک').replace(/[‌‏‎]/g, '');
}

/** جست‌وجوی سراسری پنل برای پالت فرمان. Only admins; capped result set. */
export async function searchAdmin(term: string): Promise<AdminSearchHit[]> {
  await requireAdmin(['owner', 'editor']);
  const q = norm(term);
  if (q.length < 2) return [];

  const db = getDb();
  if (!db) return [];
  const like = `%${q}%`;

  const [tours, leads, places] = await Promise.all([
    db
      .select({ id: siteTours.id, title: siteTours.title, slug: siteTours.slug, status: siteTours.status, price: siteTours.price })
      .from(siteTours)
      .where(or(ilike(siteTours.title, like), ilike(siteTours.slug, like)))
      .orderBy(desc(siteTours.updatedAt))
      .limit(6),
    db
      .select({ id: leadRequests.id, name: leadRequests.fullName, phone: leadRequests.phone, createdAt: leadRequests.createdAt })
      .from(leadRequests)
      .where(or(ilike(leadRequests.fullName, like), ilike(leadRequests.phone, like)))
      .orderBy(desc(leadRequests.createdAt))
      .limit(6),
    db
      .select({ id: siteDestinations.id, name: siteDestinations.name, slug: siteDestinations.slug, type: siteDestinations.type })
      .from(siteDestinations)
      .where(or(ilike(siteDestinations.name, like), ilike(siteDestinations.slug, like)))
      .orderBy(desc(siteDestinations.updatedAt))
      .limit(6),
  ]);

  const hits: AdminSearchHit[] = [];
  for (const t of tours) {
    hits.push({
      id: `tour-${t.id}`,
      kind: 'tour',
      title: t.title,
      subtitle: `تور${t.status ? ` · ${t.status}` : ''}`,
      href: `/admin/tours?edit=${t.id}`,
    });
  }
  for (const l of leads) {
    hits.push({
      id: `lead-${l.id}`,
      kind: 'lead',
      title: l.name || 'بدون نام',
      subtitle: `درخواست تماس · ${l.phone}`,
      href: '/admin/leads',
    });
  }
  for (const p of places) {
    hits.push({
      id: `place-${p.id}`,
      kind: 'destination',
      title: p.name,
      subtitle: p.type === 'country' ? 'کشور' : 'شهر',
      href: `/admin/places?edit=${p.id}`,
    });
  }
  return hits;
}

/** سری زمانی روزانه برای داشبورد: تعداد رکورد جدید هر موجودیت در ۳۰ روز گذشته. */
export async function getDashboardTrend(days = 30) {
  await requireAdmin(['owner', 'editor']);
  const empty = { labels: [] as string[], leads: [] as number[], tours: [] as number[], destinations: [] as number[], guides: [] as number[] };
  const db = getDb();
  if (!db) return empty;

  const since = new Date();
  since.setHours(0, 0, 0, 0);
  since.setDate(since.getDate() - (days - 1));

  const daily = <T extends { createdAt: unknown }>(col: T) =>
    sql`date_trunc('day', ${col})`;

  const leadDay = daily({ createdAt: leadRequests.createdAt });
  const tourDay = daily({ createdAt: siteTours.createdAt });
  const destDay = daily({ createdAt: siteDestinations.createdAt });
  const guideDay = daily({ createdAt: guides.createdAt });

  const [leadRows, tourRows, destRows, guideRows] = await Promise.all([
    db
      .select({ day: sql<string>`to_char(${leadDay}, 'YYYY-MM-DD')`, n: count() })
      .from(leadRequests)
      .where(gte(leadRequests.createdAt, since))
      .groupBy(leadDay)
      .orderBy(leadDay),
    db
      .select({ day: sql<string>`to_char(${tourDay}, 'YYYY-MM-DD')`, n: count() })
      .from(siteTours)
      .where(gte(siteTours.createdAt, since))
      .groupBy(tourDay)
      .orderBy(tourDay),
    db
      .select({ day: sql<string>`to_char(${destDay}, 'YYYY-MM-DD')`, n: count() })
      .from(siteDestinations)
      .where(gte(siteDestinations.createdAt, since))
      .groupBy(destDay)
      .orderBy(destDay),
    db
      .select({ day: sql<string>`to_char(${guideDay}, 'YYYY-MM-DD')`, n: count() })
      .from(guides)
      .where(gte(guides.createdAt, since))
      .groupBy(guideDay)
      .orderBy(guideDay),
  ]);

  const toMap = (rows: Array<{ day: string; n: number }>) => new Map(rows.map((r) => [r.day, Number(r.n)]));
  const leadMap = toMap(leadRows);
  const tourMap = toMap(tourRows);
  const destMap = toMap(destRows);
  const guideMap = toMap(guideRows);

  const labels: string[] = [];
  const leads: number[] = [];
  const toursSeries: number[] = [];
  const destinations: number[] = [];
  const guidesSeries: number[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    labels.push(key);
    leads.push(leadMap.get(key) ?? 0);
    toursSeries.push(tourMap.get(key) ?? 0);
    destinations.push(destMap.get(key) ?? 0);
    guidesSeries.push(guideMap.get(key) ?? 0);
  }
  return { labels, leads, tours: toursSeries, destinations, guides: guidesSeries };
}
