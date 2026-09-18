import type { Metadata } from 'next';
import { listCatalog, deletePlace } from './actions';
import CatalogManager from './CatalogManager';
import { requireAdmin } from '@/src/lib/admin-auth';

export const metadata: Metadata = {
  title: 'مکان‌ها | پنل ریوان سفر',
  robots: 'noindex,nofollow',
};

export default async function AdminPlacesPage() {
  const session = await requireAdmin(['owner', 'editor']);
  const catalog = await listCatalog();

  async function handleDeletePlace(id: string) {
    'use server';
    await deletePlace(id);
  }

  return (
    <CatalogManager
      places={catalog.places.map((p) => ({ id: p.id, slug: p.slug, nameFa: p.nameFa, type: p.type }))}
      origins={catalog.origins.map((o) => ({ id: o.id, slug: o.slug, nameFa: o.nameFa }))}
      carriers={catalog.carriers.map((c) => ({ id: c.id, slug: c.slug, nameFa: c.nameFa }))}
      hotels={catalog.hotels.map((h) => ({ id: h.id, slug: h.slug, nameFa: h.nameFa }))}
      isOwner={session.role === 'owner'}
      onDeletePlace={handleDeletePlace}
    />
  );
}
