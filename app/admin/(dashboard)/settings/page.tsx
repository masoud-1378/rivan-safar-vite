import type { Metadata } from 'next';
import { getSettings } from './actions';
import SettingsForm from './SettingsForm';
import { requireAdmin } from '@/src/lib/admin-auth';
import { withDefaults } from '@/src/lib/settings';

export const metadata: Metadata = {
  title: 'تنظیمات | پنل ریوان سفر',
  robots: 'noindex,nofollow',
};

export default async function AdminSettingsPage() {
  const session = await requireAdmin(['owner', 'editor']);
  const rows = await getSettings();
  return <SettingsForm initial={withDefaults(rows)} role={session.role} />;
}