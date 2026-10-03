"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: React.ReactNode;
  /** "start" slides in from the right in RTL (the natural side for Persian). */
  side?: "start" | "end" | "bottom";
  children: React.ReactNode;
  className?: string;
}

/**
 * Panel slide ≈ 280ms in / 200ms out (vibefarsi: UI motion 150–300ms;
 * exit is lighter because the user is done with the sheet).
 * Overlay fade ≈ 200ms.
 */
const PANEL_IN_MS = 280;
const PANEL_OUT_MS = 200;
const PANEL_EASE = "cubic-bezier(0.32, 0.72, 0, 1)";
const OVERLAY_MS = 200;

function panelHidden(side: NonNullable<SheetProps["side"]>) {
  if (side === "bottom") return "translate-y-full opacity-0";
  if (side === "start") return "ltr:-translate-x-full rtl:translate-x-full opacity-0";
  return "ltr:translate-x-full rtl:-translate-x-full opacity-0";
}

/** کشو. A side panel for filters, carts and mobile navigation. */
export function Sheet({
  open,
  onOpenChange,
  title,
  side = "start",
  children,
  className,
}: SheetProps) {
  const titleId = React.useId();
  const panelRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLElement | null>(null);
  const [present, setPresent] = React.useState(open);
  const [shown, setShown] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setPresent(true);
      const id = requestAnimationFrame(() => {
        requestAnimationFrame(() => setShown(true));
      });
      return () => cancelAnimationFrame(id);
    }
    setShown(false);
    const t = window.setTimeout(() => setPresent(false), PANEL_OUT_MS);
    return () => window.clearTimeout(t);
  }, [open]);

  React.useEffect(() => {
    if (!present) return;
    // فوکوس‌ترپ: ماشه را نگه دار، فوکوس را وارد دیالوگ کن، Tab را داخل بچرخان،
    // و بعد از بسته شدن فوکوس را به ماشه برگردان.
    triggerRef.current = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onOpenChange(false);
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const focusables = panelRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusables.length === 0) {
        e.preventDefault();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      triggerRef.current?.focus?.();
    };
  }, [present, onOpenChange]);

  if (!present) return null;

  return (
    <div className="fixed inset-0 z-50" role="presentation">
      <div
        aria-hidden
        onClick={() => onOpenChange(false)}
        className={cn(
          "absolute inset-0 bg-black/50 transition-opacity ease-in-out",
          shown ? "opacity-100" : "opacity-0",
        )}
        style={{ transitionDuration: `${OVERLAY_MS}ms` }}
      />
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        className={cn(
          "absolute flex flex-col bg-popover text-popover-foreground shadow-overlay outline-none will-change-transform",
          "transition-[transform,opacity]",
          side === "start" && "inset-y-0 start-0 w-full max-w-sm border-e border-border",
          side === "end" && "inset-y-0 end-0 w-full max-w-sm border-s border-border",
          side === "bottom" && "inset-x-0 bottom-0 max-h-[85vh] rounded-t-2xl border-t border-border",
          shown ? "translate-x-0 translate-y-0 opacity-100" : panelHidden(side),
          className,
        )}
        style={{
          transitionDuration: `${PANEL_IN_MS}ms`,
          transitionTimingFunction: PANEL_EASE,
        }}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          {title && (
            <h2 id={titleId} className="text-panel-title">
              {title}
            </h2>
          )}
          <button
            type="button"
            aria-label="بستن"
            onClick={() => onOpenChange(false)}
            className="ms-auto flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="flex flex-1 flex-col overflow-auto p-5">{children}</div>
      </div>
    </div>
  );
}
