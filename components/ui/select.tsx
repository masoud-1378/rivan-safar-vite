import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type SelectOption = { value: string; label: string; disabled?: boolean };

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "children"> {
  options: SelectOption[];
  placeholder?: string;
  /** Ref forwarded to the native select (React 19 ref-as-prop). */
  ref?: React.Ref<HTMLSelectElement>;
}

/**
 * انتخاب. A styled native <select>: keyboard, screen readers and mobile
 * pickers work for free. The chevron sits at the inline-end (left in RTL).
 */
export function Select({ className, options, placeholder, ref, ...props }: SelectProps) {
  return (
    <div className="relative">
      <select
        ref={ref}
        className={cn(
          "h-10 w-full cursor-pointer appearance-none rounded-field border-0 border-b border-input bg-transparent ps-3 pe-9 text-panel-body text-foreground",
          "focus-visible:outline-none focus-visible:border-brand",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((o) => (
          <option key={o.value} value={o.value} disabled={o.disabled}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
}
