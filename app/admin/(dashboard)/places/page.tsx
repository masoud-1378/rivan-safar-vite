import type { Metadata } from 'next';
import { listDestinations } from './actions';
import CatalogManager from './CatalogManager';

export const metadata: Metadata = {
  title: 'مکان‌ها | پنل ریوان سفر',
  robots: 'noindex,nofollow',
};

export default async function AdminPlacesPage() {
  const destinations = await listDestinations();
  return <CatalogManager initial={destinations} />;
}
