'use client';

import RouteErrorCard from '@/src/components/RouteErrorCard';

/** QA1-05: مرز خطای اختصاصی هاب مقصدها. */
export default function DestinationsHubError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <RouteErrorCard
      error={error}
      retry={retry}
      logTag="destinations hub"
      title="فهرست مقصدها بارگذاری نشد"
      description="می‌توانید دوباره تلاش کنید، یا مستقیم زنگ بزنید تا کارشناس ما مقصد مناسب‌تان را پیشنهاد بدهد."
      linkHref="/"
      linkLabel="صفحهٔ اصلی"
    />
  );
}
