'use client';

import * as React from 'react';
import { Check, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Sheet } from '@/components/ui/sheet';
import { cn, fa } from '@/lib/utils';
import type { StageId } from './TourForm';

export interface StepperStage {
  id: StageId;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface StageStepperProps {
  stages: StepperStage[];
  activeStage: StageId;
  onSelect: (id: StageId) => void;
  /** وضعیت تکمیل هر مرحله (تیک سبز) */
  isPassed: (id: StageId) => boolean;
}

/**
 * استپر ۸ مرحلهٔ ویزارد تور — ریسپانسیو واقعی (موج ۵).
 *
 * - موبایل/تبلت (زیر lg): نوار جمع‌وجور «مرحلهٔ فعلی» + دکمه‌های قبلی/بعدی؛
 *   با زدن روی مرحلهٔ فعلی، همهٔ مرحله‌ها در یک شیت پایینی باز می‌شوند.
 * - دسکتاپ (lg به بالا): استپر افقی تک‌ردیفه با اسکرول افقی؛ در عرض باریک
 *   نمی‌شکند و تب فعال همیشه دیده می‌شود.
 */
export function StageStepper({ stages, activeStage, onSelect, isPassed }: StageStepperProps) {
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const desktopNavRef = React.useRef<HTMLElement>(null);
  const activeIndex = stages.findIndex((s) => s.id === activeStage);
  const active = stages[activeIndex] ?? stages[0];
  const ActiveIcon = active.icon;

  // در دسکتاپ باریک، مرحلهٔ فعال با اسکرول افقی به دید می‌آید —
  // فقط وقتی بیرون از دید افقی است، و هرگز در مانت اولیه.
  const mountedRef = React.useRef(false);
  React.useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    const nav = desktopNavRef.current;
    const btn = nav?.querySelector<HTMLElement>(`[data-step-btn="${activeStage}"]`);
    if (!nav || !btn) return;
    const navRect = nav.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();
    if (btnRect.left < navRect.left || btnRect.right > navRect.right) {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      btn.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: reduce ? 'auto' : 'smooth' });
    }
  }, [activeStage]);

  const go = (dir: 1 | -1) => {
    const next = stages[Math.min(stages.length - 1, Math.max(0, activeIndex + dir))];
    if (next) onSelect(next.id);
  };

  const pick = (id: StageId) => {
    setSheetOpen(false);
    onSelect(id);
  };

  return (
    <>
      {/* ── موبایل/تبلت: نوار مرحلهٔ فعلی ── */}
      <div className="lg:hidden">
        <div className="flex items-center gap-2 rounded-sm border border-border bg-card p-2">
          <button
            type="button"
            onClick={() => go(-1)}
            disabled={activeIndex <= 0}
            aria-label="مرحلهٔ قبلی"
            className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-sm border border-border text-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <ChevronRight className="size-5" />
          </button>

          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            aria-haspopup="dialog"
            aria-label={`انتخاب مرحله؛ مرحلهٔ فعلی: ${active.label}`}
            className="flex min-h-11 min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-sm px-3 py-2 text-start transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <span className="min-w-0 flex-1">
              <span className="block truncate text-panel-label font-bold text-foreground">
                {active.label}
              </span>
              <span className="mt-1 block text-panel-caption text-muted-foreground">
                مرحلهٔ {fa(active.id)} از {fa(stages.length)}
              </span>
              {/* نوار پیشرفت مراحل */}
              <span
                className="mt-1.5 block h-1 overflow-hidden rounded-full bg-muted"
                role="progressbar"
                aria-valuenow={activeIndex + 1}
                aria-valuemin={1}
                aria-valuemax={stages.length}
                aria-valuetext={`مرحلهٔ ${fa(active.id)} از ${fa(stages.length)}`}
              >
                <span
                  className="block h-full rounded-full bg-brand"
                  style={{
                    width: `${((activeIndex + 1) / stages.length) * 100}%`,
                    transitionProperty: 'width',
                    transitionDuration: '200ms',
                  }}
                />
              </span>
            </span>
            <span
              className="grid size-9 shrink-0 place-items-center rounded-full bg-brand text-panel-caption font-bold text-brand-foreground"
              aria-hidden
            >
              {fa(active.id)}
            </span>
            <ChevronDown className="size-5 shrink-0 text-muted-foreground" aria-hidden />
          </button>

          <button
            type="button"
            onClick={() => go(1)}
            disabled={activeIndex >= stages.length - 1}
            aria-label="مرحلهٔ بعدی"
            className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-sm border border-border text-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <ChevronLeft className="size-5" />
          </button>
        </div>
      </div>

      {/* ── شیت انتخاب مرحله (موبایل/تبلت) ── */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen} side="bottom" title="انتخاب مرحله">
        <ul className="max-h-[70dvh] space-y-1 overflow-y-auto pb-[max(1rem,env(safe-area-inset-bottom))]">
          {stages.map((stage) => {
            const Icon = stage.icon;
            const passed = isPassed(stage.id);
            const current = stage.id === activeStage;
            return (
              <li key={stage.id}>
                <button
                  type="button"
                  onClick={() => pick(stage.id)}
                  aria-current={current ? 'step' : undefined}
                  className={cn(
                    'flex min-h-14 w-full cursor-pointer items-center gap-3 rounded-sm border px-3 py-2.5 text-start transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                    current
                      ? 'border-brand bg-brand/10'
                      : 'border-transparent hover:bg-accent'
                  )}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-panel-label font-bold text-foreground">
                      {stage.label}
                    </span>
                    <span className="block truncate text-panel-caption text-muted-foreground">
                      {stage.description}
                    </span>
                  </span>
                  <span
                    className={cn(
                      'grid size-9 shrink-0 place-items-center rounded-full text-panel-caption font-bold',
                      current
                        ? 'bg-brand text-brand-foreground'
                        : passed
                          ? 'bg-success/20 text-success'
                          : 'bg-muted text-muted-foreground'
                    )}
                    aria-hidden
                  >
                    {passed && !current ? <Check className="size-4" /> : fa(stage.id)}
                  </span>
                  <Icon className="size-5 shrink-0 text-muted-foreground" aria-hidden />
                </button>
              </li>
            );
          })}
        </ul>
      </Sheet>

      {/* ── دسکتاپ: استپر افقی تک‌ردیفه ── */}
      <nav
        ref={desktopNavRef}
        aria-label="مراحل ساخت تور"
        className="hidden overflow-x-auto rounded-sm border border-border bg-card p-3 lg:block"
      >
        <ol className="flex min-w-max items-stretch gap-1">
          {stages.map((stage, i) => {
            const Icon = stage.icon;
            const passed = isPassed(stage.id);
            const current = stage.id === activeStage;
            const last = i === stages.length - 1;
            return (
              <li key={stage.id} className="flex items-stretch">
                <button
                  type="button"
                  data-step-btn={stage.id}
                  onClick={() => onSelect(stage.id)}
                  aria-current={current ? 'step' : undefined}
                  title={stage.label}
                  className={cn(
                    'group flex w-28 cursor-pointer flex-col gap-2 rounded-sm border p-3 text-start transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                    current
                      ? 'border-brand bg-brand/10'
                      : passed
                        ? 'border-border/70 bg-secondary/30 hover:bg-secondary/60'
                        : 'border-transparent hover:bg-muted/40'
                  )}
                >
                  <span className="flex items-center justify-between">
                    <Icon
                      className={cn('size-4', current ? 'text-brand' : 'text-muted-foreground')}
                      aria-hidden
                    />
                    <span
                      className={cn(
                        'grid size-7 place-items-center rounded-full text-panel-caption font-bold',
                        current
                          ? 'bg-brand text-brand-foreground'
                          : passed
                            ? 'bg-success/20 text-success'
                            : 'bg-muted text-muted-foreground'
                      )}
                      aria-hidden
                    >
                      {passed && !current ? <Check className="size-4" /> : fa(stage.id)}
                    </span>
                  </span>
                  <span
                    className={cn(
                      'block truncate text-panel-caption font-bold leading-tight',
                      current ? 'text-foreground' : 'text-foreground/80'
                    )}
                  >
                    {stage.label}
                  </span>
                </button>
                {!last && (
                  <span
                    aria-hidden
                    className={cn(
                      'mx-1 w-px self-stretch',
                      passed ? 'bg-success/40' : 'bg-border'
                    )}
                  />
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
