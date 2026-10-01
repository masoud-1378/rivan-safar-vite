'use client';

import React, { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Field, Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { saveGuide, type GuideInput, type GuideRow, type GuideStatus } from './actions';
import BlockEditor, { cleanBlocks, validateBlocks } from '@/components/ui/block-editor';

const CATEGORIES = [
  { value: 'destination-choice', label: 'انتخاب مقصد (destination-choice)' },
  { value: 'visa-docs', label: 'ویزا و مدارک (visa-docs)' },
  { value: 'budget-cost', label: 'بودجه و هزینه‌ها (budget-cost)' },
  { value: 'hotel-flight', label: 'هتل و پرواز (hotel-flight)' },
  { value: 'exhibition-trade', label: 'نمایشگاهی و تجاری (exhibition-trade)' },
  { value: 'general', label: 'عمومی (general)' },
];

const STATUSES: Array<{ value: GuideStatus; label: string }> = [
  { value: 'draft', label: 'پیش‌نویس' },
  { value: 'review', label: 'در حال بازبینی' },
  { value: 'published', label: 'منتشرشده' },
  { value: 'paused', label: 'متوقف' },
  { value: 'archived', label: 'بایگانی' },
];

export default function GuideForm({
  initial,
  editingId,
  onSaved,
  onCancel,
}: {
  initial?: GuideRow | null;
  editingId?: string | null;
  onSaved?: () => void;
  onCancel?: () => void;
}) {
  const [slug, setSlug] = useState(initial?.slug ?? '');
  const [titleFa, setTitleFa] = useState(initial?.titleFa ?? '');
  const [category, setCategory] = useState(initial?.category ?? 'general');
  const [categoryLabel, setCategoryLabel] = useState(initial?.categoryLabel ?? '');
  const [readTime, setReadTime] = useState(initial?.readTime ?? '');
  const [author, setAuthor] = useState(initial?.author ?? '');
  const [reviewer, setReviewer] = useState(initial?.reviewer ?? '');
  const [summary, setSummary] = useState(initial?.summary ?? '');
  const [heroImage, setHeroImage] = useState(initial?.heroImage ?? '');
  const [directAnswer, setDirectAnswer] = useState(initial?.directAnswer ?? '');
  const [relatedDestinationSlug, setRelatedDestinationSlug] = useState(
    initial?.relatedDestinationSlug ?? '',
  );
  const [relatedTourId, setRelatedTourId] = useState(initial?.relatedTourId ?? '');
  const [sections, setSections] = useState<unknown[]>(
    Array.isArray(initial?.sections) ? initial.sections : [],
  );
  const [faqs, setFaqs] = useState<unknown[]>(
    Array.isArray(initial?.faqs) ? initial.faqs : [],
  );
  const [sectionsError, setSectionsError] = useState<string | undefined>();
  const [faqsError, setFaqsError] = useState<string | undefined>();
  const [status, setStatus] = useState<GuideStatus>(initial?.status ?? 'draft');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

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
      relatedTourId: relatedTourId.trim(),
      status,
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
            <h2 className="text-lg font-semibold">{editingId ? 'ویرایش مقاله' : 'مقاله جدید'}</h2>
            <p className="mt-1 text-sm text-muted-foreground">اطلاعات و محتوای راهنمای سفر را وارد کنید.</p>
          </div>
          {onCancel && <Button type="button" variant="ghost" size="sm" onClick={onCancel}>انصراف</Button>}
        </div>

      {error && (
          <div className="rounded-sm border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="نامک انگلیسی (Slug)" htmlFor="guide-slug">          <Input
            id="guide-slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="text-start"
            dir="ltr"
            placeholder="e.g. dubai-metro-guide"
            required
          />
        </Field>

        <Field label="عنوان فارسی" htmlFor="guide-title">          <Input
            id="guide-title"
            value={titleFa}
            onChange={(e) => setTitleFa(e.target.value)}

            placeholder="مثال: راهنمای کامل متروی دبی"
            required
          />
        </Field>

        <Field label="دسته‌بندی (category)" htmlFor="guide-cat">          <Select
            id="guide-cat"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            options={CATEGORIES.map((c) => ({ value: c.value, label: c.label }))}
          />
        </Field>

        <Field label="برچسب دسته‌بندی (categoryLabel)" htmlFor="guide-cat-lbl">
          <Input
            id="guide-cat-lbl"
            value={categoryLabel}
            onChange={(e) => setCategoryLabel(e.target.value)}

            placeholder="مثال: راهنمای سفر"
          />
        </Field>

        <Field label="مدت زمان مطالعه (readTime)" htmlFor="guide-read-time">
          <Input
            id="guide-read-time"
            value={readTime}
            onChange={(e) => setReadTime(e.target.value)}

            placeholder="مثال: ۶ دقیقه مطالعه"
          />
        </Field>

        <Field label="نویسنده (author)" htmlFor="guide-author">
          <Input
            id="guide-author"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}

            placeholder="نام نویسنده"
          />
        </Field>

        <Field label="بازبین (reviewer)" htmlFor="guide-reviewer">
          <Input
            id="guide-reviewer"
            value={reviewer}
            onChange={(e) => setReviewer(e.target.value)}

            placeholder="نام بازبین یا کارشناس"
          />
        </Field>

        <Field label="آدرس تصویر اصلی (heroImage)" htmlFor="guide-hero">
          <Input
            id="guide-hero"
            value={heroImage}
            onChange={(e) => setHeroImage(e.target.value)}
            className="text-start"
            dir="ltr"
            placeholder="https://..."
          />
        </Field>

        <Field label="نامک مقصد مرتبط (relatedDestinationSlug)" htmlFor="guide-rel-dest">
          <Input
            id="guide-rel-dest"
            value={relatedDestinationSlug}
            onChange={(e) => setRelatedDestinationSlug(e.target.value)}
            className="text-start"
            dir="ltr"
            placeholder="مثال: dubai یا turkey"
          />
        </Field>

        <Field label="شناسه تور مرتبط (relatedTourId)" htmlFor="guide-rel-tour">
          <Input
            id="guide-rel-tour"
            value={relatedTourId}
            onChange={(e) => setRelatedTourId(e.target.value)}
            className="text-start"
            dir="ltr"
            placeholder="شناسه یا نامک تور"
          />
        </Field>

        <Field label="وضعیت انتشار" htmlFor="guide-status">          <Select
            id="guide-status"
            value={status}
            onChange={(e) => setStatus(e.target.value as GuideStatus)}
            options={STATUSES.map((s) => ({ value: s.value, label: s.label }))}
          />
        </Field>
      </div>

      <Field label="خلاصه مقاله (summary)" htmlFor="guide-summary">
        <Textarea
          id="guide-summary"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
            className="min-h-20"
          placeholder="چکیده کوتاه مقاله..."
        />
      </Field>

      <Field label="پاسخ مستقیم و سریع (directAnswer)" htmlFor="guide-direct">
        <Textarea
          id="guide-direct"
          value={directAnswer}
          onChange={(e) => setDirectAnswer(e.target.value)}
            className="min-h-20"
          placeholder="پاسخ سریع به پرسش اصلی کاربر..."
        />
      </Field>

      <BlockEditor
        kind="section"
        title="بخش‌های مقاله"
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
          <Button type="submit" disabled={pending}>{pending ? 'در حال ذخیره...' : 'ذخیره'}</Button>
        {onCancel && (
          <Button type="button" onClick={onCancel} variant="outline">انصراف</Button>
        )}
        </div>
      </form>
    </Card>
  );
}
