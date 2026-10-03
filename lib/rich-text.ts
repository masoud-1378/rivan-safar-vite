/**
 * lib/rich-text.ts — هلپرهای متن غنی (JSON تایپ‌تپ)، بدون هیچ وابستگی به تایپ‌تپ.
 *
 * این فایل عمداً از `@tiptap/*` ایمپورت نمی‌کند تا رندرر سمت سرور
 * (RichText) بدون کشیدن باندل ویرایشگر کار کند. تایپ `JSONContent` این‌جا
 * ساختاری تعریف شده و با خروجی `editor.getJSON()` سازگار است.
 */

/** یک نود از درخت JSON تایپ‌تپ (شکل ساختاری؛ کافی برای ذخیره و رندر). */
export interface RichNode {
  type?: string;
  attrs?: Record<string, unknown>;
  content?: RichNode[];
  marks?: RichMark[];
  text?: string;
}

/** یک نشانه (mark) مثل bold یا link. */
export interface RichMark {
  type: string;
  attrs?: Record<string, unknown>;
}

/** سند متن غنی — ریشه همیشه `{ type: 'doc', content: [...] }` است. */
export type JSONContent = RichNode;

/**
 * تبدیل متن تخت به JSON تایپ‌تپ.
 *
 * الگوریتم (تیم داده معادل SQL همین را پیاده می‌کند):
 *  ۱. ابتدا و انتهای کل متن trim می‌شود.
 *  ۲. متن بر اساس «خط خالی» (یک یا چند خط که فقط فاصله دارند: ‎/\n\s*\n/‎)
 *     به بندها شکسته می‌شود.
 *  ۳. هر بند → یک نود `paragraph`. خط‌های داخل یک بند با ‎\n‎ به هم
 *     می‌چسبند (hardBreak ساخته نمی‌شود؛ رندرر ‎\n‎ را به ‎<br>‎ تبدیل می‌کند).
 *  ۴. متن خالی (یا فقط فاصله) → سند با یک پاراگراف خالی.
 */
export function richFromPlainText(text: string): JSONContent {
  const trimmed = text.trim();
  if (!trimmed) {
    return { type: 'doc', content: [{ type: 'paragraph' }] };
  }
  const paragraphs = trimmed
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\n+/g, '\n').trim())
    .filter(Boolean);
  return {
    type: 'doc',
    content: paragraphs.map((p) => ({
      type: 'paragraph',
      content: [{ type: 'text', text: p }],
    })),
  };
}

/** آیا سند هیچ متن خوانایی ندارد؟ (null، خالی، یا فقط فاصله/نود خالی) */
export function isRichEmpty(json: JSONContent | null | undefined): boolean {
  if (!json) return true;
  if (typeof json.text === 'string' && json.text.trim() !== '') return false;
  const children = json.content ?? [];
  return children.every(isRichEmpty);
}

/**
 * متن تختِ خوانا از سند غنی — برای شمارش واژه، خلاصهٔ کارت‌ها و JSON-LD.
 * نودهای hardBreak و مرز بندها به خط تازه تبدیل می‌شوند؛ بقیهٔ ساختار (لیست،
 * جدول، عکس) فقط متنشان برداشته می‌شود.
 */
export function richToPlainText(json: JSONContent | null | undefined): string {
  if (!json) return '';
  const parts: string[] = [];
  const walk = (node: RichNode): void => {
    if (node.type === 'text' && typeof node.text === 'string') {
      parts.push(node.text);
    } else if (node.type === 'hardBreak') {
      parts.push('\n');
    }
    for (const child of node.content ?? []) walk(child);
    if (node.type === 'paragraph' || node.type === 'heading' || node.type === 'listItem') {
      parts.push('\n');
    }
  };
  walk(json);
  return parts.join('').replace(/\n{3,}/g, '\n\n').trim();
}

/**
 * تمیزکاری مقدار ذخیره‌سازی: رشتهٔ تخت را به JSON تبدیل می‌کند و سند خالی را
 * به null برمی‌گرداند تا در ستون‌های `*_rich` (nullable) خالیِ واقعی بنشیند.
 */
export function cleanRichValue(value: JSONContent | string | null | undefined): JSONContent | null {
  const json = normalizeRichValue(value);
  if (!json || isRichEmpty(json)) return null;
  return json;
}

/**
 * انتخاب نمایشی: اگر نسخهٔ غنی (`*_rich`) متن خوانا دارد همان، وگرنه متن تخت
 * قدیمی. ورودی غنی می‌تواند JSON تایپ‌تپ یا (دفاعی) رشتهٔ تخت باشد.
 */
export function richFallback(
  rich: JSONContent | string | null | undefined,
  plain: string | null | undefined,
): JSONContent | string {
  const json = normalizeRichValue(rich ?? null);
  if (json && !isRichEmpty(json)) return json;
  return plain ?? '';
}

/**
 * اگر مقدار ذخیره‌شده رشتهٔ تخت بود (متن‌های قدیمیِ قبل از ویرایشگر)،
 * به JSON تبدیلش کن؛ وگرنه همان JSON را برگردان.
 */
export function normalizeRichValue(value: JSONContent | string | null | undefined): JSONContent | null {
  if (value == null) return null;
  if (typeof value === 'string') return richFromPlainText(value);
  return value;
}

/**
 * خوانش دوسویهٔ پاسخ غنی یک قلم FAQ (قرارداد تیم داده: کلید answer_rich
 * داخل آبجکت؛ دادهٔ آزمایشی قدیمی با کلید camelCase هم تحمل می‌شود).
 * برای رندر عمومی هر چهار موجودیت (QA ترک تورها، ایراد ۱).
 */
export function faqRichAnswer(f: unknown): JSONContent | string | null | undefined {
  const o = (f ?? {}) as Record<string, unknown>;
  return (o.answer_rich ?? o.answerRich) as JSONContent | string | null | undefined;
}
