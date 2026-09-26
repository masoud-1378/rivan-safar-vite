# Implementation Plan: 5-Stage Modular Tour Editor in Admin

**Branch**: `002-tour-5stages-editor` | **Date**: 2026-09-26 | **Spec**: `specs/002-tour-5stages-editor/spec.md`  
**Status**: Ready for Tasks Generation

---

## 1. Summary & Architecture Approach

Transform the monolithic, long form in `app/admin/(dashboard)/tours/TourForm.tsx` into a modern **5-stage modular workspace** utilizing VibeFarsi `Tabs` or stepped navigation:

1. **Tab 1: هویت پایه و حمل‌ونقل (`identity`)**:
   - Title, Slug, Tour Type (`foreign`, `domestic`, `exhibition`).
   - Transport Kind (`air`, `rail`, `land`, `mixed`) with carrier name (airline or train/bus company).
   - Origins (`originCities` multi-select) & Destinations (`tree.all`).
   - Duration (days/nights), Jalali departure date, Guaranteed departure toggle (`حرکت تضمین‌شده`), Base price & currency.
2. **Tab 2: پکیج هتل‌ها و ماتریس اتاق‌ها (`accommodations`)**:
   - Hotel picker connected to `accommodations` / `hotels`.
   - Meal plan Board selector (`BB`, `HB`, `FB`, `ALL`, `UALL`).
   - Detailed price matrix per room: Double room (۲ تخته), Single room (۱ تخته), Child with bed, Child without bed, infant.
3. **Tab 3: برنامه سفر روزبه‌روز (`itinerary`)**:
   - Dynamic day cards: Day number, title, city, activity type (guided tour, free day, intercity transit), meal counts, and highlights.
4. **Tab 4: تعهدات حقوقی، مدارک و هزینه‌های پنهان (`trust_terms`)**:
   - Destination-aware documents checklist generator.
   - Return guarantee deposit amount (ضمانت بازگشت).
   - City tax disclosure, mandatory tips disclosure, luggage allowance (kg), physical activity level (آرام ساحلی تا پیاده‌روی سنگین).
5. **Tab 5: کارشناس و صدای مشاور (`consultant`)**:
   - Dedicated route consultant name, title, direct phone/extension.
   - Audio consultant voice note / podcast URL (`صدای مشاور سفر`).
   - Emergency ground support contact.

---

## 2. Technical Context & Constitution Compliance

- **Principle I (Step Zero)**: All fields map to existing tables and structured JSONB columns without inventing schemas or breaking production database models.
- **Principle II (Purpose Razor)**: Every stage directly solves a traveler friction point discovered during the 60-tour market reconnaissance.
- **Principle III (VibeFarsi)**: Token-based RTL layout with VibeFarsi `Card`, `Badge`, `Button`, `Field`, `Input`, `AmountInput`, `Select`, `Textarea`, and `Tabs`.
- **Principle IV (Zero Downtime / Backward Compatibility)**: Existing tours load cleanly with default fallbacks for new modular fields.

---

## 3. Implementation Steps

1. **Phase 1: Types & Server Actions Contract Extension**:
   - Extend `TourInput` in `app/admin/(dashboard)/tours/actions.ts` to support transport kind, itinerary array, room matrix, trust terms, and consultant profile.
2. **Phase 2: Modular Tab Components**:
   - Build `TourIdentityStage.tsx`
   - Build `TourHotelsStage.tsx`
   - Build `TourItineraryStage.tsx`
   - Build `TourTrustStage.tsx`
   - Build `TourConsultantStage.tsx`
3. **Phase 3: Integration into `TourForm.tsx`**:
   - Refactor `TourForm.tsx` into a tabbed layout with validation gates and quick-jump.
4. **Phase 4: Quality & Build Verification**:
   - Run `tsc --noEmit` and `npx next build` to guarantee 0 regressions across all 59 routes.
