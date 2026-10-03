import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import JsonLd from '../JsonLd';
import LandingPageView from '@/src/components/LandingPageView';
import {
  metadataFor,
  resolveSeoLive,
  breadcrumbJsonLd,
} from '../seo-helpers';
import {
  getSeoLandingByPath,
  getLandingBlocks,
  getLandingLinks,
  getLandingProductSlugs,
  getTour,
} from '@/src/lib/db-content';
import { getContactInfo } from '@/src/lib/site-contact';

/**
 * روت سراسری لندینگ‌های سئو: هر مسیری که روت مشخص‌تری در app/ نداشته باشد
 * این‌جا می‌آید؛ اگر لندینگ «منتشرشده»ای در جدول seo_landings دقیقاً روی
 * همین مسیر بود، رندر می‌شود، وگرنه ۴۰۴ واقعی.
 *
 * قانون تقدم: روت‌های موجود (مثل /tours یا /destination/[country]/[city])
 * همیشه بر این catch-all مقدم‌اند و نمی‌شکنند؛ لندینگی که urlPathش با یک
 * روت موجود تصادم کند، محتوایش را آن‌جا نشان نمی‌دهد ولی متای پنل
 * (titleFa/metaDescriptionFa/canonical) از طریق resolveSeoLive روی همان
 * صفحهٔ موجود می‌نشیند.
 */
export const dynamic = 'force-dynamic';

interface CatchAllParams {
  params: Promise<{ landingPath: string[] }>;
}

function toPath(segments: string[]): string {
  return `/${segments.join('/')}`;
}

export async function generateMetadata({
  params,
}: CatchAllParams): Promise<Metadata> {
  const { landingPath } = await params;
  // متا از DB زنده: titleFa، metaDescriptionFa، canonical و robots لندینگ.
  return metadataFor(toPath(landingPath));
}

export default async function LandingCatchAllPage({ params }: CatchAllParams) {
  const { landingPath } = await params;
  const path = toPath(landingPath);

  const [landing, contact] = await Promise.all([
    getSeoLandingByPath(path),
    getContactInfo(),
  ]);
  // گیت انتشار این‌جاست: فقط لندینگ منتشرشده رندر می‌شود؛
  // پیش‌نویس/بازبینی/متوقف/بایگانی ۴۰۴ می‌دهد و لو نمی‌رود.
  if (!landing) notFound();

  const [blocks, links, productSlugs, seo] = await Promise.all([
    getLandingBlocks(landing.id),
    getLandingLinks(landing.id),
    getLandingProductSlugs(landing.id),
    resolveSeoLive(path),
  ]);
  // تورهای متصل: فقط منتشرشده‌ها (getTour خودش گیت انتشار را دارد).
  const tours = (
    await Promise.all(productSlugs.map((slug) => getTour(slug)))
  ).filter((t) => t !== null);

  return (
    <>
      <JsonLd data={breadcrumbJsonLd(seo.breadcrumbs)} />
      <LandingPageView
        landing={landing}
        blocks={blocks}
        links={links}
        tours={tours}
        contact={contact}
      />
    </>
  );
}
