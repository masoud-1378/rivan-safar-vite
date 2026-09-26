# Contract: Tour Editor Props & Tab Schema

```typescript
export type TourEditorTabId = 
  | 'identity' 
  | 'accommodations' 
  | 'itinerary' 
  | 'trust_terms' 
  | 'consultant';

export interface TourEditorTabConfig {
  id: TourEditorTabId;
  label: string;
  iconName: string;
  description: string;
}
```
