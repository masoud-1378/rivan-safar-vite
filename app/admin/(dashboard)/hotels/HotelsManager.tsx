'use client';

import { useRef, useState, useTransition } from 'react';
import { Pencil, Plus, Archive, ImagePlus, Trash2, Loader2 } from 'lucide-react';
import { deleteHotel, saveHotel, type HotelRow } from './actions';
import { deleteHotelPhoto, listHotelPhotos, uploadHotelPhoto, type HotelPhoto } from './photos';
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
import { formatHotelStars } from '@/lib/hotel-stars';

interface HotelsManagerProps {
  initial: HotelRow[];
  places: Array<{ slug: string; name: string; type: string; parent: string }>;
  /** وقتی از ردیف مقصد «افزودن هتل» زده می‌شود: شهر از پیش پر و دیالوگ باز می‌شود. */
  initialCitySlug?: string;
}

export default function HotelsManager({ initial, places, initialCitySlug = '' }: HotelsManagerProps) {
  const [open, setOpen] = useState(initialCitySlug !== '');
  const [editing, setEditing] = useState<HotelRow | null>(null);
  const [deleting, setDeleting] = useState<HotelRow | null>(null);
  const [name, setName] = useState('');
  // کتابچه §۳ (فاز ۲): پیش‌فرض خالی؛ ستاره اجباری است (میز C2).
  // وقتی از ردیف مقصد «افزودن هتل» زده می‌شود شهر از پیش پر است (میز C1).
  const [stars, setStars] = useState<number | null>(null);
  const [placeSlug, setPlaceSlug] = useState(initialCitySlug);
  const [nameError, setNameError] = useState<string | undefined>();
  const [starsError, setStarsError] = useState<string | undefined>();
  const [pending, startTransition] = useTransition();
  const { toast } = useToast();
  // عکس‌های هتل (کتابچه §۳): فقط در حالت ویرایش — آپلود واقعی به Supabase Storage.
  const [photos, setPhotos] = useState<HotelPhoto[]>([]);
  const [photosLoading, setPhotosLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingPhoto, setDeletingPhoto] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // گشت (ایراد ۱۰): وقتی از ردیف مقصد «افزودن هتل» زده می‌شود، آدرس ?city= دارد؛ ریلود ساده
  // همان پارام را نگه می‌داشت و دیالوگ بعد از ثبت موفق دوباره باز می‌شد. با آدرس تمیز برمی‌گردیم.
  const backToHotelsTab = () => window.location.assign('/admin/catalog?tab=hotels');

  const startCreate = () => {
    setEditing(null);
    setName('');
    setStars(null);
    setPlaceSlug('');
    setNameError(undefined);
    setStarsError(undefined);
    setPhotos([]);
    setOpen(true);
  };

  const startEdit = (hotel: HotelRow) => {
    setEditing(hotel);
    setName(hotel.nameFa);
    setStars(hotel.stars);
    setPlaceSlug(hotel.placeSlug);
    setNameError(undefined);
    setStarsError(undefined);
    setPhotos([]);
    setOpen(true);
    setPhotosLoading(true);
    listHotelPhotos(hotel.slug)
      .then(setPhotos)
      .catch(() => setPhotos([]))
      .finally(() => setPhotosLoading(false));
  };

  const onPickPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !editing) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('photo', file);
      const photo = await uploadHotelPhoto(editing.slug, editing.nameFa, fd);
      setPhotos((prev) => [photo, ...prev]);
    } catch (err) {
      toast({ variant: 'error', title: err instanceof Error ? err.message : 'آپلود ناموفق بود.' });
    } finally {
      setUploading(false);
    }
  };

  const onDeletePhoto = async () => {
    const id = deletingPhoto;
    if (!id) return;
    setDeletingPhoto(null);
    try {
      await deleteHotelPhoto(id);
      setPhotos((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      toast({ variant: 'error', title: err instanceof Error ? err.message : 'حذف عکس ناموفق بود.' });
    }
  };

  const submit = () => {
    if (name.trim().length < 2) {
      setNameError('نام هتل لازم است.');
      return;
    }
    // گشت (ایراد ۶): ستاره اختیاری است — هتل بی‌ستاره مجاز است و سایت «—» نشان می‌دهد.
    // فقط اگر مقداری وارد شده، باید بین ۰ تا ۷ باشد.
    if (stars !== null && (!Number.isInteger(stars) || stars < 0 || stars > 7)) {
      setStarsError('ستارهٔ هتل باید بین ۰ تا ۷ باشد.');
      return;
    }
    startTransition(async () => {
      try {
        await saveHotel({
          id: editing?.id,
          slug: editing?.slug ?? '',
          nameFa: name.trim(),
          stars,
          placeSlug,
        });
        setOpen(false);
        backToHotelsTab();
      } catch (e) {
        const message = e instanceof Error ? e.message : 'خطا در ذخیره.';
        if (message === 'این نام قبلاً ثبت شده') {
          setNameError(message);
        } else if (message === 'ستارهٔ هتل باید بین ۰ تا ۷ باشد.') {
          setStarsError(message);
        } else {
          toast({ variant: 'error', title: message });
        }
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
      backToHotelsTab();
    } catch (error) {
      toast({ variant: 'error', title: error instanceof Error ? error.message : 'خطا در حذف.' });
    }
  };

  const placeName = (slug: string) => places.find((p) => p.slug === slug)?.name ?? slug ?? '—';
  const columns: Column<HotelRow>[] = [
    { key: 'nameFa', header: 'نام هتل', sortable: true, cell: (h) => <span className="font-semibold">{h.nameFa}</span> },
    { key: 'stars', header: 'ستاره', numeric: true, sortable: true, cell: (h) => formatHotelStars(h.stars) },
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
          <Field label="نام هتل" error={nameError}>
            <Input value={name} onChange={(e) => { setName(e.target.value); setNameError(undefined); }} placeholder="مثلاً Rixos Premium Dubai" data-autofocus />
          </Field>
          <Field label="ستاره" hint="اختیاری — خالی بماند در سایت «—» نمایش داده می‌شود." error={starsError}>
            <NumberField value={stars} onChange={(v) => { setStars(v); setStarsError(undefined); }} min={0} max={7} aria-label="ستاره هتل" />
          </Field>
          <Field label="شهر / مقصد">
            <Select
              value={placeSlug}
              onChange={(e) => setPlaceSlug(e.target.value)}
              options={[{ value: '', label: 'انتخاب کنید…' }, ...places.map((p) => ({ value: p.slug, label: p.name }))]}
            />
          </Field>
          {editing ? (
            <div className="space-y-2">
              <span className="text-sm font-medium">عکس‌ها</span>
              {photosLoading ? (
                <p className="text-xs text-muted-foreground">در حال بارگذاری…</p>
              ) : photos.length === 0 ? (
                <p className="text-xs text-muted-foreground">هنوز عکسی ثبت نشده است.</p>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {photos.map((p) => (
                    <div key={p.id} className="overflow-hidden rounded-sm border border-border">
                      <img src={p.url} alt={p.altFa} className="aspect-[4/3] w-full object-cover" loading="lazy" />
                      <button
                        type="button"
                        onClick={() => setDeletingPhoto(p.id)}
                        className="flex min-h-[44px] w-full items-center justify-center gap-1.5 text-xs text-destructive hover:bg-destructive/5"
                      >
                        <Trash2 className="size-4" />
                        حذف
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPickPhoto} aria-label="انتخاب عکس هتل" />
              <Button type="button" variant="outline" size="sm" disabled={uploading} onClick={() => fileRef.current?.click()}>
                {uploading ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
                {uploading ? 'در حال آپلود…' : 'افزودن عکس'}
              </Button>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">پس از ثبت هتل می‌توانید عکس اضافه کنید.</p>
          )}
        </div>
      </Dialog>
      <AlertDialog
        open={Boolean(deleting)}
        onOpenChange={(openState) => !openState && setDeleting(null)}
        title="بایگانی هتل"
        description={deleting ? `هتل «${deleting.nameFa}» بایگانی می‌شود و از فهرست‌ها پنهان می‌ماند؛ بعداً از صفحهٔ بایگانی می‌توانید آن را برگردانید.` : ''}
        confirmText="بایگانی هتل"
        destructive
        onConfirm={onDelete}
      />
      <AlertDialog
        open={Boolean(deletingPhoto)}
        onOpenChange={(openState) => !openState && setDeletingPhoto(null)}
        title="حذف عکس هتل"
        description={editing ? `این عکس از هتل «${editing.nameFa}» برای همیشه حذف می‌شود؛ فایل آن از فضای ذخیره‌سازی هم پاک می‌شود و این کار برگشت‌پذیر نیست.` : 'این عکس برای همیشه حذف می‌شود و برگشت‌پذیر نیست.'}
        confirmText="حذف عکس"
        destructive
        onConfirm={onDeletePhoto}
      />
    </div>
  );
}
