import type { Metadata } from 'next';
import { getDb } from '@/db/client';
import { auditLogs } from '@/db/schema';
import { desc, count, eq } from 'drizzle-orm';
import { requireAdmin } from '@/src/lib/admin-auth';

export const metadata: Metadata = {
  title: 'گزارش تغییرات | پنل ریوان سفر',
  robots: 'noindex,nofollow',
};

export default async function AdminAuditPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requireAdmin(['owner', 'editor']);
  const db = getDb();
  if (!db) throw new Error('DB_NOT_CONFIGURED');

  const page = parseInt((await searchParams).page || '1', 10);
  const perPage = 30;
  const offset = (page - 1) * perPage;

  const [total] = await db.select({ n: count() }).from(auditLogs);
  const totalPages = Math.ceil(total.n / perPage);
  const logs = await db
    .select()
    .from(auditLogs)
    .orderBy(desc(auditLogs.createdAt))
    .limit(perPage)
    .offset(offset);

  const entityLabels: Record<string, string> = {
    tour_products: 'محصول تور',
    tour_departures: 'حرکت تور',
    route_segments: 'قطعه مسیر',
    accommodation_offers: 'پیشنهاد اقامت',
    seo_landings: 'لندینگ سئو',
    lead_requests: 'درخواست تماس',
    admin_users: 'مدیر',
  };

  const actionLabels: Record<string, string> = {
    'tour.create': 'ساخت تور',
    'tour.departure': 'ثبت حرکت',
    'tour.segment': 'افزودن مسیر',
    'tour.offer': 'ثبت پیشنهاد',
    'tour.status': 'تغییر وضعیت تور',
    'lead.status': 'تغییر وضعیت لید',
    'catalog.place': 'مکان',
    'catalog.origin': 'مبدأ',
    'catalog.carrier': 'شرکت حمل‌ونقل',
    'catalog.hotel': 'هتل',
    'catalog.place.delete': 'حذف مکان',
    'settings.update': 'تنظیمات',
  };

  return (
    <div className="admin-enter space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">گزارش تغییرات (Audit Log)</h1>
        <p className="text-sm text-muted-foreground mt-1">
          تمام عملیات حساس مدیریتی ثبت شده‌اند.
        </p>
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden admin-lift">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm min-w-[1000px]">
            <thead>
              <tr className="bg-muted border-b border-border text-foreground">
                <th className="px-4 py-3 font-bold">زمان</th>
                <th className="px-4 py-3 font-bold">مجرا</th>
                <th className="px-4 py-3 font-bold">عملیات</th>
                <th className="px-4 py-3 font-bold">موجودیت</th>
                <th className="px-4 py-3 font-bold">شناسه</th>
                <th className="px-4 py-3 font-bold">دلیل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {logs.map(l => (
                <tr key={l.id} className="hover:bg-accent/40">
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                    {new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(l.createdAt))}
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground" dir="ltr">{l.actor}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {actionLabels[l.action] || l.action}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {entityLabels[l.entity] || l.entity}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground" dir="ltr">{l.entityId}</td>
                  <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">{l.reasonFa || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {Math.ceil(totalPages / 1) > 1 && (
        <nav className="flex items-center justify-center gap-2">
          {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              onClick={() => window.location.search = `page=${p}`}
              className={`px-3 py-1.5 rounded-md text-sm font-bold transition-colors ${
                p === page ? 'bg-brand text-white' : 'bg-muted hover:bg-accent'
              }`}
            >
              {p}
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}
