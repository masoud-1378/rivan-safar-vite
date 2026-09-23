'use client';

import { useState, useTransition } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import DestinationForm from './DestinationForm';
import { deleteDestination, type DestinationRow } from './actions';
import SectionSettingsDialog from '../SectionSettingsDialog';
import { AlertDialog } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DataTable, type Column } from '@/components/ui/data-table';
import { fa } from '@/lib/utils';

export default function CatalogManager({ initial, sectionSettings }: { initial: DestinationRow[]; sectionSettings: Record<string, string> }) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<DestinationRow | null>(null);
  const [deleting, setDeleting] = useState<DestinationRow | null>(null);
  const [pending, startTransition] = useTransition();
  const reload = () => { setShowForm(false); setEditing(null); window.location.reload(); };
  const onDelete = async () => {
    if (!deleting) return;
    try {
      await new Promise<void>((resolve, reject) => startTransition(async () => {
        try { await deleteDestination(deleting.id); resolve(); } catch (error) { reject(error); }
      }));
      window.location.reload();
    } catch (error) { alert(error instanceof Error ? error.message : 'خطا در حذف.'); }
  };
  const edit = (destination: DestinationRow) => { setEditing(destination); setShowForm(false); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const columns: Column<DestinationRow>[] = [
    { key: 'name', header: 'نام', sortable: true, cell: (destination) => <span className="font-semibold">{destination.name}</span> },
    { key: 'type', header: 'نوع', sortable: true },
    { key: 'category', header: 'دسته‌بندی', sortable: true, cell: (destination) => destination.category || '—' },
    { key: 'startingPrice', header: 'قیمت شروع', cell: (destination) => destination.startingPrice || '—' },
    { key: 'id', header: 'عملیات', className: 'w-36', cell: (destination) => <div className="flex gap-1"><Button variant="ghost" size="sm" onClick={() => edit(destination)}><Pencil />ویرایش</Button><Button variant="ghost" size="sm" className="text-destructive" onClick={() => setDeleting(destination)} disabled={pending}><Trash2 />حذف</Button></div> },
  ];

  return (
    <div className="admin-enter space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2"><div><h1 className="text-2xl font-bold tracking-tight text-foreground">مکان‌ها و مقصدها</h1><p className="mt-1 text-sm text-muted-foreground">مدیریت مستقیم جدول مقصدها</p></div><div className="flex items-center gap-2"><SectionSettingsDialog sectionKey="places" title="تنظیمات مقصدها" tabs={['general']} values={sectionSettings} /><Button onClick={() => { setEditing(null); setShowForm(true); }}><Plus />افزودن مقصد جدید</Button></div></div>
      {showForm || editing ? <Card><CardContent className="p-5"><DestinationForm key={editing?.id ?? 'new'} initial={editing} editingId={editing?.id ?? null} onDone={reload} /></CardContent></Card> : null}
      <Card><CardContent className="p-5"><h2 className="mb-3 text-base font-semibold">مقصدها ({fa(initial.length)})</h2><DataTable rows={initial} columns={columns} rowKey={(destination) => destination.id} searchKeys={['name', 'nameEn', 'type', 'category']} searchPlaceholder="جست‌وجوی نام، نوع یا دسته‌بندی…" emptyTitle="مقصدی ثبت نشده است" emptyDescription="برای شروع، مقصد جدیدی اضافه کنید." /></CardContent></Card>
      <AlertDialog open={Boolean(deleting)} onOpenChange={(open) => !open && setDeleting(null)} title="حذف مقصد" description={deleting ? `آیا از حذف مقصد «${deleting.name}» اطمینان دارید؟` : ''} confirmText="حذف مقصد" destructive onConfirm={onDelete} />
    </div>
  );
}
