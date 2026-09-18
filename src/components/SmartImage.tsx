'use client';

import Image from 'next/image';

interface SmartImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
}

/**
 * جایگزین مستقیم `<img className="w-full h-full object-cover">` با next/image.
 * والد باید `relative` (یا absolute/fixed) باشد — همه کانتینرهای کارت همین‌طورند.
 * remotePatterns برای images.unsplash.com در next.config.ts فعال است.
 */
export default function SmartImage({
  src,
  alt,
  className = '',
  priority = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw',
}: SmartImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      loading={priority ? undefined : 'lazy'}
      className={className}
    />
  );
}
