import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Content rendered at the inline-start edge (e.g. a country code). */
  startAddon?: React.ReactNode;
  /** Content rendered at the inline-end edge (e.g. a unit or icon). */
  endAddon?: React.ReactNode;
  /** Optional error message; renders below and sets aria-invalid. */
  error?: string;
  /** Ref forwarded to the inner native input (React 19 ref-as-prop). */
  ref?: React.Ref<HTMLInputElement>;
}

/**
 * ورودی متن. Persian text is RTL by default; pass `dir="ltr"` for phone
 * numbers, emails and codes so digits keep their natural order.
 */
export function Input({ className, type, startAddon, endAddon, error, id, dir, ref, ...props }: InputProps) {
  const grouped = Boolean(startAddon || endAddon);
  const input = (
    <input
      id={id}
      type={type}
      ref={ref}
      dir={grouped ? undefined : dir}
      aria-invalid={error ? true : undefined}
      className={cn(
        "flex w-full min-w-0 bg-transparent text-panel-body text-foreground placeholder:text-muted-foreground/70",
        "disabled:cursor-not-allowed disabled:opacity-50",
        grouped
          ? "h-full px-0 outline-none"
          : cn(
              "h-10 rounded-field border-0 border-b border-input bg-transparent px-3 transition-all duration-(--motion) ease-motion",
              "focus-visible:outline-none focus-visible:border-brand",
              "aria-invalid:border-destructive",
            ),
        className,
      )}
      {...props}
    />
  );

  if (!grouped) return withError(input, error);

  // In grouped mode the wrapper is the visible box, so className (e.g. h-9)
  // merges here for size overrides to take effect (یافتهٔ ۱: پیش‌تر className
  // به div بیرونی نمی‌رسید و h-9 روی جست‌وجوی DataTable بی‌اثر بود).
  return withError(
    <div
      dir={dir}
      className={cn(
        "flex h-10 w-full items-center gap-2 rounded-field border-0 border-b border-input bg-transparent px-3 text-panel-body transition-all duration-(--motion) ease-motion",
        "focus-within:border-brand",
        error && "border-destructive",
        className,
      )}
    >
      {startAddon && <span className="shrink-0 text-muted-foreground">{startAddon}</span>}
      {input}
      {endAddon && <span className="shrink-0 text-muted-foreground">{endAddon}</span>}
    </div>,
    error,
  );
}

function withError(node: React.ReactNode, error?: string) {
  if (!error) return node;
  return (
    <div className="space-y-1.5">
      {node}
      <p className="text-panel-caption text-destructive">{error}</p>
    </div>
  );
}

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("text-panel-label text-foreground/90", className)} {...props} />;
}

/** Stacks a Label above a control with consistent spacing. */
export function Field({
  label,
  htmlFor,
  hint,
  error,
  className,
  children,
}: {
  label?: React.ReactNode;
  htmlFor?: string;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label ? <Label htmlFor={htmlFor}>{label}</Label> : null}
      {children}
      {error ? (
        <p className="text-panel-caption text-destructive" role="alert">{error}</p>
      ) : (
        hint && <p className="text-panel-caption text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}
