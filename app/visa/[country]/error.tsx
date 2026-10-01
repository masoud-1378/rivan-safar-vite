'use client';

import RouteErrorCard from '@/src/components/RouteErrorCard';

/** QA1-05: مرز خطای اختصاصی صفحهٔ ویزا. */
export default function VisaDetailError({
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
      logTag="visa detail"
      title="صفحهٔ ویزا بارگذاری نشد"
      description="می‌توانید دوباره تلاش کنید، یا اگر برای ویزا عجله دارید مستقیم زنگ بزنید."
      linkHref="/"
      linkLabel="صفحهٔ اصلی"
    />
  );
}
