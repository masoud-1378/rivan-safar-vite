# Research & Architecture Decisions: Evolutionary VibeFarsi Public Storefront

**Feature**: `001-vibefarsi-public-design`  
**Date**: 2026-09-26  
**Status**: Completed (Phase 0)

---

## 1. Global Token Scoping & Dual-Zone Architecture

### Problem
In `src/index.css`, VibeFarsi's graphite theme tokens (`--background`, `--foreground`, `--card`, `--border`, `--primary`, etc.) are wrapped strictly inside `.admin-vibefarsi` and `body:has(.admin-vibefarsi)`. As a consequence, public storefront pages cannot consume `@/components/ui/` components natively without those tokens being unstyled or falling back to raw browser defaults. Concurrently, the public site relies on 1,600+ lines of custom `@utility` classes in `src/index.css`.

### Decision
Unify token declarations at the `:root` level with two distinct semantic palettes:
1. **Public Default Theme (`:root`)**: Warm light/sand surfaces (`--background: #FAF7F2`, `--foreground: #172027`, `--card: #FFFFFF`, `--primary: #FF6600` [Rivan Brand Orange], `--primary-foreground: #FFFFFF`, `--border: #E2E6E8`, `--muted: #F3F4F6`, `--muted-foreground: #66727A`).
2. **Admin Theme (`.admin-vibefarsi`, `[data-theme="dark"]`)**: Graphite dark palette (`--background: oklch(0.115 0.002 285)`, etc.).
3. **Outcome**: All 52 VibeFarsi components in `components/ui/` (`Button`, `Card`, `Badge`, `Dialog`, `Skeleton`, `Input`, `Select`, `Calendar`) will seamlessly render with the correct color schemes whether instantiated on public storefront routes or admin management routes.

---

## 2. Component Refactoring & VibeFarsi Primitives Mapping

| Public Component | Current State | Target VibeFarsi Refactor | Justification ("که چی بشه؟") |
| :--- | :--- | :--- | :--- |
| `src/components/TourCard.tsx` | Handcrafted divs, manual CSS badges, hardcoded colors | `@/components/ui/card`, `@/components/ui/badge`, `@/components/ui/button` | Accessible, consistent borders/shadows, interactive hover states via `motion` |
| `src/components/Hero.tsx` | Static search box with raw inputs and callback props | VibeFarsi `travel-search` block with `jalali-calendar` popover & `Select` | Immediate date selection in Solar Hijri without mental date conversion |
| `src/components/TrustBar.tsx` | Raw flex containers, manual border separators | `@/components/ui/separator`, VibeFarsi typography tokens | Transparently displays office location (مهرشهر کرج) and official tourism licenses |
| `src/components/SummerTours.tsx` | Custom grid with raw spinners on hydration | VibeFarsi responsive grid with layout-matching `Skeleton` loaders | Eliminates Cumulative Layout Shift (CLS) during Supabase REST fetch |
| `src/components/Navbar.tsx` | Legacy markup, manual dropdown | VibeFarsi navigation tokens, accessible mobile `Sheet` | Fast, clutter-free mobile navigation for Iranian mobile viewports (390px) |

---

## 3. Jalali Date Engine Integration

### Context
`lib/jalali.ts` is already implemented and validated in the codebase (`solarToGregorian`, `gregorianToSolar`, formatted Persian month labels).

### Integration Pattern
The date selector in the travel search hero will leverage `lib/jalali.ts` with the VibeFarsi `Popover` and `Calendar` architecture. When the traveler clicks the departure date, the modal popover shows solar months (`مهر`, `آبان`, `آذر`...) and updates the query parameters (`?departureDate=1405-07-15`) without triggering a full page reload.

---

## 4. Zero Layout Shift (CLS < 0.05) Protocol

### Protocol
Every section that fetches data asynchronously (`siteTours`, `siteDestinations`, `exhibitions`) must render an exact structural twin using `@/components/ui/skeleton`:
- Card image placeholder: `aspect-[16/10]` rounded container.
- Title placeholder: `h-6 w-3/4` skeleton line.
- Metadata & price placeholder: `h-5 w-1/2` and `h-8 w-1/3` action skeleton.
- Generic rotating spinners are strictly banned.

---

## 5. Compliance with Constitution Gates

- **Principle I (Step Zero)**: No brand slogans or mock value propositions invented. Address and contact remain strictly anchored to `src/lib/siteConfig.ts`.
- **Principle II (Purpose Razor)**: Every component justified by a traveler intent.
- **Principle III (RTL Craft)**: Zero `ml-`, `mr-`, `pl-`, `pr-`. Exclusively `ms-`, `me-`, `ps-`, `pe-`.
- **Principle IV (Truthful Data)**: Tour schema (`site_tours`) consumed transparently with Toman currency.
- **Principle V (Tech Stack)**: Next.js 16 + React 19 + Tailwind v4 + Supabase REST.
