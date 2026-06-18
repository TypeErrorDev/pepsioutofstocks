import { describe, expect, it } from "vitest";
import type { StockoutLog } from "@/context/TrackerContext";
import {
  EXPORT_COLUMNS,
  buildExportRows,
} from "@/lib/exportInsights";

function makeLog(overrides: Partial<StockoutLog> = {}): StockoutLog {
  return {
    id: Math.random().toString(36).slice(2),
    store: "Safeway #100",
    product: "Pepsi",
    pack_type: "24 Pack",
    location: "Main Shelf",
    root_cause: "Ordering Error",
    notes: null,
    gpid: null,
    is_worked: false,
    is_hidden: false,
    user_name: "Tester",
    updated_by: null,
    created_at: "2026-06-01T18:00:00Z",
    updated_at: "2026-06-04T18:00:00Z",
    last_verified_at: "2026-06-02T18:00:00Z",
    verification_count: 3,
    ...overrides,
  };
}

describe("buildExportRows", () => {
  it("maps a worked log to a Resolved row with a resolution timestamp", () => {
    const [row] = buildExportRows([makeLog({ is_worked: true })]);
    expect(row.status).toBe("Resolved");
    expect(row.streakDays).toBe(3);
    expect(row.store).toBe("Safeway #100");
    expect(row.resolvedAt).not.toBe(""); // updated_at, formatted
  });

  it("leaves resolvedAt empty for open gaps", () => {
    const [row] = buildExportRows([makeLog({ is_worked: false })]);
    expect(row.status).toBe("Open");
    expect(row.resolvedAt).toBe("");
  });

  it("defaults streak to 1 and notes to an empty string", () => {
    const [row] = buildExportRows([
      makeLog({ verification_count: 0, notes: null }),
    ]);
    expect(row.streakDays).toBe(1);
    expect(row.notes).toBe("");
  });

  it("produces a row object whose keys match every export column", () => {
    const [row] = buildExportRows([makeLog()]);
    for (const col of EXPORT_COLUMNS) {
      expect(row).toHaveProperty(col.key);
    }
  });

  it("is empty-safe", () => {
    expect(buildExportRows([])).toEqual([]);
  });
});
