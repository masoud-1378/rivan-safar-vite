'use client';

import React, { useState, useTransition } from 'react';
import { saveGuide, type GuideInput, type GuideRow, type GuideStatus } from './actions';

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

export const inputCls =
  'w-full bg-surface-secondary border border-border-default rounded-control px-3 py-2 text-body-sm';

function Field({
  label,
  htmlFor,
  children,
  required,
  hint,
}: {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
  required?: boolean;
  hint?: string;
}) {
  return (
    <div>
      <label htmlFor={htmlFor || label} className="block text-caption font-bold text-text-heading mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {hint && <p className="text-caption text-text-muted mt-1">{hint}</p>}
    </div>
  );
}

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
  const [sectionsJson, setSectionsJson] = useState(
    initial?.sections ? JSON.stringify(initial.sections, null, 2) : '[]',
  );
  const [faqsJson, setFaqsJson] = useState(
    initial?.faqs ? JSON.stringify(initial.faqs, null, 2) : '[]',
  );
  const [status, setStatus] = useState<GuideStatus>(initial?.status ?? 'draft');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    let parsedSections: unknown[];
    try {
      const parsed = JSON.parse(sectionsJson.trim() || '[]');
      if (!Array.isArray(parsed)) {
        setError('خطا در بخش‌ها: ساختار وارد شده باید آرایه JSON باشد.');
        return;
      }
      parsedSections = parsed;
    } catch {
      setError('خطا در فرمت JSON بخش‌ها. لطفاً فرمت ورودی را بررسی کنید.');
      return;
    }

    let parsedFaqs: unknown[];
    try {
      const parsed = JSON.parse(faqsJson.trim() || '[]');
      if (!Array.isArray(parsed)) {
        setError('خطا در پرسش‌ها: ساختار وارد شده باید آرایه JSON باشد.');
        return;
      }
      parsedFaqs = parsed;
    } catch {
      setError('خطا در فرمت JSON پرسش‌ها. لطفاً فرمت ورودی را بررسی کنید.');
      return;
    }

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
      sections: parsedSections,
      faqs: parsedFaqs,
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
    <form
      onSubmit={handleSubmit}
      className="bg-surface-primary border border-border-default rounded-card p-5 space-y-4"
    >
      <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
        <h2 className="text-h4 font-bold text-text-heading">
          {editingId ? 'ویرایش مقاله' : 'مقاله جدید'}
        </h2>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-caption font-medium text-text-muted hover:text-text-primary"
          >
            انصراف
          </button>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-control text-body-sm text-red-600">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="نامک انگلیسی (Slug)" htmlFor="guide-slug" required>
          <input
            id="guide-slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className={`${inputCls} text-left`}
            dir="ltr"
            placeholder="e.g. dubai-metro-guide"
            required
          />
        </Field>

        <Field label="عنوان فارسی" htmlFor="guide-title" required>
          <input
            id="guide-title"
            value={titleFa}
            onChange={(e) => setTitleFa(e.target.value)}
            className={inputCls}
            placeholder="مثال: راهنمای کامل متروی دبی"
            required
          />
        </Field>

        <Field label="دسته‌بندی (category)" htmlFor="guide-cat" required>
          <select
            id="guide-cat"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={inputCls}
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="برچسب دسته‌بندی (categoryLabel)" htmlFor="guide-cat-lbl">
          <input
            id="guide-cat-lbl"
            value={categoryLabel}
            onChange={(e) => setCategoryLabel(e.target.value)}
            className={inputCls}
            placeholder="مثال: راهنمای سفر"
          />
        </Field>

        <Field label="مدت زمان مطالعه (readTime)" htmlFor="guide-read-time">
          <input
            id="guide-read-time"
            value={readTime}
            onChange={(e) => setReadTime(e.target.value)}
            className={inputCls}
            placeholder="مثال: ۶ دقیقه مطالعه"
          />
        </Field>

        <Field label="نویسنده (author)" htmlFor="guide-author">
          <input
            id="guide-author"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className={inputCls}
            placeholder="نام نویسنده"
          />
        </Field>

        <Field label="بازبین (reviewer)" htmlFor="guide-reviewer">
          <input
            id="guide-reviewer"
            value={reviewer}
            onChange={(e) => setReviewer(e.target.value)}
            className={inputCls}
            placeholder="نام بازبین یا کارشناس"
          />
        </Field>

        <Field label="آدرس تصویر اصلی (heroImage)" htmlFor="guide-hero">
          <input
            id="guide-hero"
            value={heroImage}
            onChange={(e) => setHeroImage(e.target.value)}
            className={`${inputCls} text-left`}
            dir="ltr"
            placeholder="https://..."
          />
        </Field>

        <Field label="نامک مقصد مرتبط (relatedDestinationSlug)" htmlFor="guide-rel-dest">
          <input
            id="guide-rel-dest"
            value={relatedDestinationSlug}
            onChange={(e) => setRelatedDestinationSlug(e.target.value)}
            className={`${inputCls} text-left`}
            dir="ltr"
            placeholder="مثال: dubai یا turkey"
          />
        </Field>

        <Field label="شناسه تور مرتبط (relatedTourId)" htmlFor="guide-rel-tour">
          <input
            id="guide-rel-tour"
            value={relatedTourId}
            onChange={(e) => setRelatedTourId(e.target.value)}
            className={`${inputCls} text-left`}
            dir="ltr"
            placeholder="شناسه یا نامک تور"
          />
        </Field>

        <Field label="وضعیت انتشار" htmlFor="guide-status" required>
          <select
            id="guide-status"
            value={status}
            onChange={(e) => setStatus(e.target.value as GuideStatus)}
            className={inputCls}
          >
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="خلاصه مقاله (summary)" htmlFor="guide-summary">
        <textarea
          id="guide-summary"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          className={`${inputCls} min-h-[70px]`}
          placeholder="چکیده کوتاه مقاله..."
        />
      </Field>

      <Field label="پاسخ مستقیم و سریع (directAnswer)" htmlFor="guide-direct">
        <textarea
          id="guide-direct"
          value={directAnswer}
          onChange={(e) => setDirectAnswer(e.target.value)}
          className={`${inputCls} min-h-[70px]`}
          placeholder="پاسخ سریع به پرسش اصلی کاربر..."
        />
      </Field>

      <Field
        label="بخش‌های مقاله (sections)"
        htmlFor="guide-sections"
        hint="آرایه JSON بخش‌ها - هر بخش شامل title, content, order و ..."
      >
        <textarea
          id="guide-sections"
          value={sectionsJson}
          onChange={(e) => setSectionsJson(e.target.value)}
          className={`${inputCls} font-mono text-left text-caption min-h-[160px]`}
          dir="ltr"
          placeholder="[]"
        />
      </Field>

      <Field
        label="پرسش‌های متداول (faqs)"
        htmlFor="guide-faqs"
        hint="آرایه JSON پرسش‌ها - هر آیتم شامل question, answer"
      >
        <textarea
          id="guide-faqs"
          value={faqsJson}
          onChange={(e) => setFaqsJson(e.target.value)}
          className={`${inputCls} font-mono text-left text-caption min-h-[140px]`}
          dir="ltr"
          placeholder="[]"
        />
      </Field>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          className="btn btn-medium btn-primary text-btn font-bold"
          disabled={pending}
        >
          {pending ? 'در حال ذخیره...' : 'ذخیره'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-medium bg-surface-secondary text-text-primary border border-border-default hover:bg-surface-tertiary"
          >
            انصراف
          </button>
        )}
      </div>
    </form>
  );
}
