'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { Pencil, Plus, Archive, Building2 } from 'lucide-react';
import { buttonClasses } from '@/components/ui/button';
import DestinationForm from './DestinationForm';
import { deleteDestination, countDestinationTours, type DestinationRow } from './actions';
import { DESTINATION_CATEGORIES } from './categories';
import SectionSettingsDialog from '../SectionSettingsDialog';
import { AlertDialog } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DataTable, type Column } from '@/components/ui/data-table';
import { useToast } from '@/components/ui/toast';
import { fa } from '@/lib/utils';

export default function CatalogManager({ initial, sectionSettings }: { initial: DestinationRow[]; sectionSettings: Record<string, string> }) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<DestinationRow | null>(null);
  const [deleting, setDeleting] = useState<DestinationRow | null>(null);
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
  const countries = initial
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
    } catch (error) { toast({ variant: 'error', title: error instanceof Error ? error.message : 'خطا در حذف.' }); }
  };
  const edit = (destination: DestinationRow) => { setEditing(destination); setShowForm(false); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  // برچسب‌های فارسی نوع و دسته‌بندی — همان مقادیر کانونی فرم (یافتهٔ گشت: مقادیر خام انگلیسی نمایش داده می‌شد).
  // نکته: «region» دسته‌بندی کانونی نیست ولی در داده‌های قدیمی به‌عنوان دسته آمده؛ همان «منطقه» نشان داده می‌شود.
  const CATEGORY_LABELS: Record<string, string> = { ...Object.fromEntries(DESTINATION_CATEGORIES.map((c) => [c.value, c.label])), region: 'منطقه' };
  const TYPE_LABELS: Record<string, string> = { city: 'شهر', country: 'کشور', region: 'منطقه' };
  const columns: Column<DestinationRow>[] = [
    { key: 'name', header: 'نام', sortable: true, cell: (destination) => <span className="font-semibold">{destination.name}</span> },
    { key: 'type', header: 'نوع', sortable: true, cell: (destination) => TYPE_LABELS[destination.type] ?? destination.type ?? '—' },
    { key: 'category', header: 'دسته‌بندی', sortable: true, cell: (destination) => (destination.category ? (CATEGORY_LABELS[destination.category] ?? destination.category) : '—') },
    { key: 'startingPrice', header: 'قیمت شروع', cell: (destination) => destination.startingPrice || '—' },
    { key: 'id', header: 'عملیات', className: 'w-44', cell: (destination) => <div className="flex flex-wrap gap-1"><Button variant="ghost" size="sm" className="max-md:min-h-11" onClick={() => edit(destination)}><Pencil />ویرایش</Button><Link href={`/admin/catalog?tab=hotels&city=${encodeURIComponent(destination.slug)}`} title={`افزودن هتل در ${destination.name}`} className={buttonClasses('ghost', 'sm', 'max-md:min-h-11')}><Building2 />هتل</Link><Button variant="ghost" size="sm" className="text-destructive max-md:min-h-11" onClick={() => openDelete(destination)} disabled={pending}><Archive />بایگانی</Button></div> },
  ];

  return (
    <div className="admin-enter space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-2xl font-bold text-foreground">مکان‌ها و مقصدها</h1><p className="mt-1 text-sm text-muted-foreground">مدیریت مستقیم جدول مقصدها</p></div><div className="flex items-center gap-2"><SectionSettingsDialog sectionKey="places" title="تنظیمات مقصدها" tabs={['general']} values={sectionSettings} /><Button className="h-11 lg:h-10" onClick={() => { setEditing(null); setShowForm(true); }}><Plus />افزودن مقصد جدید</Button></div></div>
      {showForm || editing ? <DestinationForm key={editing?.id ?? 'new'} initial={editing} editingId={editing?.id ?? null} onDone={reload} countries={countries} /> : null}
      <Card><CardContent className="p-5"><h2 className="mb-3 text-base font-semibold">مقصدها ({fa(initial.length)})</h2><DataTable rows={initial} columns={columns} rowKey={(destination) => destination.id} searchKeys={['name', 'nameEn', 'type', 'category']} searchPlaceholder="جست‌وجوی نام، نوع یا دسته‌بندی…" emptyTitle="مقصدی ثبت نشده است" emptyDescription="برای شروع، مقصد جدیدی اضافه کنید." emptyAction={initial.length === 0 ? { label: 'افزودن اولین مقصد', onClick: () => { setEditing(null); setShowForm(true); window.scrollTo({ top: 0, behavior: 'smooth' }); } } : undefined} /></CardContent></Card>
      <AlertDialog open={Boolean(deleting)} onOpenChange={(open) => { if (!open) { setDeleting(null); setUsage(null); setUsageFailed(false); } }} title="بایگانی مقصد" description={deleting ? (<span className="block space-y-2"><span className="block">مقصد «{deleting.name}» بایگانی می‌شود و از سایت و فهرست‌ها پنهان می‌ماند؛ بعداً از صفحهٔ بایگانی می‌توانید آن را برگردانید.</span>{usageFailed ? <span className="block font-medium text-destructive">شمارش ارجاع‌ها ناموفق بود؛ با احتیاط بایگانی کنید.</span> : null}{usage !== null && usage > 0 ? <span className="block font-medium text-amber-600 dark:text-amber-400">این مقصد در {fa(usage)} تور استفاده شده است؛ آن تورها سر جایشان می‌مانند و فقط این مقصد از دسترس خارج می‌شود.</span> : null}</span>) : ''} confirmText="بایگانی مقصد" destructive onConfirm={onDelete} />
    </div>
  );
}
