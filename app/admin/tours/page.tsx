import type { Metadata } from 'next';
import { listProducts } from './actions';
import ToursManager from './ToursManager';

export const metadata: Metadata = {
  title: 'تورها | پنل ریوان سفر',
  robots: 'noindex,nofollow',
};

export default async function AdminToursPage() {
  const products = await listProducts();
  return (
    <ToursManager
      initial={products.map((p) => ({
        id: p.id,
        titleFa: p.titleFa,
        slug: p.slug,
        tourKind: p.tourKind,
        status: p.status,
      }))}
    />
  );
}
