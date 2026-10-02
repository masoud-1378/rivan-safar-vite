import Link from 'next/link';
import { ChevronLeft, Phone } from 'lucide-react';
import TourCard from './TourCard';
import type {
  DbSeoLanding,
  DbLandingBlock,
  DbLandingLink,
} from '@/src/lib/db-content';
import type { TourItem } from '@/src/data/toursData';
import type { ContactInfo } from '@/src/lib/site-contact';

interface LandingPageViewProps {
  landing: DbSeoLanding;
  blocks: DbLandingBlock[];
  links: DbLandingLink[];
  tours: TourItem[];
  contact: ContactInfo;
}

/**
 * رندر لندینگ سئوی منتشرشده (جدول seo_landings).
 * سرورکامپوننت؛ همهٔ داده از DB می‌آید و همین‌جا به‌صورت props تزریق می‌شود.
 */
export default function LandingPageView({
  landing,
  blocks,
  links,
  tours,
  contact,
}: LandingPageViewProps) {
  const visibleBlocks = blocks.filter(
    (b) => b.heading.trim() || b.content.trim(),
  );

  return (
    <div className="min-h-screen bg-page-background text-text-primary dir-rtl">
      {/* ---------------- Breadcrumb ---------------- */}
      <div className="bg-surface-secondary border-b border-border-default/60 py-2.5">
        <div className="container-main px-4 sm:px-6 lg:px-8 max-w-4xl">
          <nav
            aria-label="مسیر صفحه"
            className="flex items-center gap-2 text-caption text-text-secondary font-medium"
          >
            <Link href="/" className="hover:text-brand-orange transition-colors">
              خانه
            </Link>
            <span className="text-text-muted">/</span>
            <span className="text-text-heading font-semibold truncate max-w-[200px] sm:max-w-none">
              {landing.h1Fa}
            </span>
          </nav>
        </div>
      </div>

      {/* ---------------- Header ---------------- */}
      <section className="bg-surface-primary border-b border-border-default section-compact">
        <div className="container-main px-4 sm:px-6 lg:px-8 max-w-4xl text-right">
          <h1 className="text-h1 text-text-heading font-extrabold leading-tight">
            {landing.h1Fa}
          </h1>
        </div>
      </section>

      {/* ---------------- Content blocks ---------------- */}
      {visibleBlocks.length > 0 ? (
        <section className="section-compact">
          <div className="container-main px-4 sm:px-6 lg:px-8 max-w-4xl space-y-8">
            {visibleBlocks.map((b) => (
              <article key={b.id}>
                {b.heading.trim() ? (
                  <h2 className="text-h2 text-text-heading font-bold mb-3">
                    {b.heading}
                  </h2>
                ) : null}
                {b.content.trim() ? (
                  <p className="text-body text-text-primary leading-loose whitespace-pre-line">
                    {b.content}
                  </p>
                ) : null}
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {/* ---------------- Linked tours ---------------- */}
      {tours.length > 0 ? (
        <section className="section-compact bg-surface-secondary/50 border-y border-border-default/60">
          <div className="container-main px-4 sm:px-6 lg:px-8 max-w-6xl">
            <h2 className="text-h2 text-text-heading font-bold mb-6">
              تورهای مرتبط
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {tours.map((t) => (
                <TourCard
                  key={t.id}
                  title={t.title}
                  image={t.image}
                  duration={t.duration}
                  destination={t.destination}
                  hotelStars={t.hotelStars}
                  badge={t.badge}
                  visaRequired={t.visaRequired}
                  transportKind={t.transportKind}
                  tourType={t.type}
                  price={t.formattedPrice || undefined}
                  href={`/tour/${t.id}`}
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* ---------------- Internal links ---------------- */}
      {links.length > 0 ? (
        <section className="section-compact">
          <div className="container-main px-4 sm:px-6 lg:px-8 max-w-4xl">
            <h2 className="text-h2 text-text-heading font-bold mb-4">
              لینک‌های مرتبط
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {links.map((l) => (
                <li key={l.id}>
                  <Link
                    href={l.toPath}
                    className="flex items-center justify-between gap-2 rounded-card border border-border-default bg-surface-primary px-4 py-3 text-body-sm font-medium text-text-primary hover:border-brand-orange/50 hover:text-brand-orange transition-colors"
                  >
                    <span className="truncate">{l.anchorFa}</span>
                    <ChevronLeft className="w-4 h-4 shrink-0 text-text-muted" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {/* ---------------- CTA ---------------- */}
      <section className="section-compact">
        <div className="container-main px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="rounded-card border border-brand-orange/30 bg-surface-secondary p-6 sm:p-8 text-center">
            <h2 className="text-h2 text-text-heading font-bold mb-2">
              مشاوره و رزرو
            </h2>
            <p className="text-body text-text-secondary leading-relaxed mb-1">
              برای مشاوره دربارهٔ این سفر و رزرو تور، با کارشناس ریوان سفر در
              تماس باشید.
            </p>
            <p className="text-caption text-text-muted mb-5">
              {contact.workingHours} پاسخ‌گوییم.
            </p>
            <a
              href={contact.phoneHref}
              dir="ltr"
              className="btn btn-primary btn-medium inline-flex items-center gap-2"
            >
              <Phone className="w-4 h-4" />
              <span>تماس: {contact.phoneDisplay}</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
