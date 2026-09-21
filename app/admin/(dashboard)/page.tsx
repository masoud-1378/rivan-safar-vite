import type { Metadata } from 'next';
import Link from 'next/link';
import { and, count, eq, lte } from 'drizzle-orm';
import { ArrowLeft, BookOpen, BriefcaseBusiness, Globe2, Inbox, MapPinned } from 'lucide-react';
import { DashboardStats } from '@/components/blocks/dashboard-stats';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { formatToman, fa } from '@/lib/utils';
import { getDb } from '@/db/client';
import {
  accommodationOffers,
  exhibitions,
  guides,
  leadRequests,
  seoLandings,
  siteDestinations,
  siteTours,
  tourDepartures,
} from '@/db/schema';
import { requireAdmin } from '@/src/lib/admin-auth';

export const metadata: Metadata = {
  title: 'داشبورد | پنل ریوان سفر',
  robots: 'noindex,nofollow',
};

export default async function AdminDashboard() {
  await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');

  const [leads, tours, destinations, guidesCount, exhibitionsCount, drafts, departures, expiringPrices, recentLeads] = await Promise.all([
    db.select({ n: count() }).from(leadRequests),
    db.select({ n: count() }).from(siteTours),
    db.select({ n: count() }).from(siteDestinations),
    db.select({ n: count() }).from(guides),
    db.select({ n: count() }).from(exhibitions),
    db.select({ n: count() }).from(seoLandings).where(eq(seoLandings.workflow, 'draft')),
    db.select({ n: count() }).from(tourDepartures),
    db.select({ n: count() }).from(accommodationOffers).where(and(eq(accommodationOffers.priceStatus, 'confirmed'), lte(accommodationOffers.validUntil, new Date(Date.now() + 7 * 24 * 3600 * 1000)))),
    db.select().from(leadRequests).orderBy(leadRequests.createdAt).limit(5),
  ]);

  const stats = [
    { label: 'کل درخواست‌های تماس', value: fa(leads[0]?.n ?? 0), trend: [2, 3, 2, 5, 4, 6, 8] },
    { label: 'تورهای قابل مدیریت', value: fa(tours[0]?.n ?? 0), trend: [8, 9, 9, 10, 10, 11, 12] },
    { label: 'مقصدها و شهرها', value: fa(destinations[0]?.n ?? 0), trend: [5, 6, 7, 8, 8, 10, 11] },
    { label: 'مقاله و راهنما', value: fa(guidesCount[0]?.n ?? 0), trend: [1, 2, 2, 3, 3, 4, 4] },
  ];

  const quickLinks = [
    { href: '/admin/tours', label: 'مدیریت تورها', value: tours[0]?.n ?? 0, icon: BriefcaseBusiness },
    { href: '/admin/places', label: 'مقصدها و شهرها', value: destinations[0]?.n ?? 0, icon: MapPinned },
    { href: '/admin/guides', label: 'مقالات و راهنماها', value: guidesCount[0]?.n ?? 0, icon: BookOpen },
    { href: '/admin/exhibitions', label: 'نمایشگاه‌ها', value: exhibitionsCount[0]?.n ?? 0, icon: Globe2 },
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="mb-1 text-sm font-medium text-brand">مرکز کنترل ریوان سفر</p>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">داشبورد مدیریت</h1>
          <p className="mt-1 text-sm text-muted-foreground">محتوا، تورها و درخواست‌های مشتری را از یکجا مدیریت کنید.</p>
        </div>
        <Link href="/admin/leads" className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium transition hover:bg-accent">
          <Inbox className="size-4" /> مشاهده درخواست‌ها <ArrowLeft className="size-4" />
        </Link>
      </header>

      <DashboardStats items={stats} />

      <div className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <div><h2 className="font-semibold">دسترسی سریع</h2><p className="text-sm text-muted-foreground">بخش‌های اصلی محتوای سایت</p></div>
            <Badge variant="brand">زنده</Badge>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {quickLinks.map(({ href, label, value, icon: Icon }) => (
              <Link key={href} href={href} className="group flex items-center justify-between rounded-xl border border-border p-4 transition hover:border-brand hover:bg-accent/40">
                <span className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-lg bg-accent text-brand"><Icon className="size-5" /></span><span><span className="block font-medium">{label}</span><span className="text-xs text-muted-foreground">{fa(value)} رکورد</span></span></span>
                <ArrowLeft className="size-4 text-muted-foreground transition group-hover:-translate-x-1" />
              </Link>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <div className="mb-4"><h2 className="font-semibold">وضعیت سامانه</h2><p className="text-sm text-muted-foreground">مواردی که نیاز به توجه دارند</p></div>
          <div className="space-y-3 text-sm">
            <Link href="/admin/seo" className="flex items-center justify-between rounded-lg bg-accent/50 p-3 hover:bg-accent"><span>لندینگ‌های پیش‌نویس</span><Badge variant={Number(drafts[0]?.n ?? 0) ? 'warning' : 'success'}>{fa(drafts[0]?.n ?? 0)}</Badge></Link>
            <Link href="/admin/tours" className="flex items-center justify-between rounded-lg bg-accent/50 p-3 hover:bg-accent"><span>قیمت‌های رو به انقضا</span><Badge variant={Number(expiringPrices[0]?.n ?? 0) ? 'warning' : 'success'}>{fa(expiringPrices[0]?.n ?? 0)}</Badge></Link>
            <Link href="/admin/tours" className="flex items-center justify-between rounded-lg bg-accent/50 p-3 hover:bg-accent"><span>حرکت‌های ثبت‌شده</span><Badge variant="secondary">{fa(departures[0]?.n ?? 0)}</Badge></Link>
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-border p-5"><div><h2 className="font-semibold">آخرین درخواست‌های تماس</h2><p className="text-sm text-muted-foreground">پیگیری سریع سرنخ‌های جدید</p></div><Link href="/admin/leads" className="text-sm font-medium text-brand hover:underline">مشاهده همه</Link></div>
        <div className="divide-y divide-border">
          {recentLeads.length === 0 ? <p className="p-5 text-sm text-muted-foreground">هنوز درخواستی ثبت نشده است.</p> : recentLeads.map((lead) => <Link key={lead.id} href="/admin/leads" className="flex flex-wrap items-center justify-between gap-3 p-4 transition hover:bg-accent/40"><div><p className="font-medium">{lead.fullName}</p><p className="text-xs text-muted-foreground" dir="ltr">{lead.phone}</p></div><div className="text-left"><p className="text-sm">{lead.tourContext || lead.destinationHint || 'درخواست عمومی'}</p><p className="text-xs text-muted-foreground">{lead.status === 'new' ? 'جدید' : lead.status}</p></div></Link>)}
        </div>
      </Card>
    </div>
  );
}