import type { Metadata } from 'next';
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
  return params.then(({ country }) => metadataFor(`/visa/${country}`));
}

export default async function VisaPage({
  params,
}: {
  params: Promise<{ country: string }>;
}) {
  const { country } = await params;
  const seo = resolveSeo(`/visa/${country}`);
  return (
    <>
      <JsonLd data={breadcrumbJsonLd(seo.breadcrumbs)} />
      <RouteView type="visa_country" params={{ countrySlug: country }} />
    </>
  );
}
