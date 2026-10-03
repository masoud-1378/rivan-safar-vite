/**
 * منطق «تصادم آدرس لندینگ» — ماژول مشترک پنل و سایت.
 *
 * وقتی ادمین برای لندینگ سئو آدرسی می‌دهد که روت واقعی سایت آن را می‌برد
 * (مثلاً /tours که صفحهٔ تورهاست، یا /tour/istanbul که صفحهٔ جزئیات تور است)،
 * لندینگ آن‌جا نمایش داده نمی‌شود. این ماژول همان سنجش را انجام می‌دهد تا پنل
 * پیش از ذخیره هشدار بدهد و آدرس را شماره‌دار یکتا کند.
 *
 * فهرست روت‌ها از src/lib/site-routes.ts می‌آید (تولیدشده از ساختار app/).
 */
import { normalizeLandingPath } from './db-content';
import { SITE_STATIC_ROUTES, SITE_DYNAMIC_PATTERNS } from './site-routes';

export type PathCollisionKind = 'static-route' | 'dynamic-route' | 'landing';

export interface PathCollision {
  kind: PathCollisionKind;
  /** الگوی درگیر، برای لاگ/دیباگ: /tours یا /tour/[slug] */
  route: string;
  /** یک‌دو جملهٔ فارسیِ روشن برای دیالوگ هشدار */
  reason: string;
  /** فقط برای kind='dynamic-route': الگوی خام (['tour', ':slug']) برای فرار شماره‌دار */
  pattern?: readonly string[];
}

/**
 * آیا آدرسِ داده‌شده با یکی از روت‌های واقعی سایت تصادم می‌کند؟
 * تقدم نکست هم رعایت شده: اول تطابق دقیق استاتیک، بعد الگوهای داینامیک.
 * خودِ catch-all لندینگ‌ها ([...landingPath]) در فهرست نیست.
 */
export function findRouteCollision(path: string): PathCollision | null {
  const clean = normalizeLandingPath(path);

  const staticHit = SITE_STATIC_ROUTES.find((r) => r === clean);
  if (staticHit) {
    return {
      kind: 'static-route',
      route: staticHit,
      reason: `«${clean}» آدرس یکی از صفحه‌های سایت است. لندینگ با این آدرس روی سایت دیده نمی‌شود.`,
    };
  }

  const segs = clean.split('/').filter(Boolean);
  for (const pattern of SITE_DYNAMIC_PATTERNS) {
    if (pattern.length !== segs.length) continue;
    let matches = true;
    for (let i = 0; i < pattern.length; i++) {
      const p = pattern[i];
      if (!p.startsWith(':') && p !== segs[i]) {
        matches = false;
        break;
      }
    }
    if (matches) {
      const shown = `/${pattern.map((p) => (p.startsWith(':') ? `[${p.slice(1)}]` : p)).join('/')}`;
      return {
        kind: 'dynamic-route',
        route: shown,
        reason: `«${clean}» روی سایت صفحهٔ دیگری را باز می‌کند. لندینگ با این آدرس روی سایت دیده نمی‌شود.`,
        pattern,
      };
    }
  }
  return null;
}

/**
 * شماره‌دار کردن آدرس: /foo ← /foo-2 ؛ /foo-2 ← /foo-3.
 * اگر تهِ آدرس از قبل شماره داشت، همان شماره یکی زیاد می‌شود.
 */
export function incrementLandingPath(path: string): string {
  const clean = normalizeLandingPath(path);
  if (clean === '/') return '/-2';
  const idx = clean.lastIndexOf('/');
  const head = clean.slice(0, idx);
  const tail = clean.slice(idx + 1);
  const m = tail.match(/^(.*)-(\d+)$/);
  if (m) return `${head}/${m[1]}-${parseInt(m[2], 10) + 1}`;
  return `${clean}-2`;
}

/** شماره‌دار کردن یک سگمنت تنها: tour ← tour-2 ؛ tour-2 ← tour-3. */
function incrementSegment(seg: string): string {
  const m = seg.match(/^(.*)-(\d+)$/);
  if (m) return `${m[1]}-${parseInt(m[2], 10) + 1}`;
  return `${seg}-2`;
}

/**
 * کاندید بعدی آدرس آزاد.
 * - تصادم استاتیک/لندینگ: تهِ آدرس شماره‌دار می‌شود (/tours ← /tours-2).
 * - تصادم داینامیک: شماره‌دار کردن ته هیچ‌وقت از زیر الگو بیرون نمی‌آید
 *   (/tour/istanbul-2 باز هم /tour/[slug] را می‌برد)؛ پس آخرین سگمنتِ استاتیکِ
 *   خودِ الگو شماره‌دار می‌شود تا آدرس از الگو فرار کند
 *   (/tour/istanbul ← /tour-2/istanbul). این همان «آدرس شماره‌دار» است که
 *   واقعاً به catch-all لندینگ‌ها می‌رسد و روی سایت سرو می‌شود.
 */
export function nextLandingPathCandidate(path: string): string {
  const clean = normalizeLandingPath(path);
  const hit = findRouteCollision(clean);
  if (!hit || hit.kind !== 'dynamic-route' || !hit.pattern) {
    return incrementLandingPath(clean);
  }
  const segs = clean.split('/').filter(Boolean);
  let idx = -1;
  for (let i = 0; i < hit.pattern.length; i++) {
    if (!hit.pattern[i].startsWith(':')) idx = i;
  }
  if (idx < 0 || idx >= segs.length) return incrementLandingPath(clean);
  const next = [...segs];
  next[idx] = incrementSegment(segs[idx]);
  return `/${next.join('/')}`;
}
