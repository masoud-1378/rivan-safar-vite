'use client';

import { useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Copy, Pencil, Plus, Archive, Plane, Train, Bus, Ship, Route, ShieldCheck } from 'lucide-react';
import { deleteTour, setToursPublishStatusBulk, archiveToursBulk, type TourRow } from './actions';
import { CAPACITY_OPTIONS } from './tour-helpers';
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
 * بج شیوهٔ سفر (T9): اول از ستون ذخیره‌شدهٔ transport_kind؛ برای ردیف‌های قدیمیِ
 * بی‌مقدار همان حدس regex قبلی روی خط هوایی، تا تور قدیمی بی‌بج نماند.
 */
function transportBadge(tour: TourRow) {
  const kind =
    tour.transportKind ||
    (/قطار|بن ریل|فدک|رجاء/i.test(tour.airline || '') ? 'rail'
      : /اتوبوس|زمینی|vip/i.test(tour.airline || '') ? 'land'
      : 'air');
  const carrier = tour.airline || 'پرواز';
  switch (kind) {
    case 'rail':
      return (
        <span className="inline-flex items-center gap-1 rounded bg-blue-500/10 px-1.5 py-0.5 text-blue-600 font-medium">
          <Train className="size-3" /> ریلی ({carrier === 'پرواز' ? 'قطار' : carrier})
        </span>
      );
    case 'land':
      return (
        <span className="inline-flex items-center gap-1 rounded bg-amber-500/10 px-1.5 py-0.5 text-amber-600 font-medium">
          <Bus className="size-3" /> زمینی ({carrier === 'پرواز' ? 'اتوبوس VIP' : carrier})
        </span>
      );
    case 'sea':
      return (
        <span className="inline-flex items-center gap-1 rounded bg-teal-500/10 px-1.5 py-0.5 text-teal-600 font-medium">
          <Ship className="size-3" /> دریایی ({carrier === 'پرواز' ? 'کشتی' : carrier})
        </span>
      );
    case 'mixed':
      return (
        <span className="inline-flex items-center gap-1 rounded bg-violet-500/10 px-1.5 py-0.5 text-violet-600 font-medium">
          <Route className="size-3" /> ترکیبی ({carrier === 'پرواز' ? 'چندوسیله‌ای' : carrier})
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 rounded bg-sky-500/10 px-1.5 py-0.5 text-sky-600 font-medium">
          <Plane className="size-3" /> هوایی ({carrier})
        </span>
      );
  }
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
  // عملیات گروهی (T15)
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<null | 'publish' | 'unpublish' | 'archive'>(null);
  const [bulkBusy, setBulkBusy] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const toggleSelected = (key: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const togglePageSelected = (keys: string[], select: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      for (const k of keys) {
        if (select) next.add(k);
        else next.delete(k);
      }
      return next;
    });
  };

  const selectedTours = tours.filter((t) => selected.has(t.id));

  const runBulk = async () => {
    if (!bulkAction || selected.size === 0 || bulkBusy) return;
    setBulkBusy(true);
    try {
      if (bulkAction === 'archive') {
        await archiveToursBulk([...selected]);
        setTours((ts) => ts.filter((t) => !selected.has(t.id)));
        toast({ title: `${fa(selected.size)} تور بایگانی شد`, description: 'از سایت پنهان شدند؛ از صفحهٔ بایگانی می‌توانید برگردانیدشان.' });
      } else {
        const next = bulkAction === 'publish' ? 'published' : 'draft';
        await setToursPublishStatusBulk([...selected], next);
        setTours((ts) => ts.map((t) => (selected.has(t.id) ? { ...t, publishStatus: next } : t)));
        toast({
          title: bulkAction === 'publish' ? `${fa(selected.size)} تور منتشر شد` : `انتشار ${fa(selected.size)} تور لغو شد`,
          description: bulkAction === 'publish' ? 'منتشر شدند و روی سایت دیده می‌شوند.' : 'از سایت پنهان شدند.',
        });
      }
      setSelected(new Set());
      setBulkAction(null);
    } catch (error) {
      toast({ variant: 'error', title: error instanceof Error ? error.message : 'عملیات گروهی انجام نشد؛ دوباره تلاش کنید.' });
    } finally {
      setBulkBusy(false);
    }
  };

  // قلم ۴ (میز T1): فیلتر وضعیت — گزینه‌ها از همان ثابت مشترک مرحلهٔ ۱ می‌آیند (X7).
  const statusOptions = useMemo(() => CAPACITY_OPTIONS, []);

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
        return (
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-foreground">{tour.title}</span>
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              {transportBadge(tour)}
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
      <Card><CardContent className="p-5"><h2 className="mb-3 text-base font-semibold">تورها ({fa(tours.length)})</h2><DataTable rows={visible} columns={columns} rowKey={(tour) => tour.id} searchKeys={['title', 'destination', 'typeLabel']} searchPlaceholder="جست‌وجوی عنوان، مقصد یا نوع تور…" selection={{ selected, onToggle: toggleSelected, onTogglePage: togglePageSelected }} toolbar={<><Select aria-label="فیلتر وضعیت ظرفیت" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} options={[{ value: 'all', label: 'همه ظرفیت‌ها' }, ...statusOptions]} className="h-9 w-40" /><Select aria-label="فیلتر انتشار" value={publishFilter} onChange={(e) => setPublishFilter(e.target.value as 'all' | 'draft' | 'published')} options={[{ value: 'all', label: 'همه (انتشار)' }, { value: 'draft', label: 'پیش‌نویس' }, { value: 'published', label: 'منتشرشده' }]} className="h-9 w-40" /></>} emptyTitle={statusFilter === 'all' && publishFilter === 'all' ? 'توری ثبت نشده است' : 'توری با این فیلتر پیدا نشد'} emptyDescription={statusFilter === 'all' && publishFilter === 'all' ? 'برای شروع، تور جدیدی اضافه کنید.' : 'فیلترها را عوض کنید یا جست‌وجو را پاک کنید.'} emptyAction={statusFilter === 'all' && publishFilter === 'all' ? { label: 'ساخت اولین تور', onClick: () => { window.location.href = '/admin/tours/new'; } } : undefined} /></CardContent></Card>
      {/* نوار عملیات گروهی (T15): فقط وقتی انتخابی هست دیده می‌شود */}
      {selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-sm border border-brand/20 bg-brand/5 p-3">
          <span className="text-xs font-bold text-foreground">{fa(selected.size)} تور انتخاب شده</span>
          <span className="mx-1 h-5 w-px bg-border" aria-hidden="true" />
          <Button size="sm" onClick={() => setBulkAction('publish')} className="text-xs">
            انتشار
          </Button>
          <Button size="sm" variant="outline" onClick={() => setBulkAction('unpublish')} className="text-xs">
            لغو انتشار
          </Button>
          <Button size="sm" variant="outline" onClick={() => setBulkAction('archive')} className="text-xs text-destructive hover:text-destructive">
            بایگانی
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())} className="text-xs">
            لغو انتخاب
          </Button>
        </div>
      )}
      {duplicating && (
        <DuplicateTourDialog
          key={duplicating.id}
          tour={duplicating}
          onClose={() => setDuplicating(null)}
          onDone={(newId) => { setDuplicating(null); router.push(newId ? `/admin/tours/${newId}` : '/admin/tours'); }}
        />
      )}
      {/* سه دیالوگ جمعی (T15): فهرست حداکثر ۵ نام + «و N تور دیگر» + جملهٔ پیامد */}
      {bulkAction && (
        <AlertDialog
          open
          onOpenChange={(open) => !open && setBulkAction(null)}
          title={
            bulkAction === 'publish' ? 'انتشار گروهی'
            : bulkAction === 'unpublish' ? 'لغو انتشار گروهی'
            : 'بایگانی گروهی'
          }
          description={
            <div className="space-y-1.5">
              <ul className="list-disc space-y-0.5 ps-4 text-start">
                {selectedTours.slice(0, 5).map((t) => (
                  <li key={t.id}>{t.title}</li>
                ))}
              </ul>
              {selectedTours.length > 5 && (
                <p className="text-xs text-muted-foreground">و {fa(selectedTours.length - 5)} تور دیگر</p>
              )}
              <p className="pt-1 text-xs font-bold text-foreground">
                {bulkAction === 'publish'
                  ? 'این تورها منتشر می‌شوند و روی سایت دیده می‌شوند.'
                  : bulkAction === 'unpublish'
                    ? 'این تورها از سایت پنهان می‌شوند.'
                    : 'این تورها بایگانی می‌شوند و از سایت پنهان می‌شوند؛ بعداً از صفحهٔ بایگانی می‌توانید برگردانیدشان.'}
              </p>
            </div>
          }
          confirmText={
            bulkAction === 'publish' ? 'انتشار تورها'
            : bulkAction === 'unpublish' ? 'لغو انتشار'
            : 'بایگانی تورها'
          }
          destructive={bulkAction === 'archive'}
          onConfirm={() => void runBulk()}
        />
      )}
      <AlertDialog open={Boolean(deleting)} onOpenChange={(open) => !open && setDeleting(null)} title="بایگانی تور" description={deleting ? `تور «${deleting.title}» بایگانی می‌شود و از سایت و فهرست‌ها پنهان می‌شود؛ بعداً از صفحهٔ بایگانی می‌توانید آن را برگردانید.` : ''} confirmText="بایگانی تور" destructive onConfirm={onDelete} />
    </div>
  );
}
