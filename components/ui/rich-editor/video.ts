/**
 * تبدیل نشانی ویدیو به نشانی امبد — فقط یوتیوب و آپارات.
 * بدون وابستگی به تایپ‌تپ تا هم در ویرایشگر و هم در رندرر استفاده شود.
 */
export function parseVideoUrl(raw: string): string | null {
  try {
    const u = new URL(raw.trim());
    const host = u.hostname.replace(/^www\./, '').toLowerCase();
    if (host === 'youtube.com' || host === 'm.youtube.com') {
      const id =
        u.searchParams.get('v') ?? u.pathname.match(/^\/shorts\/([\w-]{6,})/)?.[1] ?? null;
      if (id) return `https://www.youtube-nocookie.com/embed/${id}`;
    }
    if (host === 'youtu.be') {
      const id = u.pathname.slice(1).split('/')[0];
      if (id) return `https://www.youtube-nocookie.com/embed/${id}`;
    }
    if (host === 'aparat.com') {
      const m = u.pathname.match(/\/v\/([A-Za-z0-9]+)/);
      if (m) return `https://www.aparat.com/video/video/embed/videohash/${m[1]}/vt/frame`;
    }
    return null;
  } catch {
    return null;
  }
}
