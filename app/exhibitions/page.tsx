import type { Metadata } from 'next';
import RouteView from '../RouteView';
import JsonLd from '../JsonLd';
import {
  metadataFor,
  resolveSeo,
  breadcrumbJsonLd,
  itemListJsonLd,
} from '../seo-helpers';
import { getExhibitionsHubContent } from '@/src/lib/db-content';
import { getContactInfo } from '@/src/lib/site-contact';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  return metadataFor('/exhibitions');
}

export default async function ExhibitionsPage() {
  const seo = resolveSeo('/exhibitions');
  const [hubContent, contact] = await Promise.all([getExhibitionsHubContent(), getContactInfo()]);
  const exhibitionsData = hubContent.exhibitions;
  const series = Object.values(exhibitionsData).map((s) => ({
    name: s.title,
    url: `/exhibition/${s.slug}`,
  }));
  return (
    <>
      <JsonLd data={breadcrumbJsonLd(seo.breadcrumbs)} />
      <JsonLd data={itemListJsonLd('/exhibitions', series)} />
      <RouteView type="exhibitions_hub" params={{}} data={{ exhibitions: exhibitionsData }} contact={contact} />
    </>
  );
}
