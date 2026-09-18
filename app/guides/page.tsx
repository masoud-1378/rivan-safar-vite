import type { Metadata } from 'next';
import RouteView from '../RouteView';
import JsonLd from '../JsonLd';
import {
  metadataFor,
  resolveSeo,
  breadcrumbJsonLd,
  itemListJsonLd,
} from '../seo-helpers';
import { GUIDES } from '@/src/data/guidesData';

export function generateMetadata(): Metadata {
  return metadataFor('/guides');
}

export default function GuidesPage() {
  const seo = resolveSeo('/guides');
  const guides = Object.values(GUIDES).map((g) => ({
    name: g.title,
    url: `/guide/${g.slug}`,
  }));
  return (
    <>
      <JsonLd data={breadcrumbJsonLd(seo.breadcrumbs)} />
      <JsonLd data={itemListJsonLd('/guides', guides)} />
      <RouteView type="guides_hub" params={{}} />
    </>
  );
}
