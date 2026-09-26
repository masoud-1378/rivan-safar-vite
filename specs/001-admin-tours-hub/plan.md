# Implementation Plan: Dedicated Tour Management Hub (سامانه جامع مدیریت تورها)

**Branch**: `001-admin-tours-hub` | **Date**: 2026-09-26 | **Spec**: `specs/001-admin-tours-hub/spec.md`  
**Status**: Ready for Tasks Generation

---

## 1. Summary & Architecture Approach

Consolidate the fragmented tour-related admin views into a cohesive **Tour Management Hub** (`/admin/tours`), creating a dedicated operations dashboard when clicking "تورها" in the sidebar.

The 5 operational pillars:
1. **لیست تورها (`/admin/tours`)**: Main tour packages manager, status, and pricing.
2. **درخواست‌های رزرو تور (`/admin/tours/leads`)**: Booking inquiries specifically for tours.
3. **مقصدها و شهرها (`/admin/tours/places`)**: Destination tree (countries/cities).
4. **مبدأهای حرکت (`/admin/tours/origins` یا `/admin/origins`)**: Departure hubs/cities (هوایی، زمینی، ریلی).
5. **هتل‌های طرف قرارداد (`/admin/tours/hotels`)**: Partner hotels & amenities.

### Technical Architecture
- Create a shared sub-layout / navigation header component `app/admin/(dashboard)/tours/TourHubNav.tsx` displaying the 5 pillars with active tab states and count badges.
- Retain existing direct URLs (`/admin/hotels`, `/admin/origins`, `/admin/places`, `/admin/leads`) as secondary aliases or re-route them into the Tour Hub context so no bookmarks break.
- Update `AdminSidebar.tsx`: Group the 5 items under the prominent "مدیریت تورها" umbrella.
- Provide a dedicated Tour Leads sub-view with quick status toggles.

---

## 2. Technical Context & Constitution Gates

- **Principle I (Step Zero)**: Retain existing PostgreSQL schemas and Supabase REST actions. No invented fields.
- **Principle II (Purpose Razor)**: Direct, friction-free access to all tour inventory and incoming tour inquiries in one workspace.
- **Principle III (VibeFarsi)**: Graphite dark theme, VibeFarsi `Badge`, `Card`, `Button`, `DataTable`, `Tabs`.
- **Principle IV (Type Safety)**: 100% TypeScript type-safe routes and actions.

---

## 3. Detailed Component Plan

1. **`TourHubNav.tsx`**:
   - Reusable tab-navigation bar at the top of tour sub-pages.
   - Shows tabs:
     - 📋 لیست تورها (`/admin/tours`)
     - 📥 درخواست‌های رزرو (`/admin/tours/leads`)
     - 🌍 مقصدها و شهرها (`/admin/tours/places`)
     - 🧭 مبدأهای حرکت (`/admin/origins`)
     - 🏨 هتل‌های طرف قرارداد (`/admin/tours/hotels`)
2. **Sub-Route Setup**:
   - `app/admin/(dashboard)/tours/leads/page.tsx`: Reuses `LeadManager` filtered for tour inquiries.
   - `app/admin/(dashboard)/tours/places/page.tsx`: Destination manager view within Tour Hub context.
   - `app/admin/(dashboard)/tours/origins/page.tsx`: Origins manager view within Tour Hub context.
   - `app/admin/(dashboard)/tours/hotels/page.tsx`: Hotel manager view within Tour Hub context.
3. **`AdminSidebar.tsx` Refactor**:
   - Streamlines the navigation to highlight "مدیریت تورها" as a prominent, multi-faceted operational hub.
