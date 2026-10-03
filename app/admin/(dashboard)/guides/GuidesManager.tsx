'use client';

import { useState, useTransition } from 'react';
import { Pencil, Plus, Archive, Eye } from 'lucide-react';
import GuideForm, { type GuidePickerOption } from './GuideForm';
import { deleteGuide, setGuideStatus, type GuideRow, type GuideStatus } from './actions';
import { AlertDialog } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DataTable, type Column } from '@/components/ui/data-table';
import { Select } from '@/components/ui/select';
import { useToast } from '@/components/ui/toast';
import { fa } from '@/lib/utils';
import { safeErrorMessage } from '@/src/lib/error-message';

const STATUS_MAP: Record<GuideStatus, { label: string; variant: 'success' | 'warning' | 'secondary' | 'brand' | 'destructive' }> = {
  published: { label: 'منتشرشده', variant: 'success' }, review: { label: 'در حال بازبینی', variant: 'warning' }, draft: { label: 'پیش‌نویس', variant: 'secondary' }, paused: { label: 'متوقف', variant: 'brand' }, archived: { label: 'بایگانی', variant: 'destructive' },
};
const statusOptions = (Object.keys(STATUS_MAP) as GuideStatus[]).map((value) => ({ value, label: STATUS_MAP[value].label }));

export default function GuidesManager({ initial, destinationOptions = [], tourOptions = [] }: { initial: GuideRow[]; destinationOptions?: GuidePickerOption[]; tourOptions?: GuidePickerOption[] }) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<GuideRow | null>(null);
  const [deleting, setDeleting] = useState<GuideRow | null>(null);
  const [pending, startTransition] = useTransition();
  const { toast } = useToast();
  const reload = () => { setShowForm(false); setEditing(null); window.location.reload(); };
  const onDelete = async () => {
    if (!deleting) return;
    try { await new Promise<void>((resolve, reject) => startTransition(async () => { try { await deleteGuide(deleting.id); resolve(); } catch (error) { reject(error); } })); window.location.reload(); } catch (error) { toast({ variant: 'error', title: safeErrorMessage(error, 'خطا در حذف.') }); }
  };
  const onStatusChange = (id: string, status: GuideStatus) => startTransition(async () => { try { await setGuideStatus(id, status); window.location.reload(); } catch (error) { toast({ variant: 'error', title: safeErrorMessage(error, 'خطا در تغییر وضعیت.') }); } });
  const edit = (guide: GuideRow) => { setEditing(guide); setShowForm(false); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const columns: Column<GuideRow>[] = [
    { key: 'titleFa', header: 'عنوان راهنما', sortable: true, cell: (guide) => <span className="font-medium">{guide.titleFa}</span> },
    { key: 'slug', header: 'نامک', sortable: true, cell: (guide) => <span dir="ltr">{guide.slug}</span> },
    { key: 'category', header: 'دسته‌بندی', cell: (guide) => guide.categoryLabel || guide.category },
    { key: 'readTime', header: 'زمان مطالعه', cell: (guide) => guide.readTime || '—' },
    { key: 'status', header: 'وضعیت', cell: (guide) => <Badge variant={STATUS_MAP[guide.status].variant}>{STATUS_MAP[guide.status].label}</Badge> },
    { key: 'id', header: 'تغییر وضعیت', cell: (guide) => <Select aria-label={`تغییر وضعیت ${guide.titleFa}`} value={guide.status} disabled={pending} onChange={(event) => onStatusChange(guide.id, event.target.value as GuideStatus)} className="h-8 min-w-36 text-panel-caption max-md:min-h-11" options={statusOptions} /> },
    { key: 'updatedAt', header: 'عملیات', className: 'w-56', cell: (guide) => <div className="flex items-center gap-1"><Button variant="ghost" size="icon" title="نمایش در سایت" aria-label={`نمایش راهنمای «${guide.titleFa}» در سایت (تب تازه)`} onClick={() => window.open(`/guide/${guide.slug}`, '_blank', 'noopener,noreferrer')}><Eye /></Button><Button variant="ghost" size="sm" className="max-md:min-h-11" onClick={() => edit(guide)}><Pencil />ویرایش</Button><Button variant="ghost" size="sm" className="text-destructive max-md:min-h-11" disabled={pending} onClick={() => setDeleting(guide)}><Archive />بایگانی</Button></div> },
  ];
  return (
    <div className="admin-enter space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-panel-display text-foreground">راهنماها</h1><p className="mt-2 text-panel-body text-muted-foreground">مجموع راهنماهای ثبت‌شده: {fa(initial.length)} مورد</p></div><Button className="h-11 lg:h-10" onClick={() => { setEditing(null); setShowForm(true); }}><Plus />راهنمای جدید</Button></div>
      {(showForm || editing) && <GuideForm key={editing?.id ?? 'new'} initial={editing} editingId={editing?.id ?? null} onSaved={reload} onCancel={() => { setShowForm(false); setEditing(null); }} onDeleted={() => { setShowForm(false); setEditing(null); window.location.reload(); }} destinationOptions={destinationOptions} tourOptions={tourOptions} />}
      <Card><CardContent className="p-5"><h2 className="mb-4 text-panel-heading">لیست راهنماها ({fa(initial.length)})</h2><DataTable rows={initial} columns={columns} rowKey={(guide) => guide.id} searchKeys={['titleFa', 'slug', 'category', 'categoryLabel']} searchPlaceholder="جست‌وجوی عنوان، نامک یا دسته‌بندی…" emptyTitle="راهنمایی یافت نشد" emptyDescription="برای شروع، راهنمای جدیدی اضافه کنید." emptyAction={initial.length === 0 ? { label: 'افزودن اولین راهنما', onClick: () => { setEditing(null); setShowForm(true); window.scrollTo({ top: 0, behavior: 'smooth' }); } } : undefined} /></CardContent></Card>
      <AlertDialog open={Boolean(deleting)} onOpenChange={(open) => !open && setDeleting(null)} title="بایگانی راهنما" description={deleting ? `راهنمای «${deleting.titleFa}» بایگانی می‌شود و از سایت و فهرست‌ها پنهان می‌ماند. با «بازیابی» خودِ راهنما برمی‌گردد، ولی لینک‌های داخلی‌اش برای همیشه پاک شده‌اند و برنمی‌گردند.` : ''} confirmText="بایگانی راهنما" destructive onConfirm={onDelete} />
    </div>
  );
}
