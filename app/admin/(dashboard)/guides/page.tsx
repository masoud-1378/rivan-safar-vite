import type { Metadata } from 'next';
import { listGuides } from './actions';
import { listDestinations } from '../places/actions';
import { listTours } from '../tours/actions';
import GuidesManager from './GuidesManager';

export const metadata: Metadata = {
  title: 'مقالات و راهنماها | پنل ریوان سفر',
  robots: 'noindex,nofollow',
};

export default async function AdminGuidesPage() {
  const [guides, destinations, tours] = await Promise.all([listGuides(), listDestinations(), listTours()]);
  return (
    <GuidesManager
      initial={guides}
      destinationOptions={destinations.map((d) => ({ value: d.slug, label: d.name }))}
      tourOptions={tours.map((t) => ({ value: t.slug, label: t.title }))}
    />
  );
}
