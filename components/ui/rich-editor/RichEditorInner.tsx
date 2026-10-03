'use client';

import * as React from 'react';
import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
import { Node, mergeAttributes } from '@tiptap/core';
import { parseVideoUrl } from './video';
import {
  Bold, Italic, Underline as UnderlineIcon, List, ListOrdered, Quote,
  Link2, Unlink, Table as TableIcon, Image as ImageIcon, Clapperboard,
  Minus, Undo2, Redo2, AlignRight, AlignCenter, AlignLeft,
  Heading2, Heading3, Plus, Trash2, Pencil, ImagePlus,
} from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip } from '@/components/ui/tooltip';
import { DropdownMenu } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { JSONContent } from '@/lib/rich-text';
import type { PickedImage, RichEditorProps } from './types';
import { rivanBlockExtensions, RivanBlocksToolbar } from './blocks';

/* ————————————————— نود ویدیو ————————————————— */

export const VideoEmbed = Node.create({
  name: 'videoEmbed',
  group: 'block',
  atom: true,
  draggable: true,
  addAttributes() {
    return {
      src: { default: null },
      title: { default: 'ویدیو' },
    };
  },
  parseHTML() {
    return [{ tag: 'iframe[data-video-embed]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      { class: 'rich-video' },
      [
        'iframe',
        mergeAttributes(HTMLAttributes, {
          'data-video-embed': '',
          frameborder: '0',
          allowfullscreen: 'true',
        }),
      ],
    ];
  },
});

/** عکس با پشتیبانی از زیرنویس (caption) — در JSON به‌صورت attrs.caption ذخیره می‌شود. */
const CaptionedImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      caption: { default: null },
    };
  },
});

/* ————————————————— ابزارها ————————————————— */

function Tool({
  title,
  onClick,
  active,
  disabled,
  children,
}: {
  title: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Tooltip content={title}>
      <button
        type="button"
        className="rich-editor-tool"
        data-active={active ? 'true' : undefined}
        onClick={onClick}
        disabled={disabled}
        aria-label={title}
      >
        {children}
      </button>
    </Tooltip>
  );
}

function Divider() {
  return <span className="rich-editor-divider" aria-hidden="true" />;
}

/* ————————————————— دیالوگ‌ها ————————————————— */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5 text-panel-body">
      <span className="font-medium">{label}</span>
      {children}
    </label>
  );
}

function ImageDialog({
  open,
  onOpenChange,
  initial,
  pickImage,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial: { url: string; caption: string; alt: string };
  pickImage?: () => Promise<PickedImage | null>;
  onConfirm: (img: { url: string; caption: string; alt: string }) => void;
}) {
  const [url, setUrl] = React.useState(initial.url);
  const [caption, setCaption] = React.useState(initial.caption);
  const [alt, setAlt] = React.useState(initial.alt);
  const [picking, setPicking] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setUrl(initial.url);
      setCaption(initial.caption);
      setAlt(initial.alt);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open ]);

  const handlePick = async () => {
    if (!pickImage) return;
    setPicking(true);
    try {
      const picked = await pickImage();
      if (picked) {
        setUrl(picked.url);
        if (picked.caption) setCaption(picked.caption);
        if (picked.alt) setAlt(picked.alt);
      }
    } finally {
      setPicking(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="درج عکس"
      footer={
        <>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            انصراف
          </Button>
          <Button onClick={() => onConfirm({ url: url.trim(), caption: caption.trim(), alt: alt.trim() })} disabled={!url.trim()}>
            درج عکس
          </Button>
        </>
      }
    >
      <div className="space-y-4" dir="rtl">
        <Field label="نشانی عکس">
          <div className="flex gap-2">
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://…"
              dir="ltr"
              className="text-left"
            />
            {pickImage && (
              <Button variant="outline" onClick={handlePick} disabled={picking}>
                <ImagePlus className="h-4 w-4" />
                {picking ? '…' : 'انتخاب از کتابخانه'}
              </Button>
            )}
          </div>
        </Field>
        <Field label="زیرنویس (اختیاری — زیر عکس نمایش داده می‌شود)">
          <Input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="توضیح کوتاه دربارهٔ عکس" />
        </Field>
        <Field label="متن جایگزین (برای دسترس‌پذیری و سئو)">
          <Input value={alt} onChange={(e) => setAlt(e.target.value)} placeholder="عکس چه چیزی را نشان می‌دهد؟" />
        </Field>
      </div>
    </Dialog>
  );
}

function VideoDialog({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onConfirm: (embedSrc: string) => void;
}) {
  const [url, setUrl] = React.useState('');
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    if (open) {
      setUrl('');
      setError('');
    }
  }, [open ]);

  const confirm = () => {
    const src = parseVideoUrl(url);
    if (!src) {
      setError('نشانی معتبر نیست؛ فقط پیوند یوتیوب و آپارات پذیرفته می‌شود.');
      return;
    }
    onConfirm(src);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="درج ویدیو"
      description="پیوند ویدیو را از یوتیوب یا آپارات بگذارید."
      footer={
        <>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            انصراف
          </Button>
          <Button onClick={confirm} disabled={!url.trim()}>
            درج ویدیو
          </Button>
        </>
      }
    >
      <div className="space-y-2" dir="rtl">
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=…"
          dir="ltr"
          className="text-left"
        />
        {error && <p className="text-panel-body text-red-600">{error}</p>}
      </div>
    </Dialog>
  );
}

function LinkDialog({
  open,
  onOpenChange,
  initial,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial: string;
  onConfirm: (href: string) => void;
}) {
  const [url, setUrl] = React.useState(initial);

  React.useEffect(() => {
    if (open) setUrl(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open ]);

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="درج پیوند"
      footer={
        <>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            انصراف
          </Button>
          <Button onClick={() => onConfirm(url.trim())} disabled={!url.trim()}>
            ثبت پیوند
          </Button>
        </>
      }
    >
      <div dir="rtl">
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://…"
          dir="ltr"
          className="text-left"
        />
      </div>
    </Dialog>
  );
}

/* ————————————————— نوار ابزار ————————————————— */

function Toolbar({ editor, variant, pickImage }: { editor: Editor; variant: 'full' | 'light'; pickImage?: RichEditorProps['pickImage'] }) {
  const [imageOpen, setImageOpen] = React.useState(false);
  const [imageInitial, setImageInitial] = React.useState({ url: '', caption: '', alt: '' });
  const [videoOpen, setVideoOpen] = React.useState(false);
  const [linkOpen, setLinkOpen] = React.useState(false);
  const [linkInitial, setLinkInitial] = React.useState('');

  const openImageInsert = () => {
    setImageInitial({ url: '', caption: '', alt: '' });
    setImageOpen(true);
  };

  const openImageEdit = () => {
    const attrs = editor.getAttributes('image');
    setImageInitial({
      url: typeof attrs.src === 'string' ? attrs.src : '',
      caption: typeof attrs.caption === 'string' ? attrs.caption : '',
      alt: typeof attrs.alt === 'string' ? attrs.alt : '',
    });
    setImageOpen(true);
  };

  const confirmImage = (img: { url: string; caption: string; alt: string }) => {
    const attrs = { src: img.url, alt: img.alt || null, caption: img.caption || null };
    if (editor.isActive('image')) {
      editor.chain().focus().updateAttributes('image', attrs).run();
    } else {
      editor.chain().focus().insertContent({ type: 'image', attrs }).run();
    }
    setImageOpen(false);
  };

  const openLink = () => {
    if (editor.isActive('link')) {
      editor.chain().focus().unsetLink().run();
      return;
    }
    setLinkInitial(editor.getAttributes('link').href ?? '');
    setLinkOpen(true);
  };

  const isFull = variant === 'full';

  return (
    <>
      <div className="rich-editor-toolbar" dir="rtl">
        {isFull && (
          <>
            <Tool title="تیتر ۲" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })}>
              <Heading2 />
            </Tool>
            <Tool title="تیتر ۳" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })}>
              <Heading3 />
            </Tool>
            <Divider />
          </>
        )}
        <Tool title="ضخیم" onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')}>
          <Bold />
        </Tool>
        <Tool title="مورب" onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')}>
          <Italic />
        </Tool>
        {isFull && (
          <Tool title="زیرخط‌دار" onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')}>
            <UnderlineIcon />
          </Tool>
        )}
        <Divider />
        <Tool title="فهرست نشانه‌دار" onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')}>
          <List />
        </Tool>
        <Tool title="فهرست شماره‌دار" onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')}>
          <ListOrdered />
        </Tool>
        <Divider />
        <Tool title={editor.isActive('link') ? 'حذف پیوند' : 'درج پیوند'} onClick={openLink} active={editor.isActive('link')}>
          {editor.isActive('link') ? <Unlink /> : <Link2 />}
        </Tool>
        {isFull && (
          <>
            <Divider />
            <Tool title="نقل‌قول" onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')}>
              <Quote />
            </Tool>
            <DropdownMenu
              align="start"
              trigger={
                <span className={cn('rich-editor-tool')} role="button" aria-label="جدول" title="جدول">
                  <TableIcon className="h-4 w-4" />
                </span>
              }
              items={
                editor.isActive('table')
                  ? [
                      { label: 'افزودن سطر', icon: Plus, onSelect: () => editor.chain().focus().addRowAfter().run() },
                      { label: 'افزودن ستون', icon: Plus, onSelect: () => editor.chain().focus().addColumnAfter().run() },
                      { type: 'separator' },
                      { label: 'حذف سطر', icon: Trash2, onSelect: () => editor.chain().focus().deleteRow().run() },
                      { label: 'حذف ستون', icon: Trash2, onSelect: () => editor.chain().focus().deleteColumn().run() },
                      { type: 'separator' },
                      { label: 'حذف جدول', icon: Trash2, danger: true, onSelect: () => editor.chain().focus().deleteTable().run() },
                    ]
                  : [
                      {
                        label: 'درج جدول ۳×۳',
                        icon: TableIcon,
                        onSelect: () => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
                      },
                    ]
              }
            />
            <Tool title="درج عکس" onClick={openImageInsert}>
              <ImageIcon />
            </Tool>
            {editor.isActive('image') && (
              <Tool title="ویرایش عکس" onClick={openImageEdit}>
                <Pencil />
              </Tool>
            )}
            <Tool title="درج ویدیو (یوتیوب / آپارات)" onClick={() => setVideoOpen(true)}>
              <Clapperboard />
            </Tool>
            <Tool title="خط جداکننده" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
              <Minus />
            </Tool>
            <Divider />
            <Tool title="راست‌چین" onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })}>
              <AlignRight />
            </Tool>
            <Tool title="وسط‌چین" onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })}>
              <AlignCenter />
            </Tool>
            <Tool title="چپ‌چین" onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })}>
              <AlignLeft />
            </Tool>
            <Divider />
            <Tool title="بازگردانی" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
              <Undo2 />
            </Tool>
            <Tool title="تکرار" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
              <Redo2 />
            </Tool>
          </>
        )}
      </div>

      <ImageDialog
        open={imageOpen}
        onOpenChange={setImageOpen}
        initial={imageInitial}
        pickImage={pickImage}
        onConfirm={confirmImage}
      />
      <VideoDialog
        open={videoOpen}
        onOpenChange={setVideoOpen}
        onConfirm={(src) => {
          editor.chain().focus().insertContent({ type: 'videoEmbed', attrs: { src } }).run();
          setVideoOpen(false);
        }}
      />
      <LinkDialog
        open={linkOpen}
        onOpenChange={setLinkOpen}
        initial={linkInitial}
        onConfirm={(href) => {
          editor.chain().focus().setLink({ href }).run();
          setLinkOpen(false);
        }}
      />
    </>
  );
}

/* ————————————————— کامپوننت اصلی ————————————————— */

export function RichEditorInner({
  value,
  onChange,
  variant = 'full',
  placeholder,
  pickImage,
  extraToolbar,
  extraExtensions,
}: RichEditorProps) {
  const [empty, setEmpty] = React.useState(true);
  const onChangeRef = React.useRef(onChange);
  onChangeRef.current = onChange;

  const editor = useEditor(
    {
      extensions: [
        StarterKit.configure({
          heading: variant === 'full' ? { levels: [2, 3] } : false,
          blockquote: variant === 'full' ? undefined : false,
          horizontalRule: variant === 'full' ? undefined : false,
          strike: false,
          code: false,
          codeBlock: false,
        }),
        ...(variant === 'full'
          ? [
              Underline,
              TextAlign.configure({ types: ['heading', 'paragraph'], defaultAlignment: 'right' }),
              CaptionedImage.configure({ inline: false, allowBase64: true }),
              Table.configure({ resizable: true }),
              TableRow,
              TableHeader,
              TableCell,
              VideoEmbed,
            ]
          : []),
        Link.configure({ openOnClick: false, autolink: true }),
        // بلوک‌های تخصصی ریوان سفر — پیش‌فرض حالت full (ردیف اول نوار ابزار).
        // مصرف‌کننده می‌تواند با extraExtensions خودش جایگزین کند.
        ...(extraExtensions ?? (variant === 'full' ? rivanBlockExtensions : [])),
      ],
      content: (value ?? undefined) as never,
      immediatelyRender: false,
      editorProps: {
        attributes: { dir: 'rtl', class: 'rich-editor-content' },
      },
      onUpdate: ({ editor: e }) => {
        setEmpty(e.isEmpty);
        onChangeRef.current(e.getJSON() as unknown as JSONContent);
      },
      onCreate: ({ editor: e }) => {
        setEmpty(e.isEmpty);
      },
    },
    [variant],
  );

  if (!editor) return null;

  // ردیف اول نوار ابزار: اگر مصرف‌کننده چیزی نداد و حالت full است،
  // نوار بلوک‌های ریوان سفر (جلوی چشم) گذاشته می‌شود.
  const firstRow =
    extraToolbar ?? (variant === 'full' ? (e: Editor) => <RivanBlocksToolbar editor={e} /> : undefined);

  return (
    <div className="rich-editor" dir="rtl">
      {firstRow ? (
        <div className="rich-editor-toolbar rich-editor-toolbar--blocks" dir="rtl">
          {typeof firstRow === 'function' ? firstRow(editor) : firstRow}
        </div>
      ) : null}
      <Toolbar editor={editor} variant={variant} pickImage={pickImage} />
      <div className="rich-editor-body">
        {placeholder && empty && <div className="rich-editor-placeholder">{placeholder}</div>}
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
