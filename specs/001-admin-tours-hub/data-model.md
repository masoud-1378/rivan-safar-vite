# Data Model & Contracts: Tour Management Hub

**Feature**: `001-admin-tours-hub`  
**Date**: 2026-09-26

---

## 1. Navigational Pillar Contracts

```typescript
export interface TourHubTabItem {
  id: 'tours' | 'leads' | 'places' | 'origins' | 'hotels';
  label: string;
  href: string;
  iconName: string;
  description: string;
  badge?: number | string;
}
```

## 2. Server Action Reuse

- `listTours()` from `app/admin/(dashboard)/tours/actions`
- `listLeads()` from `app/admin/(dashboard)/leads/actions`
- `listDestinationTree()` from `app/admin/(dashboard)/places/actions`
- `listOrigins()` from `app/admin/(dashboard)/origins/actions`
- `listHotels()` from `app/admin/(dashboard)/hotels/actions`
