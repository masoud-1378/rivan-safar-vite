import type { Metadata } from 'next';
import { listExhibitions } from './actions';
import ExhibitionsManager from './ExhibitionsManager';

export const metadata: Metadata = {
  title: 'نمایشگاه‌ها | پنل ریوان سفر',
  robots: 'noindex,nofollow',
};

export default async function AdminExhibitionsPage() {
  const exhibitions = await listExhibitions();
  return <ExhibitionsManager initial={exhibitions} />;
}
