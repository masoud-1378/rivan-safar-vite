import type { Metadata } from 'next';
import { listDestinations } from '../places/actions';
import { getSettingsMap } from '../settings/actions';
import { listOriginsAdmin } from '../origins/actions';
import { listHotels } from '../hotels/actions';
import { listDestinationTree } from '../tours/actions';
import CatalogManager from '../places/CatalogManager';
import OriginsManager from '../origins/OriginsManager';
import HotelsManager from '../hotels/HotelsManager';
import CatalogTabs, { type CatalogTabId } from './CatalogTabs';

export const metadata: Metadata = {
  title: 'کاتالوگ | پنل ریوان سفر',
  robots: 'noindex,nofollow',
};

const TABS: CatalogTabId[] = ['destinations', 'origins', 'hotels'];

export default async function AdminCatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; city?: string }>;
}) {
  const params = await searchParams;
  const tab: CatalogTabId = (TABS as string[]).includes(params.tab ?? '') ? (params.tab as CatalogTabId) : 'destinations';
  // هر سه فهرست کوچک‌اند؛ یک‌جا کشیده می‌شوند تا شمار تب‌ها همیشه درست باشد.
  const [destinations, origins, hotels, settings, tree] = await Promise.all([
    listDestinations(),
    listOriginsAdmin(),
    listHotels(),
    getSettingsMap(),
    listDestinationTree(),
  ]);
  const counts = { destinations: destinations.length, origins: origins.length, hotels: hotels.length };

  return (
    <CatalogTabs tab={tab} counts={counts}>
      {tab === 'destinations' ? (
        <CatalogManager initial={destinations} sectionSettings={settings} />
      ) : tab === 'origins' ? (
        <OriginsManager initial={origins} />
      ) : (
        <HotelsManager initial={hotels} places={tree.all} initialCitySlug={params.city ?? ''} />
      )}
    </CatalogTabs>
  );
}
