import type { Metadata } from 'next';
import { listDestinations } from './actions';
import { getSettingsMap } from '../settings/actions';
import CatalogManager from './CatalogManager';

export const metadata: Metadata = {
  title: 'مکان‌ها | پنل ریوان سفر',
  robots: 'noindex,nofollow',
};

export default async function AdminPlacesPage() {
  const [destinations, settings] = await Promise.all([listDestinations(), getSettingsMap()]);
  return <CatalogManager initial={destinations} sectionSettings={settings} />;
}