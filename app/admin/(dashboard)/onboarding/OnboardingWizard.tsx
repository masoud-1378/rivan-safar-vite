'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { Check, Database, Flag, MapPin, Plane, Rocket, Send } from 'lucide-react';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { fa } from '@/lib/utils';
import { completeOnboarding, getOnboardingState, runSampleSeed, type OnboardingState } from './actions';

export default function OnboardingWizard({ initial }: { initial: OnboardingState }) {
  const [state, setState] = useState<OnboardingState>(initial);
  const [hidden, setHidden] = useState(initial.completed);
  const [pending, startTransition] = useTransition();
  const { toast } = useToast();

  if (hidden) return null;

  const { counts, isOwner } = state;
  const hasBaseData = counts.destinations > 0 && counts.origins > 0;

  const steps = [
    {
      icon: Database,
      title: 'دادهٔ نمونه (اختیاری)',
      description: isOwner
        ? 'با یک کلیک، مقصدها، مبدأها و لندینگ‌های نمونه را وارد کنید تا پنل را با دادهٔ واقعی ببینید.'
        : 'وارد کردن دادهٔ نمونه فقط با نقش مالک ممکن است.',
      done: hasBaseData,
      action: isOwner ? (
        <Button
          size="sm"
          variant={hasBaseData ? 'ghost' : 'outline'}
          disabled={pending || hasBaseData}
          onClick={() =>
            startTransition(async () => {
              try {
                await runSampleSeed();
                const next = await getOnboardingState();
                setState(next);
                toast({ variant: 'success', title: 'دادهٔ نمونه وارد شد.' });
              } catch (e) {
                toast({ variant: 'error', title: e instanceof Error ? e.message : 'خطا در ورود دادهٔ نمونه.' });
              }
            })
          }
        >
          {pending ? 'در حال ورود…' : hasBaseData ? 'وارد شده است' : 'شروع با دادهٔ نمونه'}
        </Button>
      ) : null,
    },
    {
      icon: MapPin,
      title: 'اولین مقصد',
      description: `تا اینجا ${fa(counts.destinations)} مقصد ثبت شده است.`,
      done: counts.destinations > 0,
      action: (
        <Button size="sm" variant="outline" asChild>
          <Link href="/admin/places">مدیریت مقصدها</Link>
        </Button>
      ),
    },
    {
      icon: Send,
      title: 'اولین مبدأ',
      description: `تا اینجا ${fa(counts.origins)} مبدأ ثبت شده است.`,
      done: counts.origins > 0,
      action: (
        <Button size="sm" variant="outline" asChild>
          <Link href="/admin/origins">مدیریت مبدأها</Link>
        </Button>
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
        <Button size="sm" variant="outline" asChild disabled={!hasBaseData}>
          <Link href="/admin/tours">مدیریت تورها</Link>
        </Button>
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
          onClick={() =>
            startTransition(async () => {
              try {
                await completeOnboarding();
                setHidden(true);
                toast({ variant: 'success', title: 'راه‌اندازی تمام شد. موفق باشید!' });
              } catch (e) {
                toast({ variant: 'error', title: e instanceof Error ? e.message : 'خطا در ثبت پایان راه‌اندازی.' });
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
            <h2 className="text-base font-bold text-foreground">راه‌اندازی در ۵ قدم</h2>
          </div>
          <span className="text-sm text-muted-foreground">
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
              className={`flex items-start justify-between gap-3 rounded-xl border p-3 ${
                step.done ? 'border-success/30 bg-success/5' : 'border-border bg-card'
              }`}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`grid size-8 shrink-0 place-items-center rounded-full text-sm font-bold ${
                    step.done ? 'bg-success text-success-foreground' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {step.done ? <Check className="size-4" /> : fa(i + 1)}
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">{step.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{step.description}</p>
                </div>
              </div>
              <div className="shrink-0">{step.action}</div>
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
