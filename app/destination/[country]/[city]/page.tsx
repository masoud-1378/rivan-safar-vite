import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import RouteView from '../../../RouteView';
import JsonLd from '../../../JsonLd';
import {
  metadataFor,
  resolveSeo,
  breadcrumbJsonLd,
} from '../../../seo-helpers';
import { getLiveContent, getCities } from '@/src/lib/db-content';
import { getContactInfo } from '@/src/lib/site-contact';

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  const cities = await getCities();
  return Object.values(cities).map((city) => ({
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
  const [content, contact] = await Promise.all([getLiveContent(), getContactInfo()]);
  if (!content.cities[city]) notFound();
  const seo = resolveSeo(`/destination/${country}/${city}`);
  return (
    <>
      <JsonLd data={breadcrumbJsonLd(seo.breadcrumbs)} />
      <RouteView
        type="destination_city"
        params={{ countrySlug: country, placeSlug: city }}
        data={content}
        contact={contact}
      />
    </>
  );
}
