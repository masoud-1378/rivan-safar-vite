import type { Metadata } from 'next';
import { listDestinationTree, listOrigins, listTours } from './actions';
import { listHotels } from '../hotels/actions';
import { getSettingsMap } from '../settings/actions';
import ToursManager from './ToursManager';

export const metadata: Metadata = {
  title: 'تورها | پنل ریوان سفر',
  robots: 'noindex,nofollow',
};

export default async function AdminToursPage() {
  const [tours, settings, tree, origins, hotels] = await Promise.all([
    listTours(),
    getSettingsMap(),
    listDestinationTree(),
    listOrigins(),
    listHotels(),
  ]);
  return <ToursManager initial={tours} sectionSettings={settings} tree={tree} origins={origins} hotels={hotels} />;
}
