import type { Metadata } from 'next';
import RouteView from '../../RouteView';
import JsonLd from '../../JsonLd';
import { metadataFor, resolveSeo, breadcrumbJsonLd } from '../../seo-helpers';
import { getTours } from '@/src/lib/db-content';
import { getContactInfo } from '@/src/lib/site-contact';

export const dynamic = 'force-dynamic';

export function generateMetadata(): Metadata {
  return metadataFor('/tours/domestic');
}

export default async function DomesticToursPage() {
  const seo = resolveSeo('/tours/domestic');
  const [tours, contact] = await Promise.all([getTours(), getContactInfo()]);
  return (
    <>
      <JsonLd data={breadcrumbJsonLd(seo.breadcrumbs)} />
      <RouteView type="tours_domestic" params={{}} data={{ tours }} contact={contact} />
    </>
  );
}
