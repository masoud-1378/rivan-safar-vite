# Project Constitution: Rivan Safar

## Core Principles

### Principle I: Step Zero & Stakeholder Truth (Absolute Law)
- Never fabricate, guess, or assume business rules, pricing logic, slogans, or schemas without stakeholder input or documentation.
- The Single Source of Truth for system data is the verified PostgreSQL schema via Drizzle ORM (`db/schema.ts`) and Supabase REST.

### Principle II: Purpose Razor ("که چی بشه؟")
- Every interface, view, and button must serve a clear, practical purpose for business management or customer operations.
- Avoid unnecessary decorative fluff or redundant layers.

### Principle III: VibeFarsi Standard & Persian Craft
- All administrative interfaces must strictly adhere to the VibeFarsi component library (`components/ui/*`), token variables, and graphite theme (`.admin-vibefarsi`).
- 100% strict logical RTL properties (`ms-`, `me-`, `ps-`, `pe-`, `text-start`, `text-end`).
- Clean Persian numerals and Jalali dates for Iranian operations.

### Principle IV: Technical Stack & Architecture Integrity
- Next.js 16 App Router, React 19, Tailwind CSS v4, Drizzle ORM, Supabase REST.
- Type safety: TypeScript must pass `tsc --noEmit` with zero errors on all PRs.
- Clean module boundaries: Dedicated Tour Management Hub acting as a comprehensive sub-panel consolidating reservations, tours list, destinations, origins, and hotels.

## Governance
- All changes must pass SDD gates via Spec Kit (`spec.md` -> `plan.md` -> `tasks.md` -> implementation).
- Zero regression on existing site features, public pages, or database tables.
