import { getTour } from '@/src/lib/db-content';
import TourCard from '@/src/components/TourCard';
import { formatFaPrice } from './format';
import type { TourCardSnapshot } from './types';

/**
 * blocks/TourCardBlock.tsx — رندر عمومی بلوک «کارت تور». سرورکامپوننت؛
 * هیچ ایمپورتی از تایپ‌تپ ندارد تا در RichText سوار شود.
 *
 * دفاعی: اول تور زنده از دیتابیس خوانده می‌شود و «کارت واقعی تور» رندر
 * می‌شود؛ اگر تور حذف شده بود، نمای ذخیره‌شده (snapshot) با کارت ساده و
 * بدون پیوند نمایش داده می‌شود تا چیزی نشکند؛ اگر هیچ‌کدام نبود،
 * هیچ‌چیز رندر نمی‌شود.
 */

function safeImage(src: unknown): string | null {
  if (typeof src !== 'string') return null;
  const t = src.trim();
  return /^(https?:)/i.test(t) ? t : null;
}

function coerceSnapshot(raw: unknown): TourCardSnapshot | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const title = typeof r.title === 'string' ? r.title : '';
  if (!title.trim()) return null;
  const price = Number(r.price);
  return {
    title,
    image: typeof r.image === 'string' ? r.image : '',
    duration: typeof r.duration === 'string' ? r.duration : '',
    destination: typeof r.destination === 'string' ? r.destination : '',
    price: Number.isFinite(price) && price > 0 ? price : null,
    badge: typeof r.badge === 'string' && r.badge ? r.badge : null,
    statusLabel: typeof r.statusLabel === 'string' && r.statusLabel ? r.statusLabel : null,
  };
}

export async function TourCardBlock({
  tourSlug,
  snapshot,
}: {
  tourSlug: string;
  snapshot: unknown;
}) {
  let live = null;
  if (tourSlug) {
    try {
      live = await getTour(tourSlug);
    } catch {
      live = null;
    }
  }

  if (live) {
    return (
      <div className="rich-tour-card">
        <TourCard
          title={live.title}
          image={live.image}
          duration={live.duration || undefined}
          destination={live.destination || undefined}
          badge={live.badge ?? undefined}
          price={live.price > 0 ? live.formattedPrice : undefined}
          transportKind={live.transportKind ?? undefined}
          visaRequired={live.visaRequired}
          tourType={live.type}
          hotelStars={live.hotelStars > 0 ? live.hotelStars : undefined}
          href={`/tour/${live.id}`}
        />
      </div>
    );
  }

  // تور حذف شده: نمای ذخیره‌شده، ساده و بدون پیوند.
  const s = coerceSnapshot(snapshot);
  if (!s) return null;
  const price = formatFaPrice(s.price);
  const img = safeImage(s.image);
  return (
    <div className="rich-tour-card rich-tour-card--archived">
      <div className="rich-tour-card__static">
        {img && <img src={img} alt="" loading="lazy" className="rich-tour-card__static-img" />}
        <div className="rich-tour-card__static-body">
          <p className="rich-tour-card__static-title">{s.title}</p>
          <p className="rich-tour-card__static-meta">
            {[s.destination, s.duration].filter(Boolean).join(' · ')}
          </p>
          <p className="rich-tour-card__static-price">
            {price ? `${price} تومان` : 'استعلام قیمت'}
          </p>
          <p className="rich-tour-card__static-note">این تور در حال حاضر در فهرست تورها نیست.</p>
        </div>
      </div>
    </div>
  );
}
