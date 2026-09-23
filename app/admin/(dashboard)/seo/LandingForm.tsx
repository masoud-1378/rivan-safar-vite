'use client';

import { useState, useTransition } from 'react';
import { DatePicker } from '@/components/ui/date-picker';
import { Field, Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useToast } from '@/components/ui/toast';
import { Textarea } from '@/components/ui/textarea';
import { createLanding, type LandingInput } from './actions';

const PAGE_TYPES = [
  { value: 'home', label: 'خانه' },
  { value: 'tours_all', label: 'همه تورها' },
  { value: 'tours_foreign', label: 'تور خارجی' },
  { value: 'tours_domestic', label: 'تور داخلی' },
  { value: 'country', label: 'کشور' },
  { value: 'destination_city', label: 'شهر/مقصد' },
  { value: 'tour_detail', label: 'جزئیات تور' },
  { value: 'exhibitions_hub', label: 'نمایشگاه‌ها' },
  { value: 'exhibition_detail', label: 'جزئیات نمایشگاه' },
  { value: 'guides_hub', label: 'راهنماها' },
  { value: 'guide_detail', label: 'جزئیات راهنما' },
  { value: 'visa_country', label: 'ویزا' },
  { value: 'about', label: 'درباره ما' },
  { value: 'contact', label: 'تماس' },
  { value: 'licenses', label: 'مجوزها' },
  { value: 'terms', label: 'قوانین' },
  { value: 'privacy', label: 'حریم خصوصی' },
];

const WORKFLOW_OPTIONS = [
  { value: 'draft', label: 'پیش‌نویس' },
  { value: 'review', label: 'بازبینی' },
  { value: 'published', label: 'منتشرشده' },
  { value: 'paused', label: 'متوقف' },
  { value: 'archived', label: 'بایگانی' },
];

export default function LandingForm({ onSaved }: { onSaved?: () => void }) {
  const [queryOwner, setQueryOwner] = useState('');
  const [urlPath, setUrlPath] = useState('');
  const [pageType, setPageType] = useState('country');
  const [titleFa, setTitleFa] = useState('');
  const [metaDescriptionFa, setMetaDescriptionFa] = useState('');
  const [h1Fa, setH1Fa] = useState('');
  const [workflow, setWorkflow] = useState<NonNullable<LandingInput['workflow']>>('draft');
  const [indexStatus, setIndexStatus] = useState<NonNullable<LandingInput['indexStatus']>>('noindex');
  const [nextReviewAt, setNextReviewAt] = useState<Date | null>(null);
  const [pending, startTransition] = useTransition();
  const { toast } = useToast();

  const submit = () => {
    const input: LandingInput = {
      queryOwner: queryOwner.trim(),
      urlPath: urlPath.trim().startsWith('/') ? urlPath.trim() : '/' + urlPath.trim(),
      pageType,
      titleFa,
      metaDescriptionFa,
      h1Fa,
      workflow,
      indexStatus,
      nextReviewAt: nextReviewAt ? nextReviewAt.toISOString() : '',
    };
    startTransition(async () => {
      try {
        await createLanding(input);
        toast({ variant: 'success', title: 'لندینگ ساخته شد.' });
        if (onSaved) onSaved();
        window.location.reload();
      } catch (e) {
        toast({ variant: 'error', title: e instanceof Error ? e.message : 'خطا در ساخت لندینگ.' });
      }
    });
  };

  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-5 admin-lift">
      <h2 className="font-semibold text-foreground">لندینگ جدید</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Query Owner" htmlFor="qo" hint="کد یکتای صفحه، مثلاً home:ریوان سفر">
          <Input id="qo" dir="ltr" value={queryOwner} onChange={(e) => setQueryOwner(e.target.value)} placeholder="home:ریوان سفر" />
        </Field>
        <Field label="مسیر URL" htmlFor="up" hint="بدون نیم‌فاصله؛ مثلاً /destination/turkey/istanbul">
          <Input id="up" dir="ltr" value={urlPath} onChange={(e) => setUrlPath(e.target.value)} placeholder="/destination/turkey/istanbul" />
        </Field>
        <Field label="نوع صفحه" htmlFor="pt">
          <Select id="pt" value={pageType} onChange={(e) => setPageType(e.target.value)} options={PAGE_TYPES} />
        </Field>
        <Field label="عنوان سئو (Title)" htmlFor="tf" hint="حدود ۶۰ نویسه">
          <Input id="tf" value={titleFa} onChange={(e) => setTitleFa(e.target.value)} placeholder="تور استانبول با اقامت در مرکز شهر" />
        </Field>
        <Field label="توضیحات متا (Meta Description)" htmlFor="md" hint="حدود ۱۵۵ نویسه">
          <Textarea id="md" autoResize showCount maxLength={200} value={metaDescriptionFa} onChange={(e) => setMetaDescriptionFa(e.target.value)} placeholder="توضیح کوتاهی که در نتایج جست‌وجو نمایش داده می‌شود." />
        </Field>
        <Field label="تیتر صفحه (H1)" htmlFor="h1">
          <Input id="h1" value={h1Fa} onChange={(e) => setH1Fa(e.target.value)} placeholder="تور استانبول" />
        </Field>
        <Field label="وضعیت انتشار" htmlFor="wf">
          <Select id="wf" value={workflow} onChange={(e) => setWorkflow(e.target.value as NonNullable<LandingInput['workflow']>)} options={WORKFLOW_OPTIONS} />
        </Field>
        <Field label="ایندکس" htmlFor="ix" hint="noindex یعنی صفحه از نتایج جست‌وجو حذف شود">
          <Select id="ix" dir="ltr" value={indexStatus} onChange={(e) => setIndexStatus(e.target.value as NonNullable<LandingInput['indexStatus']>)} options={[{ value: 'index', label: 'index' }, { value: 'noindex', label: 'noindex' }]} />
        </Field>
        <Field label="بازبینی بعدی" htmlFor="nr" hint="تاریخ شمسی">
          <DatePicker value={nextReviewAt} onChange={setNextReviewAt} placeholder="انتخاب تاریخ بازبینی" />
        </Field>
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={submit} disabled={pending} className="inline-flex h-10 items-center justify-center rounded-lg bg-brand px-4 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand/90 disabled:pointer-events-none disabled:opacity-50">
          {pending ? 'در حال ثبت...' : 'ایجاد لندینگ'}
        </button>
      </div>
    </div>
  );
}
