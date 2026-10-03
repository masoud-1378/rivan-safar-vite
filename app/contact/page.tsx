import type { Metadata } from 'next';
import RouteView from '../RouteView';
import JsonLd from '../JsonLd';
import { metadataFor, resolveSeo, breadcrumbJsonLd } from '../seo-helpers';

// P1-11: شماره تماس و محتوای تماس از تنظیمات DB خوانده می‌شود؛ استاتیکِ
// زمان بیلد نباشد تا بدون دیپلوی تازه بماند.
export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  return metadataFor('/contact');
}

export default function ContactPage() {
  const seo = resolveSeo('/contact');
  return (
    <>
      <JsonLd data={breadcrumbJsonLd(seo.breadcrumbs)} />
      <RouteView type="contact" params={{}} />
    </>
  );
}
