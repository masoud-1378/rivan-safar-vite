import type { Metadata } from 'next';
import RouteView from '../RouteView';
import JsonLd from '../JsonLd';
import { metadataFor, resolveSeo, breadcrumbJsonLd } from '../seo-helpers';

export function generateMetadata(): Metadata {
  return metadataFor('/contact');
}

export default function ContactPage() {
  const seo = resolveSeo('/contact');
  return (
    <>
      <JsonLd data={breadcrumbJsonLd(seo.breadcrumbs)} />
      <RouteView type="contact" params={{}} />
    </>
  );
}
