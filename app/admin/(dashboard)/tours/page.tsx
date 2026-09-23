import type { Metadata } from 'next';
import { listTours } from './actions';
import { getSettingsMap } from '../settings/actions';
import ToursManager from './ToursManager';

export const metadata: Metadata = {
  title: 'تورها | پنل ریوان سفر',
  robots: 'noindex,nofollow',
};

export default async function AdminToursPage() {
  const [tours, settings] = await Promise.all([listTours(), getSettingsMap()]);
  return <ToursManager initial={tours} sectionSettings={settings} />;
}