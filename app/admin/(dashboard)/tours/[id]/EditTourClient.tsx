'use client';

import { useRouter } from 'next/navigation';
import TourForm from '../TourForm';
import type { TourRow } from '../actions';
import type { DestinationTree } from '../actions';
import type { OriginRow } from '../actions';
import type { HotelRow } from '../../hotels/actions';

interface Props {
  tour: TourRow;
  tree: DestinationTree;
  origins: OriginRow[];
  hotels: HotelRow[];
}

/** پوستهٔ کلاینتی صفحهٔ ویرایش تور: بعد از ذخیره همان‌جا می‌ماند و تازه‌سازی می‌کند. */
export function EditTourClient({ tour, tree, origins, hotels }: Props) {
  const router = useRouter();
  return (
    <TourForm
      editingId={tour.id}
      initial={tour}
      tree={tree}
      origins={origins}
      hotels={hotels}
      onDone={() => router.refresh()}
    />
  );
}
