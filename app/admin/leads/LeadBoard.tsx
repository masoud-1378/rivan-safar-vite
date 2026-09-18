'use client';

import { useState, useTransition } from 'react';
import { updateLeadStatus, type LeadStatus } from './actions';

const STATUS_FA: Record<LeadStatus, string> = {
  new: 'جدید',
  contacted: 'تماس گرفته‌شده',
  qualified: 'واجد شرایط',
  won: 'موفق',
  lost: 'ناموفق',
  invalid: 'نامعتبر',
};

const STATUSES: LeadStatus[] = ['new', 'contacted', 'qualified', 'won', 'lost', 'invalid'];

export interface LeadRow {
  id: string;
  fullName: string;
  phone: string;
  sourcePath: string;
  tourContext: string | null;
  destinationHint: string | null;
  passengers: string | null;
  notes: string | null;
  status: LeadStatus;
  assignee: string | null;
  createdAt: string;
}

function faDate(iso: string) {
  try {
    return new Intl.DateTimeFormat('fa-IR', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function LeadBoard({ initial }: { initial: LeadRow[] }) {
  const [filter, setFilter] = useState<LeadStatus | 'all'>('all');
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState('');

  const rows = initial.filter((r) => filter === 'all' || r.status === filter);

  const changeStatus = (id: string, status: LeadStatus) => {
    setMessage('');
    startTransition(async () => {
      try {
        await updateLeadStatus(id, status);
        setMessage('وضعیت به‌روزرسانی شد.');
      } catch {
        setMessage('خطا در به‌روزرسانی. دسترسی شما کافی نیست؟');
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <FilterChip active={filter === 'all'} onClick={() => setFilter('all')} label="همه" />
        {STATUSES.map((s) => (
          <FilterChip key={s} active={filter === s} onClick={() => setFilter(s)} label={STATUS_FA[s]} />
        ))}
      </div>
      {message ? <p className="text-body-sm text-text-secondary">{message}</p> : null}
      <div className="bg-surface-primary border border-border-default rounded-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-body-sm min-w-[720px]">
            <thead>
              <tr className="bg-surface-secondary border-b border-border-default text-text-heading">
                <th className="px-4 py-3 font-bold">نام</th>
                <th className="px-4 py-3 font-bold">تلفن</th>
                <th className="px-4 py-3 font-bold">زمینه تور</th>
                <th className="px-4 py-3 font-bold">منبع</th>
                <th className="px-4 py-3 font-bold">تاریخ</th>
                <th className="px-4 py-3 font-bold">وضعیت</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-text-secondary">
                    درخواستی با این وضعیت ثبت نشده است.
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id} className="hover:bg-surface-secondary/50">
                    <td className="px-4 py-3 font-bold text-text-heading">{r.fullName}</td>
                    <td className="px-4 py-3" dir="ltr">
                      <a href={`tel:${r.phone}`} className="text-link font-medium">
                        {r.phone}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {[r.tourContext, r.destinationHint].filter(Boolean).join(' — ') || '—'}
                    </td>
                    <td className="px-4 py-3 text-text-secondary" dir="ltr">
                      {r.sourcePath}
                    </td>
                    <td className="px-4 py-3 text-text-secondary whitespace-nowrap">{faDate(r.createdAt)}</td>
                    <td className="px-4 py-3">
                      <select
                        value={r.status}
                        disabled={pending}
                        onChange={(e) => changeStatus(r.id, e.target.value as LeadStatus)}
                        className="bg-surface-secondary border border-border-default rounded-control px-2 py-1.5 text-body-sm"
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {STATUS_FA[s]}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`chip chip-small ${active ? 'chip-selected' : ''}`}
    >
      {label}
    </button>
  );
}
