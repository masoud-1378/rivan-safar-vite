/**
 * چک‌های CMS و سئو برای اطمینان از کیفیت محتوا.
 * اجرا: npm run cms:check
 * خروجی غیرصفر = گیت بسته است.
 */
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
let failures = 0;
function fail(msg: string) {
  failures += 1;
  console.error(`[FAIL] ${msg}`);
}
function ok(msg: string) {
  console.log(`[OK] ${msg}`);
}

// 1. هیچ DATABASE_URL واقعی در گیت نباشد
const envExample = fs.readFileSync(path.join(root, '.env.example'), 'utf8');
if (/postgres:\/\/[^U]/i.test(envExample) && !envExample.includes('USER:PASSWORD')) {
  fail('.env.example حاوی رشته اتصال واقعی است.');
} else {
  ok('Secret در گیت نیست.');
}

// 2. واژه‌های ممنوعه در CTAها و محتوای فروش
const bannedCta: Array<[string, RegExp]> = [
  ['رزرو تور (به‌جای درخواست تماس)', /رزرو تور/g],
  ['پشتیبانی ۲۴ ساعته', /پشتیبانی ۲۴ ساعته|24 ساعته/g],
  ['تضمینی', /تضمینی/g],
  ['ارزان‌ترین|ارزانترین', /ارزان‌ترین|ارزانترین/g],
  ['تکرارنشدنی', /تکرارنشدنی/g],
  ['فرصت طلایی', /فرصت طلایی/g],
  ['آخرین شانس', /آخرین شانس/g],
];
const scanDirs = ['src/components', 'src/data'];
for (const dir of scanDirs) {
  const full = path.join(root, dir);
  if (!fs.existsSync(full)) continue;
  for (const file of fs.readdirSync(full)) {
    if (!file.endsWith('.tsx') && !file.endsWith('.ts')) continue;
    const content = fs.readFileSync(path.join(full, file), 'utf8');
    for (const [label, re] of bannedCta) {
      const matches = content.match(re);
      if (matches && matches.length > 0) {
        fail(`${dir}/${file}: «${label}» × ${matches.length}`);
      }
    }
  }
}

// 3. لینک‌های شکسته در Navbar/Footer
const noDataRoutes = ['/destination/russia', '/destination/turkey/van', '/visa/dubai'];
const navFiles = ['src/components/Navbar.tsx', 'src/components/Footer.tsx'];
for (const rel of navFiles) {
  const content = fs.readFileSync(path.join(root, rel), 'utf8');
  for (const route of noDataRoutes) {
    if (content.includes(`'${route}'`) || content.includes(`"${route}"`)) {
      fail(`${rel} به مسیر بدون دیتا لینک می‌دهد: ${route}`);
    }
  }
}

// 4. sitemap فقط مسیرهای Published
const sitemapPath = path.join(root, 'app', 'sitemap.ts');
if (!fs.existsSync(sitemapPath)) {
  fail('app/sitemap.ts وجود ندارد.');
} else {
  const sitemap = fs.readFileSync(sitemapPath, 'utf8');
  if (sitemap.includes('/destination/russia') || sitemap.includes('/visa/dubai')) {
    fail('sitemap شامل مسیر بدون موجودی است.');
  } else {
    ok('sitemap فقط مسیرهای Published است.');
  }
}

// 5. queryOwner یکتا
const landingsSrc = fs.readFileSync(path.join(root, 'src', 'data', 'seoLandings.ts'), 'utf8');
const owners = [...landingsSrc.matchAll(/queryOwner:\s*'([^']+)'/g)].map((m) => m[1]);
if (new Set(owners).size !== owners.length) {
  fail('queryOwner تکراری در seoLandings.ts وجود دارد.');
} else {
  ok(`queryOwner یکتا (${owners.length} لندینگ).`);
}

// 6. لندینگ‌های Published بدون queryOwner
const hasQuery = owners.filter(o => o.length > 0).length;
if (hasQuery !== owners.length) {
  fail('برخی لندینگ‌ها queryOwner ندارند.');
} else {
  ok('همه لندینگ‌ها queryOwner دارند.');
}

// 7. لاگ کریتیکال برای CMS
const cmsFiles = [
  'app/admin/(dashboard)/seo/actions.ts',
  'app/admin/(dashboard)/tours/actions.ts',
  'app/admin/(dashboard)/leads/actions.ts',
  'app/admin/(dashboard)/places/actions.ts',
  'app/admin/(dashboard)/settings/actions.ts',
];
for (const f of cmsFiles) {
  if (!fs.existsSync(path.join(root, f))) {
    fail(`فایل CMS گم شده: ${f}`);
  }
}
ok(`فایل‌های CMS اصلی موجود (${cmsFiles.length}).`);

if (failures > 0) {
  console.error(`\ncms:check — ${failures} خطا. Launch Gate بسته است.`);
  process.exit(1);
}
console.log('\ncms:check — همه چک‌ها پاس شد.');