import type { Metadata } from 'next';
import RouteView from '../RouteView';
import JsonLd from '../JsonLd';
import {
  metadataFor,
  resolveSeo,
  breadcrumbJsonLd,
  itemListJsonLd,
} from '../seo-helpers';
import { getLiveContent } from '@/src/lib/db-content';
import { getContactInfo, getTourListSettings } from '@/src/lib/site-contact';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  return metadataFor('/tours');
}

export default async function ToursPage() {
  const seo = resolveSeo('/tours');
  // ایراد ۲۸: تعداد اولیهٔ تورها و مرتب‌سازی پیش‌فرض از تنظیمات پنل می‌آیند.
  const [content, contact, tourList] = await Promise.all([
    getLiveContent(),
    getContactInfo(),
    getTourListSettings(),
  ]);
  const tours = content.tours.map((t) => ({
    name: t.title,
    url: `/tour/${t.id}`,
  }));
  return (
    <>
      <JsonLd data={breadcrumbJsonLd(seo.breadcrumbs)} />
      <JsonLd data={itemListJsonLd('/tours', tours)} />
      <RouteView type="tours_all" params={{}} data={content} contact={contact} tourList={tourList} />
    </>
  );
}
