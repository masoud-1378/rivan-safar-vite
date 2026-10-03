'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { Pencil, Plus, Archive, Building2, Megaphone, MegaphoneOff } from 'lucide-react';
import { buttonClasses } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import DestinationForm from './DestinationForm';
import { deleteDestination, countDestinationTours, setDestinationPublishStatus, type DestinationRow } from './actions';
import { DESTINATION_CATEGORIES } from './categories';
import { AlertDialog } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DataTable, type Column } from '@/components/ui/data-table';
import { useToast } from '@/components/ui/toast';
import { fa } from '@/lib/utils';
import { safeErrorMessage } from '@/src/lib/error-message';

export default function CatalogManager({ initial, tourCounts = {} }: { initial: DestinationRow[]; tourCounts?: Record<string, number> }) {
  const [destinations, setDestinations] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<DestinationRow | null>(null);
  const [deleting, setDeleting] = useState<DestinationRow | null>(null);
  // گیت انتشار مقصد (قلم ۳ موج ۱): دیالوگ‌های جدا برای انتشار و بازگشت به پیش‌نویس، هر دو با نام مقصد.
  const [publishing, setPublishing] = useState<DestinationRow | null>(null);
  const [unpublishing, setUnpublishing] = useState<DestinationRow | null>(null);
  const [usage, setUsage] = useState<number | null>(null);
  const [usageFailed, setUsageFailed] = useState(false);
  const [pending, startTransition] = useTransition();
  const { toast } = useToast();
  const openDelete = (destination: DestinationRow) => {
    setDeleting(destination);
    setUsage(null);
    setUsageFailed(false);
    countDestinationTours(destination.slug).then(setUsage).catch(() => { setUsage(null); setUsageFailed(true); });
  };
  const reload = () => { setShowForm(false); setEditing(null); window.location.reload(); };
  const countries = destinations
    .filter((d) => d.type === 'country')
    .map((d) => ({ slug: d.slug, name: d.name }))
    .sort((a, b) => a.name.localeCompare(b.name, 'fa'));
  const onDelete = async () => {
    if (!deleting) return;
    try {
      await new Promise<void>((resolve, reject) => startTransition(async () => {
        try { await deleteDestination(deleting.id); resolve(); } catch (error) { reject(error); }
      }));
      window.location.reload();
    } catch (error) { toast({ variant: 'error', title: safeErrorMessage(error, 'خطا در حذف.') }); }
  };
  const onPublish = async () => {
    if (!publishing) return;
    const target = publishing;
    try {
      await new Promise<void>((resolve, reject) => startTransition(async () => {
        try { await setDestinationPublishStatus(target.id, 'published'); resolve(); } catch (error) { reject(error); }
      }));
      setDestinations((ds) => ds.map((d) => (d.id === target.id ? { ...d, publishStatus: 'published' as const } : d)));
      setPublishing(null);
      toast({ title: `«${target.name}» منتشر شد.`, description: 'از این پس روی سایت دیده می‌شود.' });
    } catch (error) { toast({ variant: 'error', title: error instanceof Error ? error.message : 'انتشار انجام نشد؛ دوباره تلاش کنید.' }); }
  };
  const onUnpublish = async () => {
    if (!unpublishing) return;
    const target = unpublishing;
    try {
      await new Promise<void>((resolve, reject) => startTransition(async () => {
        try { await setDestinationPublishStatus(target.id, 'draft'); resolve(); } catch (error) { reject(error); }
      }));
      setDestinations((ds) => ds.map((d) => (d.id === target.id ? { ...d, publishStatus: 'draft' as const } : d)));
      setUnpublishing(null);
      toast({ title: `«${target.name}» به پیش‌نویس برگشت.`, description: 'از سایت پنهان شد ولی در فهرست می‌ماند.' });
    } catch (error) { toast({ variant: 'error', title: error instanceof Error ? error.message : 'بازگشت به پیش‌نویس انجام نشد؛ دوباره تلاش کنید.' }); }
  };
  const edit = (destination: DestinationRow) => { setEditing(destination); setShowForm(false); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  // برچسب‌های فارسی نوع و دسته‌بندی — همان مقادیر کانونی فرم (یافتهٔ گشت: مقادیر خام انگلیسی نمایش داده می‌شد).
  // نکته: «region» دسته‌بندی کانونی نیست ولی در داده‌های قدیمی به‌عنوان دسته آمده؛ همان «منطقه» نشان داده می‌شود.
  const CATEGORY_LABELS: Record<string, string> = { ...Object.fromEntries(DESTINATION_CATEGORIES.map((c) => [c.value, c.label])), region: 'منطقه' };
  const TYPE_LABELS: Record<string, string> = { city: 'شهر', country: 'کشور', region: 'منطقه' };
  const columns: Column<DestinationRow>[] = [
    { key: 'name', header: 'نام', sortable: true, cell: (destination) => <span className="text-panel-label">{destination.name}</span> },
    { key: 'type', header: 'نوع', sortable: true, cell: (destination) => TYPE_LABELS[destination.type] ?? destination.type ?? '—' },
    { key: 'category', header: 'دسته‌بندی', sortable: true, cell: (destination) => (destination.category ? (CATEGORY_LABELS[destination.category] ?? destination.category) : '—') },
    // گیت انتشار مقصد (قلم ۳ موج ۱): وضعیت انتشار با همان قرارداد بصری تورها.
    { key: 'publishStatus', header: 'انتشار', sortable: true, cell: (destination) => <Badge variant={destination.publishStatus === 'published' ? 'success' : 'warning'}>{destination.publishStatus === 'published' ? 'منتشرشده' : 'پیش‌نویس'}</Badge> },
    { key: 'startingPrice', header: 'قیمت شروع', cell: (destination) => destination.startingPrice || '—' },
    // ایراد ۲۱: قرارداد انتشار مقصدها همین‌جا به چشم ادمین می‌آید — مقصدِ
    // بایگانی‌نشده روی سایت است، ولی صفحه‌اش وقتی کامل است که تور فعال داشته باشد.
    { key: 'slug', header: 'وضعیت سایت', cell: (destination) => {
      const n = tourCounts[destination.slug] ?? 0;
      return n > 0
        ? <span className="text-panel-caption font-semibold text-emerald-700 dark:text-emerald-400">فعال روی سایت · {fa(n)} تور</span>
        : <span className="text-panel-caption font-semibold text-amber-600 dark:text-amber-400">بدون تور فعال</span>;
    } },
    { key: 'id', header: 'عملیات', className: 'w-56', cell: (destination) => <div className="flex flex-wrap gap-1">
      {destination.publishStatus === 'published'
        ? <Button variant="ghost" size="sm" className="max-md:min-h-11" onClick={() => setUnpublishing(destination)} disabled={pending}><MegaphoneOff />بازگشت به پیش‌نویس</Button>
        : <Button variant="ghost" size="sm" className="max-md:min-h-11" onClick={() => setPublishing(destination)} disabled={pending}><Megaphone />انتشار</Button>}
      <Button variant="ghost" size="sm" className="max-md:min-h-11" onClick={() => edit(destination)}><Pencil />ویرایش</Button>
      <Link href={`/admin/catalog?tab=hotels&city=${encodeURIComponent(destination.slug)}`} title={`افزودن هتل در ${destination.name}`} className={buttonClasses('ghost', 'sm', 'max-md:min-h-11')}><Building2 />هتل</Link>
      <Button variant="ghost" size="sm" className="text-destructive max-md:min-h-11" onClick={() => openDelete(destination)} disabled={pending}><Archive />بایگانی</Button>
    </div> },
  ];

  return (
    <div className="admin-enter space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-panel-display text-foreground">مکان‌ها و مقصدها</h1><p className="mt-2 text-panel-body text-muted-foreground">مدیریت مستقیم جدول مقصدها</p></div><div className="flex items-center gap-2"><Button className="h-11 lg:h-10" onClick={() => { setEditing(null); setShowForm(true); }}><Plus />افزودن مقصد جدید</Button></div></div>
      {showForm || editing ? <DestinationForm key={editing?.id ?? 'new'} initial={editing} editingId={editing?.id ?? null} onDone={reload} countries={countries} /> : null}
      {/* گیت انتشار جدا برای مقصد (قلم ۳ موج ۱، تصمیم ۶): فقط «منتشرشده»ها روی سایت دیده می‌شوند. */}
      <p className="rounded-sm border border-border bg-muted/30 px-4 py-3 text-panel-caption leading-relaxed text-muted-foreground">
        گیت انتشار مقصد: فقط مقصدهای «منتشرشده» روی سایت دیده می‌شوند. انتشار نیازمند نام، کشور/ناحیه و دست‌کم توضیح یا تصویر است؛ «بازگشت به پیش‌نویس» مقصد را از سایت پنهان می‌کند ولی از فهرست حذف نمی‌کند.
      </p>
      <Card><CardContent className="p-5"><h2 className="mb-4 text-panel-heading">مقصدها ({fa(destinations.length)})</h2><DataTable rows={destinations} columns={columns} rowKey={(destination) => destination.id} searchKeys={['name', 'nameEn', 'type', 'category']} searchPlaceholder="جست‌وجوی نام، نوع یا دسته‌بندی…" emptyTitle="مقصدی ثبت نشده است" emptyDescription="برای شروع، مقصد جدیدی اضافه کنید." emptyAction={destinations.length === 0 ? { label: 'افزودن اولین مقصد', onClick: () => { setEditing(null); setShowForm(true); window.scrollTo({ top: 0, behavior: 'smooth' }); } } : undefined} /></CardContent></Card>
      <AlertDialog open={Boolean(deleting)} onOpenChange={(open) => { if (!open) { setDeleting(null); setUsage(null); setUsageFailed(false); } }} title="بایگانی مقصد" description={deleting ? (<span className="block space-y-2"><span className="block">مقصد «{deleting.name}» بایگانی می‌شود و از سایت و فهرست‌ها پنهان می‌ماند؛ بعداً از صفحهٔ بایگانی می‌توانید آن را برگردانید.</span>{usageFailed ? <span className="block font-medium text-destructive">شمارش ارجاع‌ها ناموفق بود؛ با احتیاط بایگانی کنید.</span> : null}{usage !== null && usage > 0 ? <span className="block font-medium text-amber-600 dark:text-amber-400">این مقصد در {fa(usage)} تور استفاده شده است؛ آن تورها سر جایشان می‌مانند و فقط این مقصد از دسترس خارج می‌شود.</span> : null}</span>) : ''} confirmText="بایگانی مقصد" destructive onConfirm={onDelete} />
      <AlertDialog
        open={Boolean(publishing)}
        onOpenChange={(open) => { if (!open) setPublishing(null); }}
        title="انتشار مقصد"
        description={publishing ? (<span className="block space-y-2"><span className="block">مقصد «{publishing.name}» منتشر می‌شود و روی سایت دیده می‌شود.</span><span className="block text-muted-foreground">شرایط انتشار: نام، کشور/ناحیه و دست‌کم توضیح یا تصویر؛ اگر کامل نباشد، انتشار انجام نمی‌شود.</span></span>) : ''}
        confirmText="انتشار"
        onConfirm={onPublish}
      />
      <AlertDialog
        open={Boolean(unpublishing)}
        onOpenChange={(open) => { if (!open) setUnpublishing(null); }}
        title="بازگشت مقصد به پیش‌نویس"
        description={unpublishing ? `مقصد «${unpublishing.name}» از سایت پنهان می‌شود ولی در فهرست می‌ماند؛ هر وقت خواستید دوباره منتشرش کنید.` : ''}
        confirmText="بازگشت به پیش‌نویس"
        onConfirm={onUnpublish}
      />
    </div>
  );
}
