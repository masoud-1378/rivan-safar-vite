import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import RouteView from '../../RouteView';
import JsonLd from '../../JsonLd';
import {
  metadataFor,
  resolveSeo,
  breadcrumbJsonLd,
  tourJsonLd,
} from '../../seo-helpers';
import { getLiveContent, getTours } from '@/src/lib/db-content';

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
  const content = await getLiveContent();
  if (!content.tours.some((t) => t.id === slug)) notFound();
  const seo = resolveSeo(`/tour/${slug}`);
  return (
    <>
      <JsonLd data={breadcrumbJsonLd(seo.breadcrumbs)} />
      <JsonLd data={tourJsonLd(slug)} />
      <RouteView type="tour_detail" params={{ tourSlug: slug }} data={content} />
    </>
  );
}
