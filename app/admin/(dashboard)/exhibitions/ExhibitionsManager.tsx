'use client';

import { useState, useTransition } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import ExhibitionForm from './ExhibitionForm';
import { deleteExhibition, setExhibitionStatus, type ExhibitionRow, type ExhibitionStatus } from './actions';
import { AlertDialog } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DataTable, type Column } from '@/components/ui/data-table';
import { Select } from '@/components/ui/select';
import { fa } from '@/lib/utils';

const STATUS_MAP: Record<ExhibitionStatus, { label: string; variant: 'success' | 'warning' | 'secondary' | 'brand' | 'destructive' }> = {
  published: { label: 'منتشرشده', variant: 'success' }, review: { label: 'در حال بازبینی', variant: 'warning' }, draft: { label: 'پیش‌نویس', variant: 'secondary' }, paused: { label: 'متوقف', variant: 'brand' }, archived: { label: 'بایگانی', variant: 'destructive' },
};
const statusOptions = (Object.keys(STATUS_MAP) as ExhibitionStatus[]).map((value) => ({ value, label: STATUS_MAP[value].label }));

export default function ExhibitionsManager({ initial }: { initial: ExhibitionRow[] }) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ExhibitionRow | null>(null);
  const [deleting, setDeleting] = useState<ExhibitionRow | null>(null);
  const [pending, startTransition] = useTransition();
  const reload = () => { setShowForm(false); setEditing(null); window.location.reload(); };
  const onDelete = async () => {
    if (!deleting) return;
    try { await new Promise<void>((resolve, reject) => startTransition(async () => { try { await deleteExhibition(deleting.id); resolve(); } catch (error) { reject(error); } })); window.location.reload(); } catch (error) { alert(error instanceof Error ? error.message : 'خطا در حذف.'); }
  };
  const onStatusChange = (id: string, status: ExhibitionStatus) => startTransition(async () => { try { await setExhibitionStatus(id, status); window.location.reload(); } catch (error) { alert(error instanceof Error ? error.message : 'خطا در تغییر وضعیت.'); } });
  const edit = (exhibition: ExhibitionRow) => { setEditing(exhibition); setShowForm(false); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const columns: Column<ExhibitionRow>[] = [
    { key: 'titleFa', header: 'عنوان نمایشگاه', sortable: true, cell: (exhibition) => <span className="font-medium">{exhibition.titleFa}</span> },
    { key: 'slug', header: 'نامک', sortable: true, cell: (exhibition) => <span dir="ltr">{exhibition.slug}</span> },
    { key: 'country', header: 'کشور / شهر', cell: (exhibition) => [exhibition.country, exhibition.city].filter(Boolean).join(' / ') || '—' },
    { key: 'solarDate', header: 'تاریخ شمسی', cell: (exhibition) => exhibition.solarDate || '—' },
    { key: 'status', header: 'وضعیت', cell: (exhibition) => <Badge variant={STATUS_MAP[exhibition.status].variant}>{STATUS_MAP[exhibition.status].label}</Badge> },
    { key: 'id', header: 'تغییر وضعیت', cell: (exhibition) => <Select aria-label={`تغییر وضعیت ${exhibition.titleFa}`} value={exhibition.status} disabled={pending} onChange={(event) => onStatusChange(exhibition.id, event.target.value as ExhibitionStatus)} className="h-8 min-w-36 text-xs" options={statusOptions} /> },
    { key: 'updatedAt', header: 'عملیات', className: 'w-36', cell: (exhibition) => <div className="flex gap-1"><Button variant="ghost" size="sm" onClick={() => edit(exhibition)}><Pencil />ویرایش</Button><Button variant="ghost" size="sm" className="text-destructive" disabled={pending} onClick={() => setDeleting(exhibition)}><Trash2 />حذف</Button></div> },
  ];
  return (
    <div className="admin-enter space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-2xl font-bold tracking-tight text-foreground">نمایشگاه‌ها</h1><p className="mt-1 text-sm text-muted-foreground">مجموع نمایشگاه‌های ثبت‌شده: {fa(initial.length)} مورد</p></div><Button onClick={() => { setEditing(null); setShowForm(true); }}><Plus />نمایشگاه جدید</Button></div>
      {(showForm || editing) && <Card><CardContent className="p-5"><ExhibitionForm key={editing?.id ?? 'new'} initial={editing} editingId={editing?.id ?? null} onSaved={reload} onCancel={() => { setShowForm(false); setEditing(null); }} /></CardContent></Card>}
      <Card><CardContent className="p-5"><h2 className="mb-3 text-base font-semibold">لیست نمایشگاه‌ها ({fa(initial.length)})</h2><DataTable rows={initial} columns={columns} rowKey={(exhibition) => exhibition.id} searchKeys={['titleFa', 'slug', 'country', 'city']} searchPlaceholder="جست‌وجوی عنوان، نامک، کشور یا شهر…" emptyTitle="نمایشگاهی یافت نشد" emptyDescription="برای شروع، نمایشگاه جدیدی اضافه کنید." /></CardContent></Card>
      <AlertDialog open={Boolean(deleting)} onOpenChange={(open) => !open && setDeleting(null)} title="حذف نمایشگاه" description={deleting ? `آیا از حذف نمایشگاه «${deleting.titleFa}» اطمینان دارید؟` : ''} confirmText="حذف نمایشگاه" destructive onConfirm={onDelete} />
    </div>
  );
}
