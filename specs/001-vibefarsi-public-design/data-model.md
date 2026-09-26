# Data Model & Component Contracts: VibeFarsi Public Storefront

**Feature**: `001-vibefarsi-public-design`  
**Date**: 2026-09-26  
**Status**: Completed (Phase 1)

---

## 1. Domain Entities & Schemas (Existing DB Preservation)

The feature strictly consumes existing Drizzle schemas from `db/schema.ts` via Supabase REST (`src/lib/db-content.ts`):

```typescript
// Core Tour Entity (Preserved from db/schema.ts: siteTours)
export interface SiteTourItem {
  id: string;
  slug: string;
  title: string;
  type: 'foreign' | 'domestic' | 'exhibition';
  typeLabel: string;
  destination: string;
  destinationSlugs: string[];
  origin: string;
  route: string;
  duration: string;
  nights: number;
  closestDeparture: string;
  price: string;
  formattedPrice: string;
  priceNote: string;
  status: 'confirmed' | 'pending' | 'updating' | 'full';
  statusLabel: string;
  image: string;
  badge?: string | null;
  features: string[];
  visaRequired: boolean;
  hotelStars: number;
  airline: string;
  includedServices: string[];
  excludedServices: string[];
}
```

---

## 2. Refactored Component Interfaces

### 2.1. `TourCard` Component (`src/components/TourCard.tsx`)
```typescript
export interface TourCardProps {
  tour: SiteTourItem;
  variant?: 'standard' | 'compact' | 'featured';
  className?: string;
}
```

### 2.2. `TourCardSkeleton` Component (`src/components/TourCardSkeleton.tsx`)
```typescript
export interface TourCardSkeletonProps {
  count?: number;
  layout?: 'grid' | 'carousel';
}
```

### 2.3. `TravelSearchWidget` Component (`src/components/TravelSearchWidget.tsx`)
```typescript
export interface TravelSearchState {
  originSlug: string;
  destinationSlug: string;
  tourKind: 'all' | 'foreign' | 'domestic' | 'exhibition';
  departureDateSolar: string | null; // e.g. "1405-07-15"
}

export interface TravelSearchWidgetProps {
  initialState?: Partial<TravelSearchState>;
  onSearch?: (state: TravelSearchState) => void;
  className?: string;
}
```

### 2.4. `TrustBar` Data Contract (`src/components/TrustBar.tsx`)
```typescript
export interface TrustPillar {
  id: string;
  titleFa: string;
  subtitleFa: string;
  iconName: 'ShieldCheck' | 'MapPin' | 'PhoneCall' | 'Clock';
  badgeFa?: string;
  href?: string;
}
```

---

## 3. Global Token Contract (`src/index.css`)

```css
:root {
  /* Public Surfaces */
  --background: #FAF7F2;
  --foreground: #172027;
  --card: #FFFFFF;
  --card-foreground: #172027;
  --popover: #FFFFFF;
  --popover-foreground: #172027;

  /* Brand Accents */
  --primary: #FF6600;
  --primary-foreground: #FFFFFF;
  --secondary: #102A3A;
  --secondary-foreground: #FFFFFF;

  /* Neutrals & States */
  --muted: #F3F4F6;
  --muted-foreground: #66727A;
  --accent: #FFF0E6;
  --accent-foreground: #D95500;
  --destructive: #D93D3D;
  --destructive-foreground: #FFFFFF;

  /* Borders & Controls */
  --border: #E2E6E8;
  --input: #E2E6E8;
  --ring: #FF6600;
  --radius: 1rem;
}

/* Admin Zone Preserved */
.admin-vibefarsi,
body:has(.admin-vibefarsi) {
  color-scheme: dark;
  --background: oklch(0.115 0.002 285);
  --foreground: oklch(0.975 0 0);
  --card: oklch(0.145 0.004 285);
  /* ... preserved graphite tokens */
}
```
