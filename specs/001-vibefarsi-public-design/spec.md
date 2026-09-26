# Feature Specification: Evolutionary VibeFarsi Public Storefront Elevation

**Feature Branch**: `001-vibefarsi-public-design`  
**Created**: 2026-09-26  
**Status**: Draft (Pending Review Gate 1)  
**Input**: Evolutionary elevation of the public storefront using VibeFarsi design tokens, official UI components, and Persian RTL craft, without rebuilding or throwing away the existing Next.js / Supabase / CMS foundation.

---

## 1. Executive Summary & Boundaries

### What We Are Doing
- **Preserving 100% of Core Infrastructure**: Retaining the Next.js 16 App Router, PostgreSQL / Supabase REST data layer, Drizzle schemas, dynamic SEO helpers, and the already VibeFarsi-powered Admin CMS dashboard (`app/admin/`).
- **Elevating Public UI to VibeFarsi**: Progressively refactoring public components (`Navbar`, `Hero`, `TourCard`, `Destinations`, `TrustBar`, `TravelNeeds`, `ExhibitionTours`, `Footer`, etc.) to consume semantic VibeFarsi design tokens and official components from `components/ui/`.
- **Enforcing Constitution & Persian RTL Craft**: Eradicating legacy physical CSS directional classes (`ml-`, `pr-`, etc.), eliminating arbitrary hex colors, and introducing layout-matching `Skeleton` loaders to prevent layout shift.

### What We Are NOT Doing
- We are **not** rewriting the project from scratch.
- We are **not** modifying the database schema or destroying the existing CMS routes.
- We are **not** inventing brand slogans, pricing models, or fake promotional claims out of thin air (strictly obeying Principle I: Step Zero).

---

## 2. User Scenarios & Prioritized User Stories

### User Story 1: Global VibeFarsi Token Foundation & Layout Polish (Priority: P1 - MVP)

**User Journey**:  
As a visitor browsing Rivan Safar on any device (from a 390px smartphone to an ultrawide desktop), I see a visually cohesive, dignified Iranian travel interface styled strictly with semantic VibeFarsi design tokens (neutral backgrounds, crisp typography in Vazirmatn, dignified contrast, balanced brand accents) across header, page background, and footer, eliminating legacy brittle CSS overrides.

**Why this priority**:  
The public site currently relies on 1,600+ lines of custom legacy CSS with conflicting color definitions, while VibeFarsi tokens are restricted only to `.admin-vibefarsi`. Establishing universal semantic tokens is the non-negotiable bedrock for all subsequent UI components.

**Independent Test**:  
Can be tested by loading the public homepage and subpages: inspecting the DOM confirms that root surfaces, text, headers, and navigation bars use semantic CSS variables (`bg-background`, `text-foreground`, `border-border`, etc.) with zero hardcoded arbitrary hex values, zero letter-spacing on Persian text, and pure logical RTL padding/margins.

**Acceptance Scenarios**:
1. **Given** the public site loads, **When** examining root elements, **Then** surfaces, text colors, and borders resolve via VibeFarsi semantic CSS tokens.
2. **Given** Persian cursive typography, **When** headings and body text render, **Then** no `tracking-*` classes exist and line-heights are comfortable (minimum 1.6 for body, 1.3 for headings).
3. **Given** any viewport size, **When** layout containers adapt, **Then** all padding and margin properties use logical classes (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`, `text-start`, `text-end`) and zero `flex-row-reverse`.

---

### User Story 2: Authentic Tour Discovery Cards & VibeFarsi Primitives (Priority: P2)

**User Journey**:  
As a traveler looking for domestic, foreign, or exhibition tours, I can browse verified tour cards built with official VibeFarsi `Card`, `Badge`, and `Button` components. Each card displays real departure dates, airline badges, hotel star ratings, transparent pricing in Tomans, and status labels, without misleading bait-and-switch claims.

**Why this priority**:  
Tours are the core service of Rivan Safar. Elevating tour cards from raw HTML/CSS to official VibeFarsi primitives makes them accessible, beautifully responsive, and visually consistent with modern Persian web craft.

**Independent Test**:  
Can be tested by navigating to `/`, `/tours`, and `/tours/foreign`: tour cards render using `@/components/ui/card`, `@/components/ui/badge`, and `@/components/ui/button`. When data loads from Supabase REST, layout-matching `Skeleton` loaders maintain card aspect ratios.

**Acceptance Scenarios**:
1. **Given** tour cards are fetching data, **When** the page hydrates, **Then** layout-matching `Skeleton` loaders reserve the exact dimensions to guarantee zero Cumulative Layout Shift (CLS < 0.05).
2. **Given** an active tour, **When** rendered, **Then** pricing displays with explicit Toman formatting and Persian numerals, hotel ratings use clear star indicators, and the action button uses VibeFarsi `Button`.
3. **Given** a tour card, **When** hovered or tapped, **Then** smooth, dignified micro-interactions (`motion`) trigger without jarring animations or layout jitter.

---

### User Story 3: Purposeful Travel Search & Jalali Date Experience (Priority: P3)

**User Journey**:  
As a traveler with fixed vacation or business travel dates, I can immediately filter tours by destination, tour kind (تفریحی | نمایشگاهی), and departure date using VibeFarsi's `jalali-calendar` popover and accessible search controls in the hero section, finding my ideal tour in under 5 seconds without scrolling past empty marketing slogans.

**Why this priority**:  
Solves the primary user friction point: travelers need to verify dates and destinations immediately before committing attention.

**Independent Test**:  
Can be tested by interacting with the hero search widget: clicking the departure date opens the Jalali calendar popover with solar months (فروردین، اردیبهشت، ...), selecting a date updates the filter state, and destination dropdowns use VibeFarsi `Select` / `Combobox`.

**Acceptance Scenarios**:
1. **Given** the hero search widget, **When** the user clicks the departure date field, **Then** a Jalali calendar popover appears with current solar date highlighted and accessible month navigation.
2. **Given** destination selection, **When** user types or chooses a country/city, **Then** auto-complete operates with VibeFarsi `Combobox` / `Select` with instant keyboard navigation.
3. **Given** search filters applied, **When** user clicks search, **Then** the filtered results update smoothly with crawlable URL parameters.

---

### User Story 4: Transparent Trust Credibility & Inquiry Sheet (Priority: P4)

**User Journey**:  
As a business manager or prospective traveler with detailed questions, I can review verified licensing, official physical address (مهرشهر کرج), and working hours, or trigger an inquiry modal/sheet powered by VibeFarsi `Dialog` / `Sheet` with `iran-validation` (Iranian mobile and National ID formatting) without facing aggressive full-screen popup traps.

**Why this priority**:  
Fulfills Principle IV (Dignity & Transparency): converting interest into genuine human contact with verified legal credentials and zero friction.

**Acceptance Scenarios**:
1. **Given** the contact or inquiry CTA, **When** clicked, **Then** an accessible VibeFarsi `Sheet` or `Dialog` slides in smoothly with background blur.
2. **Given** user entering a mobile phone number, **When** typing digits, **Then** input validates Iranian mobile format (`09...`) and converts to clean Persian digits.
3. **Given** the TrustBar / Footer, **When** viewed, **Then** physical office address, telephone numbers, and tourism licensing badges are clearly stated from central configuration (`siteConfig.ts`).

---

## 3. Edge Cases & Safeguards

- **Slow Network / Offline Supabase**: When network connection drops or Supabase REST takes >3 seconds, fallback content displays graceful `Alert` or cached data with clear retry options, never a white screen of death.
- **Missing Tour Images**: When a tour or destination lacks an image URL, a structured fallback placeholder with branded gradients and destination icon renders with explicit `aspect-ratio: 16/9`.
- **Extremely Long Persian Titles**: Tour titles up to 260 characters and destination taglines must wrap with `line-clamp-2` or `text-wrap: balance` to prevent card overflow or broken grids on 320px-390px mobile screens.
- **Mixed Character Inputs (English/Persian)**: Search inputs must normalize Persian/Arabic characters (e.g. `ي` to `ی`, `ك` to `ک`) and handle English destination slugs transparently.

---

## 4. Technical & Functional Requirements

- **FR-001**: System MUST expose VibeFarsi theme tokens globally in `src/index.css` so that both the public storefront and the admin dashboard share the unified token architecture (`--background`, `--foreground`, `--card`, `--border`, `--primary`, etc.).
- **FR-002**: Public UI components MUST reuse existing VibeFarsi primitives from `components/ui/` (`Button`, `Card`, `Badge`, `Skeleton`, `Dialog`, `Sheet`, `Select`, `Calendar`, `Input`) rather than bespoke inline styling.
- **FR-003**: All interactive and navigational elements MUST render as valid, crawlable `<a href="...">` Next.js Links for full SEO indexability.
- **FR-004**: Tour pricing MUST format exclusively in Iranian Tomans using localized Persian separators and digits (`۳۵,۰۰۰,۰۰۰ تومان`).
- **FR-005**: All user-facing dates and date selectors MUST use the Jalali (Solar Hijri) calendar.
- **FR-006**: Form inputs MUST validate Iranian mobile numbers (`09...`) and National IDs using VibeFarsi `iran-validation`.
- **FR-007**: Asynchronous sections MUST use layout-matching `Skeleton` loaders to eliminate Cumulative Layout Shift.
- **FR-008**: System MUST maintain 100% strict logical RTL properties (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`, `text-start`, `text-end`) and zero `flex-row-reverse`.

---

## 5. Success Criteria & Quality Gates

- **SC-001 (Zero Layout Shift)**: Cumulative Layout Shift (CLS) on the public homepage during data hydration MUST remain below `0.05`.
- **SC-002 (Strict RTL Compliance)**: 100% of public components MUST use logical directional properties; zero instances of `ml-`, `mr-`, `pl-`, `pr-`, `left-`, or `right-` in public components.
- **SC-003 (CSS Bloat Reduction)**: Prune and streamline bespoke utility classes in `src/index.css`, replacing them with standard VibeFarsi design tokens.
- **SC-004 (Type Safety & Build)**: TypeScript compilation (`npm run lint` / `tsc --noEmit`) and Next.js production build (`next build`) MUST pass with zero errors.
- **SC-005 (SEO & Audit)**: Dynamic sitemap (`/sitemap.xml`) and SEO check (`npm run seo:check`) MUST pass all validation gates.
