'use client';

import RouteErrorCard from '@/src/components/RouteErrorCard';

/** QA1-05: مرز خطای اختصاصی هاب نمایشگاه‌ها. */
export default function ExhibitionsHubError({
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
      logTag="exhibitions hub"
      title="فهرست نمایشگاه‌ها بارگذاری نشد"
      description="می‌توانید دوباره تلاش کنید، یا مستقیم زنگ بزنید تا کارشناس ما رویداد مناسب کسب‌وکارتان را بگوید."
      linkHref="/"
      linkLabel="صفحهٔ اصلی"
    />
  );
}
