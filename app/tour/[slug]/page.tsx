import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import RouteView from '../../RouteView';
import JsonLd from '../../JsonLd';
import { metadataFor, resolveSeo, breadcrumbJsonLd } from '../../seo-helpers';
import { SAMPLE_TOURS } from '@/src/data/toursData';

export function generateStaticParams() {
  return SAMPLE_TOURS.map((tour) => ({ slug: tour.id }));
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
  if (!SAMPLE_TOURS.some((t) => t.id === slug)) notFound();
  const seo = resolveSeo(`/tour/${slug}`);
  return (
    <>
      <JsonLd data={breadcrumbJsonLd(seo.breadcrumbs)} />
      <RouteView type="tour_detail" params={{ tourSlug: slug }} />
    </>
  );
}
