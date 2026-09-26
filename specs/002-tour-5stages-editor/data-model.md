# Data Model: 5-Stage Tour Editor

```typescript
export interface TourItineraryDay {
  day: number;
  title: string;
  city: string;
  description: string;
  activityType: 'guided' | 'free' | 'transit' | 'departure';
  includedMeals?: string[]; // e.g. ['breakfast', 'lunch']
}

export interface TourHotelOption {
  hotelId?: string;
  name: string;
  stars: number;
  board: 'BB' | 'HB' | 'FB' | 'ALL' | 'UALL' | string;
  locationNote?: string;
  priceDouble: string; // Toman or foreign currency
  priceSingle?: string;
  priceChildWithBed?: string;
  priceChildNoBed?: string;
}

export interface TourTrustSpecs {
  requiredDocs: string[];
  returnGuaranteeAmount?: string; // e.g. "۱ تا ۲ میلیارد تومان ضمانت‌نامه بانکی"
  cityTaxNote?: string; // e.g. "شبی ۴ یورو مالیات شهری بر عهده مسافر در هتل"
  tipsNote?: string;
  luggageAllowanceKg?: number; // e.g. 30
  activityLevel?: 'easy' | 'moderate' | 'demanding';
  guaranteedDeparture?: boolean;
}

export interface TourConsultantSpec {
  name: string;
  title: string;
  phoneOrExtension: string;
  audioNoteUrl?: string; // صدای مشاور سفر
  emergencySupportPhone?: string;
}
```
