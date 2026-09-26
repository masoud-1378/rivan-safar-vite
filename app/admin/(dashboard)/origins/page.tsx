import type { Metadata } from 'next';
import { listOriginsAdmin } from './actions';
import OriginsManager from './OriginsManager';
import TourHubNav from '../tours/TourHubNav';

export const metadata: Metadata = {
  title: 'مبدأها | پنل ریوان سفر',
  robots: 'noindex,nofollow',
};

export default async function AdminOriginsPage() {
  const origins = await listOriginsAdmin();
  return (
    <div className="space-y-6">
      <TourHubNav counts={{ origins: origins.length }} />
      <OriginsManager initial={origins} />
    </div>
  );
}
