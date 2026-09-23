'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { ContactInfo } from './site-contact';

export type { ContactInfo };

const FALLBACK: ContactInfo = {
  phone: '02633350139',
  phoneHref: 'tel:02633350139',
  phoneDisplay: '۰۲۶ — ۳۳۳۵۰۱۳۹',
  phoneSecondary: '',
  email: 'info@rivansafar.com',
  address: 'کرج، مهرشهر، بلوار شهرداری، نبش ۲۰۸، ساختمان آماتیس، واحد ۷',
  workingHours: 'شنبه تا پنجشنبه، ۹ تا ۲۱',
  showHeaderPhone: true,
  showFooterPhone: true,
  ctaLabel: 'درخواست تماس',
  brand: 'ریوان سفر',
  tagline: 'سفر خوب، از انتخاب روشن شروع می‌شود',
};

const ContactContext = createContext<ContactInfo>(FALLBACK);

export function ContactProvider({ value, children }: { value?: Partial<ContactInfo>; children: ReactNode }) {
  return <ContactContext.Provider value={{ ...FALLBACK, ...value }}>{children}</ContactContext.Provider>;
}

export function useContact(): ContactInfo {
  return useContext(ContactContext);
}
