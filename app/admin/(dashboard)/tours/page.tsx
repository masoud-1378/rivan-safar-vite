import type { Metadata } from 'next';
import { listTours } from './actions';
import ToursManager from './ToursManager';

export const metadata: Metadata = {
  title: 'تورها | پنل ریوان سفر',
  robots: 'noindex,nofollow',
};

export default async function AdminToursPage() {
  const tours = await listTours();
  return <ToursManager initial={tours} />;
}
