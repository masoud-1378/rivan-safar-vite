'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useToast } from '@/components/ui/toast';
import { SeoMetaFields } from '@/components/ui/seo-meta-fields';
import { AlertDialog } from '@/components/ui/alert-dialog';
import { faSlug } from '@/lib/utils';
import { createLanding, updateLanding, type LandingInput } from './actions';
import type { PathCollision } from '@/src/lib/landing-path';

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
  const [queryOwnerTouched, setQueryOwnerTouched] = useState(Boolean(initial?.queryOwner));
  const [urlPath, setUrlPath] = useState(initial?.urlPath ?? '');
  const [urlPathTouched, setUrlPathTouched] = useState(Boolean(initial?.urlPath));
  const [pageType, setPageType] = useState(initial?.pageType ?? 'country');
  const [titleFa, setTitleFa] = useState(initial?.titleFa ?? '');
  const [metaDescriptionFa, setMetaDescriptionFa] = useState(initial?.metaDescriptionFa ?? '');
  const [h1Fa, setH1Fa] = useState(initial?.h1Fa ?? '');
  const [workflow, setWorkflow] = useState<NonNullable<LandingInput['workflow']>>(initial?.workflow ?? 'draft');
  const [indexStatus, setIndexStatus] = useState<NonNullable<LandingInput['indexStatus']>>(initial?.indexStatus ?? 'noindex');
  const [errors, setErrors] = useState<{ queryOwner?: string; urlPath?: string; titleFa?: string; h1Fa?: string }>({});
  const [pending, startTransition] = useTransition();
  const { toast } = useToast();
  // وضعیت دیالوگ «تصادم آدرس»: وقتی سرور needsConfirm برگرداند، این‌جا پر می‌شود.
  const [confirmState, setConfirmState] = useState<{
    suggestedPath: string;
    collision: PathCollision;
  } | null>(null);

  // S1/S2: تولید خودکار «کد یکتای صفحه» و «مسیر URL» از نوع صفحه و عنوان —
  // تا وقتی کاربر دستی دست نزده باشد.
  const onPageType = (v: string) => {
    setPageType(v);
    if (!queryOwnerTouched) setQueryOwner(`${v}:${faSlug(titleFa)}`);
  };
  const onTitleFa = (v: string) => {
    setTitleFa(v);
    setErrors((prev) => ({ ...prev, titleFa: undefined }));
    if (!queryOwnerTouched) setQueryOwner(`${pageType}:${faSlug(v)}`);
    if (!urlPathTouched) setUrlPath(`/${faSlug(v)}`);
  };
  // یافتهٔ ۴: هشدار پیشاپیشِ تغییر مسیرِ لندینگ منتشرشده.
  const urlPathChanged =
    editing &&
    initial?.workflow === 'published' &&
    urlPath.trim() !== (initial?.urlPath ?? '').trim();

  // ذخیرهٔ واقعی؛ confirmed=true یعنی ادمین تصادم را دیده و با آدرس شماره‌دار موافقت کرده.
  const doSave = (confirmed: boolean) => {
    const input: LandingInput = {
      queryOwner: queryOwner.trim(),
      urlPath: urlPath.trim().startsWith('/') ? urlPath.trim() : '/' + urlPath.trim(),
      pageType,
      titleFa,
      metaDescriptionFa,
      h1Fa,
      // حالت ساخت همیشه پیش‌نویس است (سرور هم همین را تحمیل می‌کند)؛
      // تغییر وضعیت فقط در ویرایش/فهرست و با گیت انتشار.
      workflow: editing ? workflow : 'draft',
      indexStatus,
    };
    startTransition(async () => {
      try {
        if (editing && initial) {
          const result = await updateLanding(initial.id, input, { confirmed });
          if ('needsConfirm' in result) {
            setConfirmState({ suggestedPath: result.suggestedPath, collision: result.collision });
            return;
          }
          // ریشهٔ #441: خطای قابل‌پیش‌بینی (مثل رد گیت انتشار) به‌صورت مقدار
          // می‌آید؛ همان پیام فارسی را نشان بده.
          if ('error' in result) {
            toast({ variant: 'error', title: result.error });
            return;
          }
          const typedPath = input.urlPath.replace(/\/+$/, '') || '/';
          if (result.finalPath && result.finalPath !== typedPath) {
            toast({ variant: 'success', title: `تغییرات با آدرس «${result.finalPath}» ذخیره شد.` });
          } else if (result.demotedToDraft) {
            toast({
              variant: 'warning',
              title: 'مسیر عوض شد و لینک‌های ورودی صفحه مردند؛ لندینگ به پیش‌نویس برگشت.',
            });
          } else {
            toast({ variant: 'success', title: 'تغییرات لندینگ ذخیره شد.' });
          }
        } else {
          const result = await createLanding(input, { confirmed });
          if ('needsConfirm' in result) {
            setConfirmState({ suggestedPath: result.suggestedPath, collision: result.collision });
            return;
          }
          // ریشهٔ #441: خطای قابل‌پیش‌بینی به‌صورت مقدار می‌آید.
          if ('error' in result) {
            toast({ variant: 'error', title: result.error });
            return;
          }
          toast({
            variant: 'success',
            title: confirmed ? `لندینگ با آدرس «${result.finalPath}» ساخته شد.` : 'لندینگ ساخته شد.',
          });
        }
        if (onSaved) onSaved();
        window.location.reload();
      } catch (e) {
        // ریشهٔ #441: در پروداکشن e.message همان «Minified React error #441» است؛
        // به کاربر نشانش نده. پیام عمومی + ثبت digest برای عیب‌یابی.
        console.error('[seo] landing save failed', (e as { digest?: unknown })?.digest ?? e);
        toast({ variant: 'error', title: 'خطا در ذخیره لندینگ.' });
      }
    });
  };

  // تأیید دیالوگ تصادم: ارسال دوم با همان ورودی‌ها و پرچم confirmed.
  const confirmCollision = () => doSave(true);

  const submit = () => {
    const nextErrors: typeof errors = {};
    if (!queryOwner.trim()) nextErrors.queryOwner = 'کد یکتای صفحه را بنویسید.';
    if (!urlPath.trim()) nextErrors.urlPath = 'مسیر URL را بنویسید.';
    if (!titleFa.trim()) nextErrors.titleFa = 'عنوان سئو را بنویسید.';
    if (!h1Fa.trim()) nextErrors.h1Fa = 'تیتر صفحه (H1) را بنویسید.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    doSave(false);
  };

  return (
    <div className="space-y-5 rounded-sm border border-border bg-card p-5">
      <h2 className="text-lg font-semibold text-foreground">{editing ? 'ویرایش لندینگ' : 'لندینگ جدید'}</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="کد یکتای صفحه" htmlFor="qo" hint="خودکار از نوع صفحه و عنوان ساخته می‌شود؛ مثلاً country:tehran" error={errors.queryOwner}>
          <Input id="qo" dir="ltr" value={queryOwner} onChange={(e) => { setQueryOwner(e.target.value); setQueryOwnerTouched(true); setErrors((prev) => ({ ...prev, queryOwner: undefined })); }} placeholder="country:tehran" />
        </Field>
        <Field label="مسیر URL" htmlFor="up" hint="خودکار از عنوان ساخته می‌شود؛ می‌توانید تغییرش دهید. بدون نیم‌فاصله؛ مثلاً /destination/turkey/istanbul" error={errors.urlPath}>
          <Input id="up" dir="ltr" value={urlPath} onChange={(e) => { setUrlPath(e.target.value); setUrlPathTouched(true); setErrors((prev) => ({ ...prev, urlPath: undefined })); }} placeholder="/destination/turkey/istanbul" />
          {urlPathChanged ? (
            <p className="text-xs font-medium text-warning">
              هشدار: این لندینگ منتشرشده است؛ با تغییر مسیر، لینک‌های ورودی‌اش می‌میرند و صفحه به پیش‌نویس برمی‌گردد.
            </p>
          ) : null}
        </Field>
        <Field label="نوع صفحه" htmlFor="pt">
          <Select id="pt" value={pageType} onChange={(e) => onPageType(e.target.value)} options={PAGE_TYPES} />
        </Field>
        <div className="sm:col-span-2">
          <SeoMetaFields
            metaTitle={titleFa}
            onMetaTitleChange={(v) => onTitleFa(v)}
            metaDescription={metaDescriptionFa}
            onMetaDescriptionChange={setMetaDescriptionFa}
            metaTitleError={errors.titleFa}
            titleFallback={h1Fa}
            urlPreview={urlPath.trim() || undefined}
          />
        </div>
        <Field label="تیتر صفحه (H1)" htmlFor="h1" error={errors.h1Fa}>
          <Input id="h1" value={h1Fa} onChange={(e) => { setH1Fa(e.target.value); setErrors((prev) => ({ ...prev, h1Fa: undefined })); }} placeholder="تور استانبول" />
        </Field>
        {editing ? (
          <Field label="وضعیت انتشار" htmlFor="wf">
            <Select id="wf" value={workflow} onChange={(e) => setWorkflow(e.target.value as NonNullable<LandingInput['workflow']>)} options={WORKFLOW_OPTIONS} />
          </Field>
        ) : (
          // ریشهٔ B-۹ (بخش ساخت): سرور createLanding همیشه پیش‌نویس می‌سازد و
          // مقدار این سلکت را نادیده می‌گیرد؛ پس در حالت ساخت اصلاً انتخابی
          // نشان نمی‌دهیم تا حرف رابط با رفتار سرور یکی باشد.
          <Field label="وضعیت انتشار">
            <p className="rounded-sm border border-border bg-accent/30 px-3 py-2.5 text-sm text-muted-foreground">
              لندینگ تازه همیشه «پیش‌نویس» ساخته می‌شود. انتشارش پس از تأیید
              چک‌لیست انتشار، از ستون «وضعیت» همین فهرست است.
            </p>
          </Field>
        )}
        <Field label="نمایش در گوگل" htmlFor="ix" hint="«نباشد» یعنی صفحه از نتایج جست‌وجو پنهان می‌ماند.">
          <Select id="ix" value={indexStatus} onChange={(e) => setIndexStatus(e.target.value as NonNullable<LandingInput['indexStatus']>)} options={[{ value: 'index', label: 'در نتایج گوگل باشد' }, { value: 'noindex', label: 'در نتایج گوگل نباشد' }]} />
        </Field>
      </div>
      <div className="flex gap-2">
        <Button type="button" variant="brand" onClick={submit} disabled={pending}>
          {pending ? 'در حال ثبت...' : editing ? 'ذخیره تغییرات' : 'ایجاد لندینگ'}
        </Button>
      </div>
      <AlertDialog
        open={confirmState !== null}
        onOpenChange={(open) => { if (!open) setConfirmState(null); }}
        title="با آدرس پیشنهادی ذخیره شود؟"
        description={
          confirmState ? (
            <span className="space-y-2">
              <span className="block">{confirmState.collision.reason}</span>
              <span className="block">
                آدرس پیشنهادی:{' '}
                <span dir="ltr" className="font-mono text-[13px]">«{confirmState.suggestedPath}»</span>
              </span>
              <span className="block text-muted-foreground">
                اگر آدرس دیگری می‌خواهید، انصراف بزنید و در فیلد «مسیر URL» بنویسید.
              </span>
            </span>
          ) : undefined
        }
        confirmText="ذخیره با آدرس پیشنهادی"
        cancelText="انصراف"
        onConfirm={confirmCollision}
      />
    </div>
  );
}
