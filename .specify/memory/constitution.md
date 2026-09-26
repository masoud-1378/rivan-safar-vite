# Rivan Safar (ریوان سفر) Constitution
<!-- Project Constitution for Rivan Safar: Professional Persian Travel & Tour Web Application -->

## Core Principles

### I. Step Zero & Stakeholder Truth (گام صفر: ممنوعیت مطلق حدس و اصالت تعریف کارفرما)
- **Zero Hallucination:** An AI agent is strictly forbidden from assuming, inventing, or guessing the brand identity, slogan, pricing model, target audience, or value proposition out of thin air.
- **Specification is Truth:** Every page structure, copywriting tone, and marketing claim must be anchored directly in stakeholder definitions, client briefs, and verified source documents.
- **Central Config Authority:** Business contact details, license numbers, physical address, and official brand assets must originate from the central source of truth (`src/lib/siteConfig.ts` & `src/lib/site-contact.ts` / `site_settings` in DB).

### II. The "که چی بشه؟" Purpose Razor (معماری ارگانیک قصد و تیغ غایت‌سنجی)
- **Zero Pre-Baked Templates:** No arbitrary 5-act landing templates, no mindless hero banners, and no filler sections.
- **Twin Poles of Every Screen:** Every page is born from the exact friction between *what the traveler comes for* (anxious about hidden costs, searching for specific dates, needing emergency support) and *what Rivan Safar genuinely provides* (transparent itineraries, verified group departures, legal accountability).
- **Element-Level Trial:** Every headline, image, badge, and CTA button must be acquitted under the brutal question: **«این المان اینجاست که چی بشه؟»** If it exists merely to look pretty or fill space, it is rejected and deleted.

### III. VibeFarsi Craft & Dignified RTL Design (کرافت و وقار در رابط فارسی)
- **Design Tokens Only:** Never invent rogue hex colors or arbitrary Tailwind shades. Strictly rely on semantic design tokens (`bg-background`, `text-foreground`, `border-border`, `bg-muted`, `text-muted-foreground`).
- **Strict Logical CSS:** Exclusively use logical directional properties (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`, `text-start`, `text-end`). Physical classes (`ml-`, `pl-`, `left-`, `right-`) and `flex-row-reverse` hacks are strictly forbidden.
- **Persian Typography Respect:** Never apply letter-spacing or `tracking-*` classes to Persian text. Respect proper Persian orthography and ZWNJ (نیم‌فاصله).
- **Zero Layout Shift:** Reserve image and media dimensions (`aspect-ratio`). Never show generic isolated spinners; always pair asynchronous sections with layout-matching `Skeleton` loaders from VibeFarsi.
- **Component Discovery First:** Reuse existing VibeFarsi components from `D:/vibefarsi/registry` (`components/ui`, `components/blocks`, `components/templates`) before creating new UI primitives.

### IV. Truthful Travel Architecture & Dignity (صداقت در داده‌های سفر و کرامت مسافر)
- **Separation of Concerns:** Strict architectural separation of `Product` (the overall tour experience), `Departure` (a specific date/seat pool), `Route` (actual transport segments), and `Offer` (hotel + meal packages with explicit pricing), as defined in `db/schema.ts`.
- **Zero Deceptive Dark Patterns:** 
  - Never fabricate fake routes or phantom direct flights.
  - Never display bait-and-switch pricing (e.g. low headline prices for expired or sold-out capacity).
  - Explicitly show Jalali dates (`jalali-calendar`), airline names, hotel stars, and clear breakdowns of included vs. excluded services.
- **Human Care Over Lead Traps:** The goal of interaction is human trust and clarity, not trapping users into spammy call-back forms.

### V. Performance, SEO & Engineering Invariants
- **Framework & Runtime:** Next.js 16 (App Router), React 19, TypeScript (Strict).
- **Data Layer:** PostgreSQL (Supabase) via Supabase REST client for serverless resilience + Drizzle ORM for schema and migrations.
- **Crawler & SEO Integrity:** All navigation and tour items must render as crawlable `<a href="...">` links. Metadata and JSON-LD structured data originate exclusively from central helpers (`app/seo-helpers.ts`), never hardcoded in page components.
- **Package Manager:** `npm` (strictly deterministic via `package-lock.json`).

## Technology Stack & Architectural Constraints

- **Framework:** Next.js 16 (App Router), React 19, TypeScript 5.8+ (Strict).
- **Design System:** Tailwind CSS v4, VibeFarsi Registry (Graphite theme, Vazirmatn font), Lucide React, Motion.
- **Database & Storage:** PostgreSQL (Supabase), Drizzle ORM (`db/schema.ts`).
- **Form & Validation:** `zod` for schemas, VibeFarsi `iran-validation` (Iranian national ID, mobile, Sheba/card formatting).

## Governance & Quality Gates

1. **Constitution Primacy:** This constitution supersedes transient AI trends and arbitrary design freedom.
2. **Review Gates:** Every phase of Spec Kit must pass verification:
   - `specify`: Feature requirements must be grounded in verified stakeholder needs.
   - `plan`: Architecture must verify alignment with Constitution principles (VibeFarsi, RTL, Data Model).
   - `tasks`: Clear dependency graph and atomic units of work.
   - `implement`: Zero layout shift, strict logical RTL, no unvetted styles.
3. **Amendments:** Any changes to this constitution require documentation, rationale, and version bumping.

**Version**: 1.0.0 | **Ratified**: 2026-09-26 | **Project**: Rivan Safar (ریوان سفر)
