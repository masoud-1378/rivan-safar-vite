import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

export interface TourCardSkeletonProps {
  count?: number;
  className?: string;
}

export function TourCardSkeletonItem({ className = '' }: { className?: string }) {
  return (
    <Card className={`overflow-hidden border border-border bg-card flex flex-col h-full rounded-[20px] shadow-sm ${className}`}>
      {/* 1. Image Skeleton (Aspect Ratio 4/3 matching TourCard) */}
      <div className="relative w-full aspect-[4/3] bg-muted overflow-hidden shrink-0">
        <Skeleton shimmer className="w-full h-full rounded-none" />
        {/* Top Badge Skeleton */}
        <div className="absolute top-3 start-3">
          <Skeleton shimmer className="h-6 w-20 rounded-full" />
        </div>
      </div>

      {/* 2. Content Skeleton */}
      <div className="p-4 sm:p-5 flex flex-col justify-between flex-grow gap-4 text-center">
        <div className="flex flex-col items-center gap-2.5">
          {/* Title */}
          <Skeleton shimmer className="h-6 w-4/5 rounded-md" />
          
          {/* Subtitle (Duration & Country) */}
          <div className="flex items-center justify-center gap-2 w-full">
            <Skeleton shimmer className="h-4 w-20 rounded-md" />
            <Skeleton shimmer className="h-4 w-4 rounded-full" />
            <Skeleton shimmer className="h-4 w-16 rounded-md" />
          </div>

          {/* Features Capsule Pill */}
          <div className="w-full bg-muted/60 border border-border/60 rounded-2xl py-3 px-3 flex items-center justify-around mt-1">
            <div className="flex flex-col items-center gap-1.5 flex-1">
              <Skeleton shimmer className="size-4 rounded-full" />
              <Skeleton shimmer className="h-3 w-8 rounded-sm" />
            </div>
            <div className="flex flex-col items-center gap-1.5 flex-1">
              <Skeleton shimmer className="size-4 rounded-full" />
              <Skeleton shimmer className="h-3 w-10 rounded-sm" />
            </div>
            <div className="flex flex-col items-center gap-1.5 flex-1">
              <Skeleton shimmer className="size-4 rounded-full" />
              <Skeleton shimmer className="h-3 w-12 rounded-sm" />
            </div>
            <div className="flex flex-col items-center gap-1.5 flex-1">
              <Skeleton shimmer className="size-4 rounded-full" />
              <Skeleton shimmer className="h-3 w-8 rounded-sm" />
            </div>
          </div>
        </div>

        {/* 3. Footer Price Row */}
        <div className="pt-3 border-t border-border/60 flex items-center justify-between gap-2 mt-auto">
          <Skeleton shimmer className="h-4 w-20 rounded-md" />
          <Skeleton shimmer className="h-6 w-28 rounded-md" />
        </div>
      </div>
    </Card>
  );
}

export default function TourCardSkeleton({ count = 3, className = '' }: TourCardSkeletonProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {Array.from({ length: count }).map((_, idx) => (
        <TourCardSkeletonItem key={`tour-skeleton-${idx}`} />
      ))}
    </div>
  );
}
