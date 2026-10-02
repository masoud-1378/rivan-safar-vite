import type { Metadata } from 'next';
import { getLeadStats } from '../../leads/actions';
import { getSettingsMap } from '../../settings/actions';
import { requireAdmin } from '@/src/lib/admin-auth';
import { LeadBoard } from '../../leads/LeadBoard';
import SectionSettingsDialog from '../../SectionSettingsDialog';
import TourHubNav from '../TourHubNav';

export const metadata: Metadata = {
  title: 'درخواست‌های رزرو تور | پنل ریوان سفر',
  robots: 'noindex,nofollow',
};

export default async function TourLeadsPage() {
  // احراز هویت بیرون از try می‌ماند تا خطای دسترسی قورت داده نشود.
  await requireAdmin(['owner', 'editor']);

  // الگوی dbDown داشبورد: اگر دیتابیس در دسترس نبود، به‌جای باندری خطا پیام روشن.
  let rows: Awaited<ReturnType<typeof getLeadStats>>['rows'] = [];
  let settings: Record<string, string> = {};
  let dbDown = false;
  try {
    const [stats, s] = await Promise.all([getLeadStats(), getSettingsMap()]);
    rows = stats.rows;
    settings = s;
  } catch {
    dbDown = true;
  }

  // ۴-۱۱: اندازهٔ صفحهٔ برد از کلید leads.page_size؛ بازهٔ مجاز رجیستری ۵ تا ۱۰۰.
  const rawPageSize = Number(settings['leads.page_size']);
  const pageSize = Number.isFinite(rawPageSize)
    ? Math.min(100, Math.max(5, Math.floor(rawPageSize)))
    : 20;

  // Filter leads that have tour context or originated from tour pages.
  // L2: بدون فالبک بی‌صدا؛ وقتی لید توری نیست، خود برد empty state آموزشی نشان می‌دهد.
  const tourRows = rows.filter((r) =>
    Boolean(r.tourContext) ||
    (r.sourcePath && r.sourcePath.includes('/tour'))
  );

  return (
    <div className="admin-enter space-y-6">
      {dbDown ? (
        <div className="rounded-sm border border-warning/40 bg-warning/10 p-4 text-sm">
          اتصال به دیتابیس در این لحظه برقرار نشد؛ فهرست درخواست‌ها بارگذاری نشد. چند لحظه بعد صفحه را تازه کنید.
        </div>
      ) : null}
      <TourHubNav counts={{ leads: tourRows.length }} />

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">درخواست‌های رزرو و استعلام تور</h1>
          <p className="text-sm text-muted-foreground mt-1">
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
        pageSize={pageSize}
        initial={tourRows.map((r) => ({
          id: r.id,
          fullName: r.fullName,
          phone: r.phone,
          sourcePath: r.sourcePath,
          tourContext: r.tourContext,
          destinationHint: r.destinationHint,
          passengers: r.passengers,
          notes: r.notes,
          adminNotes: r.adminNotes,
          status: r.status as 'new' | 'contacted' | 'qualified' | 'won' | 'lost' | 'invalid',
          assignee: r.assignee,
          createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : String(r.createdAt),
        }))}
      />
    </div>
  );
}
