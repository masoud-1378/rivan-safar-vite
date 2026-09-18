import type { Metadata } from 'next';
import { listGuides } from './actions';
import GuidesManager from './GuidesManager';

export const metadata: Metadata = {
  title: 'مقالات و راهنماها | پنل ریوان سفر',
  robots: 'noindex,nofollow',
};

export default async function AdminGuidesPage() {
  const guides = await listGuides();
  return <GuidesManager initial={guides} />;
}
