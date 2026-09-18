import type { Metadata } from 'next';
import RouteView from './RouteView';
import JsonLd from './JsonLd';
import { metadataFor, resolveSeo, breadcrumbJsonLd } from './seo-helpers';
import { getLiveContent } from '@/src/lib/db-content';

export const dynamic = 'force-dynamic';

export function generateMetadata(): Metadata {
  return metadataFor('/');
}

export default async function HomePage() {
  const seo = resolveSeo('/');
  const content = await getLiveContent();
  return (
    <>
      <JsonLd data={breadcrumbJsonLd(seo.breadcrumbs)} />
      <RouteView type="home" params={{}} data={content} />
    </>
  );
}
