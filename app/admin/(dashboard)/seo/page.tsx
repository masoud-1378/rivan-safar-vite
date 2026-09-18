import type { Metadata } from 'next';
import { listLandings } from './actions';
import LandingList from './LandingList';

export const metadata: Metadata = {
  title: 'مدیریت سئو | پنل ریوان سفر',
  robots: 'noindex,nofollow',
};

export default async function AdminSeoPage() {
  const landings = await listLandings();
  return <LandingList initial={landings} />;
}