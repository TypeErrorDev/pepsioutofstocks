import { describe, expect, it } from "vitest";
import {
  type AnalyticsLog,
  type PromoCalendarRow,
  brandMatchesProduct,
  chronicCount,
  chronicOffenders,
  daysBetween,
  episodesForItem,
  isLogDuringPromo,
  normalizeName,
  promoOverlap,
  rootCauseBreakdown,
  summarizeEpisodes,
  summarizeKpis,
  topProducts,
  trendByWeek,
} from "@/lib/analytics";

function log(overrides: Partial<AnalyticsLog> = {}): AnalyticsLog {
  return {
    store: "Safeway #100",
    product: "Pepsi",
    pack_type: "24 Pack",
    root_cause: "Ordering Error",
    is_worked: false,
    is_hidden: false,
    created_at: "2026-06-08T00:00:00Z",
    last_verified_at: "2026-06-08T00:00:00Z",
    verification_count: 1,
    ...overrides,
  };
}

function promo(overrides: Partial<PromoCalendarRow> = {}): PromoCalendarRow {
  return {
    id: "p1",
    brand_name: "Pepsi",
    promo_desc: "Endcap",
    start_date: "2026-06-01",
    end_date: "2026-06-30",
    discount_type: "BOGO",
    created_at: "2026-05-20T00:00:00Z",
    ...overrides,
  };
}

describe("daysBetween", () => {
  it("counts whole days", () => {
    expect(daysBetween("2026-06-06T00:00:00Z", "2026-06-10T00:00:00Z")).toBe(4);
  });
  it("clamps negatives to 0", () => {
    expect(daysBetween("2026-06-10T00:00:00Z", "2026-06-06T00:00:00Z")).toBe(0);
  });
  it("returns 0 for invalid input", () => {
    expect(daysBetween("not-a-date", "2026-06-10T00:00:00Z")).toBe(0);
  });
});

describe("summarizeKpis", () => {
  it("returns zeros for no logs", () => {
    const k = summarizeKpis([]);
    expect(k).toEqual({
      total: 0,
      open: 0,
      resolved: 0,
      resolutionRate: 0,
      avgOpenAgeDays: 0,
      longestOpenDays: 0,
    });
  });

  it("computes counts, rate, and ages of open gaps", () => {
    const now = new Date("2026-06-10T00:00:00Z");
    const logs = [
      log({ created_at: "2026-06-08T00:00:00Z" }), // open, age 2
      log({ created_at: "2026-06-06T00:00:00Z" }), // open, age 4
      log({ is_worked: true, created_at: "2026-06-01T00:00:00Z" }), // resolved
    ];
    const k = summarizeKpis(logs, now);
    expect(k.total).toBe(3);
    expect(k.open).toBe(2);
    expect(k.resolved).toBe(1);
    expect(k.resolutionRate).toBeCloseTo(1 / 3);
    expect(k.avgOpenAgeDays).toBe(3); // (2 + 4) / 2
    expect(k.longestOpenDays).toBe(4);
  });
});

describe("rootCauseBreakdown", () => {
  it("counts, sorts desc, and shares sum to 1", () => {
    const logs = [
      log({ root_cause: "Ordering Error" }),
      log({ root_cause: "Ordering Error" }),
      log({ root_cause: "Warehouse OOS" }),
      log({ root_cause: "Backstock" }),
    ];
    const out = rootCauseBreakdown(logs);
    expect(out[0]).toEqual({ cause: "Ordering Error", count: 2, pct: 0.5 });
    expect(out.map((s) => s.cause)).toEqual([
      "Ordering Error",
      "Backstock",
      "Warehouse OOS",
    ]);
    expect(out.reduce((s, x) => s + x.pct, 0)).toBeCloseTo(1);
  });

  it("labels blank causes as Unspecified", () => {
    expect(rootCauseBreakdown([log({ root_cause: "" })])[0].cause).toBe(
      "Unspecified",
    );
  });
});

describe("topProducts", () => {
  it("ranks by frequency and respects the limit", () => {
    const logs = [
      log({ product: "Pepsi" }),
      log({ product: "Pepsi" }),
      log({ product: "Mountain Dew" }),
      log({ product: "Starry" }),
    ];
    const out = topProducts(logs, 2);
    expect(out).toHaveLength(2);
    expect(out[0]).toEqual({ product: "Pepsi", count: 2 });
  });
});

describe("chronicOffenders / chronicCount", () => {
  const logs = [
    log({ store: "QFC #1", product: "Pepsi", verification_count: 3 }),
    log({ store: "QFC #1", product: "Pepsi", verification_count: 2 }),
    log({ store: "QFC #1", product: "Starry" }),
    log({ store: "Safeway #2", product: "Pepsi", verification_count: 5 }),
  ];

  it("groups store+product and sums occurrences and outage days", () => {
    const out = chronicOffenders(logs);
    expect(out[0]).toEqual({
      store: "QFC #1",
      product: "Pepsi",
      occurrences: 2,
      totalDays: 5,
    });
  });

  it("counts only pairs that recurred", () => {
    expect(chronicCount(logs)).toBe(1); // only QFC #1 / Pepsi appears twice
  });
});

describe("trendByWeek", () => {
  it("buckets by week and sorts oldest first", () => {
    const logs = [
      log({ created_at: "2026-06-01T12:00:00Z" }),
      log({ created_at: "2026-06-03T12:00:00Z" }),
      log({ created_at: "2026-06-10T12:00:00Z" }),
    ];
    const out = trendByWeek(logs);
    expect(out).toHaveLength(2);
    expect(out[0].count).toBe(2);
    expect(out[1].count).toBe(1);
    expect(out[0].weekStart < out[1].weekStart).toBe(true);
    expect(out[0].weekStart).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("brand matching", () => {
  it("normalizes punctuation and case", () => {
    expect(normalizeName("Diet Pepsi!!")).toBe("diet pepsi");
  });

  it("matches when one name contains the other", () => {
    expect(brandMatchesProduct("Pepsi", "Diet Pepsi")).toBe(true);
    expect(brandMatchesProduct("Mountain Dew", "Dew")).toBe(true);
    expect(brandMatchesProduct("Pepsi", "Mountain Dew")).toBe(false);
  });

  it("rejects empty names", () => {
    expect(brandMatchesProduct("", "Pepsi")).toBe(false);
  });
});

describe("isLogDuringPromo", () => {
  it("matches inside the window inclusive of both ends", () => {
    expect(
      isLogDuringPromo(log({ created_at: "2026-06-01T00:00:00Z" }), promo()),
    ).toBe(true);
    expect(
      isLogDuringPromo(log({ created_at: "2026-06-30T23:00:00Z" }), promo()),
    ).toBe(true);
  });

  it("rejects dates outside the window", () => {
    expect(
      isLogDuringPromo(log({ created_at: "2026-07-01T00:00:00Z" }), promo()),
    ).toBe(false);
  });

  it("rejects non-matching brands even within the window", () => {
    expect(
      isLogDuringPromo(log({ product: "Coca-Cola" }), promo({ brand_name: "Pepsi" })),
    ).toBe(false);
  });
});

describe("promoOverlap", () => {
  it("counts promo-coincident gaps and breaks them down by product", () => {
    const promos = [promo({ brand_name: "Pepsi" })];
    const logs = [
      log({ product: "Pepsi", created_at: "2026-06-05T00:00:00Z" }), // on promo
      log({ product: "Diet Pepsi", created_at: "2026-06-06T00:00:00Z" }), // on promo
      log({ product: "Starry", created_at: "2026-06-06T00:00:00Z" }), // off promo
    ];
    const out = promoOverlap(logs, promos);
    expect(out.total).toBe(3);
    expect(out.onPromo).toBe(2);
    expect(out.offPromo).toBe(1);
    expect(out.pct).toBeCloseTo(2 / 3);
    expect(out.byProduct).toEqual([
      { product: "Diet Pepsi", count: 1 },
      { product: "Pepsi", count: 1 },
    ]);
  });

  it("is empty-safe when there are no promos", () => {
    const out = promoOverlap([log()], []);
    expect(out.onPromo).toBe(0);
    expect(out.pct).toBe(0);
  });
});

describe("episodesForItem / summarizeEpisodes", () => {
  const logs = [
    log({
      store: "QFC #1",
      product: "Pepsi",
      pack_type: "24 Pack",
      created_at: "2026-06-01T00:00:00Z",
      verification_count: 2,
      is_worked: true,
    }),
    // same SKU, messy case/whitespace
    log({
      store: "qfc #1 ",
      product: " pepsi",
      pack_type: "24 pack",
      created_at: "2026-06-05T00:00:00Z",
      verification_count: 3,
      is_worked: false,
    }),
    log({ store: "QFC #1", product: "Pepsi", pack_type: "12 Pack" }), // different pack
    log({ store: "Safeway #2", product: "Pepsi", pack_type: "24 Pack" }), // different store
    log({
      store: "QFC #1",
      product: "Pepsi",
      pack_type: "24 Pack",
      is_hidden: true,
    }), // archived
  ];

  it("matches the same SKU at the same store, case-insensitive, newest first, excluding archived", () => {
    const eps = episodesForItem(logs, {
      store: "QFC #1",
      product: "Pepsi",
      packType: "24 Pack",
    });
    expect(eps).toHaveLength(2);
    expect(eps[0].created_at).toBe("2026-06-05T00:00:00Z");
    expect(eps[1].created_at).toBe("2026-06-01T00:00:00Z");
  });

  it("summarizes occurrences, total outage days, and open count", () => {
    const eps = episodesForItem(logs, {
      store: "QFC #1",
      product: "Pepsi",
      packType: "24 Pack",
    });
    expect(summarizeEpisodes(eps)).toEqual({
      occurrences: 2,
      totalDays: 5,
      openCount: 1,
    });
  });
});
