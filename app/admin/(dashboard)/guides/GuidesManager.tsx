'use client';

import { useState, useTransition } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import GuideForm from './GuideForm';
import { deleteGuide, setGuideStatus, type GuideRow, type GuideStatus } from './actions';
import { AlertDialog } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DataTable, type Column } from '@/components/ui/data-table';
import { Select } from '@/components/ui/select';
import { fa } from '@/lib/utils';

const STATUS_MAP: Record<GuideStatus, { label: string; variant: 'success' | 'warning' | 'secondary' | 'brand' | 'destructive' }> = {
  published: { label: 'منتشرشده', variant: 'success' }, review: { label: 'در حال بازبینی', variant: 'warning' }, draft: { label: 'پیش‌نویس', variant: 'secondary' }, paused: { label: 'متوقف', variant: 'brand' }, archived: { label: 'بایگانی', variant: 'destructive' },
};
const statusOptions = (Object.keys(STATUS_MAP) as GuideStatus[]).map((value) => ({ value, label: STATUS_MAP[value].label }));

export default function GuidesManager({ initial }: { initial: GuideRow[] }) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<GuideRow | null>(null);
  const [deleting, setDeleting] = useState<GuideRow | null>(null);
  const [pending, startTransition] = useTransition();
  const reload = () => { setShowForm(false); setEditing(null); window.location.reload(); };
  const onDelete = async () => {
    if (!deleting) return;
    try { await new Promise<void>((resolve, reject) => startTransition(async () => { try { await deleteGuide(deleting.id); resolve(); } catch (error) { reject(error); } })); window.location.reload(); } catch (error) { alert(error instanceof Error ? error.message : 'خطا در حذف.'); }
  };
  const onStatusChange = (id: string, status: GuideStatus) => startTransition(async () => { try { await setGuideStatus(id, status); window.location.reload(); } catch (error) { alert(error instanceof Error ? error.message : 'خطا در تغییر وضعیت.'); } });
  const edit = (guide: GuideRow) => { setEditing(guide); setShowForm(false); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const columns: Column<GuideRow>[] = [
    { key: 'titleFa', header: 'عنوان مقاله', sortable: true, cell: (guide) => <span className="font-medium">{guide.titleFa}</span> },
    { key: 'slug', header: 'نامک', sortable: true, cell: (guide) => <span dir="ltr">{guide.slug}</span> },
    { key: 'category', header: 'دسته‌بندی', cell: (guide) => guide.categoryLabel || guide.category },
    { key: 'readTime', header: 'زمان مطالعه', cell: (guide) => guide.readTime || '—' },
    { key: 'status', header: 'وضعیت', cell: (guide) => <Badge variant={STATUS_MAP[guide.status].variant}>{STATUS_MAP[guide.status].label}</Badge> },
    { key: 'id', header: 'تغییر وضعیت', cell: (guide) => <Select aria-label={`تغییر وضعیت ${guide.titleFa}`} value={guide.status} disabled={pending} onChange={(event) => onStatusChange(guide.id, event.target.value as GuideStatus)} className="h-8 min-w-36 text-xs" options={statusOptions} /> },
    { key: 'updatedAt', header: 'عملیات', className: 'w-36', cell: (guide) => <div className="flex gap-1"><Button variant="ghost" size="sm" onClick={() => edit(guide)}><Pencil />ویرایش</Button><Button variant="ghost" size="sm" className="text-destructive" disabled={pending} onClick={() => setDeleting(guide)}><Trash2 />حذف</Button></div> },
  ];
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-h2 font-bold text-text-heading">مقالات و راهنماها</h1><p className="mt-1 text-sm text-muted-foreground">مجموع مقالات ثبت‌شده: {fa(initial.length)} مورد</p></div><Button onClick={() => { setEditing(null); setShowForm(true); }}><Plus />مقاله جدید</Button></div>
      {(showForm || editing) && <Card><CardContent className="p-5"><GuideForm key={editing?.id ?? 'new'} initial={editing} editingId={editing?.id ?? null} onSaved={reload} onCancel={() => { setShowForm(false); setEditing(null); }} /></CardContent></Card>}
      <Card><CardContent className="p-5"><h2 className="mb-3 text-base font-semibold">لیست مقالات ({fa(initial.length)})</h2><DataTable rows={initial} columns={columns} rowKey={(guide) => guide.id} searchKeys={['titleFa', 'slug', 'category', 'categoryLabel']} searchPlaceholder="جست‌وجوی عنوان، نامک یا دسته‌بندی…" emptyTitle="مقاله‌ای یافت نشد" emptyDescription="برای شروع، مقاله جدیدی اضافه کنید." /></CardContent></Card>
      <AlertDialog open={Boolean(deleting)} onOpenChange={(open) => !open && setDeleting(null)} title="حذف مقاله" description={deleting ? `آیا از حذف مقاله «${deleting.titleFa}» اطمینان دارید؟` : ''} confirmText="حذف مقاله" destructive onConfirm={onDelete} />
    </div>
  );
}
