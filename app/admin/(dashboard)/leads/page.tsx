import type { Metadata } from 'next';
import { getLeadStats } from './actions';
import { LeadBoard } from './LeadBoard';

export const metadata: Metadata = {
  title: 'درخواست‌های تماس | پنل ریوان سفر',
  robots: 'noindex,nofollow',
};

export default async function AdminLeadsPage() {
  const { rows } = await getLeadStats();
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-h2 font-bold text-text-heading">درخواست‌های تماس</h1>
        <p className="text-body-sm text-text-secondary mt-1">
          جدیدترین درخواست‌های ثبت‌شده در سایت؛ تغییر وضعیت، پیگیری را مشخص می‌کند.
        </p>
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
