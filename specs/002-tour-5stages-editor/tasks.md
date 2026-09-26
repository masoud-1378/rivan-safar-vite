# Tasks: 5-Stage Modular Tour Editor in Admin

**Feature**: `002-tour-5stages-editor`  
**Status**: Completed ✓

---

## Phase 1: Data Contracts & Action Extensions

- [x] **T001**: Extend `TourInput` in `app/admin/(dashboard)/tours/actions.ts` and `tour-helpers.ts` to support:
  - `transportKind`: `'air' | 'rail' | 'land' | 'mixed'`
  - `carrierName`: string
  - `itineraryDays`: `Array<{ day: number; title: string; city: string; description: string; activityType: string; meals?: string }>`
  - `trustSpecs`: `{ returnGuarantee?: string; cityTax?: string; luggageKg?: number; activityLevel?: string; requiredDocs?: string[] }`
  - `consultantSpec`: `{ name?: string; title?: string; phone?: string; audioUrl?: string; emergencyPhone?: string }`
  - Extended room prices in `hotelOptions`: `priceDouble`, `priceSingle`, `priceChildWithBed`, `priceChildNoBed`, `locationNote`.

---

## Phase 2: Core Logistics & Accommodations Stages

- [x] **T002**: Build `app/admin/(dashboard)/tours/stages/Stage1Identity.tsx` handling:
  - Tour title, slug, type (foreign/domestic/exhibition).
  - Transport kind selector (هواپیما / قطار / اتوبوس VIP) with dynamic carrier input.
  - Multiple origins (`origins` selector) & destinations tree hierarchy with tags.
  - Duration (nights/days), guaranteed departure toggle.
  - Base price input and split currency handling (Toman vs USD/EUR/AED).
- [x] **T003**: Build `app/admin/(dashboard)/tours/stages/Stage2Hotels.tsx` handling:
  - Hotel picker and packages list.
  - Board type selector (BB, HB, FB, ALL, UALL, RO).
  - Room rate matrix (دوتخته، تک‌تخته، کودک با تخت، کودک بدون تخت).
  - Location note and transfer distance.

---

## Phase 3: Itinerary, Trust Shield & Consultant Stages

- [x] **T004**: Build `app/admin/(dashboard)/tours/stages/Stage3Itinerary.tsx` handling:
  - Dynamic day-by-day card builder (روز ۱، روز ۲...).
  - Activity type (گشت با لیدر، وقت آزاد و خرید، ترانسفر بین‌شهری، عزیمت).
  - Meals included per day (صبحانه، ناهار، شام).
  - Included services vs Excluded services tags.
- [x] **T005**: Build `app/admin/(dashboard)/tours/stages/Stage4TrustTerms.tsx` handling:
  - Smart checklist for required documents with quick presets.
  - Return guarantee amount (ضمانت بازگشت).
  - City tax and mandatory tips disclosure.
  - Luggage allowance (کیلوگرم) and physical activity level selector.
- [x] **T006**: Build `app/admin/(dashboard)/tours/stages/Stage5Consultant.tsx` handling:
  - Dedicated route specialist name, title, and direct extension.
  - Voice consultant audio link («صدای مشاور سفر» / پادکست معرفی تور).
  - 24/7 destination emergency contact number.
  - Publishing status (published, pending, archived).

---

## Phase 4: Container Orchestration & Navigation Tabs

- [x] **T007**: Refactor `app/admin/(dashboard)/tours/TourForm.tsx` to host the 5 stages within an intuitive VibeFarsi tab bar with validation indicators, step navigation, and unified save.
- [x] **T008**: Update main tours table in `ToursManager.tsx` to render transport badges (هواپیما، قطار، اتوبوس) and origin/destination route.

---

## Phase 5: Verification & Quality Gates

- [x] **T009**: Execute `tsc --noEmit` and `npx next build` to guarantee zero compilation errors across all 59 routes.
