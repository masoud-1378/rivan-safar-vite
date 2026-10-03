'use client';

/**
 * blocks/RivanBlocksToolbar.tsx — دکمه‌های پنج بلوک تخصصی ریوان سفر.
 *
 * این نوار «ردیف اول» ویرایشگر است (به‌خواست مسعود: جلوی چشم، نه ته منو).
 * از طریق extraToolbar ویرایشگر با render-prop سوار می‌شود تا به
 * نمونهٔ editor دسترسی داشته باشد:
 *   <RichEditor extraToolbar={(editor) => <RivanBlocksToolbar editor={editor} />} />
 * در حالت full اگر چیزی داده نشود، RichEditorInner خودش همین را می‌گذارد.
 */
import * as React from 'react';
import type { Editor } from '@tiptap/react';
import { Ticket, Wallet, MessageCircleQuestion, Images, PhoneCall } from 'lucide-react';
import { Tooltip } from '@/components/ui/tooltip';
import {
  TourPickerDialog,
  PriceTableDialog,
  FaqDialog,
  GalleryDialog,
  CallCtaDialog,
} from './block-dialogs';
import { getCallCtaDefaults } from './tour-search';
import { BLOCK_NODE_TYPES, type CallCtaAttrs, type TourPickerHit } from './types';

function BlockTool({
  title,
  onClick,
  children,
}: {
  title: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Tooltip content={title}>
      <button type="button" className="rich-editor-tool rich-editor-tool--block" onClick={onClick} aria-label={title}>
        {children}
      </button>
    </Tooltip>
  );
}

function Divider() {
  return <span className="rich-editor-divider" aria-hidden="true" />;
}

export function RivanBlocksToolbar({ editor }: { editor: Editor }) {
  const [tourOpen, setTourOpen] = React.useState(false);
  const [priceOpen, setPriceOpen] = React.useState(false);
  const [faqOpen, setFaqOpen] = React.useState(false);
  const [galleryOpen, setGalleryOpen] = React.useState(false);
  const [ctaOpen, setCtaOpen] = React.useState(false);
  const [ctaInitial, setCtaInitial] = React.useState<CallCtaAttrs | null>(null);

  const insert = (type: string, attrs: object) => {
    editor.chain().focus().insertContent({ type, attrs: attrs as Record<string, unknown> }).run();
  };

  const openCta = async () => {
    if (!ctaInitial) {
      try {
        const d = await getCallCtaDefaults();
        setCtaInitial({ heading: d.heading, label: d.label, phoneHref: d.phoneHref, phoneDisplay: d.phoneDisplay, note: null });
      } catch {
        setCtaInitial({ heading: null, label: 'درخواست تماس', phoneHref: '', phoneDisplay: '', note: null });
      }
    }
    setCtaOpen(true);
  };

  const insertTour = (hit: TourPickerHit) => {
    insert(BLOCK_NODE_TYPES.tourCard, {
      tourSlug: hit.slug,
      snapshot: {
        title: hit.title,
        image: hit.image,
        duration: hit.duration,
        destination: hit.destination,
        price: hit.price,
        badge: hit.badge,
        statusLabel: hit.statusLabel,
      },
    });
    setTourOpen(false);
  };

  return (
    <>
      <BlockTool title="کارت تور" onClick={() => setTourOpen(true)}>
        <Ticket />
      </BlockTool>
      <BlockTool title="جدول قیمت" onClick={() => setPriceOpen(true)}>
        <Wallet />
      </BlockTool>
      <BlockTool title="پرسش‌وپاسخ" onClick={() => setFaqOpen(true)}>
        <MessageCircleQuestion />
      </BlockTool>
      <BlockTool title="گالری عکس" onClick={() => setGalleryOpen(true)}>
        <Images />
      </BlockTool>
      <BlockTool title="دکمهٔ درخواست تماس" onClick={openCta}>
        <PhoneCall />
      </BlockTool>
      <Divider />

      <TourPickerDialog open={tourOpen} onOpenChange={setTourOpen} onConfirm={insertTour} />
      <PriceTableDialog
        open={priceOpen}
        onOpenChange={setPriceOpen}
        initial={{ title: null, rows: [] }}
        onConfirm={(attrs) => {
          insert(BLOCK_NODE_TYPES.priceTable, attrs as unknown as Record<string, unknown>);
          setPriceOpen(false);
        }}
      />
      <FaqDialog
        open={faqOpen}
        onOpenChange={setFaqOpen}
        initial={{ title: null, items: [] }}
        onConfirm={(attrs) => {
          insert(BLOCK_NODE_TYPES.faqBlock, attrs as unknown as Record<string, unknown>);
          setFaqOpen(false);
        }}
      />
      <GalleryDialog
        open={galleryOpen}
        onOpenChange={setGalleryOpen}
        initial={{ images: [] }}
        onConfirm={(attrs) => {
          insert(BLOCK_NODE_TYPES.photoGallery, attrs as unknown as Record<string, unknown>);
          setGalleryOpen(false);
        }}
      />
      {ctaInitial && (
        <CallCtaDialog
          open={ctaOpen}
          onOpenChange={setCtaOpen}
          initial={ctaInitial}
          onConfirm={(attrs) => {
            insert(BLOCK_NODE_TYPES.callCta, attrs as unknown as Record<string, unknown>);
            setCtaOpen(false);
          }}
        />
      )}
    </>
  );
}
