import type { Metadata } from 'next';
import RouteView from '../RouteView';
import JsonLd from '../JsonLd';
import { metadataFor, resolveSeo, breadcrumbJsonLd } from '../seo-helpers';
import { getCountries, getCities } from '@/src/lib/db-content';
import { getContactInfo } from '@/src/lib/site-contact';

export const dynamic = 'force-dynamic';

export function generateMetadata(): Metadata {
  return metadataFor('/destinations');
}

export default async function DestinationsPage() {
  const seo = resolveSeo('/destinations');
  const [countries, cities, contact] = await Promise.all([getCountries(), getCities(), getContactInfo()]);
  return (
    <>
      <JsonLd data={breadcrumbJsonLd(seo.breadcrumbs)} />
      <RouteView type="destinations_catalog" params={{}} data={{ countries, cities }} contact={contact} />
    </>
  );
}
