"use client";

import * as React from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Plus, Search } from "lucide-react";
import { cn, en, fa } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table";
import { Checkbox } from "./checkbox";
import { Button } from "./button";
import { Pagination } from "./pagination";
import { Skeleton } from "./skeleton";
import { EmptyState } from "./empty-state";
import { Input } from "./input";

export interface Column<T> {
  key: keyof T & string;
  header: React.ReactNode;
  sortable?: boolean;
  /** Right-aligned digits, tabular figures; sorts numerically. */
  numeric?: boolean;
  /** Custom cell renderer. */
  cell?: (row: T) => React.ReactNode;
  className?: string;
}

export interface DataTableSelection {
  selected: Set<string>;
  onToggle: (key: string) => void;
  /** انتخاب/لغو انتخاب همهٔ کلیدهای نمای فعلی (همین صفحه). */
  onTogglePage: (keys: string[], select: boolean) => void;
}

export interface DataTableProps<T> {
  rows: T[];
  columns: Column<T>[];
  rowKey: (row: T) => string;
  loading?: boolean;
  pageSize?: number;
  /** Keys searched by the toolbar filter. Omit to hide the search box. */
  searchKeys?: (keyof T & string)[];
  searchPlaceholder?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  toolbar?: React.ReactNode;
  onRowClick?: (row: T) => void;
  className?: string;
  /** عملیات گروهی: اگر داده شود، ستون چک‌باکس اول جدول رندر می‌شود. */
  selection?: DataTableSelection;
  /** دکمهٔ CTA در حالت خالی، مثلاً «ساخت اولین X» (X2)؛ فقط وقتی هیچ ردیفی نیست، نه در جست‌وجوی بی‌نتیجه (F13). */
  emptyAction?: { label: string; onClick: () => void };
  /**
   * کارت موبایل (میز ۲، ریسپانسیو): اگر داده شود، زیر md هر ردیفِ صفحهٔ جاری
   * با این رندر به‌صورت کارت عمودی نمایش داده می‌شود و جدول فقط در md+ دیده می‌شود.
   * اگر داده نشود، جدول در موبایل با اسکرول افقی و ستون اول چسبان (راست، RTL) نمایش داده می‌شود.
   */
  mobileCard?: (row: T) => React.ReactNode;
}

type Sort<T> = { key: keyof T & string; dir: "asc" | "desc" } | null;

/**
 * صفحه‌بندی ریسپانسیو (میز ۲ + نکتهٔ میز ۴): دکمه‌های صفحه‌بندی در موبایل
 * فشرده‌اند — فقط «قبلی / صفحه‌ی جاری / بعدی» با تارگت لمسی ۴۴px — چون
 * ۹ دکمهٔ ۴۴px در عرض ۳۶۰ overflow می‌دهد. در sm+ همان چیدمان کامل.
 */
export function ResponsivePagination({ page, total, onChange }: { page: number; total: number; onChange: (page: number) => void }) {
  const prevNext =
    "flex h-11 min-w-11 cursor-pointer items-center justify-center gap-1 rounded-sm border border-border px-3 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40";
  return (
    <>
      <div className="flex items-center justify-between gap-2 sm:hidden">
        <button type="button" aria-label="صفحه‌ی قبل" disabled={page <= 1} onClick={() => onChange(page - 1)} className={prevNext}>
          <ChevronRight className="size-4" />
          قبلی
        </button>
        <span className="text-xs text-muted-foreground">
          صفحه‌ی {fa(page)} از {fa(total)}
        </span>
        <button type="button" aria-label="صفحه‌ی بعد" disabled={page >= total} onClick={() => onChange(page + 1)} className={prevNext}>
          بعدی
          <ChevronLeft className="size-4" />
        </button>
      </div>
      <div className="hidden flex-wrap items-center justify-between gap-2 sm:flex">
        <span className="text-xs text-muted-foreground">
          صفحه‌ی {fa(page)} از {fa(total)}
        </span>
        <Pagination page={page} total={total} onChange={onChange} size="sm" />
      </div>
    </>
  );
}

/**
 * جدول داده. Client-side sort, text filter (Persian and Latin digits match each other),
 * تومان-friendly numeric columns, loading skeleton, empty state and pagination.
 */
export function DataTable<T extends Record<string, unknown>>({ rows, columns, rowKey, loading, pageSize = 8, searchKeys, searchPlaceholder = "جست‌وجو…", emptyTitle = "چیزی پیدا نشد", emptyDescription = "فیلتر را عوض کنید یا مورد جدیدی اضافه کنید.", toolbar, onRowClick, className, selection, emptyAction, mobileCard }: DataTableProps<T>) {
  const [q, setQ] = React.useState("");
  const [sort, setSort] = React.useState<Sort<T>>(null);
  const [page, setPage] = React.useState(1);

  const filtered = React.useMemo(() => {
    const needle = en(q.trim()).toLowerCase();
    if (!needle || !searchKeys) return rows;
    return rows.filter((r) => searchKeys.some((k) => en(String(r[k] ?? "")).toLowerCase().includes(needle)));
  }, [rows, q, searchKeys]);

  const sorted = React.useMemo(() => {
    if (!sort) return filtered;
    const col = columns.find((c) => c.key === sort.key);
    const dir = sort.dir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const av = a[sort.key], bv = b[sort.key];
      if (col?.numeric || (typeof av === "number" && typeof bv === "number")) return (Number(av) - Number(bv)) * dir;
      if (av instanceof Date && bv instanceof Date) return (av.getTime() - bv.getTime()) * dir;
      return String(av ?? "").localeCompare(String(bv ?? ""), "fa") * dir;
    });
  }, [filtered, sort, columns]);

  const pages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const current = Math.min(page, pages);
  const view = sorted.slice((current - 1) * pageSize, current * pageSize);

  const viewKeys = view.map(rowKey);
  const allViewSelected = selection && viewKeys.length > 0 && viewKeys.every((k) => selection.selected.has(k));
  const someViewSelected = selection && !allViewSelected && viewKeys.some((k) => selection.selected.has(k));

  function toggleSort(key: keyof T & string) {
    setSort((s) => (s?.key !== key ? { key, dir: "asc" } : s.dir === "asc" ? { key, dir: "desc" } : null));
  }

  function stopRowClick(e: React.SyntheticEvent) {
    e.stopPropagation();
  }

  // F13: دکمهٔ emptyAction فقط وقتی «واقعاً هیچ ردیفی نیست» (rows خالی)،
  // نه وقتی جست‌وجو/فیلتر نتیجه‌ای نداده.
  const emptyActionNode =
    emptyAction && rows.length === 0 ? (
      <Button type="button" onClick={emptyAction.onClick} className="min-h-11">
        <Plus className="size-4" />
        {emptyAction.label}
      </Button>
    ) : undefined;

  const tableNode = (
    <Table
      className={cn(
        // میز ۲: بدون کارت موبایل، در موبایل اسکرول افقی با ستون اول چسبان؛
        // ستون اول در RTL سمت راست است پس sticky right-0.
        !mobileCard &&
          "max-md:[&_td:first-child]:border-e max-md:[&_td:first-child]:border-border max-md:[&_td:first-child]:bg-card max-md:[&_td:first-child]:right-0 max-md:[&_td:first-child]:sticky max-md:[&_th:first-child]:border-e max-md:[&_th:first-child]:border-border max-md:[&_th:first-child]:bg-muted max-md:[&_th:first-child]:right-0 max-md:[&_th:first-child]:sticky max-md:[&_th:first-child]:z-10",
      )}
    >
      <TableHeader>
        <TableRow>
          {selection && (
            <TableHead className="w-10">
              <Checkbox
                checked={allViewSelected ? true : someViewSelected ? "indeterminate" : false}
                onCheckedChange={(next) => selection.onTogglePage(viewKeys, next)}
                aria-label="انتخاب همهٔ ردیف‌های همین صفحه"
              />
            </TableHead>
          )}
          {columns.map((c) => (
            <TableHead key={c.key} className={cn(c.numeric && "text-start", c.className)} aria-sort={sort?.key === c.key ? (sort.dir === "asc" ? "ascending" : "descending") : undefined}>
              {c.sortable ? (
                <button type="button" onClick={() => toggleSort(c.key)} className="inline-flex cursor-pointer items-center gap-1 hover:text-foreground">
                  {c.header}
                  {sort?.key === c.key ? (sort.dir === "asc" ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />) : <ArrowUpDown className="size-3 opacity-50" />}
                </button>
              ) : c.header}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading &&
          Array.from({ length: Math.min(pageSize, 5) }, (_, i) => (
            <TableRow key={`s${i}`}>
              {columns.map((c) => <TableCell key={c.key}><Skeleton className="h-3 w-3/4" /></TableCell>)}
            </TableRow>
          ))}
        {!loading && view.length === 0 && (
          <TableRow>
            <TableCell colSpan={columns.length + (selection ? 1 : 0)} className="p-0">
              <EmptyState
                title={emptyTitle}
                description={emptyDescription}
                className="rounded-none border-0"
                action={emptyActionNode}
              />
            </TableCell>
          </TableRow>
        )}
        {!loading && view.map((row) => (
          <TableRow key={rowKey(row)} onClick={onRowClick ? () => onRowClick(row) : undefined} className={cn(onRowClick && "cursor-pointer")}>
            {selection && (
              <TableCell className="w-10" onClick={stopRowClick}>
                <Checkbox
                  checked={selection.selected.has(rowKey(row))}
                  onCheckedChange={() => selection.onToggle(rowKey(row))}
                  aria-label="انتخاب ردیف"
                />
              </TableCell>
            )}
            {columns.map((c) => (
              <TableCell key={c.key} numeric={c.numeric} className={c.className}>
                {c.cell ? c.cell(row) : String(row[c.key] ?? "")}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <div className={cn("space-y-3", className)}>
      {(searchKeys || toolbar) && (
        <div className="flex flex-wrap items-center gap-2">
          {searchKeys && (
            <div className="w-full max-w-xs">
              <Input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder={searchPlaceholder} startAddon={<Search className="size-4" />} className="h-9 max-md:min-h-11" />
            </div>
          )}
          {toolbar}
          <span className="text-xs text-muted-foreground">{fa(sorted.length)} مورد</span>
        </div>
      )}

      {mobileCard ? (
        <>
          {/* موبایل: کارت عمودی برای هر ردیف */}
          <div className="md:hidden">
            {loading ? (
              <div className="grid gap-2" aria-hidden="true">
                {Array.from({ length: Math.min(pageSize, 4) }, (_, i) => (
                  <Skeleton key={i} className="h-28 w-full" />
                ))}
              </div>
            ) : view.length === 0 ? (
              <EmptyState title={emptyTitle} description={emptyDescription} action={emptyActionNode} />
            ) : (
              <div className="grid gap-2">
                {view.map((row) => (
                  <div
                    key={rowKey(row)}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    className={cn(onRowClick && "cursor-pointer")}
                  >
                    {mobileCard(row)}
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* دسکتاپ/تبلت: جدول معمولی */}
          <div className="hidden md:block">{tableNode}</div>
        </>
      ) : (
        tableNode
      )}

      {pages > 1 && <ResponsivePagination page={current} total={pages} onChange={setPage} />}
    </div>
  );
}
