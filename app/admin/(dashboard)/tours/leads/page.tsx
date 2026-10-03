import type { Metadata } from 'next';
import { getLeadsPage, type LeadStatus, type LeadsPage } from '../../leads/actions';
import { getSettingsMap } from '../../settings/actions';
import { requireAdmin } from '@/src/lib/admin-auth';
import { LeadBoard } from '../../leads/LeadBoard';
import SectionSettingsDialog from '../../SectionSettingsDialog';
import { LEAD_STATUSES } from '../../leads/lead-status';
import TourHubNav from '../TourHubNav';

export const metadata: Metadata = {
  title: 'درخواست‌های رزرو تور | پنل ریوان سفر',
  robots: 'noindex,nofollow',
};

function toLeadRow(r: LeadsPage['rows'][number]) {
  return {
    id: r.id,
    fullName: r.fullName,
    phone: r.phone,
    sourcePath: r.sourcePath,
    tourContext: r.tourContext,
    destinationHint: r.destinationHint,
    passengers: r.passengers,
    notes: r.notes,
    adminNotes: r.adminNotes,
    status: r.status,
    assignee: r.assignee,
    createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : String(r.createdAt),
  };
}

export default async function TourLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string; q?: string | string[] }>;
}) {
  // احراز هویت بیرون از try می‌ماند تا خطای دسترسی قورت داده نشود.
  await requireAdmin(['owner', 'editor']);
  const sp = await searchParams;
  const rawStatus = sp.status ?? 'all';
  const status: LeadStatus | 'all' = (
    rawStatus === 'all' || (LEAD_STATUSES as string[]).includes(rawStatus) ? rawStatus : 'all'
  ) as LeadStatus | 'all';
  // q آرایه‌ای (‎?q=a&q=b) صفحه را ۵۰۰ نمی‌کند؛ اولی برداشته می‌شود.
  const query = ((Array.isArray(sp.q) ? sp.q[0] : sp.q) ?? '').trim();

  // الگوی dbDown داشبورد: اگر دیتابیس در دسترس نبود، به‌جای باندری خطا پیام روشن.
  let pageData: LeadsPage = { rows: [], total: 0, page: 1, pageSize: 20, pageCount: 1 };
  let settings: Record<string, string> = {};
  let dbDown = false;
  try {
    const s = await getSettingsMap();
    settings = s;
    // ۴-۱۱: اندازهٔ صفحهٔ برد از کلید leads.page_size؛ بازهٔ مجاز رجیستری ۵ تا ۱۰۰.
    const rawPageSize = Number(s['leads.page_size']);
    const pageSize = Number.isFinite(rawPageSize)
      ? Math.min(100, Math.max(5, Math.floor(rawPageSize)))
      : 20;
    // L2: فیلتر «توری بودن» سمت سرور (زمینهٔ تور یا مسیر /tour) تا شمارش کل هم درست باشد.
    pageData = await getLeadsPage({ page: Number(sp.page), pageSize, status, q: query, tourOnly: true });
  } catch {
    dbDown = true;
  }

  return (
    <div className="admin-enter space-y-6">
      {dbDown ? (
        <div className="rounded-sm border border-warning/40 bg-warning/10 p-4 text-panel-body">
          اتصال به دیتابیس در این لحظه برقرار نشد؛ فهرست درخواست‌ها بارگذاری نشد. چند لحظه بعد صفحه را تازه کنید.
        </div>
      ) : null}
      <TourHubNav counts={{ leads: pageData.total }} />

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-panel-display text-foreground">درخواست‌های رزرو و استعلام تور</h1>
          <p className="mt-2 text-panel-body text-muted-foreground">
            درخواست‌های ثبت‌شده توسط مسافران برای تورهای اختصاصی.
          </p>
        </div>
        <SectionSettingsDialog
          sectionKey="leads"
          title="تنظیمات درخواست‌های تور"
          tabs={['notify']}
          values={settings}
        />
      </div>

      <LeadBoard
        variant="tour"
        pageSize={pageData.pageSize}
        initial={pageData.rows.map(toLeadRow)}
        total={pageData.total}
        page={pageData.page}
        pageCount={pageData.pageCount}
        status={status}
        query={query}
      />
    </div>
  );
}
