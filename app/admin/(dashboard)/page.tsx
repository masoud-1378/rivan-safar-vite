import type { Metadata } from 'next';
import Link from 'next/link';
import { and, count, eq, lte } from 'drizzle-orm';
import { ArrowLeft, BookOpen, BriefcaseBusiness, Globe2, Inbox, MapPinned } from 'lucide-react';
import { DashboardStats } from '@/components/blocks/dashboard-stats';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { BarChart } from '@/components/ui/chart';
import { formatJalali } from '@/lib/jalali';
import { formatToman, fa } from '@/lib/utils';
import { getDashboardTrend } from './actions-search';
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

const LEAD_STATUS_LABELS: Record<string, string> = {
  new: 'جدید',
  contacted: 'تماس گرفته شد',
  qualified: 'مخاطب واجد شرایط',
  won: 'تبدیل به مشتری',
  lost: 'از دست رفته',
  invalid: 'نامعتبر',
};

export default async function AdminDashboard() {
  await requireAdmin(['owner', 'editor']);
  const db = getDb();

  // هر کوئری با تایم‌اوت جدا؛ اگر دیتابیس کند/قطع بود داشبورد با صفر بالا می‌آید نه خطای ۵۰۰
  async function safeCount(run: () => Promise<Array<{ n: unknown }>>): Promise<number> {
    if (!db) return 0;
    try {
      const rows = await Promise.race([
        run(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('db-timeout')), 8000),
        ),
      ]);
      return Number(rows[0]?.n ?? 0);
    } catch {
      return 0;
    }
  }

  let recentLeads: Array<{
    id: string;
    fullName: string;
    phone: string;
    tourContext: string | null;
    destinationHint: string | null;
    status: string;
  }> = [];
  let dbDown = false;
  let leads = 0;
  let tours = 0;
  let destinations = 0;
  let guidesCount = 0;
  let exhibitionsCount = 0;
  let drafts = 0;
  let departures = 0;
  let expiringPrices = 0;
  let trend = { labels: [] as string[], leads: [] as number[], tours: [] as number[], destinations: [] as number[], guides: [] as number[] };

  if (db) {
    // ترتیبی اجرا می‌شوند تا روی اتصال تکی serverless قفل نکنند
    leads = await safeCount(() => db.select({ n: count() }).from(leadRequests));
    tours = await safeCount(() => db.select({ n: count() }).from(siteTours));
    destinations = await safeCount(() => db.select({ n: count() }).from(siteDestinations));
    guidesCount = await safeCount(() => db.select({ n: count() }).from(guides));
    exhibitionsCount = await safeCount(() => db.select({ n: count() }).from(exhibitions));
    drafts = await safeCount(() =>
      db.select({ n: count() }).from(seoLandings).where(eq(seoLandings.workflow, 'draft')),
    );
    departures = await safeCount(() => db.select({ n: count() }).from(tourDepartures));
    expiringPrices = await safeCount(() =>
      db
        .select({ n: count() })
        .from(accommodationOffers)
        .where(
          and(
            eq(accommodationOffers.priceStatus, 'confirmed'),
            lte(accommodationOffers.validUntil, new Date(Date.now() + 7 * 24 * 3600 * 1000)),
          ),
        ),
    );
    try {
      recentLeads = await Promise.race([
        db.select().from(leadRequests).orderBy(leadRequests.createdAt).limit(5),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('db-timeout')), 8000),
        ),
      ]);
    } catch {
      recentLeads = [];
    }
    dbDown =
      leads === 0 &&
      tours === 0 &&
      destinations === 0 &&
      guidesCount === 0 &&
      exhibitionsCount === 0;
  } else {
    dbDown = true;
  }

  if (!dbDown) {
    try {
      trend = await getDashboardTrend(30);
    } catch {
      trend = { labels: [], leads: [], tours: [], destinations: [], guides: [] };
    }
  }

  const last7 = (series: number[]) => {
    const slice = series.slice(-7);
    return slice.length ? slice : [0, 0, 0, 0, 0, 0, 0];
  };

  const stats = [
    { label: 'کل درخواست‌های تماس', value: fa(leads), trend: last7(trend.leads) },
    { label: 'تورهای قابل مدیریت', value: fa(tours), trend: last7(trend.tours) },
    { label: 'مقصدها و شهرها', value: fa(destinations), trend: last7(trend.destinations) },
    { label: 'مقاله و راهنما', value: fa(guidesCount), trend: last7(trend.guides) },
  ];

  const leadSeries = trend.labels.map((key, i) => ({
    label: formatJalali(new Date(key), { year: false }).split(' ')[0],
    value: trend.leads[i] ?? 0,
  }));

  const quickLinks = [
    { href: '/admin/tours', label: 'مدیریت تورها', value: tours, icon: BriefcaseBusiness },
    { href: '/admin/places', label: 'مقصدها و شهرها', value: destinations, icon: MapPinned },
    { href: '/admin/guides', label: 'مقالات و راهنماها', value: guidesCount, icon: BookOpen },
    { href: '/admin/exhibitions', label: 'نمایشگاه‌ها', value: exhibitionsCount, icon: Globe2 },
  ];

  return (
    <div className="space-y-6">
      {dbDown ? (
        <div className="rounded-xl border border-warning/40 bg-warning/10 p-4 text-sm">
          اتصال به دیتابیس در این لحظه برقرار نشد؛ آمار صفر نمایش داده می‌شود. چند لحظه بعد صفحه را تازه کنید.
        </div>
      ) : null}
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="mb-1 text-sm font-medium text-brand">مرکز کنترل ریوان سفر</p>
          <h1 className="text-2xl font-bold sm:text-3xl">داشبورد مدیریت</h1>
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
            <Link href="/admin/seo" className="flex items-center justify-between rounded-lg bg-accent/50 p-3 hover:bg-accent"><span>لندینگ‌های پیش‌نویس</span><Badge variant={Number(drafts) ? 'warning' : 'success'}>{fa(drafts)}</Badge></Link>
            <Link href="/admin/tours" className="flex items-center justify-between rounded-lg bg-accent/50 p-3 hover:bg-accent"><span>قیمت‌های رو به انقضا</span><Badge variant={Number(expiringPrices) ? 'warning' : 'success'}>{fa(expiringPrices)}</Badge></Link>
            <Link href="/admin/tours" className="flex items-center justify-between rounded-lg bg-accent/50 p-3 hover:bg-accent"><span>حرکت‌های ثبت‌شده</span><Badge variant="secondary">{fa(departures)}</Badge></Link>
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="font-semibold">روند درخواست‌های تماس</h2>
            <p className="text-sm text-muted-foreground">درخواست‌های ثبت‌شده در {fa(30)} روز گذشته، بر پایه‌ی تاریخ شمسی</p>
          </div>
          <Link href="/admin/leads" className="text-sm font-medium text-brand hover:underline">همه‌ی درخواست‌ها</Link>
        </div>
        {leadSeries.some((p) => p.value > 0) ? (
          <BarChart data={leadSeries} height={200} highlight={leadSeries.length - 1} />
        ) : (
          <p className="py-12 text-center text-sm text-muted-foreground">در ۳۰ روز گذشته درخواستی ثبت نشده است.</p>
        )}
      </Card>

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-border p-5"><div><h2 className="font-semibold">آخرین درخواست‌های تماس</h2><p className="text-sm text-muted-foreground">پیگیری سریع سرنخ‌های جدید</p></div><Link href="/admin/leads" className="text-sm font-medium text-brand hover:underline">مشاهده همه</Link></div>
        <div className="divide-y divide-border">
          {recentLeads.length === 0 ? <p className="p-5 text-sm text-muted-foreground">هنوز درخواستی ثبت نشده است.</p> : recentLeads.map((lead) => <Link key={lead.id} href="/admin/leads" className="flex flex-wrap items-center justify-between gap-3 p-4 transition hover:bg-accent/40"><div><p className="font-medium">{lead.fullName}</p><p className="text-xs text-muted-foreground" dir="ltr">{fa(lead.phone)}</p></div><div className="text-end"><p className="text-sm">{lead.tourContext || lead.destinationHint || 'درخواست عمومی'}</p><p className="text-xs text-muted-foreground">{LEAD_STATUS_LABELS[lead.status] ?? lead.status}</p></div></Link>)}
        </div>
      </Card>
    </div>
  );
}