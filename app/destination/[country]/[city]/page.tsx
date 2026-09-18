import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import RouteView from '../../../RouteView';
import JsonLd from '../../../JsonLd';
import {
  metadataFor,
  resolveSeo,
  breadcrumbJsonLd,
} from '../../../seo-helpers';
import { CITIES } from '@/src/data/destinationsData';

export function generateStaticParams() {
  return Object.values(CITIES).map((city) => ({
    country: city.parentCountrySlug ?? city.slug,
    city: city.slug,
  }));
}

export function generateMetadata({
  params,
}: {
  params: Promise<{ country: string; city: string }>;
}): Promise<Metadata> {
  return params.then(
    ({ country, city }) => metadataFor(`/destination/${country}/${city}`),
  );
}

export default async function CityPage({
  params,
}: {
  params: Promise<{ country: string; city: string }>;
}) {
  const { country, city } = await params;
  if (!CITIES[city]) notFound();
  const seo = resolveSeo(`/destination/${country}/${city}`);
  return (
    <>
      <JsonLd data={breadcrumbJsonLd(seo.breadcrumbs)} />
      <RouteView
        type="destination_city"
        params={{ countrySlug: country, placeSlug: city }}
      />
    </>
  );
}
