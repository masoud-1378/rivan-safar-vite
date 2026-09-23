import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import RouteView from '../../RouteView';
import JsonLd from '../../JsonLd';
import { metadataFor, resolveSeo, breadcrumbJsonLd } from '../../seo-helpers';
import { getCountries } from '@/src/lib/db-content';
import { getContactInfo } from '@/src/lib/site-contact';

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  const countries = await getCountries();
  return Object.keys(countries).map((country) => ({ country }));
}

export function generateMetadata({
  params,
}: {
  params: Promise<{ country: string }>;
}): Promise<Metadata> {
  return params.then(({ country }) => {
    // محتوای نازک ایندکس نشود (Quality Gate سند ۰۱)
    return metadataFor(`/visa/${country}`);
  });
}

export default async function VisaPage({
  params,
}: {
  params: Promise<{ country: string }>;
}) {
  const { country } = await params;
  const [countries, contact] = await Promise.all([getCountries(), getContactInfo()]);
  if (!countries[country]) notFound();
  const seo = resolveSeo(`/visa/${country}`);
  return (
    <>
      <JsonLd data={breadcrumbJsonLd(seo.breadcrumbs)} />
      <RouteView type="visa_country" params={{ countrySlug: country }} data={{ countries }} contact={contact} />
    </>
  );
}
