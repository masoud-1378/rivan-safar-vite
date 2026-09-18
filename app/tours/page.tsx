import type { Metadata } from 'next';
import RouteView from '../RouteView';
import JsonLd from '../JsonLd';
import {
  metadataFor,
  resolveSeo,
  breadcrumbJsonLd,
  itemListJsonLd,
} from '../seo-helpers';
import { SAMPLE_TOURS } from '@/src/data/toursData';

export function generateMetadata(): Metadata {
  return metadataFor('/tours');
}

export default function ToursPage() {
  const seo = resolveSeo('/tours');
  const tours = SAMPLE_TOURS.map((t) => ({
    name: t.title,
    url: `/tour/${t.id}`,
  }));
  return (
    <>
      <JsonLd data={breadcrumbJsonLd(seo.breadcrumbs)} />
      <JsonLd data={itemListJsonLd('/tours', tours)} />
      <RouteView type="tours_all" params={{}} />
    </>
  );
}
