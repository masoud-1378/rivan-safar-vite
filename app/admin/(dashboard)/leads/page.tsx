import type { Metadata } from 'next';
import { getLeadStats } from './actions';
import { getSettingsMap } from '../settings/actions';
import { LeadBoard } from './LeadBoard';
import SectionSettingsDialog from '../SectionSettingsDialog';

export const metadata: Metadata = {
  title: 'درخواست‌های تماس | پنل ریوان سفر',
  robots: 'noindex,nofollow',
};

export default async function AdminLeadsPage() {
  const [{ rows }, settings] = await Promise.all([getLeadStats(), getSettingsMap()]);
  return (
    <div className="admin-enter space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">درخواست‌های تماس</h1>
          <p className="text-sm text-muted-foreground mt-1">
            جدیدترین درخواست‌های ثبت‌شده در سایت؛ تغییر وضعیت، پیگیری را مشخص می‌کند.
          </p>
        </div>
        <SectionSettingsDialog
          sectionKey="leads"
          title="تنظیمات درخواست‌ها"
          tabs={['notify']}
          values={settings}
        />
      </div>
      <LeadBoard
        initial={rows.map((r) => ({
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
