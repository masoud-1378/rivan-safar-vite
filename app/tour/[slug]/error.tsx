'use client';

import { useEffect } from 'react';

/**
 * میز P-B فاز ۲ (PB-07): مرز خطای اختصاصی صفحهٔ جزئیات تور (P0 — حیاتی‌ترین
 * مسیر پول). به‌جای بن‌بست، کاربر را به فهرست تورها یا تماس تلفنی هدایت
 * می‌کند. prop رسمی نکست ۱۶: `retry`.
 */
export default function TourDetailError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    // فقط برای عیب‌یابی؛ هیچ دادهٔ شخصی لاگ نمی‌شود.
    console.error('[rivan-safar] tour detail error:', error.message, error.digest ?? '');
  }, [error]);

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
            صفحهٔ این تور بارگذاری نشد
          </h1>
          <p className="text-body text-text-secondary leading-relaxed mb-8">
            اگر عجله دارید، از فهرست تورها یکی دیگر را ببینید یا مستقیم زنگ
            بزنید؛ کارشناس ما همین حالا تور مناسب شما را پیدا می‌کند.
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
              href="/tours"
              className="btn btn-medium btn-outline px-6 font-bold"
            >
              همهٔ تورها
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
