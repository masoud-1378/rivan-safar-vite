import type { Metadata } from 'next';
import RouteView from './RouteView';
import JsonLd from './JsonLd';
import { metadataFor, resolveSeo, breadcrumbJsonLd } from './seo-helpers';

export function generateMetadata(): Metadata {
  return metadataFor('/');
}

export default function HomePage() {
  const seo = resolveSeo('/');
  return (
    <>
      <JsonLd data={breadcrumbJsonLd(seo.breadcrumbs)} />
      <RouteView type="home" params={{}} />
    </>
  );
}
