import type { Metadata } from 'next';
import RouteView from '../../RouteView';
import JsonLd from '../../JsonLd';
import { metadataFor, resolveSeo, breadcrumbJsonLd } from '../../seo-helpers';
import { getTours, getToursFallbackMode } from '@/src/lib/db-content';
import { getContactInfo } from '@/src/lib/site-contact';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  return metadataFor('/tours/foreign');
}

export default async function ForeignToursPage() {
  const seo = resolveSeo('/tours/foreign');
  // قلم ۴ موج ۱: پرچم فالبک «همه پیش‌نویس» تا ContentProvider در حالت «صفحه خالی» تور نمونه جایگزین نکند.
  const [tours, contact, toursFallback] = await Promise.all([getTours(), getContactInfo(), getToursFallbackMode()]);
  return (
    <>
      <JsonLd data={breadcrumbJsonLd(seo.breadcrumbs)} />
      <RouteView type="tours_foreign" params={{}} data={{ tours, toursFallback }} contact={contact} />
    </>
  );
}
