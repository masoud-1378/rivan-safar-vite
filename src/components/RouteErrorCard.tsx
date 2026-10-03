'use client';

import { useEffect } from 'react';

/**
 * QA1-05: مرز خطای مشترک مسیرهای سایت عمومی (الگوی error.tsx تور،
 * prop رسمی نکست ۱۶: `retry`). فارسی، با دکمهٔ «تلاش دوباره» و تماس تلفنی
 * مستقیم — هیچ بن‌بستی برای کاربر نمی‌گذارد.
 */
export default function RouteErrorCard({
  error,
  retry,
  logTag,
  title,
  description,
  linkHref,
  linkLabel,
}: {
  error: Error & { digest?: string };
  retry: () => void;
  logTag: string;
  title: string;
  description: string;
  linkHref: string;
  linkLabel: string;
}) {
  useEffect(() => {
    // فقط برای عیب‌یابی؛ هیچ دادهٔ شخصی لاگ نمی‌شود.
    console.error(`[rivan-safar] ${logTag} error:`, error.message, error.digest ?? '');
  }, [error, logTag]);

  return (
    <div className="bg-page-background text-text-primary">
      <div className="container-main px-4 sm:px-6 lg:px-8 py-16 sm:py-24 max-w-2xl mx-auto text-center">
        <div className="bg-surface-primary border border-border-default rounded-card p-8 sm:p-12">
          <div
            aria-hidden="true"
            className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-brand-orange-soft text-2xl font-extrabold text-brand-orange"
          >
            !
          </div>
          <h1 className="text-h2 text-text-heading font-extrabold mb-3">
            {title}
          </h1>
          <p className="text-body text-text-secondary leading-relaxed mb-8">
            {description}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => retry()}
              className="btn btn-medium btn-primary px-6 font-bold"
            >
              تلاش دوباره
            </button>
            <a
              href="tel:02633350139"
              className="btn btn-medium btn-outline px-6 font-bold"
            >
              تماس: ۰۲۶-۳۳۳۵۰۱۳۹
            </a>
            <a
              href={linkHref}
              className="btn btn-medium btn-outline px-6 font-bold"
            >
              {linkLabel}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
