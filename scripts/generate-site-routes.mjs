#!/usr/bin/env node
/**
 * تولیدکنندهٔ فهرست روت‌های سایت از روی ساختار پوشهٔ app/.
 *
 *   node scripts/generate-site-routes.mjs          # بازتولید src/lib/site-routes.ts
 *   node scripts/generate-site-routes.mjs --check  # فقط بررسی drift (برای CI/دستی)
 *
 * چرا این فایل هست؟
 * تشخیص «تصادم آدرس لندینگ» (src/lib/landing-path.ts) باید بداند کدام آدرس‌ها را
 * روت‌های واقعی سایت می‌برند. فهرست دستی با هر روت تازه کهنه می‌شود (drift)؛ پس
 * تنها منبع حقیقت، خودِ ساختار app/ است و این اسکریپت آن را به یک ماژول مشترک
 * تبدیل می‌کند. با هر روت تازه، فایل را دوباره بسازید و کامیت کنید.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const APP = path.join(ROOT, 'app');
const OUT = path.join(ROOT, 'src', 'lib', 'site-routes.ts');

const statics = new Set();
const dynamics = new Map(); // کلید رشته‌ای -> آرایهٔ سگمنت‌ها

/** سگمنت‌های پوشه نسبت به app، با حذف route groupهای (مثل (dashboard)). */
function urlSegments(relDir) {
  if (!relDir || relDir === '.') return [];
  return relDir.split('/').filter((s) => !/^\(.*\)$/.test(s));
}

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(p);
      continue;
    }
    const isPage = /^page\.(tsx?|jsx?|mdx?)$/.test(entry.name);
    const isRoute = /^route\.(ts|js)$/.test(entry.name);
    const isMeta = /^(robots|sitemap)\.ts$/.test(entry.name);
    if (!isPage && !isRoute && !isMeta) continue;

    const relDir = path.relative(APP, path.dirname(p)).split(path.sep).join('/');
    const segs = urlSegments(relDir);

    if (isMeta) {
      // route handlerهای ریشه: /robots.txt و /sitemap.xml
      const file = entry.name === 'robots.ts' ? 'robots.txt' : 'sitemap.xml';
      statics.add(`/${[...segs, file].join('/')}`);
      continue;
    }
    // catch-all لندینگ‌ها ([...landingPath]) خودِ روت لندینگ است، نه تصادم.
    if (segs.some((s) => s.startsWith('[...'))) continue;

    const mapped = segs.map((s) => {
      const m = s.match(/^\[([^\]]+)\]$/);
      return m ? `:${m[1]}` : s;
    });
    if (mapped.some((s) => s.startsWith(':'))) {
      dynamics.set(mapped.join('/'), mapped);
    } else {
      statics.add(`/${mapped.join('/')}`);
    }
  }
}

walk(APP);

const staticList = [...statics].sort();
const dynamicList = [...dynamics.values()].sort((a, b) =>
  a.join('/').localeCompare(b.join('/')),
);

const staticLines = staticList.map((r) => `  '${r}',`).join('\n');
const dynamicLines = dynamicList
  .map((segs) => `  [${segs.map((s) => `'${s}'`).join(', ')}],`)
  .join('\n');

const content = `/**
 * ⚠ فایل تولیدشده — دستی ویرایش نکنید.
 * سازنده: node scripts/generate-site-routes.mjs
 * منبع حقیقت: ساختار پوشهٔ app/ (روت‌های نکست).
 *
 * با هر روت تازه: npm run routes:gen و کامیت.
 * بررسی drift: npm run routes:check
 *
 * مصرف‌کننده: src/lib/landing-path.ts (تشخیص تصادم آدرس لندینگ با روت‌های سایت).
 * catch-all لندینگ‌ها ([...landingPath]) عمداً در این فهرست نیست؛ چون خودش
 * مقصد لندینگ‌هاست، نه رقیب آن‌ها.
 */

/** روت‌های استاتیک سایت — آدرس نرمال‌شده (اسلش اول، بدون اسلش پایانی). */
export const SITE_STATIC_ROUTES: readonly string[] = [
${staticLines}
];

/**
 * الگوهای داینامیک: هر الگو آرایه‌ای از سگمنت‌هاست؛ سگمنت ':name' یعنی هر مقداری.
 * مثلاً ['tour', ':slug'] یعنی /tour/‎<هر چیزی>‎ که صفحهٔ جزئیات تور را باز می‌کند.
 */
export const SITE_DYNAMIC_PATTERNS: readonly (readonly string[])[] = [
${dynamicLines}
];
`;

if (process.argv.includes('--check')) {
  const current = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : '';
  if (current !== content) {
    console.error(
      'site-routes.ts با ساختار app/ هم‌خوان نیست (drift). ' +
        'اجرا کنید: npm run routes:gen',
    );
    process.exit(1);
  }
  console.log(`site-routes.ts OK (${staticList.length} static, ${dynamicList.length} dynamic).`);
} else {
  fs.writeFileSync(OUT, content);
  console.log(`wrote ${path.relative(ROOT, OUT)} (${staticList.length} static, ${dynamicList.length} dynamic).`);
}
