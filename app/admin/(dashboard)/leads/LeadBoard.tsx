'use client';

import { useState, useTransition } from 'react';
import { Search, Trash2 } from 'lucide-react';
import { updateLeadStatus, type LeadStatus } from './actions';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { DataTable, type Column } from '@/components/ui/data-table';
import { Select } from '@/components/ui/select';

const STATUS_FA: Record<LeadStatus, string> = {
  new: 'جدید',
  contacted: 'تماس گرفته‌شده',
  qualified: 'واجد شرایط',
  won: 'موفق',
  lost: 'ناموفق',
  invalid: 'نامعتبر',
};

const STATUS_VARIANT: Record<LeadStatus, 'brand' | 'warning' | 'success' | 'destructive' | 'secondary'> = {
  new: 'brand',
  contacted: 'warning',
  qualified: 'warning',
  won: 'success',
  lost: 'destructive',
  invalid: 'secondary',
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
    return new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function LeadBoard({ initial }: { initial: LeadRow[] }) {
  const [filter, setFilter] = useState<LeadStatus | 'all'>('all');
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState('');
  const rows = initial.filter((row) => filter === 'all' || row.status === filter).map((row) => ({ ...row })) as (LeadRow & Record<string, unknown>)[];

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

  const columns: Column<LeadRow>[] = [
    { key: 'fullName', header: 'نام', sortable: true, cell: (row) => <span className="font-semibold">{row.fullName}</span> },
    { key: 'phone', header: 'تلفن', cell: (row) => <a href={`tel:${row.phone}`} dir="ltr" className="text-brand">{row.phone}</a> },
    { key: 'tourContext', header: 'زمینه تور', cell: (row) => <span>{[row.tourContext, row.destinationHint].filter(Boolean).join(' — ') || '—'}</span> },
    { key: 'createdAt', header: 'تاریخ', sortable: true, cell: (row) => <span className="whitespace-nowrap">{faDate(row.createdAt)}</span> },
    {
      key: 'status', header: 'وضعیت', cell: (row) => (
        <div className="flex items-center gap-2">
          <Badge variant={STATUS_VARIANT[row.status]}>{STATUS_FA[row.status]}</Badge>
          <Select aria-label="تغییر وضعیت درخواست" value={row.status} disabled={pending} onChange={(event) => changeStatus(row.id, event.target.value as LeadStatus)} className="h-8 min-w-36 text-xs" options={STATUSES.map((status) => ({ value: status, label: STATUS_FA[status] }))} />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
      <Card><CardContent className="p-5"><DataTable rows={rows} columns={columns} rowKey={(row) => row.id} searchKeys={['fullName', 'phone', 'tourContext', 'destinationHint']} searchPlaceholder="جست‌وجوی نام، تلفن یا مقصد…" emptyTitle="درخواستی یافت نشد" emptyDescription="وضعیت انتخاب‌شده را تغییر دهید." toolbar={<div className="w-48"><Select aria-label="فیلتر وضعیت درخواست‌ها" value={filter} onChange={(event) => setFilter(event.target.value as LeadStatus | 'all')} className="h-9" options={[{ value: 'all', label: 'همه وضعیت‌ها' }, ...STATUSES.map((status) => ({ value: status, label: STATUS_FA[status] }))]} /></div>} /></CardContent></Card>
    </div>
  );
}
