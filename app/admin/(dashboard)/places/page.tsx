import type { Metadata } from 'next';
import { listDestinations } from './actions';
import { getSettingsMap } from '../settings/actions';
import CatalogManager from './CatalogManager';
import TourHubNav from '../tours/TourHubNav';

export const metadata: Metadata = {
  title: 'مقصدها و شهرها | پنل ریوان سفر',
  robots: 'noindex,nofollow',
};

export default async function AdminPlacesPage() {
  const [destinations, settings] = await Promise.all([listDestinations(), getSettingsMap()]);
  return (
    <div className="space-y-6">
      <TourHubNav counts={{ places: destinations.length }} />
      <CatalogManager initial={destinations} sectionSettings={settings} />
    </div>
  );
}
