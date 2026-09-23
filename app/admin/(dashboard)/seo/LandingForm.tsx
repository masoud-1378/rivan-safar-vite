'use client';

import React, { useState, useTransition } from 'react';
import {
  createLanding,
  updateLanding,
  type LandingInput,
} from './actions';

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

function Field({ label, htmlFor, children, required }: { label: string; children: React.ReactNode; htmlFor?: string; required?: boolean }) {
  return (
    <div>
      <label htmlFor={htmlFor || label} className="block text-xs font-bold text-foreground mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls = 'w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground';

export default function LandingForm({ onSaved }: { onSaved?: () => void }) {
  const [queryOwner, setQueryOwner] = useState('');
  const [urlPath, setUrlPath] = useState('');
  const [pageType, setPageType] = useState('country');
  const [titleFa, setTitleFa] = useState('');
  const [metaDescriptionFa, setMetaDescriptionFa] = useState('');
  const [h1Fa, setH1Fa] = useState('');
  const [workflow, setWorkflow] = useState<'draft' | 'review' | 'published' | 'paused' | 'archived'>('draft');
  const [indexStatus, setIndexStatus] = useState<'index' | 'noindex'>('noindex');
  const [nextReviewAt, setNextReviewAt] = useState('');
  const [pending, startTransition] = useTransition();

  const submit = async () => {
    const input: LandingInput = {
      queryOwner,
      urlPath: urlPath.startsWith('/') ? urlPath : '/' + urlPath,
      pageType,
      titleFa,
      metaDescriptionFa,
      h1Fa,
      workflow,
      indexStatus,
      nextReviewAt,
    };
    startTransition(async () => {
      try {
        await createLanding(input);
        if (onSaved) onSaved();
        window.location.reload();
      } catch (e) {
        alert(e instanceof Error ? e.message : 'خطا');
      }
    });
  };

  return (
    <div className="bg-card border border-border rounded-xl p-5 space-y-4 admin-lift">
      <h2 className="font-semibold text-foreground">لندینگ جدید</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Query Owner" htmlFor="qo">
          <input id="qo" value={queryOwner} onChange={e => setQueryOwner(e.target.value)} className={inputCls} placeholder="home:ریوان سفر" />
        </Field>
        <Field label="مسیر URL" htmlFor="up" required>
          <input id="up" value={urlPath} dir="ltr" onChange={e => setUrlPath(e.target.value)} className={`${inputCls} text-left`} placeholder="/destination/turkey/istanbul" />
        </Field>
        <Field label="نوع صفحه" htmlFor="pt">
          <select id="pt" value={pageType} onChange={e => setPageType(e.target.value)} className={inputCls}>
            {PAGE_TYPES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </Field>
        <Field label="Title (SEO)" htmlFor="tf" required>
          <input id="tf" value={titleFa} onChange={e => setTitleFa(e.target.value)} className={inputCls} />
        </Field>
        <Field label="Meta Description" htmlFor="md">
          <textarea id="md" value={metaDescriptionFa} onChange={e => setMetaDescriptionFa(e.target.value)} className={`${inputCls} min-h-[80px]`} />
        </Field>
        <Field label="H1" htmlFor="h1" required>
          <input id="h1" value={h1Fa} onChange={e => setH1Fa(e.target.value)} className={inputCls} />
        </Field>
        <Field label="Workflow">
          <select value={workflow} onChange={e => setWorkflow(e.target.value as any)} className={inputCls}>
            <option value="draft">پیش‌نویس</option>
            <option value="review">بازبینی</option>
            <option value="published">منتشرشده</option>
            <option value="paused">متوقف</option>
            <option value="archived">بایگانی</option>
          </select>
        </Field>
        <Field label="Index Status">
          <select value={indexStatus} onChange={e => setIndexStatus(e.target.value as any)} className={inputCls}>
            <option value="index">index</option>
            <option value="noindex">noindex</option>
          </select>
        </Field>
        <Field label="بازبینی بعدی" htmlFor="nr">
          <input id="nr" type="date" value={nextReviewAt} onChange={e => setNextReviewAt(e.target.value)} className={inputCls} />
        </Field>
      </div>
      <div className="flex gap-2">
        <button onClick={submit} className="btn btn-medium btn-primary text-btn font-bold" disabled={pending}>
          {pending ? 'در حال ثبت...' : 'ایجاد لندینگ'}
        </button>
      </div>
    </div>
  );
}
