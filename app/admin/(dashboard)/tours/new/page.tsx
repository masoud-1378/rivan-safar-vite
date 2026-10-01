import type { Metadata } from 'next';
import { listDestinationTree, listOrigins, getTourBySlug, type TourRow } from '../actions';
import { listHotelsForPicker } from '../../hotels/actions';
import { AdminBreadcrumb } from '../AdminBreadcrumb';
import { NewTourClient } from './NewTourClient';

export const metadata: Metadata = {
  title: 'تور تازه | پنل ریوان سفر',
  robots: 'noindex,nofollow',
};

interface Props {
  searchParams: Promise<{ duplicate?: string }>;
}

/** تور تازه؛ با ?duplicate=<slug> می‌شود از روی یک تور موجود کپی ساخت (همیشه پیش‌نویس). */
export default async function AdminTourNewPage({ searchParams }: Props) {
  const { duplicate } = await searchParams;
  const [tree, origins, hotels, source] = await Promise.all([
    listDestinationTree().catch(() => ({ regions: [], all: [] })),
    listOrigins().catch(() => []),
    listHotelsForPicker().catch(() => []),
    duplicate ? getTourBySlug(duplicate).catch(() => null) : Promise.resolve(null),
  ]);

  let initial: TourRow | null = null;
  let duplicateTitle: string | null = null;
  if (source) {
    const { id: _id, slug: _slug, ...rest } = source;
    // تکثیر همیشه پیش‌نویسِ در انتظار تأیید ظرفیت است — وضعیت منبع به ارث نمی‌رسد.
    initial = { ...rest, id: '', slug: '', title: `${source.title} (تکثیر)`, publishStatus: 'draft', status: 'pending', statusLabel: 'در انتظار تأیید ظرفیت' };
    duplicateTitle = source.title;
  }

  return (
    <div className="space-y-6">
      <AdminBreadcrumb
        items={[
          { label: 'تورها', href: '/admin/tours' },
          { label: duplicateTitle ? `تکثیر «${duplicateTitle}»` : 'تور تازه' },
        ]}
      />
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {duplicateTitle ? `تکثیر تور «${duplicateTitle}»` : 'تور تازه'}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          تور تازه همیشه به‌صورت پیش‌نویس ثبت می‌شود؛ وقتی آماده شد، دکمهٔ «انتشار» را بزن.
        </p>
      </div>
      <NewTourClient initial={initial} tree={tree} origins={origins} hotels={hotels} />
    </div>
  );
}
