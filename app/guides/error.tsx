'use client';

import RouteErrorCard from '@/src/components/RouteErrorCard';

/** QA1-05: مرز خطای اختصاصی هاب راهنماها. */
export default function GuidesHubError({
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
      logTag="guides hub"
      title="فهرست راهنماها بارگذاری نشد"
      description="می‌توانید دوباره تلاش کنید، یا مستقیم زنگ بزنید تا کارشناس ما راهنمایی‌تان کند."
      linkHref="/"
      linkLabel="صفحهٔ اصلی"
    />
  );
}
