# Tasks: Evolutionary VibeFarsi Public Storefront Elevation

**Branch**: `001-vibefarsi-public-design`  
**Input**: Prerequisites from `specs/001-vibefarsi-public-design/`  
**Status**: Ready for Execution

---

## Phase 1: Setup & CSS Architecture (Universal VibeFarsi Tokens)

- [x] **T001**: Refactor `src/index.css` to declare public VibeFarsi semantic CSS tokens at `:root` (`--background: #FAF7F2`, `--foreground: #172027`, `--primary: #FF6600`, `--card: #FFFFFF`, `--border: #E2E6E8`, etc.), while strictly isolating the admin graphite theme under `.admin-vibefarsi`.
- [x] **T002**: Clean up legacy physical directional utility classes and conflicting inline colors in `src/index.css` to enforce 100% Tailwind v4 logical RTL properties.

---

## Phase 2: Foundational Primitives & Zero Layout Shift (User Story 1 & 2)

- [x] **T003**: Create `src/components/TourCardSkeleton.tsx` using official `@/components/ui/skeleton` to provide layout-matching placeholder grids during async tour fetching.
- [x] **T004**: Refactor `src/components/TourCard.tsx` to consume official VibeFarsi primitives (`@/components/ui/card`, `@/components/ui/badge`, `@/components/ui/button`), displaying prices with Persian formatting and Tomans.
- [x] **T005**: Update `src/components/SummerTours.tsx` and tour listing views to mount `TourCardSkeleton` during data hydration, eliminating CLS.

---

## Phase 3: Purposeful Travel Search & Jalali Experience (User Story 3)

- [x] **T006**: Build `src/components/TravelSearchWidget.tsx` integrating `lib/jalali.ts` with VibeFarsi `Popover`, `Calendar`, and `Select` primitives.
- [x] **T007**: Integrate `TravelSearchWidget` into `src/components/Hero.tsx` with responsive layout adaptation.

---

## Phase 4: Trust Credibility & Navigation Polish (User Story 4)

- [x] **T008**: Refactor `src/components/TrustBar.tsx` using VibeFarsi design tokens and strict logical spacing, cleanly presenting physical office and licensing credentials from `siteConfig.ts`.
- [x] **T009**: Polish `src/components/Navbar.tsx` and public header with VibeFarsi navigation tokens and accessible mobile sheet navigation.

---

## Phase 5: Verification & Quality Gate Audit

- [x] **T010**: Run complete TypeScript typecheck and linting (`npm run lint`).
- [x] **T011**: Verify production Next.js build (`npm run build`).
- [x] **T012**: Execute SEO and sitemap integrity audit (`npm run seo:check`).
