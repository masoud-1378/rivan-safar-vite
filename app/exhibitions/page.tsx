import type { Metadata } from 'next';
import RouteView from '../RouteView';
import JsonLd from '../JsonLd';
import {
  metadataFor,
  resolveSeo,
  breadcrumbJsonLd,
  itemListJsonLd,
} from '../seo-helpers';
import { EXHIBITION_SERIES } from '@/src/data/exhibitionsData';

export function generateMetadata(): Metadata {
  return metadataFor('/exhibitions');
}

export default function ExhibitionsPage() {
  const seo = resolveSeo('/exhibitions');
  const series = Object.values(EXHIBITION_SERIES).map((s) => ({
    name: s.title,
    url: `/exhibition/${s.slug}`,
  }));
  return (
    <>
      <JsonLd data={breadcrumbJsonLd(seo.breadcrumbs)} />
      <JsonLd data={itemListJsonLd('/exhibitions', series)} />
      <RouteView type="exhibitions_hub" params={{}} />
    </>
  );
}
