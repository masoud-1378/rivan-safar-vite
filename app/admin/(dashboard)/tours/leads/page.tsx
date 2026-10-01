import type { Metadata } from 'next';
import { getLeadStats } from '../../leads/actions';
import { getSettingsMap } from '../../settings/actions';
import { LeadBoard } from '../../leads/LeadBoard';
import SectionSettingsDialog from '../../SectionSettingsDialog';
import TourHubNav from '../TourHubNav';

export const metadata: Metadata = {
  title: 'درخواست‌های رزرو تور | پنل ریوان سفر',
  robots: 'noindex,nofollow',
};

export default async function TourLeadsPage() {
  const [{ rows }, settings] = await Promise.all([getLeadStats(), getSettingsMap()]);
  
  // Filter leads that have tour context or originated from tour pages.
  // L2: بدون فالبک بی‌صدا؛ وقتی لید توری نیست، خود برد empty state آموزشی نشان می‌دهد.
  const tourRows = rows.filter((r) =>
    Boolean(r.tourContext) ||
    (r.sourcePath && r.sourcePath.includes('/tour'))
  );

  return (
    <div className="admin-enter space-y-6">
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
        initial={tourRows.map((r) => ({
          id: r.id,
          fullName: r.fullName,
          phone: r.phone,
          sourcePath: r.sourcePath,
          tourContext: r.tourContext,
          destinationHint: r.destinationHint,
          passengers: r.passengers,
          notes: r.notes,
          status: r.status as 'new' | 'contacted' | 'qualified' | 'won' | 'lost' | 'invalid',
          assignee: r.assignee,
          createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : String(r.createdAt),
        }))}
      />
    </div>
  );
}
