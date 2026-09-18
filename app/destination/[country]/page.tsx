import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import RouteView from '../../RouteView';
import JsonLd from '../../JsonLd';
import { metadataFor, resolveSeo, breadcrumbJsonLd } from '../../seo-helpers';
import { COUNTRIES } from '@/src/data/destinationsData';

export function generateStaticParams() {
  return Object.keys(COUNTRIES).map((country) => ({ country }));
}

export function generateMetadata({
  params,
}: {
  params: Promise<{ country: string }>;
}): Promise<Metadata> {
  return params.then(({ country }) => metadataFor(`/destination/${country}`));
}

export default async function CountryPage({
  params,
}: {
  params: Promise<{ country: string }>;
}) {
  const { country } = await params;
  if (!COUNTRIES[country]) notFound();
  const seo = resolveSeo(`/destination/${country}`);
  return (
    <>
      <JsonLd data={breadcrumbJsonLd(seo.breadcrumbs)} />
      <RouteView type="country" params={{ countrySlug: country }} />
    </>
  );
}
