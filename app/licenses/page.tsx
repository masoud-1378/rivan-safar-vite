import type { Metadata } from 'next';
import RouteView from '../RouteView';
import JsonLd from '../JsonLd';
import { metadataFor, resolveSeo, breadcrumbJsonLd } from '../seo-helpers';

export function generateMetadata(): Metadata {
  return metadataFor('/licenses');
}

export default function LicensesPage() {
  const seo = resolveSeo('/licenses');
  return (
    <>
      <JsonLd data={breadcrumbJsonLd(seo.breadcrumbs)} />
      <RouteView type="licenses" params={{}} />
    </>
  );
}
