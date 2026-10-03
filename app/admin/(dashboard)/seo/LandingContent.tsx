'use client';

import { useEffect, useState, useTransition } from 'react';
import { Check, Link2, Trash2, X } from 'lucide-react';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useToast } from '@/components/ui/toast';
import { fa } from '@/lib/utils';
import BlockEditor, { cleanBlocks, readItem, validateBlocks } from '@/components/ui/block-editor';
import { RichText, type JSONContent } from '@/components/ui/rich-editor';
import { ColumnNotice, useColumnGuard } from '@/components/ui/column-guard';
import {
  cleanRichValue,
  isRichEmpty,
  normalizeRichValue,
  richFallback,
  richFromPlainText,
  richToPlainText,
} from '@/lib/rich-text';
import {
  checkLandingBlockRichCol,
  checkQualityGate,
  createLink,
  deleteLink,
  getLanding,
  replaceBlocks,
  type LinkInput,
} from './actions';
import { safeErrorMessage } from '@/src/lib/error-message';

interface LandingContentProps {
  landingId: string;
  titleFa: string;
  urlPath: string;
  landings: Array<{ id: string; titleFa: string; urlPath: string }>;
}

interface LinkRow {
  id: string;
  fromLandingId: string | null;
  fromPath: string | null;
  toPath: string;
  anchorFa: string;
}

/**
 * تبدیل ردیف content_blocks به آیتم فرم. متن غنی ستون `body_fa_rich` زیر
 * کلید `content_rich` در حافظهٔ فرم می‌نشیند تا BlockEditor (حالت rich) همان
 * را بخواند/بنویسد؛ موقع ذخیره دوباره جدا می‌شود.
 *
 * یافتهٔ QA لندینگ‌ها: `content_rich` از همان شروع مقدار اولیهٔ ویرایشگر را
 * می‌گیرد (همان منطق richInitial: اول نسخهٔ غنی، اگر نبود متن تخت قدیمی) تا
 * ذخیره همیشه نسخهٔ «جاری» ویرایشگر را ببیند، نه حافظهٔ کهنهٔ لحظهٔ باز شدن
 * فرم را. این یعنی: بلوک دست‌نخورده با اولین ذخیره به قالب تازه می‌رود
 * (تصمیم مسعود)، و متن تازه‌تایپ‌شده حتی وقتی ستون `body_fa_rich` نیست
 * هم تخت می‌ماند و گم نمی‌شود.
 */
function blockToValue(bodyFa: string | null, bodyFaRich: JSONContent | null): unknown {
  let base: Record<string, unknown>;
  let content = '';
  if (!bodyFa) {
    base = { heading: '', content: '' };
  } else {
    try {
      const parsed = JSON.parse(bodyFa) as Record<string, unknown>;
      if (parsed && typeof parsed === 'object' && ('heading' in parsed || 'content' in parsed)) {
        base = { ...parsed };
        content = String(parsed.content ?? '');
      } else {
        // بدنهٔ قدیمیِ متن ساده
        base = { heading: '', content: bodyFa };
        content = bodyFa;
      }
    } catch {
      // بدنهٔ قدیمیِ متن ساده
      base = { heading: '', content: bodyFa };
      content = bodyFa;
    }
  }
  const rich = normalizeRichValue(bodyFaRich);
  const contentRich =
    rich && !isRichEmpty(rich) ? rich : content.trim() ? richFromPlainText(content.trim()) : null;
  return { ...base, content_rich: contentRich };
}

export default function LandingContent({ landingId, titleFa, urlPath, landings }: LandingContentProps) {
  const [sections, setSections] = useState<unknown[]>([]);
  const [links, setLinks] = useState<LinkRow[]>([]);
  const [inLinks, setInLinks] = useState<LinkRow[]>([]);
  const [gate, setGate] = useState<Awaited<ReturnType<typeof checkQualityGate>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [blocksError, setBlocksError] = useState<string | undefined>();
  // نگهبان ستون body_fa_rich (الگوی «نگهبان + اطلاع»): تا مایگریشن 0030 اجرا
  // نشده، متن غنی ذخیره نمی‌شود و همین‌جا صادقانه می‌گوییم.
  const richReady = useColumnGuard(checkLandingBlockRichCol);
  const [showPreview, setShowPreview] = useState(false);
  // فرم لینک تازه
  const [fromSel, setFromSel] = useState<string>(landingId);
  const [fromPathCustom, setFromPathCustom] = useState('');
  const [toSel, setToSel] = useState('');
  const [anchor, setAnchor] = useState('');
  const [linkError, setLinkError] = useState<string | undefined>();
  const [pending, startTransition] = useTransition();
  const { toast } = useToast();

  const load = async () => {
    try {
      const data = await getLanding(landingId);
      if (!data) return;
      setSections(data.blocks.map((b) => blockToValue(b.bodyFa, (b.bodyFaRich ?? null) as JSONContent | null)));
      setLinks(
        data.links.map((l) => ({
          id: l.id,
          fromLandingId: l.fromLandingId,
          fromPath: l.fromPath,
          toPath: l.toPath,
          anchorFa: l.anchorFa,
        })),
      );
      setInLinks(
        data.inLinks.map((l) => ({
          id: l.id,
          fromLandingId: l.fromLandingId,
          fromPath: l.fromPath,
          toPath: l.toPath,
          anchorFa: l.anchorFa,
        })),
      );
      setGate(await checkQualityGate(landingId));
    } catch (e) {
      toast({ variant: 'error', title: safeErrorMessage(e, 'خطا در بارگذاری.') });    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [landingId]);

  const refresh = () => startTransition(async () => { await load(); });

  const saveBlocks = () => {
    const problem = validateBlocks('section', sections);
    if (problem) {
      setBlocksError(problem);
      return;
    }
    setBlocksError(undefined);
    const clean = cleanBlocks('section', sections);
    startTransition(async () => {
      try {
        // یافتهٔ ۱: ذخیرهٔ اتمیک — یک تراکنش سمت سرور، نه حذف تکی + درج تکی.
        const result = await replaceBlocks(
          landingId,
          clean.map((s, i) => {
            const f = readItem('section', s);
            const heading = String(f.heading ?? '');
            // یافتهٔ QA لندینگ‌ها: متن تخت همیشه از نسخهٔ «جاری» ویرایشگر غنی
            // استخراج می‌شود (richToPlainText)، نه از حافظهٔ کهنهٔ فرم. با این کار:
            // ۱) وقتی ستون body_fa_rich نیست، متن تازه‌تایپ‌شده تخت
            //    در body_fa می‌ماند و گم نمی‌شود؛
            // ۲) پاک‌کردن کامل متن واقعی می‌شود — دیگر از متن کهنه بک‌فیل
            //    نمی‌کنیم و متن مرده زنده نمی‌شود؛
            // ۳) body_fa برای کد قدیمی main همیشه متن جاری را نشان می‌دهد.
            const bodyFaRich = cleanRichValue(f.contentRich as JSONContent | null);
            const plain = bodyFaRich ? richToPlainText(bodyFaRich) : '';
            return {
              blockKind: 'section',
              bodyFa: JSON.stringify({ heading, content: plain }),
              bodyFaRich,
              blockOrder: i + 1,
            };
          }),
        );
        if (result.demoted) {
          toast({ variant: 'warning', title: 'با حذف این بخش، صفحه دیگر شرط انتشار را ندارد و به پیش‌نویس برگشت.' });
        } else {
          toast({ variant: 'success', title: 'بلوک‌ها ذخیره شدند.' });
        }
        await load();
      } catch (e) {
        toast({ variant: 'error', title: safeErrorMessage(e, 'خطا در ذخیره بلوک‌ها.') });      }
    });
  };

  const addLink = () => {
    setLinkError(undefined);
    const toLanding = landings.find((l) => l.id === toSel);
    if (!toLanding) {
      setLinkError('صفحهٔ مقصد را انتخاب کنید.');
      return;
    }
    if (!anchor.trim()) {
      setLinkError('متن لینک را بنویسید.');
      return;
    }
    if (fromSel !== 'custom' && fromSel === toLanding.id) {
      setLinkError('مبدأ و مقصد نمی‌توانند یکی باشند.');
      return;
    }
    if (fromSel === 'custom' && !fromPathCustom.trim()) {
      setLinkError('مسیر مبدأ دستی را بنویسید.');
      return;
    }
    const input: LinkInput =
      fromSel === 'custom'
        ? { fromPath: fromPathCustom.trim(), toPath: toLanding.urlPath, anchorFa: anchor.trim() }
        : { fromLandingId: fromSel, toPath: toLanding.urlPath, anchorFa: anchor.trim() };
    startTransition(async () => {
      try {
        await createLink(input);
        setAnchor('');
        setFromPathCustom('');
        toast({ variant: 'success', title: 'لینک داخلی ثبت شد.' });
        await load();
      } catch (e) {
        toast({ variant: 'error', title: safeErrorMessage(e, 'خطا در ثبت لینک.') });      }
    });
  };

  const removeLink = (id: string) => {
    startTransition(async () => {
      try {
        const result = await deleteLink(id);
        if (result.demoted) {
          toast({ variant: 'warning', title: 'با حذف این لینک، صفحه دیگر شرط انتشار را ندارد و به پیش‌نویس برگشت.' });
        } else {
          toast({ variant: 'success', title: 'لینک حذف شد.' });
        }
        await load();
      } catch (e) {
        toast({ variant: 'error', title: safeErrorMessage(e, 'خطا در حذف لینک.') });      }
    });
  };

  const landingName = (id: string | null) => {
    if (!id) return null;
    const l = landings.find((x) => x.id === id);
    return l ? l.titleFa : null;
  };

  // ۶ چک نهایی گیت، خوانده‌شده از خروجی checkQualityGate (مرجع نهایی: سرور)
  const missing = (frag: string) => (gate?.reasons ?? []).some((r) => r.includes(frag));
  const checks = gate
    ? [
        { label: 'کد یکتای صفحه', ok: !missing('queryOwner') },
        { label: 'توضیحات متا', ok: !missing('metaDescriptionFa') },
        { label: 'تیتر صفحه (H1)', ok: !missing('h1Fa') },
        { label: 'دست‌کم یک بلوک محتوایی', ok: !missing('بلوک محتوایی') },
        { label: 'دست‌کم یک لینک خروجی', ok: !missing('لینک داخلی خروجی') },
        { label: 'دست‌کم یک لینک ورودی', ok: !missing('لینک ورودی') },
      ]
    : [];

  if (loading) {
    return <p className="p-6 text-center text-panel-body text-muted-foreground">در حال بارگذاری…</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-panel-label font-semibold text-foreground">چک‌لیست انتشار «{titleFa}»</h3>
        <p className="mt-1 text-panel-caption text-muted-foreground">
          انتشار فقط وقتی ممکن است که هر ۶ شرط زیر سبز باشد.
        </p>
        <ul className="mt-3 space-y-2">
          {checks.map((c) => (
            <li key={c.label} className="flex items-center gap-2 text-panel-body">
              <span
                className={`grid size-5 place-items-center rounded-full ${c.ok ? 'bg-success/15 text-success' : 'bg-muted text-muted-foreground'}`}
              >
                {c.ok ? <Check className="size-3.5" /> : <X className="size-3.5" />}
              </span>
              <span className={c.ok ? 'text-foreground' : 'text-muted-foreground'}>{c.label}</span>
            </li>
          ))}
        </ul>
        {gate && !gate.canPublish ? (
          <Alert variant="warning" title="هنوز آمادهٔ انتشار نیست" className="mt-3">
            <ul className="mt-1 list-disc space-y-0.5 pe-4 text-panel-caption">
              {gate.reasons.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </Alert>
        ) : null}
        {gate?.canPublish ? (
          <Alert variant="success" title="آمادهٔ انتشار است" className="mt-3">
            از ستون «وضعیت» در جدول، «منتشرشده» را انتخاب کنید.
          </Alert>
        ) : null}
      </div>

      <div className="border-t border-border pt-5">
        <BlockEditor
          kind="section"
          title="بلوک‌های محتوا"
          hint="هر بلوک یک تیتر و یک متن غنی دارد؛ به همان ترتیب نمایش داده می‌شوند. جدول، لیست، نقل‌قول، عکس با زیرنویس و دکمهٔ تماس هم داخل متن می‌آید."
          value={sections}
          onChange={(next) => {
            setSections(next);
            setBlocksError(undefined);
          }}
          error={blocksError}
          sectionBodyEditor="rich"
        />
        {richReady === false && (
          <ColumnNotice>
            ستون متن غنی هنوز در دیتابیس ساخته نشده؛ قالب‌بندی فعلاً ذخیره
            نمی‌شود، ولی متن ساده می‌ماند و چیزی گم نمی‌شود.
          </ColumnNotice>
        )}
        <div className="mt-3 flex gap-2">
          <Button onClick={saveBlocks} disabled={pending}>
            {pending ? 'در حال ذخیره…' : 'ذخیره بلوک‌ها'}
          </Button>
          <Button variant="outline" type="button" onClick={() => setShowPreview((v) => !v)}>
            {showPreview ? 'بستن پیش‌نمایش' : 'پیش‌نمایش متن'}
          </Button>
        </div>
        {showPreview && (
          <div className="mt-4 space-y-6 rounded-md border border-border bg-card p-6" dir="rtl">
            <p className="text-panel-caption text-muted-foreground">
              پیش‌نمایش متن — همان‌طور که روی سایت دیده می‌شود.
            </p>
            {sections.length === 0 && (
              <p className="text-panel-body text-muted-foreground">هنوز بلوکی نیست.</p>
            )}
            {sections.map((raw, idx) => {
              const f = readItem('section', raw);
              const heading = String(f.heading ?? '');
              const body = richFallback(
                f.contentRich as JSONContent | string | null,
                String(f.content ?? ''),
              );
              if (!heading.trim() && (typeof body === 'string' ? !body.trim() : false)) return null;
              return (
                <article key={idx} className="space-y-2">
                  {heading.trim() && <h2 className="text-panel-heading font-bold">{heading}</h2>}
                  <RichText value={body} />
                </article>
              );
            })}
          </div>
        )}
      </div>

      <div className="border-t border-border pt-5">
        <h3 className="text-panel-label font-semibold text-foreground">لینک‌های داخلی</h3>
        <p className="mt-1 text-panel-caption text-muted-foreground">
          برای لینک ورودی، مبدأ را یک لندینگ دیگر و مقصد را همین صفحه انتخاب کنید.
        </p>
        {links.length === 0 ? (
          <p className="mt-3 rounded-sm border border-dashed border-border p-4 text-center text-panel-body text-muted-foreground">
            هنوز لینکی ثبت نشده است.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {links.map((l) => (
              <li key={l.id} className="flex items-center justify-between gap-2 rounded-sm border border-border p-3 text-panel-body">
                <span className="flex min-w-0 items-center gap-1.5">
                  <Link2 className="size-4 shrink-0 text-muted-foreground" />
                  <span className="truncate">
                    <span className="text-muted-foreground">{landingName(l.fromLandingId) ?? l.fromPath ?? '—'}</span>
                    <span className="mx-1 text-muted-foreground">←</span>
                    <span dir="ltr" className="font-mono text-panel-caption">{l.toPath}</span>
                    <span className="text-muted-foreground"> («{l.anchorFa}»)</span>
                  </span>
                </span>
                <Button variant="ghost" size="sm" className="shrink-0 text-destructive" onClick={() => removeLink(l.id)} disabled={pending} aria-label={`حذف لینک «${l.anchorFa}»`}>
                  <Trash2 />
                </Button>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-4 grid grid-cols-1 gap-4 rounded-sm border border-border bg-accent/30 p-4 sm:grid-cols-2">
          <Field label="از (مبدأ)" htmlFor="lk-from">
            <Select
              id="lk-from"
              value={fromSel}
              onChange={(e) => setFromSel(e.target.value)}
              options={[
                ...landings.map((l) => ({
                  value: l.id,
                  label: l.id === landingId ? `همین لندینگ (${l.titleFa})` : l.titleFa,
                })),
                { value: 'custom', label: 'مسیر دستی…' },
              ]}
            />
          </Field>
          <Field label="به (مقصد)" htmlFor="lk-to">
            <Select
              id="lk-to"
              value={toSel}
              onChange={(e) => setToSel(e.target.value)}
              options={[{ value: '', label: 'انتخاب کنید…' }, ...landings.map((l) => ({ value: l.id, label: `${l.titleFa} (${l.urlPath})` }))]}
            />
          </Field>
          {fromSel === 'custom' ? (
            <Field label="مسیر مبدأ دستی" htmlFor="lk-from-path" error={undefined}>
              <Input id="lk-from-path" dir="ltr" value={fromPathCustom} onChange={(e) => setFromPathCustom(e.target.value)} placeholder="/tours" />
            </Field>
          ) : null}
          <Field label="متن لینک" htmlFor="lk-anchor" error={linkError}>
            <Input id="lk-anchor" value={anchor} onChange={(e) => { setAnchor(e.target.value); setLinkError(undefined); }} placeholder="مثلاً تور استانبول" />
          </Field>
        </div>
        <div className="mt-3">
          <Button variant="outline" onClick={addLink} disabled={pending}>
            {pending ? 'در حال ثبت…' : 'افزودن لینک داخلی'}
          </Button>
        </div>
      </div>

      <div className="border-t border-border pt-5">
        <h3 className="text-panel-label font-semibold text-foreground">لینک‌های ورودی به این صفحه</h3>
        <p className="mt-1 text-panel-caption text-muted-foreground">
          فقط‌خواندنی — همین‌ها هستند که چک «دست‌کم یک لینک ورودی» گیت را سبز می‌کنند.
        </p>
        {inLinks.length === 0 ? (
          <p className="mt-3 rounded-sm border border-dashed border-border p-4 text-center text-panel-body text-muted-foreground">
            هنوز لینک ورودی‌ای به این صفحه ثبت نشده است.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {inLinks.map((l) => (
              <li key={l.id} className="flex items-center gap-2 rounded-sm border border-border p-3 text-panel-body">
                <Link2 className="size-4 shrink-0 text-muted-foreground" />
                <span className="min-w-0 truncate">
                  <span className="text-muted-foreground">{landingName(l.fromLandingId) ?? l.fromPath ?? '—'}</span>
                  <span className="mx-1 text-muted-foreground">←</span>
                  <span className="text-muted-foreground">این صفحه</span>
                  <span className="text-muted-foreground"> («{l.anchorFa}»)</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex justify-end">
        <Button variant="ghost" onClick={refresh} disabled={pending}>
          تازه‌سازی
        </Button>
      </div>
    </div>
  );
}
