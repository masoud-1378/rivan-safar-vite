'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { Check, Database, Flag, MapPin, Plane, Rocket, Send } from 'lucide-react';
import { Alert } from '@/components/ui/alert';
import { Button, buttonClasses } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { cn, fa } from '@/lib/utils';
import { completeOnboarding, getOnboardingState, runSampleSeed, type OnboardingState } from './actions';
import { safeErrorMessage } from '@/src/lib/error-message';

export default function OnboardingWizard({ initial }: { initial: OnboardingState }) {
  const [state, setState] = useState<OnboardingState>(initial);
  const [hidden, setHidden] = useState(initial.completed);
  const [pending, startTransition] = useTransition();
  const { toast } = useToast();

  const { counts, isOwner } = state;
  const hasBaseData = counts.destinations > 0 && counts.origins > 0;
  // یافتهٔ ۲: هر داده‌ای (مقصد/مبدأ/لندینگ/تور) که باشد، دکمه disable بی‌صدا نمی‌شود؛ هشدار می‌دهد.
  const hasAnyData =
    counts.destinations > 0 || counts.origins > 0 || counts.tours > 0 || counts.landings > 0;
  // یافتهٔ ۱۳: هر ۴ قدم داده کامل باشد، ویزارد خودش «اتمام» می‌خورد.
  const allDataStepsDone =
    hasBaseData && counts.destinations > 0 && counts.origins > 0 && counts.tours > 0;
  const autoCompleted = useRef(false);
  useEffect(() => {
    if (allDataStepsDone && !initial.completed && !autoCompleted.current) {
      autoCompleted.current = true;
      startTransition(async () => {
        try {
          await completeOnboarding();
          setHidden(true);
        } catch {
          autoCompleted.current = false;
        }
      });
    }
  }, [allDataStepsDone, initial.completed]);

  if (hidden) return null;

  const steps = [
    {
      icon: Database,
      title: 'دادهٔ نمونه (اختیاری)',
      description: isOwner
        ? 'با یک کلیک، مقصدها، مبدأها و لندینگ‌های نمونه را وارد کنید تا پنل را با دادهٔ واقعی ببینید.'
        : 'وارد کردن دادهٔ نمونه فقط با نقش مالک ممکن است.',
      done: hasBaseData,
      action: isOwner ? (
        <div className="w-full sm:w-auto">
          <Button
            size="sm"
            variant={hasBaseData ? 'ghost' : 'outline'}
            disabled={pending}
            className="w-full sm:w-auto"
            onClick={() =>
              startTransition(async () => {
                try {
                  await runSampleSeed();
                  const next = await getOnboardingState();
                  setState(next);
                  toast({ variant: 'success', title: 'دادهٔ نمونه وارد شد.' });
                } catch (e) {
                  toast({ variant: 'error', title: safeErrorMessage(e, 'ورود دادهٔ نمونه انجام نشد؛ دوباره تلاش کنید.') });
                }
              })
            }
          >
            {pending ? 'در حال ورود…' : 'شروع با دادهٔ نمونه'}
          </Button>
          {hasAnyData ? (
            <p className="mt-1 max-w-60 text-panel-caption leading-5 text-warning">
              داده‌ای در پنل هست؛ «دادهٔ نمونه» فقط نمونه‌های گمشدهٔ خودش را کامل می‌کند و به داده‌های شما دست نمی‌زند.
            </p>
          ) : null}
        </div>
      ) : null,
    },
    {
      icon: MapPin,
      title: 'اولین مقصد',
      description: `تا اینجا ${fa(counts.destinations)} مقصد ثبت شده است.`,
      done: counts.destinations > 0,
      // یافتهٔ ۱۰: به‌جای Buttonِ asChild (‏a داخل button نامعتبر است)، ‏a استایل‌دار.
      action: (
        <a href="/admin/catalog?tab=destinations" className={cn(buttonClasses('outline', 'sm'), 'w-full sm:w-auto')}>
          مدیریت مقصدها
        </a>
      ),
    },
    {
      icon: Send,
      title: 'اولین مبدأ',
      description: `تا اینجا ${fa(counts.origins)} مبدأ ثبت شده است.`,
      done: counts.origins > 0,
      action: (
        <a href="/admin/catalog?tab=origins" className={cn(buttonClasses('outline', 'sm'), 'w-full sm:w-auto')}>
          مدیریت مبدأها
        </a>
      ),
    },
    {
      icon: Plane,
      title: 'اولین تور',
      description: hasBaseData
        ? `تا اینجا ${fa(counts.tours)} تور ثبت شده است.`
        : 'اول مقصد و مبدأ را ثبت کنید، بعد تور بسازید.',
      done: counts.tours > 0,
      action: (
        <a
          href="/admin/tours/new"
          aria-disabled={!hasBaseData}
          className={cn(buttonClasses('outline', 'sm'), 'w-full sm:w-auto', !hasBaseData && 'pointer-events-none opacity-50')}
        >
          ساخت تور
        </a>
      ),
    },
    {
      icon: Flag,
      title: 'پایان راه‌اندازی',
      description: 'وقتی آماده بودید، راه‌اندازی را تمام کنید تا این کارت دیگر نمایش داده نشود.',
      done: false,
      action: (
        <Button
          size="sm"
          disabled={pending}
          className="w-full sm:w-auto"
          onClick={() =>
            startTransition(async () => {
              try {
                await completeOnboarding();
                setHidden(true);
                toast({ variant: 'success', title: 'راه‌اندازی تمام شد. موفق باشید!' });
              } catch (e) {
                toast({ variant: 'error', title: safeErrorMessage(e, 'خطا در ثبت پایان راه‌اندازی.') });
              }
            })
          }
        >
          اتمام راه‌اندازی
        </Button>
      ),
    },
  ];

  const doneCount = steps.filter((s) => s.done).length;

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardContent className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Rocket className="size-5 text-primary" />
            <h2 className="text-panel-heading font-bold text-foreground">راه‌اندازی در ۵ قدم</h2>
          </div>
          <span className="text-panel-body text-muted-foreground">
            {fa(doneCount)} از {fa(5)} قدم
          </span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${(doneCount / steps.length) * 100}%` }}
          />
        </div>
        <ol className="mt-4 space-y-3">
          {steps.map((step, i) => (
            <li
              key={step.title}
              className={`flex flex-col gap-3 rounded-sm border p-3 sm:flex-row sm:items-start sm:justify-between ${
                step.done ? 'border-success/30 bg-success/5' : 'border-border bg-card'
              }`}
            >
              <div className="flex min-w-0 items-start gap-3">
                <span
                  className={`grid size-8 shrink-0 place-items-center rounded-full text-panel-label font-bold ${
                    step.done ? 'bg-success text-success-foreground' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {step.done ? <Check className="size-4" /> : fa(i + 1)}
                </span>
                <div>
                  <p className="text-panel-label font-semibold text-foreground">{step.title}</p>
                  <p className="mt-1 text-panel-caption text-muted-foreground">{step.description}</p>
                </div>
              </div>
              <div className="w-full sm:w-auto sm:shrink-0">{step.action}</div>
            </li>
          ))}
        </ol>
        {!isOwner ? (
          <Alert variant="info" title="نقش شما ویراستار است" className="mt-4">
            وارد کردن دادهٔ نمونه فقط برای مالک فعال است؛ بقیهٔ قدم‌ها برای شما باز است.
          </Alert>
        ) : null}
      </CardContent>
    </Card>
  );
}
