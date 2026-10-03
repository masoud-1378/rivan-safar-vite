'use client';

import RouteErrorCard from '@/src/components/RouteErrorCard';

/** QA1-05: مرز خطای اختصاصی نمایشگاه‌ها (سری و دوره). */
export default function ExhibitionError({
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
      logTag="exhibition"
      title="صفحهٔ این نمایشگاه بارگذاری نشد"
      description="می‌توانید دوباره تلاش کنید، یا مستقیم زنگ بزنید تا کارشناس ما جزئیات نمایشگاه و سفر تجاری‌تان را بگوید."
      linkHref="/exhibitions"
      linkLabel="همهٔ نمایشگاه‌ها"
    />
  );
}
