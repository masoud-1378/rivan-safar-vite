import * as React from "react";
import { cn } from "@/lib/utils";

export interface SectionProps {
  /** تیتر سکشن. */
  title?: React.ReactNode;
  /** توضیح زیر تیتر؛ همیشه ۸ پیکسل زیر تیتر می‌نشیند. */
  description?: React.ReactNode;
  /** اکشن‌ها در انتهای خط تیتر (در راست‌چین: سمت چپ). */
  actions?: React.ReactNode;
  /**
   * سطح تیتر: «title» برای سکشن مستقل صفحه (۱۸ پیکسل)،
   * «heading» برای سکشن داخل کارت (۱۶ پیکسل).
   */
  level?: "title" | "heading";
  className?: string;
  children: React.ReactNode;
}

/**
 * سکشن. بلوک استاندارد بخش‌بندی صفحه است: سربرگ (تیتر، توضیح، اکشن)
 * و بدنه. فاصلهٔ بین سکشن‌ها را استک صفحه می‌دهد (space-y-6)؛ خود
 * سکشن حاشیهٔ بیرونی ندارد.
 *
 * فاصله‌ها: تیتر تا توضیح ۸ پیکسل، سربرگ تا بدنه ۱۶ پیکسل.
 */
export function Section({ title, description, actions, level = "title", className, children }: SectionProps) {
  return (
    <section className={className}>
      {(title || actions) && (
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            {title && (
              <h2 className={cn(level === "title" ? "text-panel-title" : "text-panel-heading")}>
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-2 text-panel-body text-muted-foreground">{description}</p>
            )}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  );
}
