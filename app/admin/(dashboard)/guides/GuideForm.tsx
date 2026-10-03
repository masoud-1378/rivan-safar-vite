'use client';

import React, { useEffect, useState, useTransition } from 'react';
import { Archive, Eye } from 'lucide-react';
import { Alert } from '@/components/ui/alert';
import { AlertDialog } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Field, Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { fa, faSlug } from '@/lib/utils';
import { deleteGuide, saveGuide, checkGuideRichCols, type GuideInput, type GuideRow, type GuideStatus } from './actions';
import { ColumnNotice, useColumnGuard } from '@/components/ui/column-guard';
import { DatePicker } from '@/components/ui/date-picker';
import { safeErrorMessage } from '@/src/lib/error-message';
import BlockEditor, { cleanBlocks, readItem, validateBlocks } from '@/components/ui/block-editor';
import { MediaField } from '@/components/ui/media-library/MediaField';
import { mediaTag, type PickedImage } from '@/components/ui/media-library/types';
import { openMediaPicker } from '@/components/ui/media-library/openMediaPicker';
import { RichEditor, RichText } from '@/components/ui/rich-editor';
import {
  cleanRichValue,
  isRichEmpty,
  normalizeRichValue,
  richFallback,
  richFromPlainText,
  richToPlainText,
  type JSONContent,
} from '@/lib/rich-text';

export interface GuidePickerOption {
  value: string;
  label: string;
}

const CATEGORIES = [
  { value: 'destination-choice', label: 'انتخاب مقصد' },
  { value: 'visa-docs', label: 'ویزا و مدارک' },
  { value: 'budget-cost', label: 'بودجه و هزینه‌ها' },
  { value: 'hotel-flight', label: 'هتل و پرواز' },
  { value: 'exhibition-trade', label: 'نمایشگاهی و تجاری' },
  { value: 'general', label: 'عمومی' },
];

const STATUSES: Array<{ value: GuideStatus; label: string }> = [
  { value: 'draft', label: 'پیش‌نویس' },
  { value: 'review', label: 'در حال بازبینی' },
  { value: 'published', label: 'منتشرشده' },
  { value: 'paused', label: 'متوقف' },
  { value: 'archived', label: 'بایگانی' },
];

/** مقدار اولیهٔ ویرایشگر: اول نسخهٔ غنی (`*_rich`)، اگر خالی بود متن تخت قدیمی. */
function initialRich(
  rich: JSONContent | string | null | undefined,
  plain: string | null | undefined,
): JSONContent | null {
  const json = normalizeRichValue(rich ?? null);
  if (json && !isRichEmpty(json)) return json;
  const t = (plain ?? '').trim();
  return t ? richFromPlainText(t) : null;
}

/** G4: شمارش واژه‌های بخش‌ها (تیتر + متن غنی/تخت) برای تخمین زمان مطالعه. */
function sectionWords(items: unknown[]): number {
  let n = 0;
  const count = (s: string) => {
    n += s.trim().split(/\s+/).filter(Boolean).length;
  };
  for (const it of items) {
    if (!it || typeof it !== 'object') continue;
    const o = it as Record<string, unknown>;
    const heading = typeof o.heading === 'string' ? o.heading : typeof o.title === 'string' ? o.title : '';
    count(heading);
    const rich = normalizeRichValue(o.content_rich as JSONContent | string | null | undefined);
    const body = rich && !isRichEmpty(rich)
      ? richToPlainText(rich)
      : typeof o.content === 'string'
        ? o.content
        : '';
    count(body);
  }
  return n;
}

function readTimeLabel(words: number): string {
  const minutes = Math.max(1, Math.round(words / 180));
  return `${fa(minutes)} دقیقه مطالعه`;
}

/** پیش‌نمایش واقعی متن — همان رندر RichText که روی سایت دیده می‌شود. */
function GuidePreview({
  titleFa,
  categoryLabel,
  readTime,
  author,
  reviewer,
  heroUrl,
  summaryRich,
  summaryPlain,
  directAnswerRich,
  directAnswerPlain,
  sections,
  faqs,
}: {
  titleFa: string;
  categoryLabel: string;
  readTime: string;
  author: string;
  reviewer: string;
  heroUrl: string;
  summaryRich: JSONContent | null;
  summaryPlain: string;
  directAnswerRich: JSONContent | null;
  directAnswerPlain: string;
  sections: unknown[];
  faqs: unknown[];
}) {
  return (
    <div className="space-y-6 rounded-md border border-border bg-card p-6" dir="rtl">
      <p className="text-xs text-muted-foreground">
        پیش‌نمایش متن — همان‌طور که روی سایت دیده می‌شود.
      </p>
      <div>
        <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {categoryLabel && <span className="font-semibold">{categoryLabel}</span>}
          {readTime && <span>زمان مطالعه: {readTime}</span>}
        </div>
        <h2 className="mb-3 text-xl font-extrabold">{titleFa || '—'}</h2>
        <div className="mb-3 font-medium leading-relaxed text-muted-foreground">
          <RichText value={richFallback(summaryRich, summaryPlain)} />
        </div>
        {(author || reviewer) && (
          <p className="mb-4 text-xs text-muted-foreground">
            {author && <>نویسنده: <span className="font-bold">{author}</span></>}
            {author && reviewer && ' • '}
            {reviewer && <>بازبین: <span className="font-bold">{reviewer}</span></>}
          </p>
        )}
        {heroUrl && (
          <div className="mb-4 overflow-hidden rounded-md border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={heroUrl} alt={titleFa} className="aspect-[21/9] w-full object-cover" />
          </div>
        )}
        <div className="rounded-md border border-orange-200 bg-orange-50 p-4 dark:border-orange-900/40 dark:bg-orange-950/20">
          <p className="mb-2 text-sm font-bold">خلاصه و نتیجه‌گیری سریع برای مسافر</p>
          <RichText value={richFallback(directAnswerRich, directAnswerPlain)} />
        </div>
      </div>
      {sections.length > 0 && (
        <div className="space-y-6">
          {sections.map((raw, idx) => {
            const f = readItem('section', raw);
            return (
              <div key={idx} className="space-y-2">
                <h3 className="border-r-4 border-orange-500 pr-3 text-base font-bold">
                  {String(f.heading ?? '')}
                </h3>
                <RichText
                  value={richFallback(
                    f.contentRich as JSONContent | string | null,
                    String(f.content ?? ''),
                  )}
                />
              </div>
            );
          })}
        </div>
      )}
      {faqs.length > 0 && (
        <div className="space-y-4 border-t border-border pt-4">
          <h3 className="text-base font-bold">پرسش‌های متداول</h3>
          {faqs.map((raw, idx) => {
            const f = readItem('faq', raw);
            return (
              <div key={idx} className="space-y-1">
                <p className="text-sm font-bold">{String(f.question ?? '')}</p>
                <RichText
                  value={richFallback(
                    f.answerRich as JSONContent | string | null,
                    String(f.answer ?? ''),
                  )}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function GuideForm({
  initial,
  editingId,
  onSaved,
  onCancel,
  onDeleted,
  destinationOptions = [],
  tourOptions = [],
}: {
  initial?: GuideRow | null;
  editingId?: string | null;
  onSaved?: () => void;
  onCancel?: () => void;
  /** بعد از بایگانی راهنما از داخل فرم صدا زده می‌شود. */
  onDeleted?: () => void;
  /** G3: فهرست واقعی مقصدها برای انتخاب «مقصد مرتبط». */
  destinationOptions?: GuidePickerOption[];
  /** G3: فهرست واقعی تورها برای انتخاب «تور مرتبط». */
  tourOptions?: GuidePickerOption[];
}) {
  const [slug, setSlug] = useState(initial?.slug ?? '');
  const [slugTouched, setSlugTouched] = useState(Boolean(initial?.slug));
  const [titleFa, setTitleFa] = useState(initial?.titleFa ?? '');
  const [category, setCategory] = useState(initial?.category ?? 'general');
  // موج ۲، تیم تکراری‌ها: برچسب دسته‌بندی دستی تایپ نمی‌شود؛ همیشه از گزینهٔ
  // انتخاب‌شدهٔ «دسته‌بندی» می‌آید. ستون categoryLabel در دیتابیس می‌ماند و نوشته می‌شود.
  const autoCategoryLabel = CATEGORIES.find((c) => c.value === category)?.label ?? '';
  const [readTime, setReadTime] = useState(initial?.readTime ?? '');
  const [readTimeTouched, setReadTimeTouched] = useState(Boolean(initial?.readTime));
  const [author, setAuthor] = useState(initial?.author ?? '');
  const [reviewer, setReviewer] = useState(initial?.reviewer ?? '');
  // خلاصه و پاسخ مستقیم با ویرایشگر کامل؛ خوانش اول از *_rich، بعد متن تخت قدیمی.
  const [summaryRich, setSummaryRich] = useState<JSONContent | null>(() =>
    initialRich(initial?.summaryRich, initial?.summary),
  );
  const [directAnswerRich, setDirectAnswerRich] = useState<JSONContent | null>(() =>
    initialRich(initial?.directAnswerRich, initial?.directAnswer),
  );
  // تصویر اصلی راهنما: آپلود تازه / انتخاب از کتابخانه / لینک دستی.
  // فرم فقط url را ذخیره می‌کند؛ کپشن و alt در خود مقدار می‌ماند تا
  // ستون‌هایش به دیتابیس اضافه شود (یادداشت content-editor/media/NOTES.md).
  const [hero, setHero] = useState<PickedImage | null>(
    initial?.heroImage ? { url: initial.heroImage } : null,
  );
  const [relatedDestinationSlug, setRelatedDestinationSlug] = useState(
    initial?.relatedDestinationSlug ?? '',
  );
  // F8: این فیلد «نامک» تور را نگه می‌دارد (مقادیر فهرست نامک‌اند)، نه شناسهٔ دیتابیس را.
  const [relatedTourSlug, setRelatedTourSlug] = useState(initial?.relatedTourSlug ?? '');
  const [sections, setSections] = useState<unknown[]>(
    Array.isArray(initial?.sections) ? initial.sections : [],
  );
  const [faqs, setFaqs] = useState<unknown[]>(
    Array.isArray(initial?.faqs) ? initial.faqs : [],
  );
  const [sectionsError, setSectionsError] = useState<string | undefined>();
  const [faqsError, setFaqsError] = useState<string | undefined>();
  const [status, setStatus] = useState<GuideStatus>(initial?.status ?? 'draft');
  // ۴-۱۰: تاریخ بازبینی دوره‌ای؛ ستون last_reviewed_at از قبل در دیتابیس هست.
  const [lastReviewedAt, setLastReviewedAt] = useState<Date | null>(
    initial?.lastReviewedAt ? new Date(initial.lastReviewedAt) : null,
  );
  const [error, setError] = useState<string | null>(null);
  // نگهبان ستون‌های *_rich (مایگریشن 0030): تا وقتی ستون‌ها نباشند، کنار همان
  // دو فیلد اطلاع صادقانه نشان داده می‌شود تا ویرایش بی‌صدا گم نشود.
  const richColsReady = useColumnGuard(checkGuideRichCols);
  const [showPreview, setShowPreview] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [pending, startTransition] = useTransition();

  // G4: تا وقتی دستی بازنویسی نشده، زمان مطالعه از طول بخش‌ها می‌آید.
  useEffect(() => {
    if (!readTimeTouched) setReadTime(readTimeLabel(sectionWords(sections)));
  }, [sections, readTimeTouched]);

  const recomputeReadTime = () => {
    setReadTime(readTimeLabel(sectionWords(sections)));
    setReadTimeTouched(false);
  };

  // G2: نامک خودکار از عنوان.
  const onTitleFa = (v: string) => {
    setTitleFa(v);
    if (!slugTouched) setSlug(faSlug(v));
  };

  // عکس داخل متن بخش‌ها از کتابخانهٔ رسانه (تگ راهنما).
  const pickSectionImage = () =>
    openMediaPicker({ tag: mediaTag('guide', slug), title: 'انتخاب عکس برای متن بخش' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const sectionsProblem = validateBlocks('section', sections);
    setSectionsError(sectionsProblem ?? undefined);
    const faqsProblem = validateBlocks('faq', faqs);
    setFaqsError(faqsProblem ?? undefined);
    if (sectionsProblem || faqsProblem) return;

    const payload: GuideInput = {
      slug: slug.trim(),
      titleFa: titleFa.trim(),
      category,
      categoryLabel: autoCategoryLabel,
      readTime: readTime.trim(),
      author: author.trim(),
      reviewer: reviewer.trim(),
      // متن‌های غنی با JSON تمیز؛ ستون‌های متنی قدیمی دست نمی‌خورند (fallback).
      summaryRich: cleanRichValue(summaryRich),
      heroImage: hero?.url.trim() ?? '',
      directAnswerRich: cleanRichValue(directAnswerRich),
      sections: cleanBlocks('section', sections),
      faqs: cleanBlocks('faq', faqs),
      sectionsFormat: initial?.sectionsFormat,
      faqsFormat: initial?.faqsFormat,
      relatedDestinationSlug: relatedDestinationSlug.trim(),
      relatedTourSlug: relatedTourSlug.trim(),
      status,
      lastReviewedAt: lastReviewedAt ? lastReviewedAt.toISOString() : null,
    };

    startTransition(async () => {
      try {
        await saveGuide(editingId ?? null, payload);
        if (onSaved) onSaved();
      } catch (err) {
        setError(safeErrorMessage(err, 'خطای نامشخص در ذخیره‌سازی.'));
      }
    });
  };

  const handleDelete = async () => {
    if (!editingId) return;
    try {
      await deleteGuide(editingId);
      if (onDeleted) onDeleted();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در بایگانی راهنما.');
    }
  };

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-5 p-5">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h2 className="text-lg font-semibold">{editingId ? 'ویرایش راهنما' : 'راهنمای جدید'}</h2>
            <p className="mt-1 text-sm text-muted-foreground">اطلاعات و محتوای راهنمای سفر را وارد کنید.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowPreview((v) => !v)}
            >
              <Eye />
              {showPreview ? 'بستن پیش‌نمایش' : 'پیش‌نمایش'}
            </Button>
            {editingId && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-destructive"
                onClick={() => setConfirmDelete(true)}
              >
                <Archive />
                بایگانی
              </Button>
            )}
            {onCancel && <Button type="button" variant="ghost" size="sm" onClick={onCancel}>انصراف</Button>}
          </div>
        </div>

      {error && (
        <Alert variant="destructive">{error}</Alert>
      )}

      {/* محتوای اصلی (خلاصه + پاسخ مستقیم) نزدیک عنوان — بالای داده‌های فراداده */}
      <Field
        label="خلاصه راهنما"
        htmlFor="guide-summary"
        hint="راهنمای نرم سئو: خلاصهٔ کوتاه (یک تا دو جمله) در نتایج گوگل بهتر دیده می‌شود؛ اجباری نیست."
      >
        <RichEditor
          variant="full"
          value={summaryRich}
          onChange={setSummaryRich}
          placeholder="چکیده کوتاه راهنما…"
        />
        {richColsReady === false && (
          <ColumnNotice>ذخیرهٔ این فیلد به به‌روزرسانی دیتابیس نیاز دارد؛ فعلاً اعمال نمی‌شود.</ColumnNotice>
        )}
      </Field>

      <Field label="پاسخ مستقیم و سریع" htmlFor="guide-direct">
        <RichEditor
          variant="full"
          value={directAnswerRich}
          onChange={setDirectAnswerRich}
          placeholder="پاسخ سریع به پرسش اصلی کاربر…"
        />
        {richColsReady === false && (
          <ColumnNotice>ذخیرهٔ این فیلد به به‌روزرسانی دیتابیس نیاز دارد؛ فعلاً اعمال نمی‌شود.</ColumnNotice>
        )}
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* عنوان اول، نامک بعد: نامک خودکار از عنوان ساخته می‌شود (ترتیب فکر کاربر) */}
        <Field label="عنوان فارسی" htmlFor="guide-title">
          <Input
            id="guide-title"
            value={titleFa}
            onChange={(e) => onTitleFa(e.target.value)}
            placeholder="مثال: راهنمای کامل متروی دبی"
            required
          />
        </Field>

        <Field label="نامک انگلیسی" htmlFor="guide-slug" hint="خودکار از عنوان فارسی ساخته می‌شود؛ فقط حروف انگلیسی، عدد، خط تیره و آندرلاین.">
          <Input
            id="guide-slug"
            value={slug}
            onChange={(e) => { setSlug(e.target.value); setSlugTouched(true); }}
            className="text-start"
            dir="ltr"
            placeholder="e.g. dubai-metro-guide"
            required
          />
        </Field>

        <Field label="دسته‌بندی" htmlFor="guide-cat">
          <Select
            id="guide-cat"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            options={CATEGORIES.map((c) => ({ value: c.value, label: c.label }))}
          />
        </Field>

        <Field
          label="برچسب دسته‌بندی"
          htmlFor="guide-cat-lbl"
          hint="خودکار از «دسته‌بندی» می‌آید؛ دستی تایپ نمی‌شود."
        >
          <div
            id="guide-cat-lbl"
            className="rounded-sm border border-border/60 bg-muted/40 px-3 py-2 text-sm text-foreground"
          >
            {autoCategoryLabel}
          </div>
          {initial?.categoryLabel && initial.categoryLabel !== autoCategoryLabel && (
            <p className="mt-1.5 text-caption text-muted-foreground">
              برچسب قدیمی («{initial.categoryLabel}») با ذخیرهٔ بعدی به «{autoCategoryLabel}» یکسان می‌شود.
            </p>
          )}
        </Field>

        <Field
          label="زمان مطالعه"
          htmlFor="guide-read-time"
          hint={readTimeTouched ? 'دستی بازنویسی شده است.' : 'خودکار از متن بخش‌ها محاسبه می‌شود؛ می‌توانید بازنویسی کنید.'}
        >
          <div className="flex items-center gap-2">
            <Input
              id="guide-read-time"
              value={readTime}
              onChange={(e) => { setReadTime(e.target.value); setReadTimeTouched(true); }}
              placeholder="مثال: ۶ دقیقه مطالعه"
              className="flex-1"
            />
            <Button type="button" variant="ghost" size="sm" onClick={recomputeReadTime}>
              محاسبهٔ خودکار
            </Button>
          </div>
        </Field>

        <Field label="نویسنده" htmlFor="guide-author">
          <Input
            id="guide-author"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="نام نویسنده"
          />
        </Field>

        <Field label="بازبین" htmlFor="guide-reviewer">
          <Input
            id="guide-reviewer"
            value={reviewer}
            onChange={(e) => setReviewer(e.target.value)}
            placeholder="نام بازبین یا کارشناس"
          />
        </Field>

        <MediaField
          label="تصویر اصلی"
          htmlFor="guide-hero"
          hint="آپلود تازه، انتخاب از کتابخانهٔ رسانه، یا درج لینک دستی."
          value={hero}
          onChange={setHero}
          tag={mediaTag('guide', slug)}
          tagLabel="راهنما"
        />

        <Field label="مقصد مرتبط" htmlFor="guide-rel-dest" hint="از فهرست واقعی مقصدها">
          <Select
            id="guide-rel-dest"
            value={relatedDestinationSlug}
            onChange={(e) => setRelatedDestinationSlug(e.target.value)}
            options={[{ value: '', label: 'بدون مقصد مرتبط' }, ...destinationOptions.map((o) => ({ value: o.value, label: o.label }))]}
          />
        </Field>

        <Field label="تور مرتبط" htmlFor="guide-rel-tour" hint="از فهرست واقعی تورها">
          <Select
            id="guide-rel-tour"
            value={relatedTourSlug}
            onChange={(e) => setRelatedTourSlug(e.target.value)}
            options={[{ value: '', label: 'بدون تور مرتبط' }, ...tourOptions.map((o) => ({ value: o.value, label: o.label }))]}
          />
        </Field>

        <Field label="وضعیت انتشار" htmlFor="guide-status">
          <Select
            id="guide-status"
            value={status}
            onChange={(e) => setStatus(e.target.value as GuideStatus)}
            options={STATUSES.map((s) => ({ value: s.value, label: s.label }))}
          />
        </Field>

        <Field label="تاریخ بازبینی" hint="تاریخ شمسی؛ برای یادآوری بازبینی دوره‌ای محتواست.">
          <DatePicker
            value={lastReviewedAt}
            onChange={setLastReviewedAt}
            placeholder="انتخاب تاریخ بازبینی"
          />
        </Field>
      </div>

      <BlockEditor
        kind="section"
        title="بخش‌های راهنما"
        value={sections}
        onChange={(next) => {
          setSections(next);
          setSectionsError(undefined);
        }}
        error={sectionsError}
        sectionBodyEditor="rich"
        pickImage={pickSectionImage}
      />

      <BlockEditor
        kind="faq"
        title="پرسش‌های متداول"
        value={faqs}
        onChange={(next) => {
          setFaqs(next);
          setFaqsError(undefined);
        }}
        error={faqsError}
        faqAnswerEditor="rich-light"
      />

      {showPreview && (
        <GuidePreview
          titleFa={titleFa}
          categoryLabel={autoCategoryLabel}
          readTime={readTime}
          author={author}
          reviewer={reviewer}
          heroUrl={hero?.url.trim() ?? ''}
          summaryRich={summaryRich}
          summaryPlain={initial?.summary ?? ''}
          directAnswerRich={directAnswerRich}
          directAnswerPlain={initial?.directAnswer ?? ''}
          sections={sections}
          faqs={faqs}
        />
      )}

      <div className="flex items-center gap-3 pt-2">
          <Button type="submit" disabled={pending}>{pending ? 'در حال ذخیره…' : 'ذخیره'}</Button>
        {onCancel && (
          <Button type="button" onClick={onCancel} variant="outline">انصراف</Button>
        )}
        </div>
      </form>

      <AlertDialog
        open={confirmDelete}
        onOpenChange={(open) => !open && setConfirmDelete(false)}
        title="بایگانی راهنما"
        description={editingId ? `راهنمای «${titleFa || slug}» بایگانی می‌شود و از سایت و فهرست‌ها پنهان می‌ماند. با «بازیابی» خود راهنما برمی‌گردد، ولی لینک‌های داخلی‌اش برای همیشه پاک شده‌اند و برنمی‌گردند.` : ''}
        confirmText="بایگانی راهنما"
        destructive
        onConfirm={handleDelete}
      />
    </Card>
  );
}
