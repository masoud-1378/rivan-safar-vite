import type { Metadata } from 'next';
import RouteView from '../RouteView';
import JsonLd from '../JsonLd';
import {
  metadataFor,
  resolveSeo,
  breadcrumbJsonLd,
  itemListJsonLd,
} from '../seo-helpers';
import { getGuides } from '@/src/lib/db-content';
import { getContactInfo } from '@/src/lib/site-contact';

export const dynamic = 'force-dynamic';

export function generateMetadata(): Metadata {
  return metadataFor('/guides');
}

export default async function GuidesPage() {
  const seo = resolveSeo('/guides');
  const [guidesData, contact] = await Promise.all([getGuides(), getContactInfo()]);
  const guides = Object.values(guidesData).map((g) => ({
    name: g.title,
    url: `/guide/${g.slug}`,
  }));
  return (
    <>
      <JsonLd data={breadcrumbJsonLd(seo.breadcrumbs)} />
      <JsonLd data={itemListJsonLd('/guides', guides)} />
      <RouteView type="guides_hub" params={{}} data={{ guides: guidesData }} contact={contact} />
    </>
  );
}
