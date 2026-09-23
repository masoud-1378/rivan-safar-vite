import type { Metadata } from 'next';
import RouteView from '../RouteView';
import JsonLd from '../JsonLd';
import {
  metadataFor,
  resolveSeo,
  breadcrumbJsonLd,
  itemListJsonLd,
} from '../seo-helpers';
import { getLiveContent } from '@/src/lib/db-content';
import { getContactInfo } from '@/src/lib/site-contact';

export const dynamic = 'force-dynamic';

export function generateMetadata(): Metadata {
  return metadataFor('/tours');
}

export default async function ToursPage() {
  const seo = resolveSeo('/tours');
  const [content, contact] = await Promise.all([getLiveContent(), getContactInfo()]);
  const tours = content.tours.map((t) => ({
    name: t.title,
    url: `/tour/${t.id}`,
  }));
  return (
    <>
      <JsonLd data={breadcrumbJsonLd(seo.breadcrumbs)} />
      <JsonLd data={itemListJsonLd('/tours', tours)} />
      <RouteView type="tours_all" params={{}} data={content} contact={contact} />
    </>
  );
}
