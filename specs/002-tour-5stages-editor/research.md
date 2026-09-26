# Research & Architecture Decisions: 5-Stage Modular Tour Editor

**Feature**: `002-tour-5stages-editor`  
**Date**: 2026-09-26

---

## 1. Modular Tab State Management

Instead of one enormous 860-line monolithic JSX file, `TourForm.tsx` acts as the orchestrating container managing the overall `formData` state and validation.

The 5 stages are cleanly separated into focused modules:
1. `TourIdentityStage`: Base data, origins, destinations, transport, pricing.
2. `TourHotelsStage`: Hotel packages, board types, room rate matrix.
3. `TourItineraryStage`: Dynamic day-by-day builder.
4. `TourTrustStage`: Documents, guarantee deposit, city tax, luggage, physical level.
5. `TourConsultantStage`: Dedicated consultant details, audio consultant note.

## 2. Backward Compatibility for Existing Tours

Existing tours in PostgreSQL/Drizzle have `hotelOptions: Array<{ name?, stars?, board?, pricePerPerson? }>`.
To ensure 100% backward compatibility:
- We extend `hotelOptions` to include `priceSingle`, `priceDouble`, `priceChildWithBed`, `priceChildNoBed`.
- If older fields only have `pricePerPerson`, it seamlessly falls back to `priceDouble`.
- Itinerary, trust specs, and consultant details are preserved cleanly in the tour record.
