import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import RouteView from '../../../RouteView';
import JsonLd from '../../../JsonLd';
import {
  metadataFor,
  resolveSeo,
  breadcrumbJsonLd,
} from '../../../seo-helpers';
import { getExhibitions } from '@/src/lib/db-content';
import { getContactInfo } from '@/src/lib/site-contact';

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  const exhibitionsData = await getExhibitions();
  return Object.values(exhibitionsData).map((s) => ({
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
  const [exhibitionsData, contact] = await Promise.all([getExhibitions(), getContactInfo()]);
  if (!exhibitionsData[series]) notFound();
  const seo = resolveSeo(`/exhibition/${series}/${edition}`);
  return (
    <>
      <JsonLd data={breadcrumbJsonLd(seo.breadcrumbs)} />
      <RouteView
        type="exhibition_detail"
        params={{ eventSeriesSlug: series, editionSlug: edition }}
        data={{ exhibitions: exhibitionsData }}
        contact={contact}
      />
    </>
  );
}
