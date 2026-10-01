/**
 * میز P-B فاز ۲ (PB-03): اسکلت‌های لودینگ سایت عمومی.
 *
 * قانون: اسکلت باید «شبح» محتوای نهایی باشد — همان چیدمان، همان نسبت‌ها،
 * همان تراکم — نه اسپینر وسط‌چین. همهٔ loading.tsxهای مسیرهای عمومی از
 * همین‌جا تغذیه می‌شوند تا زبان بصری یکدست بماند.
 */

function Block({ className = '' }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-lg bg-border-default/70 ${className}`}
    />
  );
}

/** نوار فیلتر/جست‌وجو بالای فهرست‌ها */
export function FilterBarSkeleton() {
  return (
    <div className="container-main px-4 sm:px-6 lg:px-8 pt-6" aria-hidden="true">
      <div className="flex flex-wrap gap-3">
        <Block className="h-11 w-40 rounded-full" />
        <Block className="h-11 w-32 rounded-full" />
        <Block className="h-11 w-36 rounded-full" />
        <Block className="h-11 w-28 rounded-full" />
      </div>
    </div>
  );
}

/** گرید کارت‌های تور/راهنما/مقصد */
export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="container-main px-4 sm:px-6 lg:px-8 py-8" aria-hidden="true">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-2xl border border-border-default bg-surface-primary"
          >
            <Block className="aspect-[16/10] rounded-none" />
            <div className="p-5 space-y-3">
              <Block className="h-5 w-3/4" />
              <Block className="h-4 w-1/2" />
              <div className="flex items-center justify-between pt-2">
                <Block className="h-4 w-24" />
                <Block className="h-9 w-28 rounded-xl" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** هیروی صفحهٔ اصلی/هاب‌ها: بنر + تیتر */
export function HeroSkeleton() {
  return (
    <div className="bg-surface-secondary border-b border-border-default" aria-hidden="true">
      <div className="container-main px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <Block className="h-8 w-2/3 max-w-xl mb-4" />
        <Block className="h-5 w-1/2 max-w-md mb-8" />
        <div className="flex flex-wrap gap-3">
          <Block className="h-12 w-48 rounded-full" />
          <Block className="h-12 w-36 rounded-full" />
        </div>
      </div>
    </div>
  );
}

/** صفحهٔ جزئیات (تور/راهنما/مقصد/نمایشگاه): تیتر + تصویر + متن + ستون فرم */
export function DetailSkeleton() {
  return (
    <div className="container-main px-4 sm:px-6 lg:px-8 py-8" aria-hidden="true">
      <Block className="h-4 w-64 mb-6" />
      <Block className="h-9 w-2/3 max-w-2xl mb-4" />
      <Block className="h-5 w-1/3 mb-8" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Block className="aspect-[16/9] rounded-2xl" />
          <div className="space-y-3">
            <Block className="h-4 w-full" />
            <Block className="h-4 w-full" />
            <Block className="h-4 w-5/6" />
            <Block className="h-4 w-full" />
            <Block className="h-4 w-2/3" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Block className="h-20 rounded-xl" />
            <Block className="h-20 rounded-xl" />
            <Block className="h-20 rounded-xl" />
            <Block className="h-20 rounded-xl" />
          </div>
        </div>
        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-border-default bg-surface-primary p-6 space-y-4 lg:sticky lg:top-24">
            <Block className="h-6 w-1/2" />
            <Block className="h-11 w-full rounded-xl" />
            <Block className="h-11 w-full rounded-xl" />
            <Block className="h-12 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

/** صفحهٔ مقاله/راهنمای متنی */
export function ArticleSkeleton() {
  return (
    <div className="container-main px-4 sm:px-6 lg:px-8 py-10 max-w-3xl mx-auto" aria-hidden="true">
      <Block className="h-9 w-4/5 mb-4" />
      <Block className="h-5 w-1/3 mb-8" />
      <Block className="aspect-[16/8] rounded-2xl mb-8" />
      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <Block key={i} className={`h-4 ${i % 3 === 2 ? 'w-5/6' : 'w-full'}`} />
        ))}
      </div>
    </div>
  );
}

/** صفحه‌های متنی اعتمادی (درباره/قوانین/حریم/مجوزها) */
export function TextPageSkeleton() {
  return (
    <div className="container-main px-4 sm:px-6 lg:px-8 py-10 max-w-3xl mx-auto" aria-hidden="true">
      <Block className="h-9 w-1/2 mb-3" />
      <Block className="h-5 w-2/3 mb-10" />
      {Array.from({ length: 3 }).map((_, s) => (
        <div key={s} className="mb-8 space-y-3">
          <Block className="h-6 w-1/3 mb-4" />
          <Block className="h-4 w-full" />
          <Block className="h-4 w-full" />
          <Block className="h-4 w-4/5" />
        </div>
      ))}
    </div>
  );
}

/** صفحهٔ تماس: تیتر + فرم */
export function ContactSkeleton() {
  return (
    <div className="container-main px-4 sm:px-6 lg:px-8 py-10 max-w-4xl mx-auto" aria-hidden="true">
      <div className="text-center mb-10">
        <Block className="h-9 w-1/2 mx-auto mb-4" />
        <Block className="h-5 w-2/3 mx-auto" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="rounded-2xl border border-border-default bg-surface-primary p-6 space-y-4">
          <Block className="h-6 w-1/3 mb-2" />
          <Block className="h-11 w-full rounded-xl" />
          <Block className="h-11 w-full rounded-xl" />
          <Block className="h-28 w-full rounded-xl" />
          <Block className="h-12 w-full rounded-xl" />
        </div>
        <div className="space-y-4">
          <Block className="h-24 rounded-2xl" />
          <Block className="h-24 rounded-2xl" />
          <Block className="h-24 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
