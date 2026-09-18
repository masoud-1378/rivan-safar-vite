import type { Metadata } from 'next';
import RouteView from '../RouteView';
import JsonLd from '../JsonLd';
import { metadataFor, resolveSeo, breadcrumbJsonLd } from '../seo-helpers';

export function generateMetadata(): Metadata {
  return metadataFor('/about');
}

export default function AboutPage() {
  const seo = resolveSeo('/about');
  return (
    <>
      <JsonLd data={breadcrumbJsonLd(seo.breadcrumbs)} />
      <RouteView type="about" params={{}} />
    </>
  );
}
