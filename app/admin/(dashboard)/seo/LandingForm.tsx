'use client';

import { useState, useTransition } from 'react';
import { DatePicker } from '@/components/ui/date-picker';
import { Field, Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useToast } from '@/components/ui/toast';
import { Textarea } from '@/components/ui/textarea';
import { createLanding, updateLanding, type LandingInput } from './actions';

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

// «منتشرشده» این‌جا هست تا سلکت برای لندینگ منتشرشده خالی نماند؛
// گذار به published (از draft و…) سمت سرور گیت کامل می‌خواهد، ولی نگه‌داشتن
// وضعیت publishedِ فعلی گیت دوباره نمی‌خواهد (یافتهٔ ۳).
const WORKFLOW_OPTIONS = [
  { value: 'draft', label: 'پیش‌نویس' },
  { value: 'review', label: 'بازبینی' },
  { value: 'published', label: 'منتشرشده' },
  { value: 'paused', label: 'متوقف' },
  { value: 'archived', label: 'بایگانی' },
];

export interface LandingFormInitial {
  id: string;
  queryOwner: string;
  urlPath: string;
  pageType: string;
  titleFa: string;
  metaDescriptionFa: string | null;
  h1Fa: string;
  workflow: NonNullable<LandingInput['workflow']>;
  indexStatus: NonNullable<LandingInput['indexStatus']>;
  nextReviewAt: Date | null;
}

export default function LandingForm({
  initial,
  onSaved,
}: {
  initial?: LandingFormInitial | null;
  onSaved?: () => void;
}) {
  const editing = Boolean(initial?.id);
  const [queryOwner, setQueryOwner] = useState(initial?.queryOwner ?? '');
  const [urlPath, setUrlPath] = useState(initial?.urlPath ?? '');
  const [pageType, setPageType] = useState(initial?.pageType ?? 'country');
  const [titleFa, setTitleFa] = useState(initial?.titleFa ?? '');
  const [metaDescriptionFa, setMetaDescriptionFa] = useState(initial?.metaDescriptionFa ?? '');
  const [h1Fa, setH1Fa] = useState(initial?.h1Fa ?? '');
  const [workflow, setWorkflow] = useState<NonNullable<LandingInput['workflow']>>(initial?.workflow ?? 'draft');
  const [indexStatus, setIndexStatus] = useState<NonNullable<LandingInput['indexStatus']>>(initial?.indexStatus ?? 'noindex');
  const [nextReviewAt, setNextReviewAt] = useState<Date | null>(initial?.nextReviewAt ?? null);
  const [errors, setErrors] = useState<{ queryOwner?: string; urlPath?: string; titleFa?: string; h1Fa?: string }>({});
  const [pending, startTransition] = useTransition();
  const { toast } = useToast();

  // یافتهٔ ۴: هشدار پیشاپیشِ تغییر مسیرِ لندینگ منتشرشده.
  const urlPathChanged =
    editing &&
    initial?.workflow === 'published' &&
    urlPath.trim() !== (initial?.urlPath ?? '').trim();

  const submit = () => {
    const nextErrors: typeof errors = {};
    if (!queryOwner.trim()) nextErrors.queryOwner = 'کد یکتای صفحه را بنویسید.';
    if (!urlPath.trim()) nextErrors.urlPath = 'مسیر URL را بنویسید.';
    if (!titleFa.trim()) nextErrors.titleFa = 'عنوان سئو را بنویسید.';
    if (!h1Fa.trim()) nextErrors.h1Fa = 'تیتر صفحه (H1) را بنویسید.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
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
        if (editing && initial) {
          const result = await updateLanding(initial.id, input);
          if (result.demotedToDraft) {
            toast({
              variant: 'warning',
              title: 'مسیر عوض شد و لینک‌های ورودی صفحه مردند؛ لندینگ به پیش‌نویس برگشت.',
            });
          } else {
            toast({ variant: 'success', title: 'تغییرات لندینگ ذخیره شد.' });
          }
        } else {
          await createLanding(input);
          toast({ variant: 'success', title: 'لندینگ ساخته شد.' });
        }
        if (onSaved) onSaved();
        window.location.reload();
      } catch (e) {
        toast({ variant: 'error', title: e instanceof Error ? e.message : 'خطا در ذخیره لندینگ.' });
      }
    });
  };

  return (
    <div className="space-y-4 rounded-sm border border-border bg-card p-5">
      <h2 className="font-semibold text-foreground">{editing ? 'ویرایش لندینگ' : 'لندینگ جدید'}</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Query Owner" htmlFor="qo" hint="کد یکتای صفحه، مثلاً home:ریوان سفر" error={errors.queryOwner}>
          <Input id="qo" dir="ltr" value={queryOwner} onChange={(e) => { setQueryOwner(e.target.value); setErrors((prev) => ({ ...prev, queryOwner: undefined })); }} placeholder="home:ریوان سفر" />
        </Field>
        <Field label="مسیر URL" htmlFor="up" hint="بدون نیم‌فاصله؛ مثلاً /destination/turkey/istanbul" error={errors.urlPath}>
          <Input id="up" dir="ltr" value={urlPath} onChange={(e) => { setUrlPath(e.target.value); setErrors((prev) => ({ ...prev, urlPath: undefined })); }} placeholder="/destination/turkey/istanbul" />
          {urlPathChanged ? (
            <p className="text-xs font-medium text-warning">
              هشدار: این لندینگ منتشرشده است؛ با تغییر مسیر، لینک‌های ورودی‌اش می‌میرند و صفحه به پیش‌نویس برمی‌گردد.
            </p>
          ) : null}
        </Field>
        <Field label="نوع صفحه" htmlFor="pt">
          <Select id="pt" value={pageType} onChange={(e) => setPageType(e.target.value)} options={PAGE_TYPES} />
        </Field>
        <Field label="Title (عنوان سئو)" htmlFor="tf" hint="حدود ۶۰ نویسه" error={errors.titleFa}>
          <Input id="tf" value={titleFa} onChange={(e) => { setTitleFa(e.target.value); setErrors((prev) => ({ ...prev, titleFa: undefined })); }} placeholder="تور استانبول با اقامت در مرکز شهر" />
        </Field>
        <Field label="Meta Description (توضیحات متا)" htmlFor="md" hint="حدود ۱۵۵ نویسه">
          <Textarea id="md" autoResize showCount maxLength={200} value={metaDescriptionFa} onChange={(e) => setMetaDescriptionFa(e.target.value)} placeholder="توضیح کوتاهی که در نتایج جست‌وجو نمایش داده می‌شود." />
        </Field>
        <Field label="تیتر صفحه (H1)" htmlFor="h1" error={errors.h1Fa}>
          <Input id="h1" value={h1Fa} onChange={(e) => { setH1Fa(e.target.value); setErrors((prev) => ({ ...prev, h1Fa: undefined })); }} placeholder="تور استانبول" />
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
        <button type="button" onClick={submit} disabled={pending} className="inline-flex h-10 items-center justify-center rounded-sm bg-brand px-4 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand/90 disabled:pointer-events-none disabled:opacity-50">
          {pending ? 'در حال ثبت...' : editing ? 'ذخیره تغییرات' : 'ایجاد لندینگ'}
        </button>
      </div>
    </div>
  );
}
