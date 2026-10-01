import { TextPageSkeleton } from '@/src/components/Skeletons';

/** میز P-B فاز ۲ (PB-03): حالت لودینگ مسیر — شبح محتوای نهایی، نه اسپینر خشک. */
export default function Loading() {
  return (
    <div className="bg-page-background text-text-primary" role="status" aria-label="در حال بارگذاری">
      <TextPageSkeleton />
    </div>
  );
}
