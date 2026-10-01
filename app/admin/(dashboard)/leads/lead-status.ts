import type { LeadStatus } from './actions';

/**
 * جدول برچسب واحد وضعیت‌های لید (L5): یک منبع حقیقت برای برچسب فارسی و
 * واریانت بج؛ هم در جدول، هم در دیالوگ جزئیات، هم در عملیات گروهی.
 */
export const LEAD_STATUSES: LeadStatus[] = ['new', 'contacted', 'qualified', 'won', 'lost', 'invalid'];

export const LEAD_STATUS_FA: Record<LeadStatus, string> = {
  new: 'جدید',
  contacted: 'تماس گرفته‌شده',
  qualified: 'واجد شرایط',
  won: 'موفق',
  lost: 'ناموفق',
  invalid: 'نامعتبر',
};

export const LEAD_STATUS_VARIANT: Record<LeadStatus, 'brand' | 'warning' | 'success' | 'destructive' | 'secondary'> = {
  new: 'brand',
  contacted: 'warning',
  qualified: 'warning',
  won: 'success',
  lost: 'destructive',
  invalid: 'secondary',
};
