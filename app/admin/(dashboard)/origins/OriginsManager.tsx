'use client';

import { useState, useTransition } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { deleteOrigin, saveOrigin, type OriginRow } from './actions';
import { AlertDialog } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DataTable, type Column } from '@/components/ui/data-table';
import { Dialog } from '@/components/ui/dialog';
import { Field, Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { fa } from '@/lib/utils';

const TYPE_LABEL: Record<string, string> = { region: 'قاره/ناحیه', country: 'کشور', city: 'شهر' };

export default function OriginsManager({ initial }: { initial: OriginRow[] }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<OriginRow | null>(null);
  const [deleting, setDeleting] = useState<OriginRow | null>(null);
  const [name, setName] = useState('');
  const [type, setType] = useState('city');
  const [parentSlug, setParentSlug] = useState('');
  const [pending, startTransition] = useTransition();

  const reload = () => window.location.reload();

  const startCreate = () => {
    setEditing(null);
    setName('');
    setType('city');
    setParentSlug('');
    setOpen(true);
  };

  const startEdit = (o: OriginRow) => {
    setEditing(o);
    setName(o.nameFa);
    setType(o.type);
    setParentSlug(o.parentSlug);
    setOpen(true);
  };

  const submit = () => {
    if (name.trim().length < 2) {
      alert('نام مبدأ لازم است.');
      return;
    }
    startTransition(async () => {
      try {
        await saveOrigin({ id: editing?.id, slug: editing?.slug ?? '', nameFa: name.trim(), type, parentSlug });
        setOpen(false);
        reload();
      } catch (e) {
        alert(e instanceof Error ? e.message : 'خطا در ذخیره.');
      }
    });
  };

  const onDelete = async () => {
    if (!deleting) return;
    startTransition(async () => {
      try {
        await deleteOrigin(deleting.id);
        reload();
      } catch (e) {
        alert(e instanceof Error ? e.message : 'خطا در حذف.');
      }
    });
  };

  const parentName = (slug: string) => initial.find((o) => o.slug === slug)?.nameFa ?? '—';
  const columns: Column<OriginRow>[] = [
    { key: 'nameFa', header: 'نام', sortable: true, cell: (o) => <span className="font-semibold">{o.nameFa}</span> },
    { key: 'type', header: 'نوع', sortable: true, cell: (o) => TYPE_LABEL[o.type] ?? o.type },
    { key: 'parentSlug', header: 'والد', cell: (o) => (o.parentSlug ? parentName(o.parentSlug) : '—') },
    {
      key: 'id',
      header: 'عملیات',
      className: 'w-36',
      cell: (o) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={() => startEdit(o)}>
            <Pencil />
            ویرایش
          </Button>
          <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setDeleting(o)} disabled={pending}>
            <Trash2 />
            حذف
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="admin-enter space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">مبدأها</h1>
          <p className="mt-1 text-sm text-muted-foreground">شهرهای مبدأ حرکت تورها با ساختار سلسله‌مراتبی</p>
        </div>
        <Button onClick={startCreate}>
          <Plus />
          افزودن مبدأ جدید
        </Button>
      </div>
      <Card>
        <CardContent className="p-5">
          <h2 className="mb-3 text-base font-semibold">مبدأها ({fa(initial.length)})</h2>
          <DataTable
            rows={initial}
            columns={columns}
            rowKey={(o) => o.id}
            searchKeys={['nameFa']}
            searchPlaceholder="جست‌وجوی نام مبدأ…"
            emptyTitle="مبدأی ثبت نشده است"
            emptyDescription="برای شروع، مبدأ جدیدی اضافه کنید."
          />
        </CardContent>
      </Card>
      <Dialog
        open={open}
        onOpenChange={setOpen}
        title={editing ? 'ویرایش مبدأ' : 'افزودن مبدأ جدید'}
        footer={
          <>
            <Button onClick={submit} disabled={pending}>
              {pending ? 'در حال ذخیره…' : editing ? 'ذخیره تغییرات' : 'ثبت مبدأ'}
            </Button>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              انصراف
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="نام مبدأ">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="مثل تهران" />
          </Field>
          <Field label="نوع">
            <Select
              value={type}
              onChange={(e) => setType(e.target.value)}
              options={[
                { value: 'city', label: 'شهر' },
                { value: 'country', label: 'کشور' },
                { value: 'region', label: 'قاره/ناحیه' },
              ]}
            />
          </Field>
          <Field label="والد" hint="اختیاری؛ برای ساختار سلسله‌مراتبی">
            <Select
              value={parentSlug}
              onChange={(e) => setParentSlug(e.target.value)}
              options={[{ value: '', label: 'بدون والد' }, ...initial.filter((o) => o.id !== editing?.id).map((o) => ({ value: o.slug, label: o.nameFa }))]}
            />
          </Field>
        </div>
      </Dialog>
      <AlertDialog open={Boolean(deleting)} onOpenChange={(open) => !open && setDeleting(null)} title="حذف مبدأ" description={deleting ? `آیا از حذف «${deleting.nameFa}» اطمینان دارید؟` : ''} confirmText="حذف مبدأ" destructive onConfirm={onDelete} />
    </div>
  );
}
