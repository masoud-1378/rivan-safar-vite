import * as React from 'react';
import { normalizeRichValue, type JSONContent, type RichMark, type RichNode } from '@/lib/rich-text';
import { Phone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TourCardBlock } from './blocks/TourCardBlock';

/**
 * RichText — رندرر عمومی متن غنی. سرورکامپوننت؛ هیچ ایمپورتی از تایپ‌تپ ندارد.
 *
 * امنیت: هیچ‌وقت `dangerouslySetInnerHTML` از رشتهٔ خام استفاده نمی‌شود.
 * فقط نودهای JSON تایپ‌تپ شناخته‌شده (allowlist) رندر می‌شوند؛ متن با
 * React رندر می‌شود پس خودبه‌خود escape است.
 */

const VIDEO_HOSTS = new Set([
  'www.youtube-nocookie.com',
  'www.youtube.com',
  'youtube.com',
  'www.aparat.com',
  'aparat.com',
]);

function safeHref(href: unknown): string | null {
  if (typeof href !== 'string') return null;
  const t = href.trim();
  if (/^(https?:|mailto:)/i.test(t)) return t;
  return null;
}

/** خوانش امن attr رشته‌ای از نود. */
function strAttr(node: RichNode, name: string): string {
  const v = node.attrs?.[name];
  return typeof v === 'string' ? v : '';
}

/** attr رشته‌ای خالی → null. */
function nullableStrAttr(node: RichNode, name: string): string | null {
  const s = strAttr(node, name).trim();
  return s ? s : null;
}

function safeVideoSrc(src: unknown): string | null {
  if (typeof src !== 'string') return null;
  try {
    const u = new URL(src.trim());
    if (u.protocol !== 'https:') return null;
    if (!VIDEO_HOSTS.has(u.hostname.toLowerCase())) return null;
    return u.toString();
  } catch {
    return null;
  }
}

/** فقط tel: — برای دکمهٔ تماس. */
function safeTel(href: unknown): string | null {
  if (typeof href !== 'string') return null;
  const t = href.trim();
  return /^tel:\+?[\d][\d-]*$/i.test(t) ? t : null;
}

function applyMarks(text: string, marks: RichMark[] | undefined, key: string): React.ReactNode {
  let node: React.ReactNode = text;
  for (const mark of marks ?? []) {
    switch (mark.type) {
      case 'bold':
        node = <strong key={key + '-b'}>{node}</strong>;
        break;
      case 'italic':
        node = <em key={key + '-i'}>{node}</em>;
        break;
      case 'underline':
        node = <u key={key + '-u'}>{node}</u>;
        break;
      case 'strike':
        node = <s key={key + '-s'}>{node}</s>;
        break;
      case 'link': {
        const href = safeHref(mark.attrs?.['href']);
        if (!href) break;
        node = (
          <a key={key + '-a'} href={href} target="_blank" rel="noopener noreferrer">
            {node}
          </a>
        );
        break;
      }
      default:
        break; // نشانهٔ ناشناخته نادیده گرفته می‌شود
    }
  }
  return node;
}

function renderInline(node: RichNode, key: string): React.ReactNode {
  if (node.type === 'text') {
    // \n داخل متن (از تبدیل متن تخت) → <br>
    const parts = (node.text ?? '').split('\n');
    return parts.map((part, i) => (
      <React.Fragment key={`${key}-${i}`}>
        {i > 0 && <br />}
        {applyMarks(part, node.marks, `${key}-${i}`)}
      </React.Fragment>
    ));
  }
  if (node.type === 'hardBreak') return <br key={key} />;
  return null;
}

function renderChildren(content: RichNode[] | undefined, keyPrefix: string): React.ReactNode {
  return (content ?? []).map((child, i) => renderNode(child, `${keyPrefix}-${i}`));
}

function renderNode(node: RichNode, key: string): React.ReactNode {
  const children = renderChildren(node.content, key);
  switch (node.type) {
    case 'doc':
      return <React.Fragment key={key}>{children}</React.Fragment>;
    case 'paragraph':
      // پاراگراف خالیِ انتهاییِ ویرایشگر را چاپ نکن
      if (!node.content?.length) return null;
      return <p key={key}>{children}</p>;
    case 'heading': {
      const level = node.attrs?.['level'];
      if (level === 2) return <h2 key={key}>{children}</h2>;
      if (level === 3) return <h3 key={key}>{children}</h3>;
      return <p key={key}>{children}</p>; // سطح ناشناخته → پاراگراف
    }
    case 'bulletList':
      return <ul key={key}>{children}</ul>;
    case 'orderedList':
      return <ol key={key}>{children}</ol>;
    case 'listItem':
      return <li key={key}>{children}</li>;
    case 'blockquote':
      return <blockquote key={key}>{children}</blockquote>;
    case 'horizontalRule':
      return <hr key={key} />;
    case 'text':
    case 'hardBreak':
      return renderInline(node, key);
    case 'image': {
      const src = safeHref(node.attrs?.['src']);
      if (!src) return null;
      const alt = typeof node.attrs?.['alt'] === 'string' ? (node.attrs['alt'] as string) : '';
      const caption = typeof node.attrs?.['caption'] === 'string' ? (node.attrs['caption'] as string) : '';
      const img = <img src={src} alt={alt} loading="lazy" />;
      if (caption.trim()) {
        return (
          <figure key={key}>
            {img}
            <figcaption>{caption}</figcaption>
          </figure>
        );
      }
      return <React.Fragment key={key}>{img}</React.Fragment>;
    }
    case 'videoEmbed': {
      const src = safeVideoSrc(node.attrs?.['src']);
      if (!src) return null;
      return (
        <div key={key} className="rich-video">
          <iframe src={src} title="ویدیو" allowFullScreen loading="lazy" />
        </div>
      );
    }
    /* ——— بلوک‌های تخصصی ریوان سفر ——— */
    case 'tourCard': {
      const tourSlug = typeof node.attrs?.['tourSlug'] === 'string' ? (node.attrs['tourSlug'] as string) : '';
      const snapshot: unknown = node.attrs?.['snapshot'];
      if (!tourSlug.trim() && !(snapshot && typeof snapshot === 'object')) return null;
      return <TourCardBlock key={key} tourSlug={tourSlug} snapshot={snapshot} />;
    }
    case 'priceTable': {
      const rawRows: unknown = node.attrs?.['rows'];
      const rows = (Array.isArray(rawRows) ? rawRows : [])
        .map((r) => {
          const rec = (r ?? {}) as Record<string, unknown>;
          return {
            label: typeof rec.label === 'string' ? rec.label : '',
            price: typeof rec.price === 'string' ? rec.price : '',
          };
        })
        .filter((r) => r.label.trim() || r.price.trim());
      if (rows.length === 0) return null;
      const title = nullableStrAttr(node, 'title');
      return (
        <div key={key} className="rich-price-table">
          {title && <p className="rich-price-table__title">{title}</p>}
          <table>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td>{r.label}</td>
                  <td>{r.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    case 'faqBlock': {
      const rawItems: unknown = node.attrs?.['items'];
      const items = (Array.isArray(rawItems) ? rawItems : [])
        .map((x) => {
          const rec = (x ?? {}) as Record<string, unknown>;
          return {
            question: typeof rec.question === 'string' ? rec.question : '',
            answer: typeof rec.answer === 'string' ? rec.answer : '',
          };
        })
        .filter((x) => x.question.trim());
      if (items.length === 0) return null;
      const title = nullableStrAttr(node, 'title');
      return (
        <div key={key} className="rich-faq">
          {title && <p className="rich-faq__title">{title}</p>}
          {items.map((item, i) => (
            <details key={i} className="rich-faq__item">
              <summary>{item.question}</summary>
              <div className="rich-faq__answer">
                {item.answer
                  .split(/\n\s*\n/)
                  .map((p) => p.trim())
                  .filter(Boolean)
                  .map((p, j) => (
                    <p key={j}>{p}</p>
                  ))}
              </div>
            </details>
          ))}
        </div>
      );
    }
    case 'photoGallery': {
      const rawImages: unknown = node.attrs?.['images'];
      const images = (Array.isArray(rawImages) ? rawImages : [])
        .map((x) => {
          const rec = (x ?? {}) as Record<string, unknown>;
          return {
            url: typeof rec.url === 'string' ? rec.url : '',
            caption: typeof rec.caption === 'string' ? rec.caption : '',
            alt: typeof rec.alt === 'string' ? rec.alt : '',
          };
        })
        .filter((x) => safeHref(x.url));
      if (images.length === 0) return null;
      return (
        <div key={key} className="rich-gallery">
          {images.map((img, i) => (
            <figure key={i}>
              <img src={safeHref(img.url) as string} alt={img.alt} loading="lazy" />
              {img.caption.trim() && <figcaption>{img.caption}</figcaption>}
            </figure>
          ))}
        </div>
      );
    }
    case 'callCta': {
      const phoneHref = safeTel(node.attrs?.['phoneHref']);
      const phoneDisplay = strAttr(node, 'phoneDisplay').trim();
      if (!phoneHref || !phoneDisplay) return null;
      const heading = nullableStrAttr(node, 'heading');
      const note = nullableStrAttr(node, 'note');
      const label = strAttr(node, 'label').trim() || 'درخواست تماس';
      return (
        <div key={key} className="rich-call-cta">
          {heading && <p className="rich-call-cta__heading">{heading}</p>}
          <a className="rich-call-cta__btn" href={phoneHref}>
            <Phone className="rich-call-cta__icon" />
            <span>{label}</span>
            <span className="rich-call-cta__phone">{phoneDisplay}</span>
          </a>
          {note && <p className="rich-call-cta__note">{note}</p>}
        </div>
      );
    }
    case 'table':
      return (
        <table key={key}>
          <tbody>{children}</tbody>
        </table>
      );
    case 'tableRow':
      return <tr key={key}>{children}</tr>;
    case 'tableHeader':
      return <th key={key}>{children}</th>;
    case 'tableCell':
      return <td key={key}>{children}</td>;
    default:
      return null; // نود ناشناخته رندر نمی‌شود
  }
}

export interface RichTextProps {
  /** JSON تایپ‌تپ، یا رشتهٔ تخت (متن‌های قدیمی) که به پاراگراف تبدیل می‌شود */
  value: JSONContent | string | null | undefined;
  className?: string;
}

export function RichText({ value, className }: RichTextProps) {
  const json = normalizeRichValue(value);
  if (!json) return null;
  return <div className={cn('rich-text', className)}>{renderNode(json, 'root')}</div>;
}
