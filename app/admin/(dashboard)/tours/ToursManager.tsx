'use client';

import { useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Copy, Pencil, Plus, Archive, Plane, Train, Bus, Ship, Route, ShieldCheck, Eye } from 'lucide-react';
import { deleteTour, setToursPublishStatusBulk, archiveToursBulk, type TourRow } from './actions';
import { getAllDraftFallbackAnswer } from '../settings/actions';
import { AllDraftFallbackDialog } from './AllDraftFallbackDialog';
import { CAPACITY_OPTIONS } from './tour-helpers';
import SectionSettingsDialog from '../SectionSettingsDialog';
import { AlertDialog } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTable, type Column } from '@/components/ui/data-table';
import { Select } from '@/components/ui/select';
import { useToast } from '@/components/ui/toast';
import { cn, fa } from '@/lib/utils';
import { PriceCell } from './PriceCell';
import { DuplicateTourDialog } from './DuplicateTourDialog';

interface ToursManagerProps {
  initial: TourRow[];
  sectionSettings: Record<string, string>;
}

/**
 * بج شیوهٔ سفر (قلم ۳ موج ۰): فقط از ستون ذخیره‌شدهٔ transport_kind؛ حدس regex
 * از روی نام ایرلاین حذف شد. ستون در دیتابیس notNull با پیش‌فرض 'air' است،
 * پس ردیف قدیمی هم مقدار ذخیره‌شده دارد — این «air» حدس نیست، دیتاست.
 */
function transportBadge(tour: TourRow) {
  const kind = tour.transportKind;
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
          <Route className="size-3" /> ترکیبی
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 rounded bg-sky-500/10 px-1.5 py-0.5 text-sky-600 font-medium">
          <Plane className="size-3" /> هوایی{carrier === 'پرواز' ? '' : ` (${carrier})`}
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
  // قلم ۴ موج ۱: دیالوگ سؤال «همه پیش‌نویس» — وقتی آخرین تور منتشرشده هم
  // از سایت برداشته می‌شود و مدیر هنوز جواب نداده، همان لحظه باز می‌شود.
  const [askFallbackOpen, setAskFallbackOpen] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  /**
   * قلم ۴ موج ۱: اگر با این عملیات شمار تورهای منتشرشده به صفر رسید و جوابی
   * ذخیره نشده، دیالوگ سؤال همان لحظه باز می‌شود. بستن بدون انتخاب = بنر
   * صفحه (بعد از رفرش) سؤال را یادآوری می‌کند.
   */
  const maybeAskAllDraftFallback = async (publishedRemaining: number) => {
    if (publishedRemaining !== 0) return;
    try {
      const answer = await getAllDraftFallbackAnswer();
      if (answer === null) setAskFallbackOpen(true);
    } catch {
      // خطا در خواندن جواب → بنر سرور سؤال را یادآوری می‌کند؛ دیالوگ نه.
    }
  };

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
        const res = await archiveToursBulk([...selected]);
        setTours((ts) => ts.filter((t) => !selected.has(t.id)));
        toast({ title: `${fa(selected.size)} تور بایگانی شد`, description: 'از سایت پنهان شدند؛ از صفحهٔ بایگانی می‌توانید بازیابی‌شان کنید.' });
        await maybeAskAllDraftFallback(res.publishedRemaining);
      } else {
        const next = bulkAction === 'publish' ? 'published' : 'draft';
        const res = await setToursPublishStatusBulk([...selected], next);
        // گیت انتشار گروهی (موج ۱، قلم ۲): تورهای ناقص منتشر نمی‌شوند؛
        // فقط تورهای واقعاً منتشرشده در فهرست به‌روز می‌شوند.
        const skippedIds = new Set(res.skipped.map((s) => s.id));
        setTours((ts) => ts.map((t) => (selected.has(t.id) && !skippedIds.has(t.id) ? { ...t, publishStatus: next } : t)));
        if (bulkAction === 'publish') {
          if (res.skipped.length === 0) {
            toast({
              title: `${fa(res.count)} تور منتشر شد`,
              description: 'منتشر شدند و روی سایت دیده می‌شوند.',
            });
          } else {
            const shown = res.skipped.slice(0, 3).map((s) => `«${s.title}»: ${s.missing.join('، ')}`);
            toast({
              title: `${fa(res.count)} تور منتشر شد و ${fa(res.skipped.length)} تور ناقص ماند`,
              description: `ناقص ماندند و منتشر نشدند — ${shown.join('؛ ')}${res.skipped.length > 3 ? `؛ و ${fa(res.skipped.length - 3)} تور دیگر` : ''}`,
            });
          }
        } else {
          toast({
            title: `انتشار ${fa(selected.size)} تور لغو شد`,
            description: 'از سایت پنهان شدند.',
          });
        }
        // قلم ۴ موج ۱: اگر لغو انتشار گروهی به صفر تور منتشرشده رسید، همان لحظه بپرس.
        await maybeAskAllDraftFallback(res.publishedRemaining);
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
      const res = await new Promise<{ publishedRemaining: number }>((resolve, reject) => startTransition(async () => {
        try { resolve(await deleteTour(deleting.id)); } catch (error) { reject(error); }
      }));
      if (res.publishedRemaining === 0) {
        // قلم ۴ موج ۱: بدون ریلود — تور از فهرست محلی حذف می‌شود و دیالوگ
        // سؤال همان لحظه باز می‌شود (اگر جوابی ذخیره نشده باشد).
        const goneId = deleting.id;
        setDeleting(null);
        setTours((ts) => ts.filter((t) => t.id !== goneId));
        await maybeAskAllDraftFallback(0);
        return;
      }
      window.location.reload();
    } catch (error) { toast({ variant: 'error', title: error instanceof Error ? error.message : 'حذف انجام نشد؛ دوباره تلاش کنید.' }); }
  };

  // میز ۲: دکمه‌های عملیات ردیف — یک تعریف برای جدول دسکتاپ و کارت موبایل؛
  // در موبایل تارگت لمسی ۴۴px (max-md:min-h-11) و در کارت تمام‌عرض.
  const tourActions = (tour: TourRow, card = false) => (
    <div className={cn(card ? "flex gap-1.5" : "flex items-center gap-1")} onClick={(e) => e.stopPropagation()}>
      <Button variant="ghost" size="icon" title="نمایش در سایت" aria-label={`نمایش تور «${tour.title}» در سایت (تب تازه)`} onClick={() => window.open(`/tour/${tour.slug}`, '_blank', 'noopener,noreferrer')} className={cn(card && "flex-none")}>
        <Eye />
      </Button>
      <Button variant="ghost" size="sm" className={cn("max-md:min-h-11", card && "flex-1")} onClick={() => router.push(`/admin/tours/${tour.id}`)}>
        <Pencil />ویرایش
      </Button>
      <Button variant="ghost" size="sm" className={cn("max-md:min-h-11", card && "flex-1")} onClick={() => setDuplicating(tour)}>
        <Copy />تکثیر
      </Button>
      {!card && <span className="mx-1 h-5 w-px bg-border" aria-hidden="true" />}
      <Button variant="ghost" size="sm" className={cn("text-destructive max-md:min-h-11", card && "flex-1")} onClick={() => setDeleting(tour)} disabled={pending}>
        <Archive />بایگانی
      </Button>
    </div>
  );

  const onPriceSaved = (id: string) => (price: number, formattedPrice: string) =>
    setTours((ts) => ts.map((t) => (t.id === id ? { ...t, price, formattedPrice } : t)));

  // میز ۲: کارت موبایل تور — زیر md هر ردیف یک کارت عمودی است.
  const tourCard = (tour: TourRow & Record<string, unknown>) => (
    <div className="rounded-sm border border-border bg-card p-3">
      <div className="flex items-start justify-between gap-2">
        <span className="flex min-w-0 items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={selected.has(tour.id)}
            onCheckedChange={() => toggleSelected(tour.id)}
            aria-label={`انتخاب تور ${tour.title}`}
          />
          <span className="truncate font-semibold text-foreground">{tour.title}</span>
        </span>
      </div>
      <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
        {transportBadge(tour as TourRow)}
        {tour.badge === 'حرکت تضمین‌شده' && (
          <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-1.5 py-0.5 text-emerald-600 font-bold">
            <ShieldCheck className="size-3" /> حرکت تضمین‌شده
          </span>
        )}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        <span className="font-medium text-foreground">{tour.destination || '—'}</span>
        <span className="block">از مبدأ: {tour.origin || '—'} · {tour.typeLabel || '—'}</span>
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <Badge variant={tour.status === 'confirmed' ? 'success' : tour.status === 'pending' ? 'warning' : 'secondary'}>
          {(tour.statusLabel as string) || (tour.status as string)}
        </Badge>
        <Badge variant={tour.publishStatus === 'published' ? 'success' : 'warning'}>
          {tour.publishStatus === 'published' ? 'منتشرشده' : 'پیش‌نویس'}
        </Badge>
      </div>
      <div className="mt-1" onClick={(e) => e.stopPropagation()}>
        <PriceCell id={tour.id} price={tour.price as number} onSaved={onPriceSaved(tour.id)} />
      </div>
      <div className="mt-2 border-t border-border pt-2">{tourActions(tour as TourRow, true)}</div>
    </div>
  );

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
          onSaved={onPriceSaved(tour.id)}
        />
      ),
    },
    // وضعیت ظرفیت (میز T2: جدا از وضعیت انتشار؛ confirmed/pending/… فقط ظرفیت‌اند).
    { key: 'status', header: 'ظرفیت', cell: (tour) => <Badge variant={tour.status === 'confirmed' ? 'success' : tour.status === 'pending' ? 'warning' : 'secondary'}>{tour.statusLabel || tour.status}</Badge> },
    // شرایط انتشار (میز T2، مایگریشن 0011): پیش‌نویس روی سایت دیده نمی‌شود.
    { key: 'publishStatus', header: 'انتشار', cell: (tour) => <Badge variant={tour.publishStatus === 'published' ? 'success' : 'warning'}>{tour.publishStatus === 'published' ? 'منتشرشده' : 'پیش‌نویس'}</Badge> },
    // قلم ۲ و ۳ (میز T1): تکثیر با دیالوگ تنظیمات و دور از بایگانی؛ ویرایش به مسیر جدا می‌رود (میز T2).
    { key: 'id', header: 'عملیات', cell: (tour) => tourActions(tour) },
  ];

  return (
    <div className="admin-enter space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-2xl font-bold text-foreground">تورها</h1><p className="mt-1 text-sm text-muted-foreground">مدیریت مستقیم جدول تورها — قیمت پایه را می‌توانید مستقیم از جدول ویرایش کنید</p></div><div className="flex items-center gap-2"><SectionSettingsDialog sectionKey="tours" title="تنظیمات تورها" tabs={['general']} values={sectionSettings} /><Link href="/admin/tours/new"><Button className="h-11 lg:h-10"><Plus />افزودن تور جدید</Button></Link></div></div>
      <Card><CardContent className="p-5"><h2 className="mb-3 text-base font-semibold">تورها ({fa(tours.length)})</h2><DataTable rows={visible} columns={columns} rowKey={(tour) => tour.id} searchKeys={['title', 'destination', 'typeLabel']} searchPlaceholder="جست‌وجوی عنوان، مقصد یا نوع تور…" selection={{ selected, onToggle: toggleSelected, onTogglePage: togglePageSelected }} mobileCard={tourCard} toolbar={<><Select aria-label="فیلتر وضعیت ظرفیت" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} options={[{ value: 'all', label: 'همه ظرفیت‌ها' }, ...statusOptions]} className="h-9 w-40 max-md:min-h-11" /><Select aria-label="فیلتر انتشار" value={publishFilter} onChange={(e) => setPublishFilter(e.target.value as 'all' | 'draft' | 'published')} options={[{ value: 'all', label: 'همه' }, { value: 'draft', label: 'پیش‌نویس' }, { value: 'published', label: 'منتشرشده' }]} className="h-9 w-40 max-md:min-h-11" /></>} emptyTitle={statusFilter === 'all' && publishFilter === 'all' ? 'توری ثبت نشده است' : 'توری با این فیلتر پیدا نشد'} emptyDescription={statusFilter === 'all' && publishFilter === 'all' ? 'برای شروع، تور جدیدی اضافه کنید.' : 'فیلترها را عوض کنید یا جست‌وجو را پاک کنید.'} emptyAction={statusFilter === 'all' && publishFilter === 'all' ? { label: 'ساخت اولین تور', onClick: () => { window.location.href = '/admin/tours/new'; } } : undefined} /></CardContent></Card>
      {/* نوار عملیات گروهی (T15): فقط وقتی انتخابی هست دیده می‌شود */}
      {selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-sm border border-brand/20 bg-brand/5 p-3">
          <span className="text-xs font-bold text-foreground">{fa(selected.size)} تور انتخاب‌شده</span>
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
                  ? 'تورهایی که گیت انتشار را پاس کنند منتشر می‌شوند و روی سایت دیده می‌شوند؛ تورهای ناقص منتشر نمی‌شوند.'
                  : bulkAction === 'unpublish'
                    ? 'این تورها از سایت پنهان می‌شوند.'
                    : 'این تورها بایگانی می‌شوند و از سایت پنهان می‌شوند؛ بعداً از صفحهٔ بایگانی می‌توانید بازیابی‌شان کنید.'}
              </p>
            </div>
          }
          confirmText={
            bulkAction === 'publish' ? 'انتشار تورها'
            : bulkAction === 'unpublish' ? 'لغو انتشار تورها'
            : 'بایگانی تورها'
          }
          destructive={bulkAction === 'archive'}
          onConfirm={() => void runBulk()}
        />
      )}
      <AlertDialog open={Boolean(deleting)} onOpenChange={(open) => !open && setDeleting(null)} title="بایگانی تور" description={deleting ? `تور «${deleting.title}» بایگانی می‌شود و از سایت و فهرست‌ها پنهان می‌شود؛ بعداً از صفحهٔ بایگانی می‌توانید آن را بازیابی کنید.` : ''} confirmText="بایگانی تور" destructive onConfirm={onDelete} />
      {/* قلم ۴ موج ۱: دیالوگ سؤال «همه پیش‌نویس». بستن بدون انتخاب → رفرش تا بنر سرور سؤال را یادآوری کند. */}
      <AllDraftFallbackDialog
        open={askFallbackOpen}
        onOpenChange={(open) => {
          setAskFallbackOpen(open);
          if (!open) router.refresh();
        }}
        onSaved={() => toast({ title: 'ذخیره شد' })}
      />
    </div>
  );
}
