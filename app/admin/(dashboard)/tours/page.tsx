import type { Metadata } from 'next';
import { listDestinationTree, listOrigins, listTours } from './actions';
import { listHotels } from '../hotels/actions';
import { getSettingsMap } from '../settings/actions';
import ToursManager from './ToursManager';
import TourHubNav from './TourHubNav';

export const metadata: Metadata = {
  title: 'تورها | پنل ریوان سفر',
  robots: 'noindex,nofollow',
};

export default async function AdminToursPage() {
  const [tours, settings, tree, origins, hotels] = await Promise.all([
    listTours().catch(() => []),
    getSettingsMap().catch(() => ({})),
    listDestinationTree().catch(() => ({ regions: [], all: [] })),
    listOrigins().catch(() => []),
    listHotels().catch(() => []),
  ]);
  return (
    <div className="space-y-6">
      <TourHubNav counts={{ tours: tours.length, hotels: hotels.length, origins: origins.length }} />
      <ToursManager initial={tours} sectionSettings={settings} tree={tree} origins={origins} hotels={hotels} />
    </div>
  );
}
