'use client';

import { useRouter } from 'next/navigation';
import TourForm from '../TourForm';
import { DuplicateTourDialog } from '../DuplicateTourDialog';
import type { TourRow, DestinationTree, OriginRow } from '../actions';
import type { HotelPickerItem } from '../../hotels/actions';

interface Props {
  tree: DestinationTree;
  origins: OriginRow[];
  hotels: HotelPickerItem[];
  /**
   * قلم ۳ موج ۰: اگر آمده، به‌جای ساخت بی‌صدای initial از روی تور مبدأ، همان
   * دیالوگ صریح DuplicateTourDialog باز می‌شود — تا قیمت بی‌صدا منتقل نشود و
   * نشان «حرکت تضمین‌شده» به نسخهٔ تازه نرود.
   */
  duplicateSource: TourRow | null;
}

/** پوستهٔ کلاینتی صفحهٔ تور تازه: بعد از ذخیره به صفحهٔ ویرایش همان تور می‌رود. */
export function NewTourClient({ tree, origins, hotels, duplicateSource }: Props) {
  const router = useRouter();

  // مسیر ?duplicate=<slug>: تکثیر همیشه از دیالوگ صریح می‌گذرد؛ انصراف به فهرست برمی‌گردد.
  if (duplicateSource) {
    return (
      <DuplicateTourDialog
        tour={duplicateSource}
        onClose={() => router.push('/admin/tours')}
        onDone={(id) => router.push(id ? `/admin/tours/${id}` : '/admin/tours')}
      />
    );
  }

  return (
    <TourForm
      editingId={null}
      initial={null}
      tree={tree}
      origins={origins}
      hotels={hotels}
      onDone={(id) => router.push(id ? `/admin/tours/${id}` : '/admin/tours')}
      // انصراف در تور تازه هم مثل قبل به فهرست برمی‌گردد (صریح، جدا از onDone).
      onCancel={() => router.push('/admin/tours')}
    />
  );
}
