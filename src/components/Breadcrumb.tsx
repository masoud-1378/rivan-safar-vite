import React from 'react';
import { ChevronLeft, Home } from 'lucide-react';
import { BreadcrumbItem } from '../data/siteRegistry';

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  onNavigate?: (path: string) => void;
}

export default function Breadcrumb({ items, onNavigate }: BreadcrumbProps) {
  if (!items || items.length <= 1) return null;

  const handleClick = (e: React.MouseEvent, url?: string) => {
    if (url && onNavigate) {
      e.preventDefault();
      onNavigate(url);
    }
  };

  return (
    <nav 
      aria-label="مسیر راهنما (Breadcrumb)" 
      className="bg-surface-secondary/80 border-b border-border-default/60 py-2.5 px-4 sm:px-6 lg:px-8 text-caption text-text-secondary dir-rtl"
    >
      <div className="container-main flex items-center flex-wrap gap-1.5 sm:gap-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <React.Fragment key={index}>
              {index === 0 ? (
                <a
                  href={item.url || '/'}
                  onClick={(e) => handleClick(e, item.url || '/')}
                  className="inline-flex items-center gap-1 hover:text-brand-orange text-text-secondary transition-colors"
                >
                  <Home className="w-3.5 h-3.5" />
                  <span>{item.name}</span>
                </a>
              ) : isLast ? (
                <span className="text-text-heading font-bold" aria-current="page">
                  {item.name}
                </span>
              ) : (
                <a
                  href={item.url}
                  onClick={(e) => handleClick(e, item.url)}
                  className="hover:text-brand-orange text-text-secondary transition-colors font-medium"
                >
                  {item.name}
                </a>
              )}

              {!isLast && (
                <ChevronLeft className="w-3.5 h-3.5 text-text-muted shrink-0" aria-hidden="true" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </nav>
  );
}
