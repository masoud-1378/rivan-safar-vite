import type { Metadata } from 'next';
import RouteView from '../RouteView';
import JsonLd from '../JsonLd';
import { metadataFor, resolveSeo, breadcrumbJsonLd } from '../seo-helpers';

export function generateMetadata(): Metadata {
  return metadataFor('/guides');
}

export default function GuidesPage() {
  const seo = resolveSeo('/guides');
  return (
    <>
      <JsonLd data={breadcrumbJsonLd(seo.breadcrumbs)} />
      <RouteView type="guides_hub" params={{}} />
    </>
  );
}
