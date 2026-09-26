# Contract: Tour Hub Navigation

```typescript
export interface TourHubNavProps {
  currentTab: 'tours' | 'leads' | 'places' | 'origins' | 'hotels';
  counts?: {
    tours?: number;
    leads?: number;
    places?: number;
    origins?: number;
    hotels?: number;
  };
}
```
