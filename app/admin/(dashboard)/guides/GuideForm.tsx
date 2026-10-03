'use client';

import React, { useEffect, useState, useTransition } from 'react';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Field, Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { fa, faSlug } from '@/lib/utils';
import { saveGuide, type GuideInput, type GuideRow, type GuideStatus } from './actions';
import { DatePicker } from '@/components/ui/date-picker';
import BlockEditor, { cleanBlocks, validateBlocks } from '@/components/ui/block-editor';

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

/** G4: شمارش واژه‌های بخش‌ها (تیتر + متن) برای تخمین زمان مطالعه. */
function sectionWords(items: unknown[]): number {
  let n = 0;
  for (const it of items) {
    if (!it || typeof it !== 'object') continue;
    const o = it as Record<string, unknown>;
    for (const k of ['heading', 'content', 'title', 'text']) {
      const v = o[k];
      if (typeof v === 'string') n += v.trim().split(/\s+/).filter(Boolean).length;
    }
  }
  return n;
}

function readTimeLabel(words: number): string {
  const minutes = Math.max(1, Math.round(words / 180));
  return `${fa(minutes)} دقیقه مطالعه`;
}

export default function GuideForm({
  initial,
  editingId,
  onSaved,
  onCancel,
  destinationOptions = [],
  tourOptions = [],
}: {
  initial?: GuideRow | null;
  editingId?: string | null;
  onSaved?: () => void;
  onCancel?: () => void;
  /** G3: فهرست واقعی مقصدها برای انتخاب «مقصد مرتبط». */
  destinationOptions?: GuidePickerOption[];
  /** G3: فهرست واقعی تورها برای انتخاب «تور مرتبط». */
  tourOptions?: GuidePickerOption[];
}) {
  const [slug, setSlug] = useState(initial?.slug ?? '');
  const [slugTouched, setSlugTouched] = useState(Boolean(initial?.slug));
  const [titleFa, setTitleFa] = useState(initial?.titleFa ?? '');
  const [category, setCategory] = useState(initial?.category ?? 'general');
  const [categoryLabel, setCategoryLabel] = useState(initial?.categoryLabel ?? '');
  const [readTime, setReadTime] = useState(initial?.readTime ?? '');
  const [readTimeTouched, setReadTimeTouched] = useState(Boolean(initial?.readTime));
  const [author, setAuthor] = useState(initial?.author ?? '');
  const [reviewer, setReviewer] = useState(initial?.reviewer ?? '');
  const [summary, setSummary] = useState(initial?.summary ?? '');
  const [heroImage, setHeroImage] = useState(initial?.heroImage ?? '');
  const [directAnswer, setDirectAnswer] = useState(initial?.directAnswer ?? '');
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
      categoryLabel: categoryLabel.trim(),
      readTime: readTime.trim(),
      author: author.trim(),
      reviewer: reviewer.trim(),
      summary: summary.trim(),
      heroImage: heroImage.trim(),
      directAnswer: directAnswer.trim(),
      sections: cleanBlocks('section', sections),
      faqs: cleanBlocks('faq', faqs),
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
        setError(err instanceof Error ? err.message : 'خطای نامشخص در ذخیره‌سازی.');
      }
    });
  };

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-5 p-5">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h2 className="text-lg font-semibold">{editingId ? 'ویرایش راهنما' : 'راهنمای جدید'}</h2>
            <p className="mt-1 text-sm text-muted-foreground">اطلاعات و محتوای راهنمای سفر را وارد کنید.</p>
          </div>
          {onCancel && <Button type="button" variant="ghost" size="sm" onClick={onCancel}>انصراف</Button>}
        </div>

      {error && (
        <Alert variant="destructive">{error}</Alert>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

        <Field label="عنوان فارسی" htmlFor="guide-title">
          <Input
            id="guide-title"
            value={titleFa}
            onChange={(e) => onTitleFa(e.target.value)}
            placeholder="مثال: راهنمای کامل متروی دبی"
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

        <Field label="برچسب دسته‌بندی" htmlFor="guide-cat-lbl">
          <Input
            id="guide-cat-lbl"
            value={categoryLabel}
            onChange={(e) => setCategoryLabel(e.target.value)}
            placeholder="مثال: راهنمای سفر"
          />
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

        <Field label="آدرس تصویر اصلی" htmlFor="guide-hero" hint="فقط لینک Unsplash">
          <Input
            id="guide-hero"
            value={heroImage}
            onChange={(e) => setHeroImage(e.target.value)}
            className="text-start"
            dir="ltr"
            placeholder="https://..."
          />
        </Field>

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

      <Field label="خلاصه راهنما" htmlFor="guide-summary">
        <Textarea
          id="guide-summary"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
            className="min-h-20"
          placeholder="چکیده کوتاه راهنما…"
        />
      </Field>

      <Field label="پاسخ مستقیم و سریع" htmlFor="guide-direct">
        <Textarea
          id="guide-direct"
          value={directAnswer}
          onChange={(e) => setDirectAnswer(e.target.value)}
            className="min-h-20"
          placeholder="پاسخ سریع به پرسش اصلی کاربر…"
        />
      </Field>

      <BlockEditor
        kind="section"
        title="بخش‌های راهنما"
        value={sections}
        onChange={(next) => {
          setSections(next);
          setSectionsError(undefined);
        }}
        error={sectionsError}
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
      />

      <div className="flex items-center gap-3 pt-2">
          <Button type="submit" disabled={pending}>{pending ? 'در حال ذخیره…' : 'ذخیره'}</Button>
        {onCancel && (
          <Button type="button" onClick={onCancel} variant="outline">انصراف</Button>
        )}
        </div>
      </form>
    </Card>
  );
}
