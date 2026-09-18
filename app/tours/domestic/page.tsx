import type { Metadata } from 'next';
import RouteView from '../../RouteView';
import JsonLd from '../../JsonLd';
import { metadataFor, resolveSeo, breadcrumbJsonLd } from '../../seo-helpers';

export function generateMetadata(): Metadata {
  return metadataFor('/tours/domestic');
}

export default function DomesticToursPage() {
  const seo = resolveSeo('/tours/domestic');
  return (
    <>
      <JsonLd data={breadcrumbJsonLd(seo.breadcrumbs)} />
      <RouteView type="tours_domestic" params={{}} />
    </>
  );
}
