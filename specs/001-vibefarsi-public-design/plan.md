# Implementation Plan: Evolutionary VibeFarsi Public Storefront Elevation

**Branch**: `001-vibefarsi-public-design` | **Date**: 2026-09-26 | **Spec**: `specs/001-vibefarsi-public-design/spec.md`  
**Input**: Feature specification from `specs/001-vibefarsi-public-design/spec.md`  
**Status**: Ready for Tasks Generation (Phase 1 Complete)

---

## 1. Summary

Elevate Rivan Safar's public storefront (`/`, `/tours`, `/tours/[slug]`, landing sections) to the VibeFarsi design standard without discarding the completed Next.js 16 / Supabase REST / Drizzle architecture or breaking the already VibeFarsi-powered Admin dashboard (`app/admin/`).

The technical strategy implements:
1. **Universal Root Tokens**: Promoting VibeFarsi design variables (`--background`, `--foreground`, `--primary`, `--border`, etc.) to `:root` while preserving the admin graphite dark theme under `.admin-vibefarsi`.
2. **Official VibeFarsi Primitives**: Transitioning public components (`TourCard`, `TrustBar`, `Hero`, `TravelSearchWidget`) to use components from `components/ui/` (`Button`, `Card`, `Badge`, `Skeleton`, `Popover`, `Select`).
3. **Persian Craft & Strict Logical RTL**: Eliminating legacy CSS directional classes and banning letter-spacing on Persian text.
4. **Zero Layout Shift**: Introducing structural skeleton twins for all async tour grids.

---

## 2. Technical Context

- **Language/Framework**: TypeScript 5, React 19, Next.js 16.0.7 (App Router).
- **Styling**: Tailwind CSS v4, VibeFarsi design system tokens (`@tailwindcss/postcss`).
- **Data Layer**: Supabase REST via `src/lib/db-content.ts`, Drizzle ORM schemas in `db/schema.ts`.
- **Date & Internationalization**: Jalali Solar Hijri engine (`lib/jalali.ts`), Persian numerals, Iranian format validators.
- **Verification Commands**: `npm run lint`, `npm run build`, `npm run seo:check`.

---

## 3. Constitution Gates Verification

- **Gate 1 (Principle I: Step Zero)**: PASS. All copy, addresses, and contacts are bound to verified source data (`siteConfig.ts` & `db/schema.ts`).
- **Gate 2 (Principle II: Purpose Razor)**: PASS. Refactored components directly serve traveler discovery, date validation, and inquiry.
- **Gate 3 (Principle III: VibeFarsi RTL Craft)**: PASS. Strict logical CSS properties, token-only styling, zero `tracking-*`.
- **Gate 4 (Principle IV: Truthful Travel Data)**: PASS. Tour pricing in Tomans, authentic hotel ratings, zero fake promotional countdowns.
- **Gate 5 (Principle V: Modern Stack)**: PASS. Next.js 16 + React 19 + Supabase REST preserved.

---

## 4. Phased Implementation Roadmap

### Phase 0: Research & Dual-Zone Token Architecture (Completed)
- Documented in `research.md`. Resolved token collisions between admin graphite theme and public warm theme.

### Phase 1: Contracts & Data Model (Completed)
- Documented in `data-model.md` and `quickstart.md`. Defined component prop contracts and token variables.

### Phase 2: Implementation Tasks (Next Step via `speckit-tasks`)
1. **Task Group 1: Global CSS & Root Tokens**:
   - Refactor `src/index.css` to declare public VibeFarsi tokens at `:root` and isolate admin graphite tokens.
   - Clean up conflicting legacy utility classes.
2. **Task Group 2: VibeFarsi Core Storefront Primitives**:
   - Refactor `src/components/TourCard.tsx` using `@/components/ui/card`, `@/components/ui/badge`, `@/components/ui/button`.
   - Implement `src/components/TourCardSkeleton.tsx` using `@/components/ui/skeleton`.
3. **Task Group 3: Purposeful Travel Search & Jalali Picker**:
   - Implement `TravelSearchWidget.tsx` integrating `lib/jalali.ts` with VibeFarsi `Popover` and `Select`.
   - Update `src/components/Hero.tsx` to mount the new search widget.
4. **Task Group 4: Trust Credibility & Mobile Polish**:
   - Upgrade `src/components/TrustBar.tsx` and `src/components/Navbar.tsx` to strict logical RTL and VibeFarsi tokens.
5. **Task Group 5: Validation & Quality Gate Verification**:
   - Run typecheck, linting, production build, and CLS audit.
