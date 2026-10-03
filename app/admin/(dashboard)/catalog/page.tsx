import type { Metadata } from 'next';
import { countDestinations, listDestinations, getDestinationTourCounts } from '../places/actions';
import { countOrigins, listOriginsAdmin } from '../origins/actions';
import { countHotels, listHotels } from '../hotels/actions';
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
  // X11: شمار هر سه تب همیشه از دیتابیس می‌آید، ولی دادهٔ کامل فقط تب فعال کشیده می‌شود.
  const counts = await Promise.all([countDestinations(), countOrigins(), countHotels()]).then(
    ([destinations, origins, hotels]) => ({ destinations, origins, hotels }),
  );

  return (
    <CatalogTabs tab={tab} counts={counts}>
      {tab === 'destinations' ? (
        <DestinationsTab />
      ) : tab === 'origins' ? (
        <OriginsTab />
      ) : (
        <HotelsTab city={params.city ?? ''} />
      )}
    </CatalogTabs>
  );
}

async function DestinationsTab() {
  // ایراد ۲۱: شمار تورهای منتشرشدهٔ هر مقصد هم کشیده می‌شود تا ستون
  // «وضعیت سایت» قرارداد انتشار را به ادمین نشان بدهد.
  const [destinations, tourCounts] = await Promise.all([listDestinations(), getDestinationTourCounts()]);
  return <CatalogManager initial={destinations} tourCounts={tourCounts} />;
}

async function OriginsTab() {
  const origins = await listOriginsAdmin();
  return <OriginsManager initial={origins} />;
}

async function HotelsTab({ city }: { city: string }) {
  const [hotels, tree] = await Promise.all([listHotels(), listDestinationTree()]);
  return <HotelsManager initial={hotels} places={tree.all} initialCitySlug={city} />;
}
