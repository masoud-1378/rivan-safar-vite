'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Field, Input } from '@/components/ui/input';
import { Pagination } from '@/components/ui/pagination';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Select } from '@/components/ui/select';
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

export interface AuditLogFilters {
  entity: string;
  actor: string;
}

const ENTITY_LABELS: Record<string, string> = {
  tour_products: 'محصول تور',
  tour_departures: 'حرکت تور',
  route_segments: 'قطعه مسیر',
  accommodation_offers: 'پیشنهاد اقامت',
  seo_landings: 'لندینگ سئو',
  lead_requests: 'درخواست تماس',
  admin_users: 'مدیر',
  site_tours: 'تور',
  site_destinations: 'مقصد',
  origin_cities: 'مبدأ',
  accommodations: 'هتل',
  guides: 'مقاله',
  exhibitions: 'نمایشگاه',
  content_blocks: 'بلوک محتوایی',
  seo_internal_links: 'لینک داخلی',
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
  archive: 'بایگانی',
  restore: 'بازیابی',
  hard_delete: 'حذف دائمی',
  'user.invite': 'دعوت کاربر',
  'user.create': 'افزودن کاربر',
  'user.role': 'تغییر نقش کاربر',
  'user.active': 'تغییر وضعیت کاربر',
};

const faTime = (date: Date) => `${fa(String(date.getHours()).padStart(2, '0'))}:${fa(String(date.getMinutes()).padStart(2, '0'))}`;

export default function AuditLog({ logs, page, totalPages, total, filters }: { logs: AuditLogRow[]; page: number; totalPages: number; total: number; filters: AuditLogFilters }) {
  const [view, setView] = useState('table');
  // X6: فیلتر موجودیت و انجام‌دهنده — سمت سرور اعمال می‌شود، صفحه ریست می‌گردد.
  const [entity, setEntity] = useState(filters.entity);
  const [actor, setActor] = useState(filters.actor);

  const applyFilters = (nextPage = 1, nextEntity = entity, nextActor = actor) => {
    const p = new URLSearchParams();
    if (nextEntity) p.set('entity', nextEntity);
    if (nextActor.trim()) p.set('actor', nextActor.trim());
    if (nextPage > 1) p.set('page', String(nextPage));
    window.location.search = p.toString();
  };

  const clearFilters = () => {
    setEntity('');
    setActor('');
    applyFilters(1, '', '');
  };

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
          <p className="mt-1 text-sm text-muted-foreground">تمام عملیات حساس مدیریتی ثبت‌شده‌اند. مجموع {fa(total)} رویداد.</p>
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

      <form
        onSubmit={(e) => { e.preventDefault(); applyFilters(); }}
        className="flex flex-wrap items-end gap-3"
        aria-label="فیلتر گزارش تغییرات"
      >
        <div className="w-52">
          <Field label="موجودیت" htmlFor="audit-entity">
            <Select
              id="audit-entity"
              value={entity}
              onChange={(e) => { setEntity(e.target.value); applyFilters(1, e.target.value, actor); }}
              options={[{ value: '', label: 'همهٔ موجودیت‌ها' }, ...Object.entries(ENTITY_LABELS).map(([value, label]) => ({ value, label }))]}
            />
          </Field>
        </div>
        <div className="w-64">
          <Field label="انجام‌دهنده" htmlFor="audit-actor">
            <Input
              id="audit-actor"
              value={actor}
              onChange={(e) => setActor(e.target.value)}
              placeholder="ایمیل یا نام انجام‌دهنده…"
              className="text-start"
              dir="ltr"
            />
          </Field>
        </div>
        <div className="flex items-center gap-2 pb-0.5">
          <Button type="submit" size="sm">اعمال فیلتر</Button>
          {(filters.entity || filters.actor) ? (
            <Button type="button" variant="ghost" size="sm" onClick={clearFilters}>پاک‌کردن فیلتر</Button>
          ) : null}
        </div>
      </form>

      <Card>
        <CardContent className="p-5">
          {logs.length === 0 ? (
            <EmptyState title="رویدادی ثبت نشده است" />
          ) : view === 'table' ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>زمان</TableHead>
                  <TableHead>انجام‌دهنده</TableHead>
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
              applyFilters(next);
            }}
          />
        </div>
      ) : null}
    </div>
  );
}
