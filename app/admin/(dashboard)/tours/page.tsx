import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { listOrigins, listTours, type TourRow } from './actions';
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

  // موج ۲، تیم هاب: خطای خواندن دیتابیس با «فهرست خالی» نقاب نمی‌شود.
  // هر منبع جدا ردیابی می‌شود؛ منبعی که خراب شد، بج شمارشش را پنهان می‌کند
  // (به‌جای صفرِ گمراه‌کننده) و تورها به‌جای جدولِ خالی، پیام صادقانه می‌گیرند.
  const [toursRes, settingsRes, originsRes, hotelsRes] = await Promise.allSettled([
    listTours(),
    getSettingsMap(),
    listOrigins(),
    listHotels(),
  ]);

  const tours: TourRow[] = toursRes.status === 'fulfilled' ? toursRes.value : [];
  const toursLoadError = toursRes.status === 'rejected';
  const settings = settingsRes.status === 'fulfilled' ? settingsRes.value : {};
  const origins = originsRes.status === 'fulfilled' ? originsRes.value : [];
  const originsLoadError = originsRes.status === 'rejected';
  const hotels = hotelsRes.status === 'fulfilled' ? hotelsRes.value : [];
  const hotelsLoadError = hotelsRes.status === 'rejected';

  return (
    <div className="space-y-6">
      <TourHubNav
        counts={{
          tours: toursLoadError ? undefined : tours.length,
          hotels: hotelsLoadError ? undefined : hotels.length,
          origins: originsLoadError ? undefined : origins.length,
        }}
      />
      {/* قلم ۴ موج ۱: اگر هیچ تور منتشرشده‌ای نیست و مدیر هنوز جواب نداده، بنر سؤال */}
      <AllDraftFallbackBanner />
      <ToursManager initial={tours} sectionSettings={settings} loadError={toursLoadError} />
    </div>
  );
}
