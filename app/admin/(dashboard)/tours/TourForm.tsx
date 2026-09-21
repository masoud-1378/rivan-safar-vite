'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { saveTour, type TourInput, type TourRow } from './actions';

const EMPTY: TourInput = { slug: '', title: '', type: 'foreign', typeLabel: 'تور خارجی', destination: '', origin: '', route: '', duration: '', nights: 0, closestDeparture: '', price: 0, formattedPrice: '', priceNote: '', status: 'pending', statusLabel: '', image: '', badge: '', features: [], visaRequired: false, hotelStars: 5, airline: '', includedServices: [], excludedServices: [], hotelOptions: [], description: '' };
const nlToArray = (v: string) => v.split('\n').map((s) => s.trim()).filter(Boolean);
const arrayToNl = (v: string[]) => (v ?? []).join('\n');

export default function TourForm({ initial, editingId, onDone }: { initial?: TourRow | null; editingId?: string | null; onDone: () => void }) {
  const src: TourInput = initial ? { slug: initial.slug, title: initial.title, type: initial.type, typeLabel: initial.typeLabel, destination: initial.destination, origin: initial.origin, route: initial.route, duration: initial.duration, nights: initial.nights, closestDeparture: initial.closestDeparture, price: initial.price, formattedPrice: initial.formattedPrice, priceNote: initial.priceNote, status: initial.status, statusLabel: initial.statusLabel, image: initial.image, badge: initial.badge, features: initial.features, visaRequired: initial.visaRequired, hotelStars: initial.hotelStars, airline: initial.airline, includedServices: initial.includedServices, excludedServices: initial.excludedServices, hotelOptions: initial.hotelOptions as TourInput['hotelOptions'], description: initial.description } : EMPTY;
  const [form, setForm] = useState<TourInput>(src);
  const [featuresTxt, setFeaturesTxt] = useState(arrayToNl(src.features));
  const [includedTxt, setIncludedTxt] = useState(arrayToNl(src.includedServices));
  const [excludedTxt, setExcludedTxt] = useState(arrayToNl(src.excludedServices));
  const [hotelsTxt, setHotelsTxt] = useState(JSON.stringify(src.hotelOptions ?? [], null, 2));
  const [pending, startTransition] = useTransition();
  const set = <K extends keyof TourInput>(k: K, v: TourInput[K]) => setForm((f) => ({ ...f, [k]: v }));
  const submit = () => {
    let hotelOptions: TourInput['hotelOptions'] = [];
    try { const parsed = hotelsTxt.trim() ? JSON.parse(hotelsTxt) : []; hotelOptions = Array.isArray(parsed) ? parsed : []; } catch { alert('گزینه‌های هتل JSON معتبر نیست.'); return; }
    const payload: TourInput = { ...form, nights: Number(form.nights) || 0, price: Number(form.price) || 0, hotelStars: Number(form.hotelStars) || 0, features: nlToArray(featuresTxt), includedServices: nlToArray(includedTxt), excludedServices: nlToArray(excludedTxt), hotelOptions };
    startTransition(async () => { try { await saveTour(editingId ?? null, payload); onDone(); } catch (e) { alert(e instanceof Error ? e.message : 'خطا در ذخیره.'); } });
  };
  return <Card><CardHeader><CardTitle>{editingId ? 'ویرایش تور' : 'افزودن تور جدید'}</CardTitle><CardDescription>اطلاعات تور و جزئیات خدمات را وارد کنید.</CardDescription></CardHeader><CardContent className="space-y-5"><div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
    <Field label="نامک"><Input value={form.slug} dir="ltr" onChange={(e) => set('slug', e.target.value)} /></Field><Field label="عنوان"><Input value={form.title} onChange={(e) => set('title', e.target.value)} /></Field>
    <Field label="نوع"><Select value={form.type} onChange={(e) => set('type', e.target.value)} options={[{ value: 'foreign', label: 'تور خارجی' }, { value: 'domestic', label: 'تور داخلی' }, { value: 'exhibition', label: 'تور نمایشگاهی' }]} /></Field><Field label="برچسب نوع"><Input value={form.typeLabel} onChange={(e) => set('typeLabel', e.target.value)} /></Field>
    <Field label="مقصد"><Input value={form.destination} onChange={(e) => set('destination', e.target.value)} /></Field><Field label="مبدأ"><Input value={form.origin} onChange={(e) => set('origin', e.target.value)} /></Field><Field label="مسیر"><Input value={form.route} onChange={(e) => set('route', e.target.value)} /></Field><Field label="مدت"><Input value={form.duration} onChange={(e) => set('duration', e.target.value)} /></Field>
    <Field label="شب‌ها"><Input type="number" value={form.nights} onChange={(e) => set('nights', Number(e.target.value))} /></Field><Field label="نزدیک‌ترین حرکت"><Input value={form.closestDeparture} onChange={(e) => set('closestDeparture', e.target.value)} /></Field><Field label="قیمت"><Input type="number" value={form.price} dir="ltr" onChange={(e) => set('price', Number(e.target.value))} /></Field><Field label="قیمت نمایشی"><Input value={form.formattedPrice} onChange={(e) => set('formattedPrice', e.target.value)} /></Field>
    <Field label="یادداشت قیمت"><Input value={form.priceNote} onChange={(e) => set('priceNote', e.target.value)} /></Field><Field label="وضعیت"><Select value={form.status} onChange={(e) => set('status', e.target.value)} options={[{ value: 'confirmed', label: 'قطعی' }, { value: 'pending', label: 'در انتظار' }, { value: 'updating', label: 'در حال به‌روزرسانی' }, { value: 'full', label: 'تکمیل ظرفیت' }]} /></Field>
    <Field label="برچسب وضعیت"><Input value={form.statusLabel} onChange={(e) => set('statusLabel', e.target.value)} /></Field><Field label="تصویر"><Input value={form.image} dir="ltr" onChange={(e) => set('image', e.target.value)} /></Field><Field label="بج"><Input value={form.badge} onChange={(e) => set('badge', e.target.value)} /></Field><Field label="ستاره هتل"><Input type="number" min={0} max={7} value={form.hotelStars} onChange={(e) => set('hotelStars', Number(e.target.value))} /></Field><Field label="ایرلاین"><Input value={form.airline} onChange={(e) => set('airline', e.target.value)} /></Field><Field label="ویزا لازم است؟"><Select value={form.visaRequired ? 'yes' : 'no'} onChange={(e) => set('visaRequired', e.target.value === 'yes')} options={[{ value: 'no', label: 'خیر' }, { value: 'yes', label: 'بله' }]} /></Field>
  </div><div className="grid gap-4"><Field label="ویژگی‌ها" hint="هر خط یک مورد"><Textarea value={featuresTxt} onChange={(e) => setFeaturesTxt(e.target.value)} /></Field><Field label="خدمات شامل" hint="هر خط یک مورد"><Textarea value={includedTxt} onChange={(e) => setIncludedTxt(e.target.value)} /></Field><Field label="خدمات خارج" hint="هر خط یک مورد"><Textarea value={excludedTxt} onChange={(e) => setExcludedTxt(e.target.value)} /></Field><Field label="گزینه‌های هتل" hint="آرایه JSON گزینه‌های هتل"><Textarea value={hotelsTxt} dir="ltr" onChange={(e) => setHotelsTxt(e.target.value)} className="min-h-32 font-mono text-left" /></Field><Field label="توضیحات"><Textarea value={form.description} onChange={(e) => set('description', e.target.value)} /></Field></div><div className="flex gap-2"><Button onClick={submit} disabled={pending}>{pending ? 'در حال ذخیره...' : editingId ? 'ذخیره تغییرات' : 'ثبت تور'}</Button><Button onClick={onDone} variant="outline">انصراف</Button></div></CardContent></Card>;
}
