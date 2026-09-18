import type { Metadata } from 'next';
import RouteView from '../RouteView';
import JsonLd from '../JsonLd';
import {
  metadataFor,
  resolveSeo,
  breadcrumbJsonLd,
  itemListJsonLd,
} from '../seo-helpers';
import { getExhibitions } from '@/src/lib/db-content';

export const dynamic = 'force-dynamic';

export function generateMetadata(): Metadata {
  return metadataFor('/exhibitions');
}

export default async function ExhibitionsPage() {
  const seo = resolveSeo('/exhibitions');
  const exhibitionsData = await getExhibitions();
  const series = Object.values(exhibitionsData).map((s) => ({
    name: s.title,
    url: `/exhibition/${s.slug}`,
  }));
  return (
    <>
      <JsonLd data={breadcrumbJsonLd(seo.breadcrumbs)} />
      <JsonLd data={itemListJsonLd('/exhibitions', series)} />
      <RouteView type="exhibitions_hub" params={{}} data={{ exhibitions: exhibitionsData }} />
    </>
  );
}
