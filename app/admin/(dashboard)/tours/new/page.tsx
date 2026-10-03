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

/** تور تازه؛ با ?duplicate=<slug> می‌شود از روی یک تور موجود کپی ساخت (همیشه پیش‌نویس).
 *
 * (قلم ۳ موج ۰ — ایراد QA سایه) مسیر تکثیر دیگر initialِ بی‌صدا از روی
 * `{ id, slug, ...rest }` نمی‌سازد؛ به‌جای آن تورِ مبدأ به‌صورت prop به
 * NewTourClient می‌رسد و همان دیالوگ صریح DuplicateTourDialog باز می‌شود —
 * قیمت بی‌صدا منتقل نمی‌شود و نشان «حرکت تضمین‌شده» به نسخهٔ تازه نمی‌رود.
 */
export default async function AdminTourNewPage({ searchParams }: Props) {
  const { duplicate } = await searchParams;
  const [tree, origins, hotels, source] = await Promise.all([
    listDestinationTree().catch(() => ({ regions: [], all: [] })),
    listOrigins().catch(() => []),
    listHotelsForPicker().catch(() => []),
    duplicate ? getTourBySlug(duplicate).catch(() => null) : Promise.resolve(null),
  ]);

  // اگر نامکِ تکراری پیدا نشد، صفحهٔ معمولِ تور تازه است — هیچ کپی بی‌صدایی.
  const duplicateSource: TourRow | null = source ?? null;
  const duplicateTitle = duplicateSource?.title ?? null;

  return (
    <div className="space-y-6">
      <AdminBreadcrumb
        items={[
          { label: 'تورها', href: '/admin/tours' },
          { label: duplicateTitle ? `کپی «${duplicateTitle}»` : 'تور تازه' },
        ]}
      />
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {duplicateTitle ? `کپی تور «${duplicateTitle}»` : 'تور تازه'}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          تور تازه همیشه به‌صورت پیش‌نویس ثبت می‌شود؛ وقتی آماده شد، دکمهٔ «انتشار» را بزنید.
        </p>
      </div>
      <NewTourClient duplicateSource={duplicateSource} tree={tree} origins={origins} hotels={hotels} />
    </div>
  );
}
