# Research & Architecture Decisions: Tour Management Hub

**Feature**: `001-admin-tours-hub`  
**Date**: 2026-09-26  
**Status**: Completed

---

## 1. Unified Sub-Navigation Architecture

To avoid code duplication and maintain URL bookmark compatibility:
- We create `TourHubNav.tsx` in `app/admin/(dashboard)/tours/`.
- We place `TourHubNav` at the top of:
  - `/admin/tours` (لیست تورها)
  - `/admin/tours/leads` (درخواست‌های رزرو تور)
  - `/admin/places` and `/admin/tours/places` (مقصدها و شهرها)
  - `/admin/origins` and `/admin/tours/origins` (مبدأها)
  - `/admin/hotels` and `/admin/tours/hotels` (هتل‌ها)
- This guarantees that whether a user navigates to `/admin/tours` or directly opens a sub-pillar, they remain inside the cohesive Tour Management sub-panel with full tab navigation.

## 2. Tour Bookings Filter

The `site_leads` table records incoming inquiries. We add a specialized filter in the tour hub:
- Leads with non-empty `tour_slug` or inquiries originating from tour detail pages represent direct tour booking requests.
- Staff can triage, inspect, and update their operational status without leaving the tour workspace.
