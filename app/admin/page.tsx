import type { Metadata } from 'next';
import Link from 'next/link';
import { getDb } from '@/db/client';
import { leadRequests, tourDepartures, accommodationOffers, seoLandings } from '@/db/schema';
import { eq, count, and, lte } from 'drizzle-orm';
import { requireAdmin } from '@/src/lib/admin-auth';

export const metadata: Metadata = {
  title: 'داشبورد | پنل ریوان سفر',
  robots: 'noindex,nofollow',
};

export default async function AdminDashboard() {
  await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');

  const [newLeads] = await db
    .select({ n: count() })
    .from(leadRequests)
    .where(eq(leadRequests.status, 'new'));
  const [expiringPrices] = await db
    .select({ n: count() })
    .from(accommodationOffers)
    .where(
      and(
        eq(accommodationOffers.priceStatus, 'confirmed'),
        lte(accommodationOffers.validUntil, new Date(Date.now() + 7 * 24 * 3600 * 1000)),
      ),
    );
  const [draftLandings] = await db
    .select({ n: count() })
    .from(seoLandings)
    .where(eq(seoLandings.workflow, 'draft'));
  const [departures] = await db.select({ n: count() }).from(tourDepartures);

  const cards = [
    { label: 'درخواست‌های جدید', value: newLeads.n, href: '/admin/leads', hint: 'نیازمند پیگیری' },
    { label: 'قیمت‌های رو به انقضا (۷ روز)', value: expiringPrices.n, href: '/admin/tours', hint: 'اعتبار را تمدید کنید' },
    { label: 'لندینگ‌های پیش‌نویس', value: draftLandings.n, href: '/admin/seo', hint: 'منتظر بازبینی' },
    { label: 'حرکت‌های ثبت‌شده', value: departures.n, href: '/admin/tours', hint: 'مدیریت تورها' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-h2 font-bold text-text-heading">داشبورد</h1>
        <p className="text-body-sm text-text-secondary mt-1">
          کارهای نیازمند اقدام امروز — نمودار تزئینی نداریم.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="bg-surface-primary border border-border-default rounded-card p-5 hover:shadow-card hover:-translate-y-0.5 transition-all"
          >
            <div className="text-h1 font-extrabold text-brand-orange">{c.value}</div>
            <div className="text-body font-bold text-text-heading mt-1">{c.label}</div>
            <div className="text-caption text-text-secondary mt-0.5">{c.hint}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
