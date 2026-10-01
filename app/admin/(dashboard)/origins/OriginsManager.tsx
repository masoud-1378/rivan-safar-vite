'use client';

import { useState, useTransition } from 'react';
import { Pencil, Plus, Archive, Copy } from 'lucide-react';
import { deleteOrigin, saveOrigin, copyOrigin, countOriginTours, type OriginRow } from './actions';
import { AlertDialog } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DataTable, type Column } from '@/components/ui/data-table';
import { Dialog } from '@/components/ui/dialog';
import { Field, Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useToast } from '@/components/ui/toast';
import { fa } from '@/lib/utils';

const TYPE_LABEL: Record<string, string> = { region: 'قاره/ناحیه', country: 'کشور', city: 'شهر' };

export default function OriginsManager({ initial }: { initial: OriginRow[] }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<OriginRow | null>(null);
  const [deleting, setDeleting] = useState<OriginRow | null>(null);
  const [usage, setUsage] = useState<number | null>(null);
  const [usageFailed, setUsageFailed] = useState(false);
  const openDelete = (origin: OriginRow) => {
    setDeleting(origin);
    setUsage(null);
    setUsageFailed(false);
    countOriginTours(origin.slug, origin.nameFa).then(setUsage).catch(() => { setUsage(null); setUsageFailed(true); });
  };
  const [name, setName] = useState('');
  const [type, setType] = useState('city');
  const [parentSlug, setParentSlug] = useState('');
  const [nameError, setNameError] = useState<string | undefined>();
  const [pending, startTransition] = useTransition();
  const { toast } = useToast();

  const reload = () => window.location.reload();

  const startCreate = () => {
    setEditing(null);
    setName('');
    setType('city');
    setParentSlug('');
    setNameError(undefined);
    setOpen(true);
  };

  const startEdit = (o: OriginRow) => {
    setEditing(o);
    setName(o.nameFa);
    setType(o.type);
    setParentSlug(o.parentSlug);
    setNameError(undefined);
    setOpen(true);
  };

  const submit = () => {
    if (name.trim().length < 2) {
      setNameError('نام مبدأ لازم است.');
      return;
    }
    startTransition(async () => {
      try {
        await saveOrigin({ id: editing?.id, slug: editing?.slug ?? '', nameFa: name.trim(), type, parentSlug });
        setOpen(false);
        reload();
      } catch (e) {
        const message = e instanceof Error ? e.message : 'خطا در ذخیره.';
        if (message === 'این نام قبلاً ثبت شده') {
          setNameError(message);
        } else {
          toast({ variant: 'error', title: message });
        }
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
        toast({ variant: 'error', title: e instanceof Error ? e.message : 'خطا در حذف.' });
      }
    });
  };

  const onCopy = async (origin: OriginRow) => {
    startTransition(async () => {
      try {
        const res = await copyOrigin(origin.id);
        toast({ variant: 'success', title: `کپی ساخته شد: ${res.nameFa}` });
        reload();
      } catch (e) {
        toast({ variant: 'error', title: e instanceof Error ? e.message : 'خطا در کپی.' });
      }
    });
  };

  const parentName = (slug: string) => initial.find((o) => o.slug === slug)?.nameFa ?? '—';
  // شهرهای زیرمجموعه‌ای که با بایگانی این والد یتیم می‌شوند
  const childCount = deleting ? initial.filter((o) => o.parentSlug === deleting.slug).length : 0;
  const columns: Column<OriginRow>[] = [
    { key: 'nameFa', header: 'نام', sortable: true, cell: (o) => <span className="font-semibold">{o.nameFa}</span> },
    { key: 'type', header: 'نوع', sortable: true, cell: (o) => TYPE_LABEL[o.type] ?? o.type },
    { key: 'parentSlug', header: 'والد', cell: (o) => (o.parentSlug ? parentName(o.parentSlug) : '—') },
    {
      key: 'id',
      header: 'عملیات',
      className: 'w-44',
      cell: (o) => (
        <div className="flex flex-wrap gap-1">
          <Button variant="ghost" size="sm" onClick={() => startEdit(o)}>
            <Pencil />
            ویرایش
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onCopy(o)} disabled={pending} title="ساخت یک کپی از این مبدأ">
            <Copy />
            کپی
          </Button>
          <Button variant="ghost" size="sm" className="text-destructive" onClick={() => openDelete(o)} disabled={pending}>
            <Archive />
            بایگانی
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="admin-enter space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-foreground">مبدأها</h1>
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
          <Field label="نام مبدأ" error={nameError} hint="همین نام در فهرست مبدأهای فرم تور و روی سایت دیده می‌شود">
            <Input value={name} onChange={(e) => { setName(e.target.value); setNameError(undefined); }} placeholder="مثل تهران" />
          </Field>
          <Field label="نوع" hint="شهر، کشور یا قاره/ناحیه؛ ترتیب نمایش در درخت مبدأها">
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
          <Field label="والد" hint="اختیاری؛ مشخص می‌کند این مبدأ زیر کدام والد در درخت سایت می‌نشیند">
            <Select
              value={parentSlug}
              onChange={(e) => setParentSlug(e.target.value)}
              options={[{ value: '', label: 'بدون والد' }, ...initial.filter((o) => o.id !== editing?.id).map((o) => ({ value: o.slug, label: o.nameFa }))]}
            />
          </Field>
        </div>
      </Dialog>
      <AlertDialog open={Boolean(deleting)} onOpenChange={(open) => { if (!open) { setDeleting(null); setUsage(null); setUsageFailed(false); } }} title="بایگانی مبدأ" description={deleting ? (<span className="block space-y-2"><span className="block">مبدأ «{deleting.nameFa}» بایگانی می‌شود و از فهرست‌ها پنهان می‌ماند؛ بعداً از صفحهٔ بایگانی می‌توانید آن را برگردانید.</span>{childCount > 0 ? <span className="block font-medium text-amber-600 dark:text-amber-400">{fa(childCount)} شهر زیرمجموعه یتیم می‌شوند.</span> : null}{usageFailed ? <span className="block font-medium text-destructive">شمارش ارجاع‌ها ناموفق بود؛ با احتیاط بایگانی کنید.</span> : null}{usage !== null && usage > 0 ? <span className="block font-medium text-amber-600 dark:text-amber-400">این مبدأ در {fa(usage)} تور استفاده شده است؛ آن تورها سر جایشان می‌مانند و فقط این مبدأ از دسترس خارج می‌شود.</span> : null}</span>) : ''} confirmText="بایگانی مبدأ" destructive onConfirm={onDelete} />
    </div>
  );
}
