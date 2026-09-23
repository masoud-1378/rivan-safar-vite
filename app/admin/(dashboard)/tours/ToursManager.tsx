'use client';

import { useState, useTransition } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import TourForm from './TourForm';
import { deleteTour, type TourRow } from './actions';
import { AlertDialog } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DataTable, type Column } from '@/components/ui/data-table';
import { fa, formatToman } from '@/lib/utils';

export default function ToursManager({ initial }: { initial: TourRow[] }) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<TourRow | null>(null);
  const [deleting, setDeleting] = useState<TourRow | null>(null);
  const [pending, startTransition] = useTransition();

  const reload = () => { setShowForm(false); setEditing(null); window.location.reload(); };
  const onDelete = async () => {
    if (!deleting) return;
    try {
      await new Promise<void>((resolve, reject) => startTransition(async () => {
        try { await deleteTour(deleting.id); resolve(); } catch (error) { reject(error); }
      }));
      window.location.reload();
    } catch (error) { alert(error instanceof Error ? error.message : 'خطا در حذف.'); }
  };
  const edit = (tour: TourRow) => { setEditing(tour); setShowForm(false); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const columns: Column<TourRow>[] = [
    { key: 'title', header: 'عنوان', sortable: true, cell: (tour) => <span className="font-semibold">{tour.title}</span> },
    { key: 'destination', header: 'مقصد', sortable: true },
    { key: 'typeLabel', header: 'نوع', cell: (tour) => tour.typeLabel || '—' },
    { key: 'price', header: 'قیمت', numeric: true, sortable: true, cell: (tour) => formatToman(Number(tour.price)) },
    { key: 'status', header: 'وضعیت', cell: (tour) => <Badge variant={tour.status === 'published' ? 'success' : tour.status === 'pending' ? 'warning' : 'secondary'}>{tour.statusLabel || tour.status}</Badge> },
    { key: 'id', header: 'عملیات', className: 'w-36', cell: (tour) => <div className="flex gap-1"><Button variant="ghost" size="sm" onClick={() => edit(tour)}><Pencil />ویرایش</Button><Button variant="ghost" size="sm" className="text-destructive" onClick={() => setDeleting(tour)} disabled={pending}><Trash2 />حذف</Button></div> },
  ];

  return (
    <div className="admin-enter space-y-6">
      <div className="flex items-center justify-between gap-2"><div><h1 className="text-2xl font-bold tracking-tight text-foreground">تورها</h1><p className="mt-1 text-sm text-muted-foreground">مدیریت مستقیم جدول تورها</p></div><Button onClick={() => { setEditing(null); setShowForm(true); }}><Plus />افزودن تور جدید</Button></div>
      {showForm || editing ? <Card><CardContent className="p-5"><TourForm key={editing?.id ?? 'new'} initial={editing} editingId={editing?.id ?? null} onDone={reload} /></CardContent></Card> : null}
      <Card><CardContent className="p-5"><h2 className="mb-3 text-base font-semibold">تورها ({fa(initial.length)})</h2><DataTable rows={initial} columns={columns} rowKey={(tour) => tour.id} searchKeys={['title', 'destination', 'typeLabel']} searchPlaceholder="جست‌وجوی عنوان، مقصد یا نوع تور…" emptyTitle="توری ثبت نشده است" emptyDescription="برای شروع، تور جدیدی اضافه کنید." /></CardContent></Card>
      <AlertDialog open={Boolean(deleting)} onOpenChange={(open) => !open && setDeleting(null)} title="حذف تور" description={deleting ? `آیا از حذف تور «${deleting.title}» اطمینان دارید؟` : ''} confirmText="حذف تور" destructive onConfirm={onDelete} />
    </div>
  );
}
