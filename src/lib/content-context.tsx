'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { SAMPLE_TOURS, type TourItem } from '@/src/data/toursData';
import { COUNTRIES, CITIES, type Place } from '@/src/data/destinationsData';
import { GUIDES, type GuideItem } from '@/src/data/guidesData';
import { EXHIBITION_SERIES, type ExhibitionSeries } from '@/src/data/exhibitionsData';

export interface ContentValue {
  tours: TourItem[];
  countries: Record<string, Place>;
  cities: Record<string, Place>;
  guides: Record<string, GuideItem>;
  exhibitions: Record<string, ExhibitionSeries>;
}

const STATIC_CONTENT: ContentValue = {
  tours: SAMPLE_TOURS,
  countries: COUNTRIES,
  cities: CITIES,
  guides: GUIDES,
  exhibitions: EXHIBITION_SERIES,
};

const ContentContext = createContext<ContentValue>(STATIC_CONTENT);

export function ContentProvider({
  value,
  children,
}: {
  value?: Partial<ContentValue>;
  children: ReactNode;
}) {
  const merged: ContentValue = {
    tours: value?.tours && value.tours.length > 0 ? value.tours : STATIC_CONTENT.tours,
    countries:
      value?.countries && Object.keys(value.countries).length > 0
        ? value.countries
        : STATIC_CONTENT.countries,
    cities:
      value?.cities && Object.keys(value.cities).length > 0
        ? value.cities
        : STATIC_CONTENT.cities,
    guides:
      value?.guides && Object.keys(value.guides).length > 0
        ? value.guides
        : STATIC_CONTENT.guides,
    exhibitions:
      value?.exhibitions && Object.keys(value.exhibitions).length > 0
        ? value.exhibitions
        : STATIC_CONTENT.exhibitions,
  };
  return (
    <ContentContext.Provider value={merged}>{children}</ContentContext.Provider>
  );
}

/** محتوای زنده سایت (از دیتابیس) با پشتیبان استاتیک. */
export function useContent(): ContentValue {
  return useContext(ContentContext);
}