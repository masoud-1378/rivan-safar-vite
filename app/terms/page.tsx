import type { Metadata } from 'next';
import RouteView from '../RouteView';
import JsonLd from '../JsonLd';
import { metadataFor, resolveSeo, breadcrumbJsonLd } from '../seo-helpers';

export function generateMetadata(): Metadata {
  return metadataFor('/terms');
}

export default function TermsPage() {
  const seo = resolveSeo('/terms');
  return (
    <>
      <JsonLd data={breadcrumbJsonLd(seo.breadcrumbs)} />
      <RouteView type="terms" params={{}} />
    </>
  );
}
