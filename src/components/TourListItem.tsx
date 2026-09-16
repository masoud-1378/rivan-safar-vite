import React from 'react';
import { Clock, ShieldCheck, FileText, ChevronLeft } from 'lucide-react';
import { motion } from 'motion/react';

export interface TourListItemProps {
  key?: React.Key;
  id?: string | number;
  title: string;
  image: string;
  duration: string;
  badge?: string;
  visaRequired?: boolean;
  visaFree?: boolean; // kept for backwards compat or logic
  price: string;
  pricePending?: boolean;
  soldOut?: boolean;
  limited?: boolean;
  closestDeparture?: string;
  recurring?: boolean;
  origin?: string;
  onClick?: () => void;
  className?: string;
}

export default function TourListItem({
  title,
  image,
  duration,
  badge,
  visaRequired,
  visaFree,
  price,
  pricePending = false,
  soldOut = false,
  limited = false,
  closestDeparture,
  recurring,
  origin,
  onClick,
  className = ''
}: TourListItemProps) {
  
  // Determine if visa is required
  const isVisaKeywordInTitle = /ژاپن|آلمان|فرانسه|اسپانیا|چین|دبی|اروپا|شینگن|کانادا|انگلیس|رم|پاریس/i.test(title);
  const requiresVisa = visaRequired !== undefined 
    ? visaRequired 
    : (visaFree !== undefined ? !visaFree : isVisaKeywordInTitle);

  // Single Feature (Decision Maker)
  let featureElement = null;
  if (requiresVisa) {
    featureElement = (
      <span className="status status-warning">
        ویزا
      </span>
    );
  } else {
    featureElement = (
      <span className="status status-success">
        بدون ویزا
      </span>
    );
  }

  let statusBadge = null;
  if (soldOut) {
    statusBadge = 'تکمیل ظرفیت';
  } else if (limited) {
    statusBadge = 'ظرفیت محدود';
  }

  return (
    <div 
      onClick={onClick}
      className={`group bg-surface-primary border border-border-default rounded-card shadow-subtle hover:-translate-y-0.5 hover:shadow-card hover:border-border-default/80 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col md:flex-row min-h-[100px] w-full dir-rtl ${soldOut ? 'opacity-85' : ''} ${className}`}
    >
      {/* --- Image Area --- */}
      <div className="relative w-full md:w-[140px] lg:w-[160px] shrink-0 aspect-[16/9] md:aspect-auto">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 md:hidden" />
        
        {/* Top Badges */}
        <div className="absolute top-3 right-3 left-3 flex items-start justify-end gap-2 z-10 pointer-events-none">
          {/* Status Badge */}
          {statusBadge && (
            <div className="flex flex-col gap-1.5 items-end">
              <span className={`inline-flex px-2 py-1 rounded-md text-caption font-bold text-white shadow-sm ${
                soldOut ? 'bg-red-500/90' : 'bg-brand-orange/90'
              }`}>
                {statusBadge}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* --- Information Area --- */}
      <div className="flex-1 p-3 lg:p-4 flex flex-col justify-center">
        <h3 className="text-body font-bold text-text-heading mb-1 lg:mb-2 md:text-body lg:text-h5 line-clamp-2 leading-snug">
          {title}
        </h3>
        
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="badge">
            <Clock className="w-3.5 h-3.5 opacity-80" />
            <span>{duration}</span>
          </span>
        </div>

        <div className="mt-auto">
          {closestDeparture ? (
            <div className="inline-flex items-center gap-2 text-text-secondary text-caption font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-orange"></span>
              <span>نزدیک‌ترین حرکت: {closestDeparture}</span>
            </div>
          ) : recurring ? (
            <div className="inline-flex items-center gap-2 text-text-secondary text-caption font-medium">
              <span>برگزاری منظم</span>
            </div>
          ) : null}
        </div>
      </div>

      {/* --- Action Area (Desktop) --- */}
      <div className="hidden md:flex shrink-0 w-[140px] lg:w-[180px] p-4 lg:p-5 flex-col justify-center border-r border-border-subtle">
        <div className="text-right">
          <span className="block text-caption text-text-secondary mb-1">
            {pricePending || soldOut ? 'وضعیت قیمت' : 'شروع قیمت از'}
          </span>
          <div className="flex flex-wrap items-baseline gap-1">
            {pricePending ? (
              <span className="text-body font-extrabold text-brand-orange">
                در حال بررسی
              </span>
            ) : soldOut ? (
              <span className="text-body font-extrabold text-text-secondary line-through opacity-70">
                تکمیل ظرفیت
              </span>
            ) : (
              <>
                <span className="text-h5 lg:text-h4 font-extrabold text-brand-orange">
                  {price}
                </span>
                <span className="text-caption text-text-secondary font-medium">
                  تومان
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* --- Action Area (Mobile) --- */}
      <div className="md:hidden flex flex-col px-4 pb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-right">
            <span className="block text-caption text-text-secondary mb-0.5">
              {pricePending || soldOut ? 'وضعیت قیمت' : 'شروع قیمت از'}
            </span>
            <div className="flex items-baseline gap-1">
              {pricePending ? (
                <span className="text-body font-extrabold text-brand-orange">
                  در حال بررسی
                </span>
              ) : soldOut ? (
                <span className="text-body font-extrabold text-text-secondary line-through opacity-70">
                  تکمیل ظرفیت
                </span>
              ) : (
                <>
                  <span className="text-body font-extrabold text-brand-orange">
                    {price}
                  </span>
                  <span className="text-caption text-text-secondary font-medium">
                    تومان
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
