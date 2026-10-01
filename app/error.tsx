'use client';

import { useEffect } from 'react';

/**
 * میز P-B فاز ۲ (PB-02): مرز خطای سراسری سایت عمومی.
 * تا پیش از این هیچ error.tsx در هیچ مسیر عمومی نبود؛ کرش یک کامپوننت
 * کل صفحه را به ۵۰۰ پیش‌فرض نکست می‌برد. این باندری داخل لایهٔ سایت
 * (زیر روت لئوت) می‌نشیند و خطا را به یک صفحهٔ فارسیِ راه‌گشا با دکمهٔ
 * «تلاش دوباره» تبدیل می‌کند. مسیرهای /admin دست‌نخورده‌اند.
 */
export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    // فقط برای عیب‌یابی؛ هیچ دادهٔ شخصی لاگ نمی‌شود.
    console.error('[rivan-safar] route error:', error.message, error.digest ?? '');
  }, [error]);

  return (
    <div className="bg-page-background text-text-primary dir-rtl">
      <div className="container-main px-4 sm:px-6 lg:px-8 py-16 sm:py-24 max-w-2xl mx-auto text-center">
        <div className="bg-surface-primary border border-border-default rounded-card p-8 sm:p-12">
          <div
            aria-hidden="true"
            className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-brand-orange-soft text-2xl font-extrabold text-brand-orange"
          >
            !
          </div>
          <h1 className="text-h2 text-text-heading font-extrabold mb-3">
            مشکلی در نمایش این صفحه پیش آمد
          </h1>
          <p className="text-body text-text-secondary leading-relaxed mb-8">
            نگران نباشید؛ اطلاعات شما از دست نرفته است. معمولاً با یک بار تلاش
            دوباره صفحه درست نمایش داده می‌شود. اگر خطا تکرار شد، با پشتیبانی
            ریوان سفر در تماس باشید.
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
              href="/"
              className="btn btn-medium btn-outline px-6 font-bold"
            >
              بازگشت به صفحه اصلی
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
