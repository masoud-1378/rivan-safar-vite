import type { Metadata } from 'next';
import RouteView from '../RouteView';
import JsonLd from '../JsonLd';
import {
  metadataFor,
  resolveSeo,
  breadcrumbJsonLd,
  itemListJsonLd,
} from '../seo-helpers';
import { getGuidesHubContent } from '@/src/lib/db-content';
import { getContactInfo } from '@/src/lib/site-contact';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  return metadataFor('/guides');
}

export default async function GuidesPage() {
  const seo = resolveSeo('/guides');
  const [hubContent, contact] = await Promise.all([getGuidesHubContent(), getContactInfo()]);
  const guidesData = hubContent.guides;
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
