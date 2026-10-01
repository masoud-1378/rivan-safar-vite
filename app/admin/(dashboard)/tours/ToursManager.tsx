'use client';

import { useMemo, useState, useTransition } from 'react';
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
import { Select } from '@/components/ui/select';
import { useToast } from '@/components/ui/toast';
import { fa } from '@/lib/utils';
import { PriceCell } from './PriceCell';
import { DuplicateTourDialog } from './DuplicateTourDialog';

interface ToursManagerProps {
  initial: TourRow[];
  sectionSettings: Record<string, string>;
}

/**
 * هاب تورها: فقط فهرست + عملیات (میز T2). ساخت و ویرایش در مسیرهای جدا
 * (/admin/tours/new و /admin/tours/[id]) انجام می‌شود؛ فرم درون‌صفحه‌ای نداریم.
 *
 * قرارداد یکدست دیالوگ‌ها (قلم ۳ بخش ۲ کتابچه، میز T1):
 * - غیرمخرب (افزودن تور جدید): لینک مستقیم به /admin/tours/new، بدون «تأیید ترسناک».
 * - غیرمخربِ سازنده (تکثیر): دیالوگِ «تنظیمات تکثیر» (عنوان، نامک یکتا، تاریخ حرکت بعدی)؛
 *   کپی همیشه پیش‌نویس ساخته می‌شود و کاربر بعدش به صفحهٔ ویرایش همان تور می‌رود.
 *   دکمه‌اش با جداکننده از بایگانی (مخرب) جداست.
 * - مخربِ برگشت‌پذیر (بایگانی): دیالوگ با نام تور + توضیح برگشت‌پذیری.
 * - مخربِ برگشت‌ناپذیر (حذف دائمی در صفحهٔ بایگانی): دیالوگ با نام تور + هشدار صریح برگشت‌ناپذیری.
 */
export default function ToursManager({ initial, sectionSettings }: ToursManagerProps) {
  const [tours, setTours] = useState(initial);
  const [deleting, setDeleting] = useState<TourRow | null>(null);
  const [duplicating, setDuplicating] = useState<TourRow | null>(null);
  const [pending, startTransition] = useTransition();
  const [statusFilter, setStatusFilter] = useState('all');
  const [publishFilter, setPublishFilter] = useState<'all' | 'draft' | 'published'>('all');
  const { toast } = useToast();
  const router = useRouter();

  // قلم ۴ (میز T1): فیلتر وضعیت — گزینه‌ها از وضعیت‌های واقعیِ همین فهرست ساخته می‌شوند.
  const statusOptions = useMemo(() => {
    const seen = new Map<string, string>();
    for (const t of tours) {
      if (!seen.has(t.status)) seen.set(t.status, t.statusLabel || t.status);
    }
    return [...seen.entries()].map(([value, label]) => ({ value, label }));
  }, [tours]);

  const visible = tours.filter(
    (t) =>
      (statusFilter === 'all' || t.status === statusFilter) &&
      (publishFilter === 'all' || t.publishStatus === publishFilter)
  );

  const onDelete = async () => {
    if (!deleting) return;
    try {
      await new Promise<void>((resolve, reject) => startTransition(async () => {
        try { await deleteTour(deleting.id); resolve(); } catch (error) { reject(error); }
      }));
      window.location.reload();
    } catch (error) { toast({ variant: 'error', title: error instanceof Error ? error.message : 'حذف انجام نشد؛ دوباره تلاش کنید.' }); }
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
                <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-1.5 py-0.5 text-emerald-600 font-bold">
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
      // قلم ۵ (میز T1): مبدأ خالی «—» خاکستری نشان داده می‌شود، نه سلول خالی.
      cell: (tour) => (
        <div className="text-xs">
          <span className={tour.destination ? 'text-foreground font-medium' : 'text-muted-foreground'}>
            {tour.destination || '—'}
          </span>
          <span className="block text-[11px] text-muted-foreground">
            از مبدأ:{' '}
            {tour.origin ? (
              <span className="text-foreground/80">{tour.origin}</span>
            ) : (
              <span className="text-muted-foreground/60">—</span>
            )}
          </span>
        </div>
      )
    },
    { key: 'typeLabel', header: 'نوع', cell: (tour) => tour.typeLabel || '—' },
    {
      key: 'price',
      header: 'قیمت پایه',
      numeric: true,
      sortable: true,
      // قلم ۱ (میز T1): ویرایش در جای قیمت — کلیک روی قیمت، تایپ، Enter. بدون رفرش صفحه.
      cell: (tour) => (
        <PriceCell
          id={tour.id}
          price={tour.price}
          onSaved={(price, formattedPrice) =>
            setTours((ts) => ts.map((t) => (t.id === tour.id ? { ...t, price, formattedPrice } : t)))
          }
        />
      ),
    },
    // وضعیت ظرفیت (میز T2: جدا از وضعیت انتشار؛ confirmed/pending/… فقط ظرفیت‌اند).
    { key: 'status', header: 'ظرفیت', cell: (tour) => <Badge variant={tour.status === 'confirmed' ? 'success' : tour.status === 'pending' ? 'warning' : 'secondary'}>{tour.statusLabel || tour.status}</Badge> },
    // شرایط انتشار (میز T2، مایگریشن 0011): پیش‌نویس روی سایت دیده نمی‌شود.
    { key: 'publishStatus', header: 'انتشار', cell: (tour) => <Badge variant={tour.publishStatus === 'published' ? 'success' : 'warning'}>{tour.publishStatus === 'published' ? 'منتشرشده' : 'پیش‌نویس'}</Badge> },
    // قلم ۲ و ۳ (میز T1): تکثیر با دیالوگ تنظیمات و دور از بایگانی؛ ویرایش به مسیر جدا می‌رود (میز T2).
    { key: 'id', header: 'عملیات', cell: (tour) => <div className="flex items-center gap-1"><Button variant="ghost" size="sm" onClick={() => router.push(`/admin/tours/${tour.id}`)}><Pencil />ویرایش</Button><Button variant="ghost" size="sm" onClick={() => setDuplicating(tour)}><Copy />تکثیر</Button><span className="mx-1 h-5 w-px bg-border" aria-hidden="true" /><Button variant="ghost" size="sm" className="text-destructive" onClick={() => setDeleting(tour)} disabled={pending}><Archive />بایگانی</Button></div> },
  ];

  return (
    <div className="admin-enter space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2"><div><h1 className="text-2xl font-bold text-foreground">تورها</h1><p className="mt-1 text-sm text-muted-foreground">مدیریت مستقیم جدول تورها — قیمت پایه را می‌توانید مستقیم از جدول ویرایش کنید</p></div><div className="flex items-center gap-2"><SectionSettingsDialog sectionKey="tours" title="تنظیمات تورها" tabs={['general']} values={sectionSettings} /><Link href="/admin/tours/new"><Button><Plus />افزودن تور جدید</Button></Link></div></div>
      <Card><CardContent className="p-5"><h2 className="mb-3 text-base font-semibold">تورها ({fa(tours.length)})</h2><DataTable rows={visible} columns={columns} rowKey={(tour) => tour.id} searchKeys={['title', 'destination', 'typeLabel']} searchPlaceholder="جست‌وجوی عنوان، مقصد یا نوع تور…" toolbar={<><Select aria-label="فیلتر وضعیت ظرفیت" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} options={[{ value: 'all', label: 'همه ظرفیت‌ها' }, ...statusOptions]} className="h-9 w-40" /><Select aria-label="فیلتر انتشار" value={publishFilter} onChange={(e) => setPublishFilter(e.target.value as 'all' | 'draft' | 'published')} options={[{ value: 'all', label: 'همه (انتشار)' }, { value: 'draft', label: 'پیش‌نویس' }, { value: 'published', label: 'منتشرشده' }]} className="h-9 w-40" /></>} emptyTitle={statusFilter === 'all' && publishFilter === 'all' ? 'توری ثبت نشده است' : 'توری با این فیلتر پیدا نشد'} emptyDescription={statusFilter === 'all' && publishFilter === 'all' ? 'برای شروع، تور جدیدی اضافه کنید.' : 'فیلترها را عوض کنید یا جست‌وجو را پاک کنید.'} /></CardContent></Card>
      {duplicating && (
        <DuplicateTourDialog
          key={duplicating.id}
          tour={duplicating}
          onClose={() => setDuplicating(null)}
          onDone={(newId) => { setDuplicating(null); router.push(newId ? `/admin/tours/${newId}` : '/admin/tours'); }}
        />
      )}
      <AlertDialog open={Boolean(deleting)} onOpenChange={(open) => !open && setDeleting(null)} title="بایگانی تور" description={deleting ? `تور «${deleting.title}» بایگانی می‌شود و از سایت و فهرست‌ها پنهان می‌شود؛ بعداً از صفحهٔ بایگانی می‌توانید آن را برگردانید.` : ''} confirmText="بایگانی تور" destructive onConfirm={onDelete} />
    </div>
  );
}
