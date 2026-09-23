import type { Metadata } from 'next';
import { listLandings } from './actions';
import { getSettingsMap } from '../settings/actions';
import LandingList from './LandingList';

export const metadata: Metadata = {
  title: 'مدیریت سئو | پنل ریوان سفر',
  robots: 'noindex,nofollow',
};

export default async function AdminSeoPage() {
  const [landings, settings] = await Promise.all([listLandings(), getSettingsMap()]);
  return <LandingList initial={landings} sectionSettings={settings} />;
}