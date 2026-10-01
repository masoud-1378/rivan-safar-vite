import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { listDestinationTree, listOrigins, getTourById } from '../actions';
import { listHotelsForPicker } from '../../hotels/actions';
import { AdminBreadcrumb } from '../AdminBreadcrumb';
import { EditTourClient } from './EditTourClient';

export const metadata: Metadata = {
  title: 'ویرایش تور | پنل ریوان سفر',
  robots: 'noindex,nofollow',
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminTourEditPage({ params }: Props) {
  const { id } = await params;
  const [tour, tree, origins, hotels] = await Promise.all([
    getTourById(id).catch(() => null),
    listDestinationTree().catch(() => ({ regions: [], all: [] })),
    listOrigins().catch(() => []),
    listHotelsForPicker().catch(() => []),
  ]);
  if (!tour) notFound();

  return (
    <div className="space-y-6">
      <AdminBreadcrumb
        items={[
          { label: 'تورها', href: '/admin/tours' },
          { label: tour.title },
        ]}
      />
      <div>
        <h1 className="text-xl font-bold text-foreground">ویرایش تور</h1>
        <p className="mt-1 text-sm text-muted-foreground">{tour.title}</p>
      </div>
      <EditTourClient tour={tour} tree={tree} origins={origins} hotels={hotels} />
    </div>
  );
}
