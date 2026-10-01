'use client';

import RouteErrorCard from '@/src/components/RouteErrorCard';

/** QA1-05: مرز خطای اختصاصی مقصدها (کشور و شهر). */
export default function DestinationError({
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
      logTag="destination"
      title="صفحهٔ این مقصد بارگذاری نشد"
      description="می‌توانید دوباره تلاش کنید، یا مستقیم زنگ بزنید تا کارشناس ما اطلاعات سفر این مقصد را بدهد."
      linkHref="/destinations"
      linkLabel="همهٔ مقصدها"
    />
  );
}
