import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export interface Crumb {
  label: string;
  href?: string;
}

/**
 * بردکرامب راست‌چین پنل ادمین. لیبل هاب تورها همیشه «تورها» است.
 */
export function AdminBreadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="بردکرامب" dir="rtl" className="flex items-center gap-1 text-sm">
      <ol className="flex items-center gap-1">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={item.label} className="flex items-center gap-1">
              {i > 0 && <ChevronLeft className="size-4 text-muted-foreground" aria-hidden />}
              {isLast || !item.href ? (
                <span aria-current={isLast ? 'page' : undefined} className={isLast ? 'font-bold text-foreground' : 'text-muted-foreground'}>
                  {item.label}
                </span>
              ) : (
                <Link href={item.href} className="text-muted-foreground hover:text-foreground transition-colors">
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
