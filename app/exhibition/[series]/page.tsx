import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import RouteView from '../../RouteView';
import JsonLd from '../../JsonLd';
import { metadataFor, resolveSeo, breadcrumbJsonLd } from '../../seo-helpers';
import { getExhibitions } from '@/src/lib/db-content';

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  const exhibitionsData = await getExhibitions();
  return Object.keys(exhibitionsData).map((series) => ({ series }));
}

export function generateMetadata({
  params,
}: {
  params: Promise<{ series: string }>;
}): Promise<Metadata> {
  return params.then(({ series }) => metadataFor(`/exhibition/${series}`));
}

export default async function ExhibitionSeriesPage({
  params,
}: {
  params: Promise<{ series: string }>;
}) {
  const { series } = await params;
  const exhibitionsData = await getExhibitions();
  if (!exhibitionsData[series]) notFound();
  const seo = resolveSeo(`/exhibition/${series}`);
  return (
    <>
      <JsonLd data={breadcrumbJsonLd(seo.breadcrumbs)} />
      <RouteView
        type="exhibition_detail"
        params={{ eventSeriesSlug: series, editionSlug: '' }}
        data={{ exhibitions: exhibitionsData }}
      />
    </>
  );
}
