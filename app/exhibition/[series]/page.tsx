import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import RouteView from '../../RouteView';
import JsonLd from '../../JsonLd';
import { metadataFor, resolveSeo, breadcrumbJsonLd } from '../../seo-helpers';
import { EXHIBITION_SERIES } from '@/src/data/exhibitionsData';

export function generateStaticParams() {
  return Object.keys(EXHIBITION_SERIES).map((series) => ({ series }));
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
  if (!EXHIBITION_SERIES[series]) notFound();
  const seo = resolveSeo(`/exhibition/${series}`);
  return (
    <>
      <JsonLd data={breadcrumbJsonLd(seo.breadcrumbs)} />
      <RouteView
        type="exhibition_detail"
        params={{ eventSeriesSlug: series, editionSlug: '' }}
      />
    </>
  );
}
