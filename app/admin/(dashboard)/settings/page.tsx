import type { Metadata } from 'next';
import { getSettings } from './actions';
import SettingsForm from './SettingsForm';
import { requireAdmin } from '@/src/lib/admin-auth';

export const metadata: Metadata = {
  title: 'تنظیمات | پنل ریوان سفر',
  robots: 'noindex,nofollow',
};

export default async function AdminSettingsPage() {
  const settings = await getSettings();
  await import('@/src/lib/admin-auth').then(m => m.requireAdmin(['owner']));
  return <SettingsForm initial={settings} />;
}