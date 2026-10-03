'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CalendarDays, X } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Field, Input } from '@/components/ui/input';
import { formatJalali } from '@/lib/jalali';
import { cn } from '@/lib/utils';

interface DepartureDateFieldProps {
  value: string;
  onChange: (v: string) => void;
  label?: string;
  hint?: string;
  error?: string;
  placeholder?: string;
}

const POP_GAP = 8;
const POP_MARGIN = 8;

/**
 * پاپ‌آپ تقویم با موقعیت‌یابی دستی (flip + shift):
 * کتابخانهٔ float پروژه شیفت افقی ندارد و همین باعث می‌شد پاپ‌آپ از لبهٔ
 * چپ صفحه بیرون بزند؛ پس موقعیت این‌جا حساب می‌شود:
 *  - عمودی: اول پایین دکمه؛ اگر جا نشد بالا (flip)؛ اگر هیچ‌کدام، میخ به داخل نما
 *  - افقی: لبهٔ شروع (در راست‌چین: راست) به دکمه می‌چسبد و بعد به داخل نما شیفت می‌خورد
 *  - در موبایل اگر تقویم از عرض نما بزرگ‌تر بود، عرضش محدود می‌شود
 * با هر اسکرول/تغییر اندازه/تغییر ماه، موقعیت از نو حساب می‌شود.
 */
function SmartCalendarPopup({
  open,
  onClose,
  anchorRef,
  value,
  onPick,
}: {
  open: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLDivElement | null>;
  value: Date | null;
  onPick: (d: Date) => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => setMounted(true), []);

  const reposition = useCallback(() => {
    const anchor = anchorRef.current;
    const panel = panelRef.current;
    if (!anchor || !panel) return;
    const r = anchor.getBoundingClientRect();
    const rtl = getComputedStyle(anchor).direction === 'rtl';
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const pw = Math.min(panel.offsetWidth || 280, vw - POP_MARGIN * 2);
    const ph = panel.offsetHeight || 0;

    // افقی: چسبیدن به لبهٔ شروع، بعد شیفت به داخل نما
    const rawLeft = rtl ? r.right - pw : r.left;
    const left = Math.min(Math.max(rawLeft, POP_MARGIN), Math.max(POP_MARGIN, vw - pw - POP_MARGIN));

    // عمودی: پایین، وگرنه بالا، وگرنه میخ به داخل نما
    let top: number;
    if (r.bottom + POP_GAP + ph <= vh) {
      top = r.bottom + POP_GAP;
    } else if (r.top - POP_GAP - ph >= POP_MARGIN) {
      top = r.top - POP_GAP - ph;
    } else {
      top = Math.min(Math.max(r.bottom + POP_GAP, POP_MARGIN), Math.max(POP_MARGIN, vh - ph - POP_MARGIN));
    }

    setPos({ top: Math.round(top), left: Math.round(left) });
  }, [anchorRef]);

  // قبل از اولین رنگ، موقعیت درست ست می‌شود تا پاپ‌آپ چشمک نزند.
  useLayoutEffect(() => {
    if (open) {
      setPos(null);
      reposition();
    }
  }, [open, reposition]);

  useEffect(() => {
    if (!open) return;
    window.addEventListener('resize', reposition);
    window.addEventListener('scroll', reposition, true);
    // عوض شدن ماه، ارتفاع تقویم را عوض می‌کند؛ موقعیت باید دنبالش بیاید.
    const ro = new ResizeObserver(() => reposition());
    if (panelRef.current) ro.observe(panelRef.current);
    const onDoc = (e: MouseEvent) => {
      if (!panelRef.current?.contains(e.target as Node) && !anchorRef.current?.contains(e.target as Node)) {
        onClose();
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('resize', reposition);
      window.removeEventListener('scroll', reposition, true);
      ro.disconnect();
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, reposition, onClose, anchorRef]);

  if (!mounted || !open) return null;
  return createPortal(
    <div
      ref={panelRef}
      role="dialog"
      aria-label="انتخاب تاریخ حرکت از تقویم"
      className={cn(
        'fixed z-50 rounded-sm border border-border bg-card p-1 shadow-overlay',
        pos === null && 'invisible',
      )}
      style={
        pos
          ? { top: pos.top, left: pos.left, maxWidth: 'calc(100vw - 16px)', maxHeight: 'calc(100dvh - 16px)', overflowY: 'auto' }
          : { top: 0, left: 0, maxWidth: 'calc(100vw - 16px)', maxHeight: 'calc(100dvh - 16px)', overflowY: 'auto' }
      }
    >
      <Calendar
        value={value}
        onChange={(d) => {
          onPick(d);
          onClose();
        }}
      />
    </div>,
    document.body,
  );
}

/**
 * «تاریخ حرکت بعدی» — همان ستون closestDeparture که روی سایت نمایش داده می‌شود.
 * متن آزاد ذخیره می‌ماند (داده‌های قدیمی مثل «۱۵ آبان» دست نمی‌خورند)؛
 * تقویم شمسی فقط میان‌بری است که همان متن را با قالب یکدست می‌نویسد.
 */
export function DepartureDateField({
  value,
  onChange,
  label = 'تاریخ حرکت بعدی',
  hint = 'روی کارت تور در سایت نمایش داده می‌شود',
  error,
  placeholder = 'مثلاً: ۱۵ آبان',
}: DepartureDateFieldProps) {
  // F10: تاریخ انتخاب‌شده از تقویم روی خودِ دکمه دیده می‌شود (کنترل‌شده).
  const [picked, setPicked] = useState<Date | null>(null);
  const [calOpen, setCalOpen] = useState(false);
  const calAnchorRef = useRef<HTMLDivElement>(null);
  const closeCal = useCallback(() => setCalOpen(false), []);

  return (
    <Field label={label} hint={hint} error={error}>
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => {
            // تایپ دستی، انتخاب تقویمیِ قبلی را بی‌اعتبار می‌کند.
            setPicked(null);
            onChange(e.target.value);
          }}
          placeholder={placeholder}
          className="grow max-md:text-base"
        />
        <div ref={calAnchorRef} className="w-40 shrink-0">
          <button
            type="button"
            aria-haspopup="dialog"
            aria-expanded={calOpen}
            onClick={() => setCalOpen((o) => !o)}
            className={cn(
              'flex h-10 w-full min-w-0 cursor-pointer items-center justify-between gap-2 overflow-hidden rounded-field border-0 border-b border-input bg-transparent px-3 text-panel-body transition-colors',
              'focus-visible:outline-none focus-visible:border-brand',
            )}
          >
            <span className={cn('flex min-w-0 items-center gap-2', !picked && 'text-muted-foreground/70')}>
              <CalendarDays className="size-4 shrink-0 text-muted-foreground" />
              <span className="truncate whitespace-nowrap">
                {picked ? formatJalali(picked, { weekday: false }) : 'از تقویم انتخاب کنید'}
              </span>
            </span>
            {picked && (
              <span
                role="button"
                tabIndex={0}
                aria-label="پاک کردن تاریخ"
                onClick={(e) => {
                  e.stopPropagation();
                  setPicked(null);
                  onChange('');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    e.stopPropagation();
                    setPicked(null);
                    onChange('');
                  }
                }}
                className="rounded p-0.5 text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-brand"
              >
                <X className="size-3.5" />
              </span>
            )}
          </button>
          <SmartCalendarPopup
            open={calOpen}
            onClose={closeCal}
            anchorRef={calAnchorRef}
            value={picked}
            onPick={(d) => {
              setPicked(d);
              onChange(formatJalali(d, { weekday: false }));
            }}
          />
        </div>
      </div>
    </Field>
  );
}
