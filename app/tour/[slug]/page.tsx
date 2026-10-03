import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import RouteView from '../../RouteView';
import JsonLd from '../../JsonLd';
import {
  metadataFor,
  resolveSeo,
  breadcrumbJsonLd,
  tourJsonLd,
  tourVideosJsonLd,
} from '../../seo-helpers';
import { getTourDetailContent, getTours } from '@/src/lib/db-content';
import { getContactInfo } from '@/src/lib/site-contact';

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  const tours = await getTours();
  return tours.map((tour) => ({ slug: tour.id }));
}

export function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  return params.then(({ slug }) => metadataFor(`/tour/${slug}`));
}

export default async function TourPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [content, contact] = await Promise.all([getTourDetailContent(), getContactInfo()]);
  if (!content.tours.some((t) => t.id === slug)) notFound();
  const seo = resolveSeo(`/tour/${slug}`);
  // ردیف ۲-۴: اسکیمای سئو از آبجکت تور زنده ساخته می‌شود، نه دیتای نمونه.
  const tour = content.tours.find((t) => t.id === slug);
  return (
    <>
      <JsonLd data={breadcrumbJsonLd(seo.breadcrumbs)} />
      <JsonLd data={tourJsonLd(tour)} />
      {/* موج ۶: ویدیوهای گالری — VideoObject، فقط وقتی ویدیو هست */}
      <JsonLd data={tourVideosJsonLd(tour)} />
      <RouteView type="tour_detail" params={{ tourSlug: slug }} data={content} contact={contact} />
    </>
  );
}
