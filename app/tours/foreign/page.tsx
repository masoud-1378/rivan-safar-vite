import type { Metadata } from 'next';
import RouteView from '../../RouteView';
import JsonLd from '../../JsonLd';
import { metadataFor, resolveSeo, breadcrumbJsonLd } from '../../seo-helpers';

export function generateMetadata(): Metadata {
  return metadataFor('/tours/foreign');
}

export default function ForeignToursPage() {
  const seo = resolveSeo('/tours/foreign');
  return (
    <>
      <JsonLd data={breadcrumbJsonLd(seo.breadcrumbs)} />
      <RouteView type="tours_foreign" params={{}} />
    </>
  );
}
