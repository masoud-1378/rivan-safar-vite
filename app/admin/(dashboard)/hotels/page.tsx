import type { Metadata } from 'next';
import { listHotels } from './actions';
import { listDestinationTree } from '../tours/actions';
import HotelsManager from './HotelsManager';
import TourHubNav from '../tours/TourHubNav';

export const metadata: Metadata = {
  title: 'هتل‌ها | پنل ریوان سفر',
  robots: 'noindex,nofollow',
};

export default async function AdminHotelsPage() {
  const [hotels, tree] = await Promise.all([listHotels(), listDestinationTree()]);
  return (
    <div className="space-y-6">
      <TourHubNav counts={{ hotels: hotels.length }} />
      <HotelsManager initial={hotels} places={tree.all} />
    </div>
  );
}
