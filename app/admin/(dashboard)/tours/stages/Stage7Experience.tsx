'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Users,
  Plus,
  Pencil,
  Trash2,
  Star,
  ImagePlus,
  X,
  MessageSquareHeart,
  Images,
  Loader2,
  Check,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Field, Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { AlertDialog } from '@/components/ui/alert-dialog';
import { DualGalleryAdd, DualImageInput } from '@/components/ui/dual-image-input';
import { useToast } from '@/components/ui/toast';
import type { TourInput } from '../actions';
import {
  listLeaders,
  createLeader,
  updateLeader,
  deleteLeader,
  uploadExperiencePhoto,
  deleteExperiencePhoto,
} from '../experience';
import type {
  TourLeaderItem,
  TourReviewItem,
  TourGalleryItem,
  LeaderInput,
  LeaderJoinMode,
} from '../experience-types';

interface Stage7ExperienceProps {
  data: TourInput;
  onChange: (fields: Partial<TourInput>) => void;
}

const EMPTY_LEADER: LeaderInput = { name: '', photo: '', bio: '', languages: '', joinMode: 'from_origin' };

function joinModeLabel(m: LeaderJoinMode): string {
  return m === 'from_origin' ? 'از مبدأ همراه گروه است' : 'در مقصد به گروه می‌پیوندد';
}

function Stars({ value, onPick, size = 'md' }: { value: number; onPick?: (n: number) => void; size?: 'sm' | 'md' }) {
  const cls = size === 'sm' ? 'w-3.5 h-3.5' : 'w-6 h-6';
  return (
    <div className="flex items-center gap-0.5" dir="ltr">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onPick?.(n)}
          className={onPick ? 'cursor-pointer' : 'cursor-default'}
          aria-label={`${n} ستاره`}
        >
          <Star
            className={`${cls} ${n <= value ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/40'}`}
          />
        </button>
      ))}
    </div>
  );
}

export default function Stage7Experience({ data, onChange }: Stage7ExperienceProps) {
  const { toast } = useToast();

  /* ── تورلیدر ── */
  const [leaders, setLeaders] = useState<TourLeaderItem[]>([]);
  const [leadersLoading, setLeadersLoading] = useState(true);
  const [leaderFormOpen, setLeaderFormOpen] = useState(false);
  const [editingLeaderId, setEditingLeaderId] = useState<string | null>(null);
  const [leaderForm, setLeaderForm] = useState<LeaderInput>(EMPTY_LEADER);
  const [leaderSaving, setLeaderSaving] = useState(false);
  const [leaderUploading, setLeaderUploading] = useState(false);
  const [deletingLeaderId, setDeletingLeaderId] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    listLeaders()
      .then((rows) => {
        if (alive) setLeaders(rows);
      })
      .catch(() => {
        if (alive) toast({ variant: 'error', title: 'فهرست تورلیدرها خوانده نشد.' });
      })
      .finally(() => {
        if (alive) setLeadersLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [toast]);

  const selectedLeader = leaders.find((l) => l.id === data.leaderId) ?? null;

  function openNewLeaderForm() {
    setEditingLeaderId(null);
    setLeaderForm(EMPTY_LEADER);
    setLeaderFormOpen(true);
  }
  function openEditLeaderForm(l: TourLeaderItem) {
    setEditingLeaderId(l.id);
    setLeaderForm({ name: l.name, photo: l.photo, bio: l.bio, languages: l.languages, joinMode: l.joinMode });
    setLeaderFormOpen(true);
  }

  async function saveLeaderForm() {
    setLeaderSaving(true);
    try {
      if (editingLeaderId) {
        const res = await updateLeader(editingLeaderId, leaderForm);
        if (res.ok === false) {
          toast({ variant: 'error', title: res.error });
          return;
        }
        setLeaders((prev) => prev.map((l) => (l.id === editingLeaderId ? { ...l, ...leaderForm, id: l.id } : l)));
        toast({ title: 'مشخصات تورلیدر به‌روز شد.' });
      } else {
        const res = await createLeader(leaderForm);
        if (res.ok === false) {
          toast({ variant: 'error', title: res.error });
          return;
        }
        setLeaders((prev) => [...prev, res.leader].sort((a, b) => a.name.localeCompare(b.name, 'fa')));
        onChange({ leaderId: res.leader.id });
        toast({ title: 'تورلیدر ساخته و به این تور وصل شد.' });
      }
      setLeaderFormOpen(false);
      setEditingLeaderId(null);
      setLeaderForm(EMPTY_LEADER);
    } finally {
      setLeaderSaving(false);
    }
  }

  async function removeLeader(id: string) {
    // دیالوگ درون‌برنامه‌ای (نه window.confirm که در اتوماسیون/موبایل گم می‌شود).
    setDeletingLeaderId(id);
  }

  async function confirmRemoveLeader() {
    const id = deletingLeaderId;
    setDeletingLeaderId(null);
    if (!id) return;
    const res = await deleteLeader(id);
    if (res.ok === false) {
      // لیدرِ وصل به تور: پیام صادقانهٔ سرور حتماً دیده می‌شود.
      toast({ variant: 'error', title: res.error });
      return;
    }
    setLeaders((prev) => prev.filter((l) => l.id !== id));
    if (data.leaderId === id) onChange({ leaderId: null });
    toast({ title: 'تورلیدر حذف شد.' });
  }

  async function uploadLeaderPhoto(file: File): Promise<string> {
    setLeaderUploading(true);
    try {
      const fd = new FormData();
      fd.set('photo', file);
      const res = await uploadExperiencePhoto('leader', fd);
      if (res.ok === false) throw new Error(res.error);
      toast({ title: 'عکس آپلود شد.' });
      return res.url;
    } finally {
      setLeaderUploading(false);
    }
  }

  /* ── نظر مسافران ── */
  const reviews: TourReviewItem[] = Array.isArray(data.reviews) ? data.reviews : [];
  const [reviewFormOpen, setReviewFormOpen] = useState(false);
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');

  function addReview() {
    const name = reviewName.trim();
    const text = reviewText.trim();
    if (name.length < 2) {
      toast({ variant: 'error', title: 'نام مسافر لازم است.' });
      return;
    }
    if (text.length < 4) {
      toast({ variant: 'error', title: 'متن نظر خیلی کوتاه است.' });
      return;
    }
    onChange({
      reviews: [
        ...reviews,
        { id: `tmp-${Date.now()}`, name, rating: reviewRating, text, isVisible: true },
      ],
    });
    setReviewName('');
    setReviewText('');
    setReviewRating(5);
    setReviewFormOpen(false);
    toast({ title: 'نظر اضافه شد؛ با ذخیرهٔ تور ثبت می‌شود.' });
  }

  function toggleReview(i: number) {
    onChange({
      reviews: reviews.map((r, idx) => (idx === i ? { ...r, isVisible: !r.isVisible } : r)),
    });
  }
  function removeReview(i: number) {
    onChange({ reviews: reviews.filter((_, idx) => idx !== i) });
  }

  /* ── گالری واقعی ── */
  const gallery: TourGalleryItem[] = Array.isArray(data.gallery) ? data.gallery : [];
  const [galleryUploading, setGalleryUploading] = useState(false);

  async function uploadGalleryFiles(files: File[]) {
    if (files.length === 0) return;
    setGalleryUploading(true);
    try {
      const added: TourGalleryItem[] = [];
      for (const file of files) {
        const fd = new FormData();
        fd.set('photo', file);
        const res = await uploadExperiencePhoto('gallery', fd);
        if (res.ok === false) {
          toast({ variant: 'error', title: res.error });
          break;
        }
        added.push({ url: res.url, caption: '' });
      }
      if (added.length > 0) {
        onChange({ gallery: [...gallery, ...added].slice(0, 30) });
        toast({ title: `${added.length} عکس به گالری اضافه شد.` });
      }
    } finally {
      setGalleryUploading(false);
    }
  }

  function setCaption(i: number, caption: string) {
    onChange({ gallery: gallery.map((g, idx) => (idx === i ? { ...g, caption } : g)) });
  }
  function removeGalleryItem(i: number) {
    const url = gallery[i]?.url;
    onChange({ gallery: gallery.filter((_, idx) => idx !== i) });
    if (url) void deleteExperiencePhoto(url);
  }

  return (
    <div className="space-y-8">
      {/* ── تورلیدر ── */}
      <section className="rounded-card border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-1">
          <Users className="w-5 h-5 text-brand-orange" />
          <h3 className="text-h4 font-bold text-text-heading">تورلیدر این حرکت</h3>
        </div>
        <p className="text-body-sm text-text-secondary mb-4">
          مسافر می‌خواهد بداند کی همراهش است. لیدر هر حرکت عوض می‌شود؛ نزدیک تاریخ حرکت همین‌جا عوضش کنید.
        </p>

        {leadersLoading ? (
          <div className="flex items-center gap-2 text-text-secondary text-body-sm">
            <Loader2 className="w-4 h-4 animate-spin" /> در حال خواندن فهرست…
          </div>
        ) : (
          <>
            <div className="grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => onChange({ leaderId: null })}
                className={`rounded-control border p-3 text-right transition-colors ${
                  !data.leaderId ? 'border-brand-orange bg-brand-orange/5' : 'border-border hover:border-muted-foreground/40'
                }`}
              >
                <div className="text-body-sm font-bold">بدون تورلیدر</div>
                <div className="text-caption text-text-secondary">بعداً مشخص می‌شود</div>
              </button>
              {leaders.map((l) => (
                <div
                  key={l.id}
                  className={`rounded-control border p-3 transition-colors ${
                    data.leaderId === l.id ? 'border-brand-orange bg-brand-orange/5' : 'border-border'
                  }`}
                >
                  <button type="button" onClick={() => onChange({ leaderId: l.id })} className="w-full text-right">
                    <div className="flex items-center gap-3">
                      {l.photo ? (
                        <img src={l.photo} alt={l.name} className="w-11 h-11 rounded-full object-cover shrink-0" />
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-muted flex items-center justify-center shrink-0">
                          <Users className="w-5 h-5 text-muted-foreground" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="text-body-sm font-bold flex items-center gap-1.5">
                          {l.name}
                          {data.leaderId === l.id && <Check className="w-4 h-4 text-brand-orange" />}
                        </div>
                        {l.languages && <div className="text-caption text-text-secondary truncate">{l.languages}</div>}
                      </div>
                    </div>
                  </button>
                  <div className="flex items-center gap-1 mt-2">
                    <Button type="button" variant="ghost" size="sm" onClick={() => openEditLeaderForm(l)}>
                      <Pencil className="w-3.5 h-3.5" /> ویرایش
                    </Button>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeLeader(l.id)}>
                      <Trash2 className="w-3.5 h-3.5" /> حذف
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {!leaderFormOpen ? (
              <Button type="button" variant="outline" size="sm" className="mt-3" onClick={openNewLeaderForm}>
                <Plus className="w-4 h-4" /> لیدر تازه
              </Button>
            ) : (
              <div className="mt-4 rounded-control border border-border bg-background p-4 space-y-3">
                <div className="text-body-sm font-bold">{editingLeaderId ? 'ویرایش تورلیدر' : 'لیدر تازه'}</div>
                <Field label="نام و نام خانوادگی *">
                  <Input value={leaderForm.name} onChange={(e) => setLeaderForm((f) => ({ ...f, name: e.target.value }))} placeholder="مثلاً علی رضایی" />
                </Field>
                <DualImageInput
                  label="عکس"
                  value={leaderForm.photo}
                  onChange={(url) => setLeaderForm((f) => ({ ...f, photo: url }))}
                  uploadFile={uploadLeaderPhoto}
                  round
                />
                <Field label="سابقه در همین مسیر">
                  <Textarea value={leaderForm.bio} onChange={(e) => setLeaderForm((f) => ({ ...f, bio: e.target.value }))} placeholder="مثلاً ۸ سال سابقه در مسیر دبی؛ مسلط به هتل‌های پالم" rows={2} />
                </Field>
                <Field label="زبان‌ها">
                  <Input value={leaderForm.languages} onChange={(e) => setLeaderForm((f) => ({ ...f, languages: e.target.value }))} placeholder="فارسی، انگلیسی، عربی" />
                </Field>
                <Field label="نحوهٔ همراهی">
                  <div className="flex flex-col gap-2">
                    {(['from_origin', 'at_destination'] as LeaderJoinMode[]).map((m) => (
                      <label key={m} className="flex items-center gap-2 text-body-sm cursor-pointer">
                        <input
                          type="radio"
                          name="joinMode"
                          checked={leaderForm.joinMode === m}
                          onChange={() => setLeaderForm((f) => ({ ...f, joinMode: m }))}
                        />
                        {joinModeLabel(m)}
                      </label>
                    ))}
                  </div>
                </Field>
                <div className="flex items-center gap-2">
                  <Button type="button" size="sm" disabled={leaderSaving} onClick={saveLeaderForm}>
                    {leaderSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    ثبت لیدر
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setLeaderFormOpen(false);
                      setEditingLeaderId(null);
                      setLeaderForm(EMPTY_LEADER);
                    }}
                  >
                    انصراف
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </section>

      {/* ── نظر مسافران ── */}
      <section className="rounded-card border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-1">
          <MessageSquareHeart className="w-5 h-5 text-brand-orange" />
          <h3 className="text-h4 font-bold text-text-heading">نظر مسافران این تور</h3>
        </div>
        <p className="text-body-sm text-text-secondary mb-4">
          چند نظر واقعی با نام و نکتهٔ مشخص، قوی‌ترین سازندهٔ اعتماد است. فقط نظرهایی که تیک «نمایش» دارند روی سایت می‌آیند.
        </p>

        {reviews.length === 0 && !reviewFormOpen ? (
          <div className="rounded-control border border-dashed border-border p-6 text-center text-body-sm text-text-secondary">
            هنوز نظری ثبت نشده است.
          </div>
        ) : (
          <div className="space-y-2 mb-3">
            {reviews.map((r, i) => (
              <div key={r.id ?? i} className={`rounded-control border p-3 ${r.isVisible ? 'border-border' : 'border-border opacity-60'}`}>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <Stars value={r.rating} size="sm" />
                    <span className="text-body-sm font-bold">{r.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button type="button" variant="ghost" size="sm" onClick={() => toggleReview(i)} title={r.isVisible ? 'پنهان شود' : 'نمایش داده شود'}>
                      {r.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </Button>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeReview(i)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-body-sm text-text-secondary">{r.text}</p>
              </div>
            ))}
          </div>
        )}

        {!reviewFormOpen ? (
          <Button type="button" variant="outline" size="sm" onClick={() => setReviewFormOpen(true)}>
            <Plus className="w-4 h-4" /> افزودن نظر
          </Button>
        ) : (
          <div className="rounded-control border border-border bg-background p-4 space-y-3">
            <Field label="نام مسافر *">
              <Input value={reviewName} onChange={(e) => setReviewName(e.target.value)} placeholder="نام کوچک کافی است" />
            </Field>
            <Field label="امتیاز">
              <Stars value={reviewRating} onPick={setReviewRating} />
            </Field>
            <Field label="متن نظر *">
              <Textarea value={reviewText} onChange={(e) => setReviewText(e.target.value)} placeholder="نکتهٔ مشخص؛ نه «عالی بود» کلیشه‌ای" rows={3} />
            </Field>
            <div className="flex items-center gap-2">
              <Button type="button" size="sm" onClick={addReview}>
                <Check className="w-4 h-4" /> افزودن
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setReviewFormOpen(false)}>
                انصراف
              </Button>
            </div>
          </div>
        )}
      </section>

      {/* ── گالری واقعی ── */}
      <section className="rounded-card border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-1">
          <Images className="w-5 h-5 text-brand-orange" />
          <h3 className="text-h4 font-bold text-text-heading">گالری عکس واقعی</h3>
        </div>
        <p className="text-body-sm text-text-secondary mb-4">
          مسافر می‌خواهد ببیند پولش دقیقاً کجا می‌رود: ۶ تا ۱۰ عکس واقعی از هتل و مقصد، نه استوک.
        </p>

        {gallery.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
            {gallery.map((g, i) => (
              <div key={`${g.url}-${i}`} className="rounded-control border border-border overflow-hidden bg-background">
                <div className="relative aspect-[4/3]">
                  <img src={g.url} alt={g.caption || 'عکس گالری تور'} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeGalleryItem(i)}
                    className="absolute top-1.5 left-1.5 rounded-full bg-black/60 text-white p-1.5 hover:bg-black/80"
                    title="حذف عکس"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <Input
                  value={g.caption}
                  onChange={(e) => setCaption(i, e.target.value)}
                  placeholder="زیرنویس عکس…"
                  className="border-0 rounded-none text-caption"
                />
              </div>
            ))}
          </div>
        )}

        <DualGalleryAdd
          uploading={galleryUploading}
          onFiles={(files) => void uploadGalleryFiles(files)}
          onLink={(url) => {
            onChange({ gallery: [...gallery, { url, caption: '' }].slice(0, 30) });
            toast({ title: 'عکس با لینک به گالری اضافه شد.' });
          }}
        />
        <p className="text-caption text-text-secondary mt-2">
          اگر گالری خالی بماند، این بخش روی سایت نمایش داده نمی‌شود.
        </p>
      </section>

      <AlertDialog
        open={deletingLeaderId !== null}
        onOpenChange={(open) => { if (!open) setDeletingLeaderId(null); }}
        title="این تورلیدر حذف شود؟"
        description="اگر لیدر به توری وصل باشد، حذف نمی‌شود و پیامش را می‌بینید."
        confirmText="حذف"
        destructive
        onConfirm={confirmRemoveLeader}
      />
    </div>
  );
}
