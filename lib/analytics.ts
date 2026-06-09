/**
 * Pure analytics for the insights page.
 *
 * Every function here is side-effect free and operates on plain arrays so it
 * can be unit-tested exhaustively without a database or React. The UI passes in
 * the already-filtered logs, so these results automatically respect whatever
 * time/store/status filter is active on the page.
 *
 * Nothing in this module writes to the database — it is read/derive only.
 */

import type { StockoutLog } from "@/context/TrackerContext";

/** A row from the `promo_calendar` table. */
export interface PromoCalendarRow {
  id: string;
  brand_name: string;
  promo_desc: string | null;
  start_date: string; // date, "YYYY-MM-DD"
  end_date: string; // date, "YYYY-MM-DD"
  discount_type: string | null;
  created_at: string;
}

/**
 * The subset of log fields the analytics actually read. `StockoutLog` is
 * structurally assignable to this, so real logs pass straight through while
 * tests can build minimal fixtures.
 */
export interface AnalyticsLog {
  store: string;
  product: string;
  pack_type: string;
  root_cause: string;
  is_worked: boolean;
  is_hidden: boolean;
  created_at: string;
  last_verified_at?: string | null;
  verification_count?: number | null;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** Whole days between two ISO timestamps, never negative. */
export function daysBetween(fromIso: string, toIso: string | number | Date): number {
  const from = new Date(fromIso).getTime();
  const to = toIso instanceof Date ? toIso.getTime() : new Date(toIso).getTime();
  if (Number.isNaN(from) || Number.isNaN(to)) return 0;
  return Math.max(0, Math.floor((to - from) / DAY_MS));
}

export interface KpiSummary {
  total: number;
  open: number;
  resolved: number;
  /** 0..1 share of logs marked worked. */
  resolutionRate: number;
  /** Mean age in days of still-open gaps. */
  avgOpenAgeDays: number;
  /** Oldest still-open gap, in days. */
  longestOpenDays: number;
}

export function summarizeKpis(
  logs: AnalyticsLog[],
  now: Date = new Date(),
): KpiSummary {
  const total = logs.length;
  const openLogs = logs.filter((l) => !l.is_worked);
  const open = openLogs.length;
  const resolved = total - open;

  const ages = openLogs.map((l) => daysBetween(l.created_at, now));
  const avgOpenAgeDays = ages.length
    ? ages.reduce((sum, d) => sum + d, 0) / ages.length
    : 0;
  const longestOpenDays = ages.length ? Math.max(...ages) : 0;

  return {
    total,
    open,
    resolved,
    resolutionRate: total ? resolved / total : 0,
    avgOpenAgeDays,
    longestOpenDays,
  };
}

export interface CauseSlice {
  cause: string;
  count: number;
  /** 0..1 share of the total. */
  pct: number;
}

export function rootCauseBreakdown(logs: AnalyticsLog[]): CauseSlice[] {
  const counts = new Map<string, number>();
  for (const log of logs) {
    const cause = log.root_cause?.trim() || "Unspecified";
    counts.set(cause, (counts.get(cause) ?? 0) + 1);
  }
  const total = logs.length;
  return Array.from(counts, ([cause, count]) => ({
    cause,
    count,
    pct: total ? count / total : 0,
  })).sort((a, b) => b.count - a.count || a.cause.localeCompare(b.cause));
}

export interface ProductCount {
  product: string;
  count: number;
}

/** Products with the most logged gaps in the set. */
export function topProducts(logs: AnalyticsLog[], limit = 5): ProductCount[] {
  const counts = new Map<string, number>();
  for (const log of logs) {
    const product = log.product?.trim() || "Unknown";
    counts.set(product, (counts.get(product) ?? 0) + 1);
  }
  return Array.from(counts, ([product, count]) => ({ product, count }))
    .sort((a, b) => b.count - a.count || a.product.localeCompare(b.product))
    .slice(0, limit);
}

export interface ChronicOffender {
  store: string;
  product: string;
  /** Distinct logged episodes for this store+product (each row is one gap). */
  occurrences: number;
  /** Summed verification streak across those episodes (total outage days). */
  totalDays: number;
}

/**
 * Store+product pairs that go out of stock repeatedly. `occurrences > 1` means
 * the same item has gapped more than once — the highest-signal target for
 * intervention. Sorted by occurrences, then total outage days.
 */
export function chronicOffenders(
  logs: AnalyticsLog[],
  limit = 5,
): ChronicOffender[] {
  const groups = new Map<string, ChronicOffender>();
  for (const log of logs) {
    const store = log.store?.trim() || "Unknown";
    const product = log.product?.trim() || "Unknown";
    const key = `${store}||${product}`;
    const entry = groups.get(key) ?? { store, product, occurrences: 0, totalDays: 0 };
    entry.occurrences += 1;
    entry.totalDays += Math.max(1, log.verification_count ?? 1);
    groups.set(key, entry);
  }
  return Array.from(groups.values())
    .sort(
      (a, b) =>
        b.occurrences - a.occurrences ||
        b.totalDays - a.totalDays ||
        a.store.localeCompare(b.store),
    )
    .slice(0, limit);
}

/** Number of distinct store+product pairs that have gapped more than once. */
export function chronicCount(logs: AnalyticsLog[]): number {
  const counts = new Map<string, number>();
  for (const log of logs) {
    const key = `${log.store?.trim()}||${log.product?.trim()}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  let chronic = 0;
  for (const n of counts.values()) if (n > 1) chronic += 1;
  return chronic;
}

export interface WeekBucket {
  /** Sunday that starts the week, "YYYY-MM-DD". */
  weekStart: string;
  count: number;
}

/** UTC date portion ("YYYY-MM-DD") of an ISO timestamp. */
export function isoDate(iso: string): string {
  return new Date(iso).toISOString().slice(0, 10);
}

function weekStartOf(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const utcMidnight = Date.UTC(
    d.getUTCFullYear(),
    d.getUTCMonth(),
    d.getUTCDate(),
  );
  const dow = new Date(utcMidnight).getUTCDay(); // 0 = Sunday
  return new Date(utcMidnight - dow * DAY_MS).toISOString().slice(0, 10);
}

/**
 * New gaps bucketed by the (UTC) week they were first logged, oldest first.
 * This is the "are we trending down?" series.
 */
export function trendByWeek(logs: AnalyticsLog[]): WeekBucket[] {
  const counts = new Map<string, number>();
  for (const log of logs) {
    const week = weekStartOf(log.created_at);
    if (!week) continue;
    counts.set(week, (counts.get(week) ?? 0) + 1);
  }
  return Array.from(counts, ([weekStart, count]) => ({ weekStart, count })).sort(
    (a, b) => a.weekStart.localeCompare(b.weekStart),
  );
}

/** Normalize a name to alphanumeric words for fuzzy comparison. */
export function normalizeName(value: string): string {
  return (value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/**
 * Whether a promo's brand plausibly refers to a logged product. Matches when
 * the normalized names are equal or one contains the other (e.g. promo
 * "Pepsi" ↔ product "Diet Pepsi").
 */
export function brandMatchesProduct(brandName: string, product: string): boolean {
  const b = normalizeName(brandName);
  const p = normalizeName(product);
  if (!b || !p) return false;
  return p === b || p.includes(b) || b.includes(p);
}

export function isLogDuringPromo(
  log: AnalyticsLog,
  promo: PromoCalendarRow,
): boolean {
  if (!brandMatchesProduct(promo.brand_name, log.product)) return false;
  const day = isoDate(log.created_at);
  return day >= promo.start_date && day <= promo.end_date;
}

export interface PromoOverlap {
  total: number;
  onPromo: number;
  offPromo: number;
  /** 0..1 share of gaps that coincided with a matching active promo. */
  pct: number;
  /** Products gapped during their own promo, most frequent first. */
  byProduct: ProductCount[];
}

/**
 * How many logged gaps coincided with an active, brand-matching promotion.
 * Answers "how much of our out-of-stock is promo-driven (and stockable-ahead)?"
 */
export function promoOverlap(
  logs: AnalyticsLog[],
  promos: PromoCalendarRow[],
): PromoOverlap {
  const total = logs.length;
  const byProduct = new Map<string, number>();
  let onPromo = 0;

  for (const log of logs) {
    const matched = promos.some((promo) => isLogDuringPromo(log, promo));
    if (matched) {
      onPromo += 1;
      const product = log.product?.trim() || "Unknown";
      byProduct.set(product, (byProduct.get(product) ?? 0) + 1);
    }
  }

  return {
    total,
    onPromo,
    offPromo: total - onPromo,
    pct: total ? onPromo / total : 0,
    byProduct: Array.from(byProduct, ([product, count]) => ({ product, count }))
      .sort((a, b) => b.count - a.count || a.product.localeCompare(b.product))
      .slice(0, 8),
  };
}

/**
 * Every non-archived episode of the same SKU (store + product + pack type) as
 * the given item, newest first. Each episode is a separate row because the
 * dedup engine starts a fresh log once a gap is resolved and recurs — so this
 * is the recurrence history for one item at one store.
 */
export function episodesForItem<T extends AnalyticsLog>(
  logs: T[],
  item: { store: string; product: string; packType: string },
): T[] {
  const key = (s: string) => (s ?? "").trim().toLowerCase();
  const store = key(item.store);
  const product = key(item.product);
  const pack = key(item.packType);
  return logs
    .filter(
      (l) =>
        !l.is_hidden &&
        key(l.store) === store &&
        key(l.product) === product &&
        key(l.pack_type) === pack,
    )
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export interface EpisodeSummary {
  occurrences: number;
  totalDays: number;
  openCount: number;
}

export function summarizeEpisodes(episodes: AnalyticsLog[]): EpisodeSummary {
  return {
    occurrences: episodes.length,
    totalDays: episodes.reduce(
      (sum, e) => sum + Math.max(1, e.verification_count ?? 1),
      0,
    ),
    openCount: episodes.filter((e) => !e.is_worked).length,
  };
}

// Re-export so callers can use the richer type without importing two modules.
export type { StockoutLog };
