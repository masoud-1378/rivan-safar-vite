'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Copy, Pencil, Plus, Archive, Plane, Train, Bus, ShieldCheck } from 'lucide-react';
import { deleteTour, type TourRow } from './actions';
import SectionSettingsDialog from '../SectionSettingsDialog';
import { AlertDialog } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DataTable, type Column } from '@/components/ui/data-table';
import { useToast } from '@/components/ui/toast';
import { fa, formatToman } from '@/lib/utils';

interface ToursManagerProps {
  initial: TourRow[];
  sectionSettings: Record<string, string>;
}

/**
 * هاب تورها: فقط لیست + عملیات. ساخت و ویرایش در مسیرهای جدا
 * (/admin/tours/new و /admin/tours/[id]) انجام می‌شود.
 */
export default function ToursManager({ initial, sectionSettings }: ToursManagerProps) {
  const [deleting, setDeleting] = useState<TourRow | null>(null);
  const [pending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  const onDelete = async () => {
    if (!deleting) return;
    try {
      await new Promise<void>((resolve, reject) => startTransition(async () => {
        try { await deleteTour(deleting.id); resolve(); } catch (error) { reject(error); }
      }));
      window.location.reload();
    } catch (error) { toast({ variant: 'error', title: error instanceof Error ? error.message : 'خطا در حذف.' }); }
  };
  const columns: Column<TourRow>[] = [
    {
      key: 'title',
      header: 'عنوان و شیوه سفر',
      sortable: true,
      cell: (tour) => {
        const isRail = /قطار|بن ریل|فدک|رجاء/i.test(tour.airline || '');
        const isLand = /اتوبوس|زمینی|vip/i.test(tour.airline || '');
        return (
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-foreground">{tour.title}</span>
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              {isRail ? (
                <span className="inline-flex items-center gap-1 rounded bg-blue-500/10 px-1.5 py-0.5 text-blue-600 font-medium">
                  <Train className="size-3" /> ریلی ({tour.airline || 'قطار'})
                </span>
              ) : isLand ? (
                <span className="inline-flex items-center gap-1 rounded bg-amber-500/10 px-1.5 py-0.5 text-amber-600 font-medium">
                  <Bus className="size-3" /> زمینی ({tour.airline || 'اتوبوس VIP'})
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded bg-sky-500/10 px-1.5 py-0.5 text-sky-600 font-medium">
                  <Plane className="size-3" /> هوایی ({tour.airline || 'پرواز'})
                </span>
              )}
              {tour.badge === 'حرکت تضمین‌شده' && (
                <span className="inline-flex items-center gap-0.5 rounded bg-emerald-500/10 px-1.5 py-0.5 text-emerald-600 font-bold">
                  <ShieldCheck className="size-3" /> حرکت تضمین‌شده
                </span>
              )}
            </div>
          </div>
        );
      }
    },
    {
      key: 'destination',
      header: 'مسیر (مبدأ به مقصد)',
      sortable: true,
      cell: (tour) => (
        <div className="text-xs">
          <span className="text-foreground font-medium">{tour.destination || '—'}</span>
          {tour.origin && <span className="block text-[11px] text-muted-foreground">از مبدأ: {tour.origin}</span>}
        </div>
      )
    },
    { key: 'typeLabel', header: 'نوع', cell: (tour) => tour.typeLabel || '—' },
    { key: 'price', header: 'قیمت پایه', numeric: true, sortable: true, cell: (tour) => formatToman(Number(tour.price)) },
    { key: 'status', header: 'ظرفیت', cell: (tour) => <Badge variant={tour.status === 'confirmed' ? 'success' : tour.status === 'pending' ? 'warning' : 'secondary'}>{tour.statusLabel || tour.status}</Badge> },
    { key: 'publishStatus', header: 'انتشار', cell: (tour) => <Badge variant={tour.publishStatus === 'published' ? 'success' : 'warning'}>{tour.publishStatus === 'published' ? 'منتشرشده' : 'پیش‌نویس'}</Badge> },
    { key: 'id', header: 'عملیات', className: 'w-44', cell: (tour) => <div className="flex gap-1"><Button variant="ghost" size="sm" onClick={() => router.push(`/admin/tours/${tour.id}`)}><Pencil />ویرایش</Button><Button variant="ghost" size="sm" onClick={() => router.push(`/admin/tours/new?duplicate=${encodeURIComponent(tour.slug)}`)}><Copy />تکثیر</Button><Button variant="ghost" size="sm" className="text-destructive" onClick={() => setDeleting(tour)} disabled={pending}><Archive />بایگانی</Button></div> },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2"><div><h1 className="text-2xl font-bold text-foreground">تورها</h1><p className="mt-1 text-sm text-muted-foreground">مدیریت مستقیم جدول تورها</p></div><div className="flex items-center gap-2"><SectionSettingsDialog sectionKey="tours" title="تنظیمات تورها" tabs={['general']} values={sectionSettings} /><Link href="/admin/tours/new"><Button><Plus />افزودن تور جدید</Button></Link></div></div>
      <Card><CardContent className="p-0"><DataTable rows={initial} columns={columns} rowKey={(tour) => tour.id} searchKeys={['title', 'destination', 'typeLabel']} searchPlaceholder="جست‌وجوی عنوان، مقصد یا نوع تور…" emptyTitle="توری ثبت نشده است" emptyDescription="برای شروع، تور جدیدی اضافه کنید." /></CardContent></Card>
      <AlertDialog open={Boolean(deleting)} onOpenChange={(open) => { if (!open) setDeleting(null); }} title="بایگانی تور" description={deleting ? `تور «${deleting.title}» بایگانی می‌شود و از سایت و فهرست‌ها پنهان می‌ماند؛ بعداً از صفحهٔ بایگانی می‌توانید آن را برگردانید.` : ''} confirmText="بایگانی تور" destructive onConfirm={onDelete} />
      <p className="text-[11px] text-muted-foreground">تعداد: {fa(initial.length)} تور</p>
    </div>
  );
}
