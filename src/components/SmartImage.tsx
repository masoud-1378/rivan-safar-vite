'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ImageOff } from 'lucide-react';

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
 * remotePatterns در next.config.ts: images.unsplash.com و هاست ذخیره‌سازی سوپابیس.
 * اگر src خالی باشد یا لودش شکست بخورد (میز ۳ — ایراد ۲۶: آدرس خراب، فایل
 * حذف‌شده، ۴۰۴)، به‌جای آیکون شکستهٔ مرورگر یک placeholder تمیز نشان می‌دهد.
 */
export default function SmartImage({
  src,
  alt,
  className = '',
  priority = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw',
}: SmartImageProps) {
  const [failed, setFailed] = useState(false);
  if (!src || !src.trim() || failed) {
    return (
      <div
        className={`absolute inset-0 flex items-center justify-center bg-surface-secondary ${className}`}
        role="img"
        aria-label={alt}
      >
        <ImageOff className="w-8 h-8 text-text-muted/50" />
      </div>
    );
  }
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      loading={priority ? undefined : 'lazy'}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
