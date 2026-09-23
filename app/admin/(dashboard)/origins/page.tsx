import type { Metadata } from 'next';
import { listOriginsAdmin } from './actions';
import OriginsManager from './OriginsManager';

export const metadata: Metadata = {
  title: 'مبدأها | پنل ریوان سفر',
  robots: 'noindex,nofollow',
};

export default async function AdminOriginsPage() {
  const origins = await listOriginsAdmin();
  return <OriginsManager initial={origins} />;
}