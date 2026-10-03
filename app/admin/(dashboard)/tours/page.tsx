import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { listOrigins, listTours } from './actions';
import { listHotels } from '../hotels/actions';
import { getSettingsMap } from '../settings/actions';
import ToursManager from './ToursManager';
import TourHubNav from './TourHubNav';
import { AllDraftFallbackBanner } from './AllDraftFallbackBanner';

export const metadata: Metadata = {
  title: 'تورها | پنل ریوان سفر',
  robots: 'noindex,nofollow',
};

interface Props {
  searchParams: Promise<{ new?: string }>;
}

export default async function AdminToursPage({ searchParams }: Props) {
  // سازگاری با لینک‌های قدیمی (مثل ⌘K): ?new=1 به مسیر تازهٔ ساخت تور می‌رود.
  const { new: newParam } = await searchParams;
  if (newParam === '1') redirect('/admin/tours/new');

  const [tours, settings, origins, hotels] = await Promise.all([
    listTours().catch(() => []),
    getSettingsMap().catch(() => ({})),
    listOrigins().catch(() => []),
    listHotels().catch(() => []),
  ]);
  return (
    <div className="space-y-6">
      <TourHubNav counts={{ tours: tours.length, hotels: hotels.length, origins: origins.length }} />
      {/* قلم ۴ موج ۱: اگر هیچ تور منتشرشده‌ای نیست و مدیر هنوز جواب نداده، بنر سؤال */}
      <AllDraftFallbackBanner />
      <ToursManager initial={tours} sectionSettings={settings} />
    </div>
  );
}
