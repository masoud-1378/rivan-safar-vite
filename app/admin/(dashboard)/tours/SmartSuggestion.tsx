'use client';

import type { ReactNode } from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SmartSuggestionProps {
  title: string;
  description?: ReactNode;
  onAccept: () => void;
  onReject: () => void;
  acceptText?: string;
  rejectText?: string;
}

/**
 * کارت پیشنهاد هوشمند (موج ۲) — الگوی واحد قانون طلایی محصول:
 * پیشنهاد دیده می‌شود با دو دکمه؛ تا مدیر «پذیرفتن» را نزند هیچ فیلدی عوض نمی‌شود.
 * رجیستر: رسمی-انسانی پنل (پذیرفتن / رد).
 */
export function SmartSuggestion({
  title,
  description,
  onAccept,
  onReject,
  acceptText = 'پذیرفتن',
  rejectText = 'رد',
}: SmartSuggestionProps) {
  return (
    <div className="rounded-sm border border-brand/25 bg-brand/5 p-3">
      <p className="flex items-center gap-1.5 text-xs font-bold text-foreground">
        <Sparkles className="size-3.5 shrink-0 text-brand" />
        <span>{title}</span>
      </p>
      {description ? (
        <p className="mt-1 text-caption leading-relaxed text-muted-foreground">{description}</p>
      ) : null}
      <div className="mt-2 flex gap-2">
        <Button type="button" size="sm" onClick={onAccept} className="text-xs">
          {acceptText}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={onReject}
          className="text-xs text-muted-foreground"
        >
          {rejectText}
        </Button>
      </div>
    </div>
  );
}
