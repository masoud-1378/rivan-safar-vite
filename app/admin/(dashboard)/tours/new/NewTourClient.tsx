'use client';

import { useRouter } from 'next/navigation';
import TourForm from '../TourForm';
import type { TourRow, DestinationTree, OriginRow } from '../actions';
import type { HotelRow } from '../../hotels/actions';

interface Props {
  initial: TourRow | null;
  tree: DestinationTree;
  origins: OriginRow[];
  hotels: HotelRow[];
}

/** پوستهٔ کلاینتی صفحهٔ تور تازه: بعد از ذخیره به صفحهٔ ویرایش همان تور می‌رود. */
export function NewTourClient({ initial, tree, origins, hotels }: Props) {
  const router = useRouter();
  return (
    <TourForm
      editingId={null}
      initial={initial}
      tree={tree}
      origins={origins}
      hotels={hotels}
      onDone={(id) => router.push(id ? `/admin/tours/${id}` : '/admin/tours')}
    />
  );
}
