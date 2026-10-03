'use client';

/**
 * blocks/rivan-blocks.tsx — پنج بلوک تخصصی ریوان سفر برای ویرایشگر TipTap.
 *
 * هر بلوک: یک Node اتم (attrs تمیز JSON) + نمای داخل ویرایشگر (NodeView)
 * با دکمهٔ ویرایش/حذف. رندر عمومی در RichText.tsx است (بدون تایپ‌تپ).
 */
import * as React from 'react';
import { Node, mergeAttributes } from '@tiptap/core';
import { NodeViewWrapper, ReactNodeViewRenderer, type NodeViewProps } from '@tiptap/react';
import { Pencil, Trash2, Phone } from 'lucide-react';
import { formatFaPrice } from './format';
import {
  TourPickerDialog,
  PriceTableDialog,
  FaqDialog,
  GalleryDialog,
  CallCtaDialog,
} from './block-dialogs';
import type {
  TourCardAttrs,
  TourCardSnapshot,
  TourPickerHit,
  PriceTableAttrs,
  FaqBlockAttrs,
  PhotoGalleryAttrs,
  CallCtaAttrs,
} from './types';

const str = (v: unknown): string => (typeof v === 'string' ? v : '');
const nullableStr = (v: unknown): string | null => {
  const s = str(v).trim();
  return s ? s : null;
};

function BlockActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="rich-block-actions" contentEditable={false}>
      <button type="button" className="rich-block-action" onClick={onEdit} aria-label="ویرایش بلوک">
        <Pencil />
      </button>
      <button
        type="button"
        className="rich-block-action rich-block-action--danger"
        onClick={onDelete}
        aria-label="حذف بلوک"
      >
        <Trash2 />
      </button>
    </div>
  );
}

/* ————————————————— کارت تور ————————————————— */

function coerceTourCard(node: NodeViewProps['node']): TourCardAttrs {
  const a = (node.attrs ?? {}) as Record<string, unknown>;
  const raw = a.snapshot;
  let snapshot: TourCardSnapshot | null = null;
  if (raw && typeof raw === 'object') {
    const r = raw as Record<string, unknown>;
    const price = Number(r.price);
    snapshot = {
      title: str(r.title),
      image: str(r.image),
      duration: str(r.duration),
      destination: str(r.destination),
      price: Number.isFinite(price) && price > 0 ? price : null,
      badge: nullableStr(r.badge),
      statusLabel: nullableStr(r.statusLabel),
    };
  }
  return { tourSlug: str(a.tourSlug), snapshot };
}

function snapshotFromHit(hit: TourPickerHit): TourCardSnapshot {
  return {
    title: hit.title,
    image: hit.image,
    duration: hit.duration,
    destination: hit.destination,
    price: hit.price,
    badge: hit.badge,
    statusLabel: hit.statusLabel,
  };
}

function TourCardView({ node, updateAttributes, deleteNode }: NodeViewProps) {
  const [editOpen, setEditOpen] = React.useState(false);
  const attrs = coerceTourCard(node);
  const s = attrs.snapshot;
  const price = formatFaPrice(s?.price);

  return (
    <NodeViewWrapper className="rich-block rich-block-tourcard" data-drag-handle>
      <BlockActions onEdit={() => setEditOpen(true)} onDelete={deleteNode} />
      {s ? (
        <div className="rich-block-tourcard__card">
          {s.image && <img src={s.image} alt="" className="rich-block-tourcard__img" />}
          <div className="rich-block-tourcard__body">
            <p className="rich-block-tourcard__title">{s.title || 'کارت تور'}</p>
            <p className="rich-block-tourcard__meta">
              {[s.destination, s.duration, s.statusLabel].filter(Boolean).join(' · ')}
            </p>
            <p className="rich-block-tourcard__price">{price ? `${price} تومان` : 'استعلام قیمت'}</p>
          </div>
        </div>
      ) : (
        <p className="rich-block-empty">کارت تور — توری انتخاب نشده است.</p>
      )}
      <TourPickerDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        initialSlug={attrs.tourSlug || undefined}
        onConfirm={(hit) => {
          updateAttributes({ tourSlug: hit.slug, snapshot: snapshotFromHit(hit) });
          setEditOpen(false);
        }}
      />
    </NodeViewWrapper>
  );
}

export const TourCardNode = Node.create({
  name: 'tourCard',
  group: 'block',
  atom: true,
  draggable: true,
  addAttributes() {
    return {
      tourSlug: { default: '' },
      snapshot: { default: null },
    };
  },
  parseHTML() {
    return [
      {
        tag: 'div[data-tour-card]',
        getAttrs: (el) => ({
          tourSlug: (el as HTMLElement).dataset.tourSlug ?? '',
        }),
      },
    ];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-tour-card': '',
        'data-tour-slug': str((HTMLAttributes as Record<string, unknown>).tourSlug),
      }),
    ];
  },
  addNodeView() {
    return ReactNodeViewRenderer(TourCardView);
  },
});

/* ————————————————— جدول قیمت ————————————————— */

function coercePriceTable(node: NodeViewProps['node']): PriceTableAttrs {
  const a = (node.attrs ?? {}) as Record<string, unknown>;
  const rows = Array.isArray(a.rows)
    ? (a.rows as Array<Record<string, unknown>>)
        .map((r) => ({ label: str(r.label), price: str(r.price) }))
        .filter((r) => r.label || r.price)
    : [];
  return { title: nullableStr(a.title), rows };
}

function PriceTableView({ node, updateAttributes, deleteNode }: NodeViewProps) {
  const [editOpen, setEditOpen] = React.useState(false);
  const attrs = coercePriceTable(node);
  const preview = attrs.rows.slice(0, 4);

  return (
    <NodeViewWrapper className="rich-block rich-block-pricetable" data-drag-handle>
      <BlockActions onEdit={() => setEditOpen(true)} onDelete={deleteNode} />
      {attrs.title && <p className="rich-block__title">{attrs.title}</p>}
      {preview.length > 0 ? (
        <table className="rich-block-pricetable__table">
          <tbody>
            {preview.map((r, i) => (
              <tr key={i}>
                <td>{r.label}</td>
                <td>{r.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="rich-block-empty">جدول قیمت — ردیفی ندارد.</p>
      )}
      {attrs.rows.length > preview.length && (
        <p className="rich-block-more">و {attrs.rows.length - preview.length} ردیف دیگر…</p>
      )}
      <PriceTableDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        initial={attrs}
        onConfirm={(next) => {
          updateAttributes({ title: next.title, rows: next.rows });
          setEditOpen(false);
        }}
      />
    </NodeViewWrapper>
  );
}

export const PriceTableNode = Node.create({
  name: 'priceTable',
  group: 'block',
  atom: true,
  draggable: true,
  addAttributes() {
    return {
      title: { default: null },
      rows: { default: [] },
    };
  },
  parseHTML() {
    return [{ tag: 'div[data-price-table]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-price-table': '' })];
  },
  addNodeView() {
    return ReactNodeViewRenderer(PriceTableView);
  },
});

/* ————————————————— پرسش‌وپاسخ ————————————————— */

function coerceFaq(node: NodeViewProps['node']): FaqBlockAttrs {
  const a = (node.attrs ?? {}) as Record<string, unknown>;
  const items = Array.isArray(a.items)
    ? (a.items as Array<Record<string, unknown>>)
        .map((x) => ({ question: str(x.question), answer: str(x.answer) }))
        .filter((x) => x.question)
    : [];
  return { title: nullableStr(a.title), items };
}

function FaqView({ node, updateAttributes, deleteNode }: NodeViewProps) {
  const [editOpen, setEditOpen] = React.useState(false);
  const attrs = coerceFaq(node);
  const preview = attrs.items.slice(0, 3);

  return (
    <NodeViewWrapper className="rich-block rich-block-faq" data-drag-handle>
      <BlockActions onEdit={() => setEditOpen(true)} onDelete={deleteNode} />
      {attrs.title && <p className="rich-block__title">{attrs.title}</p>}
      {preview.length > 0 ? (
        <div className="rich-block-faq__list">
          {preview.map((x, i) => (
            <details key={i} className="rich-block-faq__item">
              <summary>{x.question}</summary>
              <p>{x.answer || '—'}</p>
            </details>
          ))}
        </div>
      ) : (
        <p className="rich-block-empty">پرسش‌وپاسخ — پرسشی ندارد.</p>
      )}
      {attrs.items.length > preview.length && (
        <p className="rich-block-more">و {attrs.items.length - preview.length} پرسش دیگر…</p>
      )}
      <FaqDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        initial={attrs}
        onConfirm={(next) => {
          updateAttributes({ title: next.title, items: next.items });
          setEditOpen(false);
        }}
      />
    </NodeViewWrapper>
  );
}

export const FaqBlockNode = Node.create({
  name: 'faqBlock',
  group: 'block',
  atom: true,
  draggable: true,
  addAttributes() {
    return {
      title: { default: null },
      items: { default: [] },
    };
  },
  parseHTML() {
    return [{ tag: 'div[data-faq-block]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-faq-block': '' })];
  },
  addNodeView() {
    return ReactNodeViewRenderer(FaqView);
  },
});

/* ————————————————— گالری عکس ————————————————— */

function coerceGallery(node: NodeViewProps['node']): PhotoGalleryAttrs {
  const a = (node.attrs ?? {}) as Record<string, unknown>;
  const images = Array.isArray(a.images)
    ? (a.images as Array<Record<string, unknown>>)
        .map((x) => ({
          url: str(x.url),
          caption: nullableStr(x.caption),
          alt: nullableStr(x.alt),
        }))
        .filter((x) => x.url)
    : [];
  return { images };
}

function PhotoGalleryView({ node, updateAttributes, deleteNode }: NodeViewProps) {
  const [editOpen, setEditOpen] = React.useState(false);
  const attrs = coerceGallery(node);
  const preview = attrs.images.slice(0, 4);

  return (
    <NodeViewWrapper className="rich-block rich-block-gallery" data-drag-handle>
      <BlockActions onEdit={() => setEditOpen(true)} onDelete={deleteNode} />
      {preview.length > 0 ? (
        <div className="rich-block-gallery__grid">
          {preview.map((img, i) => (
            <figure key={i}>
              <img src={img.url} alt="" />
              {img.caption && <figcaption>{img.caption}</figcaption>}
            </figure>
          ))}
        </div>
      ) : (
        <p className="rich-block-empty">گالری عکس — عکسی ندارد.</p>
      )}
      {attrs.images.length > preview.length && (
        <p className="rich-block-more">و {attrs.images.length - preview.length} عکس دیگر…</p>
      )}
      <GalleryDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        initial={attrs}
        onConfirm={(next) => {
          updateAttributes({ images: next.images });
          setEditOpen(false);
        }}
      />
    </NodeViewWrapper>
  );
}

export const PhotoGalleryNode = Node.create({
  name: 'photoGallery',
  group: 'block',
  atom: true,
  draggable: true,
  addAttributes() {
    return {
      images: { default: [] },
    };
  },
  parseHTML() {
    return [{ tag: 'div[data-photo-gallery]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-photo-gallery': '' })];
  },
  addNodeView() {
    return ReactNodeViewRenderer(PhotoGalleryView);
  },
});

/* ————————————————— دکمهٔ درخواست تماس ————————————————— */

function coerceCallCta(node: NodeViewProps['node']): CallCtaAttrs {
  const a = (node.attrs ?? {}) as Record<string, unknown>;
  return {
    heading: nullableStr(a.heading),
    label: str(a.label) || 'درخواست تماس',
    phoneHref: str(a.phoneHref),
    phoneDisplay: str(a.phoneDisplay),
    note: nullableStr(a.note),
  };
}

function CallCtaView({ node, updateAttributes, deleteNode }: NodeViewProps) {
  const [editOpen, setEditOpen] = React.useState(false);
  const attrs = coerceCallCta(node);

  return (
    <NodeViewWrapper className="rich-block rich-block-callcta" data-drag-handle>
      <BlockActions onEdit={() => setEditOpen(true)} onDelete={deleteNode} />
      <div className="rich-block-callcta__banner">
        {attrs.heading && <p className="rich-block-callcta__heading">{attrs.heading}</p>}
        <span className="rich-block-callcta__btn">
          <Phone />
          {attrs.label}
          {attrs.phoneDisplay && <span className="rich-block-callcta__phone">{attrs.phoneDisplay}</span>}
        </span>
        {attrs.note && <p className="rich-block-callcta__note">{attrs.note}</p>}
      </div>
      <CallCtaDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        initial={attrs}
        onConfirm={(next) => {
          updateAttributes({ ...next });
          setEditOpen(false);
        }}
      />
    </NodeViewWrapper>
  );
}

export const CallCtaNode = Node.create({
  name: 'callCta',
  group: 'block',
  atom: true,
  draggable: true,
  addAttributes() {
    return {
      heading: { default: null },
      label: { default: 'درخواست تماس' },
      phoneHref: { default: '' },
      phoneDisplay: { default: '' },
      note: { default: null },
    };
  },
  parseHTML() {
    return [{ tag: 'div[data-call-cta]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-call-cta': '' })];
  },
  addNodeView() {
    return ReactNodeViewRenderer(CallCtaView);
  },
});

/* ————————————————— بستهٔ اکستنشن‌ها ————————————————— */

/** هر پنج بلوک؛ RichEditorInner در حالت full خودش آن‌ها را سوار می‌کند. */
export const rivanBlockExtensions = [
  TourCardNode,
  PriceTableNode,
  FaqBlockNode,
  PhotoGalleryNode,
  CallCtaNode,
];
