'use client';

import RouteErrorCard from '@/src/components/RouteErrorCard';

/** QA1-05: مرز خطای اختصاصی جزئیات راهنما. */
export default function GuideDetailError({
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
      logTag="guide detail"
      title="صفحهٔ این راهنما بارگذاری نشد"
      description="می‌توانید دوباره تلاش کنید، یا اگر سؤالتان فوری است مستقیم زنگ بزنید؛ کارشناس ما راهنمایی‌تان می‌کند."
      linkHref="/guides"
      linkLabel="همهٔ راهنماها"
    />
  );
}
