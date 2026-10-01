'use client';

import { useEffect } from 'react';

/**
 * میز P-B فاز ۲ (PB-07): مرز خطای اختصاصی مسیرهای تور (P0).
 * این باندری /tours و هر دو زیرمسیر /tours/foreign و /tours/domestic را پوشش
 * می‌دهد. پیام فارسیِ راه‌گشا: کاربر را به‌جای بن‌بست، به صفحهٔ اصلی یا تماس
 * تلفنی (مسیر پول) هدایت می‌کند. prop رسمی نکست ۱۶: `retry`.
 */
export default function ToursError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    // فقط برای عیب‌یابی؛ هیچ دادهٔ شخصی لاگ نمی‌شود.
    console.error('[rivan-safar] tours error:', error.message, error.digest ?? '');
  }, [error]);

  return (
    <div className="bg-page-background text-text-primary dir-rtl">
      <div className="container-main px-4 sm:px-6 lg:px-8 py-16 sm:py-24 max-w-2xl mx-auto text-center">
        <div className="bg-surface-primary border border-border-default rounded-2xl p-8 sm:p-12">
          <div
            aria-hidden="true"
            className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-brand-orange-soft text-2xl font-extrabold text-brand-orange"
          >
            !
          </div>
          <h1 className="text-h2 text-text-heading font-extrabold mb-3">
            فهرست تورها بارگذاری نشد
          </h1>
          <p className="text-body text-text-secondary leading-relaxed mb-8">
            تورها سر جایشان‌اند؛ فقط این بار صفحه درست باز نشد. یک بار دیگر تلاش
            کنید؛ اگر درست نشد، مستقیم با ما تماس بگیرید تا تور مناسب را
            پیشنهاد بدهیم.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => retry()}
              className="rounded-xl bg-brand-orange px-6 py-3 font-bold text-white transition-colors hover:bg-brand-orange-hover focus:outline-none"
            >
              تلاش دوباره
            </button>
            <a
              href="tel:02633350139"
              className="rounded-xl border border-brand-orange px-6 py-3 font-bold text-brand-orange transition-colors hover:bg-brand-orange-soft"
            >
              تماس: ۰۲۶-۳۳۳۵۰۱۳۹
            </a>
            <a
              href="/"
              className="rounded-xl border border-border-default px-6 py-3 font-bold text-text-heading transition-colors hover:bg-surface-secondary"
            >
              صفحه اصلی
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
