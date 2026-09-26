# Feature Specification: Dedicated Tour Management Hub (سامانه جامع مدیریت تورها)

**Feature Branch**: `001-admin-tours-hub`  
**Created**: 2026-09-26  
**Status**: Draft (Review Gate 1)  
**Input**: When clicking on "تورها" in Admin, enter a dedicated, comprehensive Tour Management Hub consolidating:
1. درخواست‌های رزرو تور (Tour booking/lead requests)
2. لیست تورها (Tours list / CRUD)
3. مقصدها و شهرها (Destinations & Cities)
4. مبدأها (Origins / Departure cities)
5. هتل‌ها (Hotels)

---

## 1. Executive Summary & Architecture Context

Currently, the admin sidebar lists `درخواست‌های تماس`, `تورها`, `مقصدها و شهرها`, `مبدأها`, and `هتل‌ها` as fragmented, top-level sibling items. Tour management is extensive enough to warrant its own dedicated workspace.

This feature introduces a dedicated **Tour Management Hub** (`/admin/tours`), featuring:
- A unified top-level sub-navigation / dashboard header tailored specifically to tour operations.
- Direct quick-access sub-navigation between the 5 operational pillars:
  1. **درخواست‌های رزرو تور (`/admin/tours/leads` or tabs in `/admin/tours`)**: Inquiries and booking requests specifically filtered for tours.
  2. **لیست و مدیریت تورها (`/admin/tours`)**: Main tour catalog, pricing, status, and creation.
  3. **مقصدها و شهرها (`/admin/tours/places` or linked `/admin/places`)**: Managing countries, cities, and destination content.
  4. **مبدأهای پروازی (`/admin/tours/origins` or linked `/admin/origins`)**: Departure airports/cities.
  5. **هتل‌های طرف قرارداد (`/admin/tours/hotels` or linked `/admin/hotels`)**: Star ratings, amenities, and partner hotels.
- Preserves 100% of underlying server actions, schemas (`db/schema.ts`), and permission checks (owner vs editor).
- Streamlines the main `AdminSidebar` to represent "مدیریت تورها" as the primary umbrella entry point.

---

## 2. User Scenarios & Prioritized User Stories

### User Story 1 - Dedicated Tour Operations Hub & Navigation (Priority: P1 - MVP)

**User Journey**:  
As an agency administrator or operations manager, when I click on "تورها" in the admin sidebar, I am brought into a dedicated "مرکز مدیریت و عملیات تورها" workspace. At the top of this hub, I see an operations bar with key metrics (تعداد تورهای فعال، درخواست‌های در انتظار، مقاصد و هتل‌ها) and immediate tab/sub-nav links to switch seamlessly between the 5 core sections:
1. درخواست‌های رزرو (Booking Inquiries)
2. لیست و پکیج‌های تور (Tour Packages)
3. مقصدها و شهرها (Destinations)
4. مبدأها (Origins)
5. هتل‌ها (Hotels)

**Why this priority**:  
Eliminates mental friction and fragmentation. All resources needed to publish, update, and fulfill tours are grouped into a single, cohesive command center.

**Independent Test**:  
Can be tested by navigating to `/admin/tours`: verify the presence of the Tour Hub Sub-Header/Tabs with the 5 sections, operational counters, and smooth routing between them.

**Acceptance Scenarios**:
1. **Given** an admin user in `/admin`, **When** clicking "تورها", **Then** the Tour Management Hub loads with dedicated sub-navigation for the 5 pillars.
2. **Given** the Tour Hub sub-navigation, **When** switching between tabs (رزروها، تورها، مقصدها، مبدأها، هتل‌ها), **Then** each view maintains contextual breadcrumbs back to the Tour Hub.

---

### User Story 2 - Dedicated Tour Booking Requests Sub-Panel (Priority: P2)

**User Journey**:  
As a tour sales expert, when I am in the Tour Hub and select "درخواست‌های رزرو تور", I see only leads/inquiries associated with tours (excluding general contact inquiries), complete with tour name, departure date, contact phone, and quick status actions (تماس گرفته شد، در انتظار، لغو شده).

**Why this priority**:  
Fulfills user request #1: operations staff managing tours need to immediately see booking leads alongside tour inventory without navigating away to the generic inbox.

**Independent Test**:  
Navigate to the Tour Hub's "درخواست‌های رزرو": verify leads specific to tour packages are displayed with contact digits, status badges, and management actions.

**Acceptance Scenarios**:
1. **Given** tour leads exist, **When** viewing the Tour Bookings view, **Then** leads are listed chronologically with contact numbers, tour titles, and status controls.
2. **Given** a new tour inquiry, **When** updating its status, **Then** the change persists instantly via Supabase REST.

---

### User Story 3 - Consolidated Destinations, Origins & Hotels Sub-Panels (Priority: P3)

**User Journey**:  
As a tour manager composing a new tour package, I can directly inspect and edit partner hotels, active origin airports, and destination cities right within the Tour Hub workspace without jumping through disconnected sidebar menus.

**Why this priority**:  
Completes the 5 pillars specified by the user (`مقصدها و شهرها`, `مبدأها`, `هتل‌ها`) under the unified Tour Hub umbrella.

**Independent Test**:  
In `/admin/tours`, click on "هتل‌ها", "مقصدها", or "مبدأها": verify each view renders with full CRUD capabilities inside the Tour Hub workspace context.

**Acceptance Scenarios**:
1. **Given** a manager viewing "هتل‌ها" in Tour Hub, **When** creating or editing a hotel, **Then** the hotel becomes immediately selectable in the Tour Package builder.
2. **Given** the main `AdminSidebar`, **When** reviewed, **Then** sidebar clutter is reduced by organizing these entities under the primary "مدیریت تورها" umbrella while preserving direct deep-links.

---

## 3. Edge Cases & Safeguards

- **Direct URL Bookmarks**: If an admin has bookmarked `/admin/hotels`, `/admin/places`, or `/admin/origins`, these URLs must continue to work flawlessly (via redirects or nested layout) without breaking bookmarks or external links.
- **Permissions (Owner vs Editor)**: Both owners and editors have access to tour management, but audit logs and user rights remain enforced.
- **Empty States**: If a destination has no tours, or no booking requests exist yet, display an elegant VibeFarsi `EmptyState` component with clear CTA to create one.

---

## 4. Functional Requirements

- **FR-001**: System MUST provide a dedicated Tour Management Hub sub-header/layout with 5 navigational tabs: `لیست تورها`, `درخواست‌های رزرو`, `مقصدها و شهرها`, `مبدأها`, `هتل‌ها`.
- **FR-002**: Tour booking requests MUST filter leads specifically associated with tours or provide direct filtered triage for tour sales.
- **FR-003**: The Tour Hub MUST display real-time summary indicators (active tours count, pending leads count, total destinations, total hotels).
- **FR-004**: All UI views inside the Tour Hub MUST consume VibeFarsi components (`@/components/ui/*`) and graphite theme tokens.
- **FR-005**: All existing server actions (`listTours`, `listHotels`, `listOrigins`, `listDestinationTree`, `listLeads`) MUST remain fully functional without breaking database integrity.

---

## 5. Success Criteria

- **SC-001**: Single-click access to all 5 tour pillars directly from the Tour Hub.
- **SC-002**: Clean TypeScript compilation (`tsc --noEmit`) with zero errors.
- **SC-003**: Production Next.js build passes with all admin routes intact.
