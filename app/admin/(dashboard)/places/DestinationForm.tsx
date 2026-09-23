'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, Input } from '@/components/ui/input';
import { NumberField } from '@/components/ui/number-field';
import { Select } from '@/components/ui/select';
import { TagsInput } from '@/components/ui/tags-input';
import { useToast } from '@/components/ui/toast';
import { Textarea } from '@/components/ui/textarea';
import { fa } from '@/lib/utils';
import { saveDestination, type DestinationInput, type DestinationRow, type FaqItem } from './actions';

const EMPTY: DestinationInput = { slug: '', name: '', nameEn: '', type: 'city', parentCountrySlug: '', parentCountryName: '', category: '', image: '', heroTagline: '', description: '', bestSeason: '', visaRequired: false, visaType: '', flightDuration: '', currency: '', startingPrice: '', startingPriceNote: '', lastVerifiedAt: '', activeToursCount: 0, popularDistricts: [], keyHighlights: [], travelTips: [], faqs: [], relatedGuides: [] };
const nlToArray = (v: string) => v.split('\n').map((s) => s.trim()).filter(Boolean);

export default function DestinationForm({ initial, editingId, onDone }: { initial?: DestinationRow | null; editingId?: string | null; onDone: () => void }) {
  const src: DestinationInput = initial ? { slug: initial.slug, name: initial.name, nameEn: initial.nameEn, type: initial.type, parentCountrySlug: initial.parentCountrySlug, parentCountryName: initial.parentCountryName, category: initial.category, image: initial.image, heroTagline: initial.heroTagline, description: initial.description, bestSeason: initial.bestSeason, visaRequired: initial.visaRequired, visaType: initial.visaType, flightDuration: initial.flightDuration, currency: initial.currency, startingPrice: initial.startingPrice, startingPriceNote: initial.startingPriceNote, lastVerifiedAt: initial.lastVerifiedAt, activeToursCount: initial.activeToursCount, popularDistricts: initial.popularDistricts, keyHighlights: initial.keyHighlights, travelTips: initial.travelTips, faqs: initial.faqs, relatedGuides: initial.relatedGuides } : EMPTY;
  const [form, setForm] = useState<DestinationInput>(src);
  const [guidesTxt, setGuidesTxt] = useState((src.relatedGuides ?? []).join('\n'));
  const [faqs, setFaqs] = useState<FaqItem[]>(src.faqs ?? []);
  const [pending, startTransition] = useTransition();
  const { toast } = useToast();

  const set = <K extends keyof DestinationInput>(k: K, v: DestinationInput[K]) => setForm((f) => ({ ...f, [k]: v }));
  const addFaq = () => setFaqs((arr) => [...arr, { question: '', answer: '' }]);
  const removeFaq = (idx: number) => setFaqs((arr) => arr.filter((_, i) => i !== idx));
  const updateFaq = (idx: number, patch: Partial<FaqItem>) => setFaqs((arr) => arr.map((item, i) => (i === idx ? { ...item, ...patch } : item)));

  const submit = () => {
    const payload: DestinationInput = {
      ...form,
      activeToursCount: Number(form.activeToursCount) || 0,
      popularDistricts: form.popularDistricts ?? [],
      keyHighlights: form.keyHighlights ?? [],
      travelTips: form.travelTips ?? [],
      relatedGuides: nlToArray(guidesTxt),
      faqs: faqs.filter((f) => f.question.trim() || f.answer.trim()),
    };
    startTransition(async () => {
      try {
        await saveDestination(editingId ?? null, payload);
        onDone();
      } catch (e) {
        toast({ variant: 'error', title: e instanceof Error ? e.message : 'خطا در ذخیره.' });
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{editingId ? 'ویرایش مقصد' : 'افزودن مقصد جدید'}</CardTitle>
        <CardDescription>اطلاعات مقصد، نکات سفر و پرسش‌های متداول را وارد کنید.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="نامک"><Input value={form.slug} dir="ltr" onChange={(e) => set('slug', e.target.value)} /></Field>
          <Field label="نام فارسی"><Input value={form.name} onChange={(e) => set('name', e.target.value)} /></Field>
          <Field label="نام انگلیسی"><Input value={form.nameEn} dir="ltr" onChange={(e) => set('nameEn', e.target.value)} /></Field>
          <Field label="نوع"><Select value={form.type} onChange={(e) => set('type', e.target.value)} options={[{ value: 'city', label: 'شهر' }, { value: 'country', label: 'کشور' }]} /></Field>
          <Field label="نامک کشور مادر"><Input value={form.parentCountrySlug} dir="ltr" onChange={(e) => set('parentCountrySlug', e.target.value)} /></Field>
          <Field label="نام کشور مادر"><Input value={form.parentCountryName} onChange={(e) => set('parentCountryName', e.target.value)} /></Field>
          <Field label="دسته‌بندی"><Input value={form.category} onChange={(e) => set('category', e.target.value)} /></Field>
          <Field label="تصویر" hint="آدرس کامل تصویر"><Input value={form.image} dir="ltr" onChange={(e) => set('image', e.target.value)} /></Field>
          <Field label="شعار هدر"><Input value={form.heroTagline} onChange={(e) => set('heroTagline', e.target.value)} /></Field>
          <Field label="بهترین فصل"><Input value={form.bestSeason} onChange={(e) => set('bestSeason', e.target.value)} /></Field>
          <Field label="ویزا لازم است؟"><Select value={form.visaRequired ? 'yes' : 'no'} onChange={(e) => set('visaRequired', e.target.value === 'yes')} options={[{ value: 'no', label: 'خیر' }, { value: 'yes', label: 'بله' }]} /></Field>
          <Field label="نوع ویزا"><Input value={form.visaType} onChange={(e) => set('visaType', e.target.value)} /></Field>
          <Field label="مدت پرواز"><Input value={form.flightDuration} onChange={(e) => set('flightDuration', e.target.value)} /></Field>
          <Field label="واحد پول"><Input value={form.currency} onChange={(e) => set('currency', e.target.value)} /></Field>
          <Field label="شروع قیمت"><Input value={form.startingPrice} onChange={(e) => set('startingPrice', e.target.value)} /></Field>
          <Field label="یادداشت شروع قیمت"><Input value={form.startingPriceNote} onChange={(e) => set('startingPriceNote', e.target.value)} /></Field>
          <Field label="آخرین راستی‌آزمایی"><Input value={form.lastVerifiedAt} onChange={(e) => set('lastVerifiedAt', e.target.value)} /></Field>
          <Field label="تعداد تورهای فعال"><NumberField value={Number(form.activeToursCount) || 0} onChange={(v) => set('activeToursCount', v)} min={0} aria-label="تعداد تورهای فعال" /></Field>
        </div>

        <div className="grid gap-4">
          <Field label="توضیحات" hint="حداکثر ۱۲۰۰ نویسه"><Textarea autoResize showCount maxLength={1200} value={form.description} onChange={(e) => set('description', e.target.value)} /></Field>
          <Field label="محله‌های محبوب" hint="با Enter یا ویرگول اضافه کنید"><TagsInput value={form.popularDistricts ?? []} onChange={(v) => set('popularDistricts', v)} placeholder="مثلاً شهر قدیم" /></Field>
          <Field label="جاذبه‌های کلیدی" hint="با Enter یا ویرگول اضافه کنید"><TagsInput value={form.keyHighlights ?? []} onChange={(v) => set('keyHighlights', v)} placeholder="مثلاً برج میلاد" /></Field>
          <Field label="نکات سفر" hint="با Enter یا ویرگول اضافه کنید"><TagsInput value={form.travelTips ?? []} onChange={(v) => set('travelTips', v)} placeholder="مثلاً بهترین زمان سفر" /></Field>
          <Field label="راهنماهای مرتبط" hint="نامک‌ها، هر خط یک مورد"><Textarea value={guidesTxt} dir="ltr" onChange={(e) => setGuidesTxt(e.target.value)} /></Field>
        </div>

        <div className="space-y-3 border-t pt-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">پرسش‌های متداول</h3>
            <Button type="button" variant="outline" size="sm" onClick={addFaq}>افزودن پرسش</Button>
          </div>
          {faqs.length === 0 ? (
            <p className="text-sm text-muted-foreground">هنوز پرسشی ثبت نشده است.</p>
          ) : (
            <div className="space-y-3">
              {faqs.map((faq, idx) => (
                <div key={idx} className="space-y-3 rounded-xl border border-border bg-muted/30 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">پرسش {fa(idx + 1)}</span>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeFaq(idx)}>حذف پرسش</Button>
                  </div>
                  <Input placeholder="پرسش..." value={faq.question} onChange={(e) => updateFaq(idx, { question: e.target.value })} />
                  <Textarea placeholder="پاسخ..." value={faq.answer} onChange={(e) => updateFaq(idx, { answer: e.target.value })} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button onClick={submit} disabled={pending}>{pending ? 'در حال ذخیره...' : editingId ? 'ذخیره تغییرات' : 'ثبت مقصد'}</Button>
          <Button type="button" variant="outline" onClick={onDone}>انصراف</Button>
        </div>
      </CardContent>
    </Card>
  );
}
