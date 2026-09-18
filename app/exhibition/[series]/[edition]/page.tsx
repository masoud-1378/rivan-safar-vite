import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import RouteView from '../../../RouteView';
import JsonLd from '../../../JsonLd';
import {
  metadataFor,
  resolveSeo,
  breadcrumbJsonLd,
} from '../../../seo-helpers';
import { EXHIBITION_SERIES } from '@/src/data/exhibitionsData';

export function generateStaticParams() {
  return Object.values(EXHIBITION_SERIES).map((s) => ({
    series: s.slug,
    edition: s.upcomingEdition.editionSlug,
  }));
}

export function generateMetadata({
  params,
}: {
  params: Promise<{ series: string; edition: string }>;
}): Promise<Metadata> {
  return params.then(
    ({ series, edition }) => metadataFor(`/exhibition/${series}/${edition}`),
  );
}

export default async function ExhibitionEditionPage({
  params,
}: {
  params: Promise<{ series: string; edition: string }>;
}) {
  const { series, edition } = await params;
  if (!EXHIBITION_SERIES[series]) notFound();
  const seo = resolveSeo(`/exhibition/${series}/${edition}`);
  return (
    <>
      <JsonLd data={breadcrumbJsonLd(seo.breadcrumbs)} />
      <RouteView
        type="exhibition_detail"
        params={{ eventSeriesSlug: series, editionSlug: edition }}
      />
    </>
  );
}
