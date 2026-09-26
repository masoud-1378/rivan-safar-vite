# Tasks: Dedicated Tour Management Hub (سامانه جامع مدیریت تورها)

**Branch**: `001-admin-tours-hub`  
**Status**: Ready for Implementation

---

## Phase 1: Tour Hub Navigation & Shared Sub-Header

- [ ] **T001**: Create `app/admin/(dashboard)/tours/TourHubNav.tsx` displaying the unified 5-pillar operational navigation bar with active styling, icons, and description tooltips:
  1. لیست تورها (`/admin/tours`)
  2. درخواست‌های رزرو تور (`/admin/tours/leads`)
  3. مقصدها و شهرها (`/admin/places`)
  4. مبدأها (`/admin/origins`)
  5. هتل‌ها (`/admin/hotels`)
- [ ] **T002**: Mount `TourHubNav` in `app/admin/(dashboard)/tours/page.tsx` above `ToursManager`.

---

## Phase 2: Dedicated Tour Bookings & Leads View

- [ ] **T003**: Create `app/admin/(dashboard)/tours/leads/page.tsx` integrating `TourHubNav` with `LeadManager` filtered specifically for tour booking requests.
- [ ] **T004**: Add quick filter for tour leads status and easy access to caller information.

---

## Phase 3: Seamless Integration with Places, Origins & Hotels

- [ ] **T005**: Mount `TourHubNav` on `app/admin/(dashboard)/places/page.tsx` so the destination tree functions smoothly within the Tour Hub workspace.
- [ ] **T006**: Mount `TourHubNav` on `app/admin/(dashboard)/origins/page.tsx` so origin airport management functions within the Tour Hub workspace.
- [ ] **T007**: Mount `TourHubNav` on `app/admin/(dashboard)/hotels/page.tsx` so hotel management functions within the Tour Hub workspace.

---

## Phase 4: Admin Sidebar Consolidation & Quality Gates

- [ ] **T008**: Update `app/admin/(dashboard)/AdminSidebar.tsx` to group the tour operations cleanly under the primary "مدیریت تورها" hub, elevating the workspace feel.
- [ ] **T009**: Execute `tsc --noEmit` and `npx next build` to guarantee zero errors across all 58 routes.
