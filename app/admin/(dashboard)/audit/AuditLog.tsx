'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Pagination } from '@/components/ui/pagination';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Timeline, type TimelineItem } from '@/components/ui/timeline';
import { formatJalali } from '@/lib/jalali';
import { fa } from '@/lib/utils';

export interface AuditLogRow {
  id: string;
  actor: string;
  action: string;
  entity: string;
  entityId: string;
  reasonFa: string | null;
  createdAt: Date;
}

const ENTITY_LABELS: Record<string, string> = {
  tour_products: 'محصول تور',
  tour_departures: 'حرکت تور',
  route_segments: 'قطعه مسیر',
  accommodation_offers: 'پیشنهاد اقامت',
  seo_landings: 'لندینگ سئو',
  lead_requests: 'درخواست تماس',
  admin_users: 'مدیر',
};

const ACTION_LABELS: Record<string, string> = {
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

const faTime = (date: Date) => `${fa(String(date.getHours()).padStart(2, '0'))}:${fa(String(date.getMinutes()).padStart(2, '0'))}`;

export default function AuditLog({ logs, page, totalPages, total }: { logs: AuditLogRow[]; page: number; totalPages: number; total: number }) {
  const [view, setView] = useState('table');

  const timeline: TimelineItem[] = logs.map((l) => ({
    date: new Date(l.createdAt),
    title: `${ACTION_LABELS[l.action] ?? l.action} — ${ENTITY_LABELS[l.entity] ?? l.entity}`,
    description: (
      <span className="flex flex-wrap items-center gap-2">
        <span dir="ltr" className="font-mono text-[11px]">{l.actor}</span>
        {l.reasonFa ? <span>{l.reasonFa}</span> : null}
      </span>
    ),
  }));

  return (
    <div className="admin-enter space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">گزارش تغییرات</h1>
          <p className="mt-1 text-sm text-muted-foreground">تمام عملیات حساس مدیریتی ثبت شده‌اند. مجموع {fa(total)} رویداد.</p>
        </div>
        <SegmentedControl
          value={view}
          onChange={setView}
          aria-label="نوع نمایش گزارش"
          options={[
            { value: 'table', label: 'جدول' },
            { value: 'timeline', label: 'خط زمان' },
          ]}
        />
      </div>

      <Card>
        <CardContent className="p-5">
          {logs.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">رویدادی ثبت نشده است.</p>
          ) : view === 'table' ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>زمان</TableHead>
                  <TableHead>مجرا</TableHead>
                  <TableHead>عملیات</TableHead>
                  <TableHead>موجودیت</TableHead>
                  <TableHead>شناسه</TableHead>
                  <TableHead>دلیل</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {formatJalali(new Date(l.createdAt))} · {faTime(new Date(l.createdAt))}
                    </TableCell>
                    <TableCell dir="ltr" className="font-medium">{l.actor}</TableCell>
                    <TableCell><Badge variant="secondary">{ACTION_LABELS[l.action] ?? l.action}</Badge></TableCell>
                    <TableCell className="text-muted-foreground">{ENTITY_LABELS[l.entity] ?? l.entity}</TableCell>
                    <TableCell dir="ltr" className="font-mono text-xs text-muted-foreground">{l.entityId}</TableCell>
                    <TableCell className="max-w-xs truncate text-muted-foreground">{l.reasonFa || '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Timeline items={timeline} />
          )}
        </CardContent>
      </Card>

      {totalPages > 1 ? (
        <div className="flex justify-center">
          <Pagination
            page={page}
            total={totalPages}
            onChange={(next) => {
              window.location.search = `page=${next}`;
            }}
          />
        </div>
      ) : null}
    </div>
  );
}
