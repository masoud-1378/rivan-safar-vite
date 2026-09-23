'use client';

import { useState, useTransition } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { deleteHotel, saveHotel, type HotelRow } from './actions';
import { AlertDialog } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DataTable, type Column } from '@/components/ui/data-table';
import { Dialog } from '@/components/ui/dialog';
import { Field, Input } from '@/components/ui/input';
import { NumberField } from '@/components/ui/number-field';
import { Select } from '@/components/ui/select';
import { useToast } from '@/components/ui/toast';
import { fa } from '@/lib/utils';

interface HotelsManagerProps {
  initial: HotelRow[];
  places: Array<{ slug: string; name: string; type: string; parent: string }>;
}

export default function HotelsManager({ initial, places }: HotelsManagerProps) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<HotelRow | null>(null);
  const [deleting, setDeleting] = useState<HotelRow | null>(null);
  const [name, setName] = useState('');
  const [stars, setStars] = useState(5);
  const [placeSlug, setPlaceSlug] = useState('');
  const [pending, startTransition] = useTransition();
  const { toast } = useToast();

  const reload = () => window.location.reload();

  const startCreate = () => {
    setEditing(null);
    setName('');
    setStars(5);
    setPlaceSlug('');
    setOpen(true);
  };

  const startEdit = (hotel: HotelRow) => {
    setEditing(hotel);
    setName(hotel.nameFa);
    setStars(hotel.stars);
    setPlaceSlug(hotel.placeSlug);
    setOpen(true);
  };

  const submit = () => {
    if (name.trim().length < 2) {
      toast({ variant: 'error', title: 'نام هتل لازم است.' });
      return;
    }
    startTransition(async () => {
      try {
        await saveHotel({
          id: editing?.id,
          slug: editing?.slug ?? '',
          nameFa: name.trim(),
          stars: Math.max(0, Number(stars) || 0),
          placeSlug,
        });
        setOpen(false);
        reload();
      } catch (e) {
        toast({ variant: 'error', title: e instanceof Error ? e.message : 'خطا در ذخیره.' });
      }
    });
  };

  const onDelete = async () => {
    if (!deleting) return;
    try {
      await new Promise<void>((resolve, reject) =>
        startTransition(async () => {
          try {
            await deleteHotel(deleting.id);
            resolve();
          } catch (error) {
            reject(error);
          }
        }),
      );
      reload();
    } catch (error) {
      toast({ variant: 'error', title: error instanceof Error ? error.message : 'خطا در حذف.' });
    }
  };

  const placeName = (slug: string) => places.find((p) => p.slug === slug)?.name ?? slug ?? '—';
  const columns: Column<HotelRow>[] = [
    { key: 'nameFa', header: 'نام هتل', sortable: true, cell: (h) => <span className="font-semibold">{h.nameFa}</span> },
    { key: 'stars', header: 'ستاره', numeric: true, sortable: true, cell: (h) => fa(h.stars) },
    { key: 'placeSlug', header: 'مقصد', sortable: true, cell: (h) => (h.placeSlug ? placeName(h.placeSlug) : '—') },
    {
      key: 'id',
      header: 'عملیات',
      className: 'w-36',
      cell: (h) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={() => startEdit(h)}>
            <Pencil />
            ویرایش
          </Button>
          <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setDeleting(h)} disabled={pending}>
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
          <h1 className="text-2xl font-bold text-foreground">هتل‌ها</h1>
          <p className="mt-1 text-sm text-muted-foreground">مدیریت مستقیم جدول اقامتگاه‌ها</p>
        </div>
        <Button onClick={startCreate}>
          <Plus />
          افزودن هتل جدید
        </Button>
      </div>
      <Card>
        <CardContent className="p-5">
          <h2 className="mb-3 text-base font-semibold">هتل‌ها ({fa(initial.length)})</h2>
          <DataTable
            rows={initial}
            columns={columns}
            rowKey={(h) => h.id}
            searchKeys={['nameFa', 'placeSlug']}
            searchPlaceholder="جست‌وجوی نام هتل یا مقصد…"
            emptyTitle="هتلی ثبت نشده است"
            emptyDescription="برای شروع، هتل جدیدی اضافه کنید."
          />
        </CardContent>
      </Card>
      <Dialog
        open={open}
        onOpenChange={setOpen}
        title={editing ? 'ویرایش هتل' : 'افزودن هتل جدید'}
        footer={
          <>
            <Button onClick={submit} disabled={pending}>
              {pending ? 'در حال ذخیره…' : editing ? 'ذخیره تغییرات' : 'ثبت هتل'}
            </Button>
            <Button variant="outline" data-autofocus onClick={() => setOpen(false)}>
              انصراف
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="نام هتل">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="مثلاً Rixos Premium Dubai" data-autofocus />
          </Field>
          <Field label="ستاره">
            <NumberField value={stars} onChange={setStars} min={0} max={7} aria-label="ستاره هتل" />
          </Field>
          <Field label="شهر / مقصد">
            <Select
              value={placeSlug}
              onChange={(e) => setPlaceSlug(e.target.value)}
              options={[{ value: '', label: 'انتخاب کنید…' }, ...places.map((p) => ({ value: p.slug, label: p.name }))]}
            />
          </Field>
        </div>
      </Dialog>
      <AlertDialog
        open={Boolean(deleting)}
        onOpenChange={(openState) => !openState && setDeleting(null)}
        title="حذف هتل"
        description={deleting ? `آیا از حذف هتل «${deleting.nameFa}» اطمینان دارید؟` : ''}
        confirmText="حذف هتل"
        destructive
        onConfirm={onDelete}
      />
    </div>
  );
}
