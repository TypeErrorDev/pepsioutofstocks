import "@testing-library/jest-dom";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { StockoutLog } from "@/context/TrackerContext";

const mockUseTracker = vi.fn();
vi.mock("@/context/TrackerContext", () => ({
  useTracker: () => mockUseTracker(),
}));

import Dashboard from "@/components/Dashboard";

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
    created_at: "2026-06-01T00:00:00Z",
    updated_at: "2026-06-01T00:00:00Z",
    last_verified_at: "2026-06-01T00:00:00Z",
    verification_count: 1,
    ...overrides,
  };
}

function mockTracker(logs: StockoutLog[]) {
  mockUseTracker.mockReturnValue({
    logs,
    salesAlerts: [],
    profile: {
      id: "u",
      username: "qa",
      full_name: "QA Lead",
      gpid: "1",
      role: "admin",
      created_at: "",
    },
    loading: false,
    toggleWorkedStatus: vi.fn(),
    addLog: vi.fn(),
    addSalesAlert: vi.fn(),
    resolveSalesAlert: vi.fn(),
  });
}

describe("Dashboard resolution leader stat", () => {
  it("shows the store with the most resolutions in the past 7 days", () => {
    const justNow = new Date().toISOString();
    mockTracker([
      makeLog({ store: "QFC #1", is_worked: true, updated_at: justNow }),
      makeLog({ store: "QFC #1", is_worked: true, updated_at: justNow }),
      makeLog({ store: "Safeway #2", is_worked: true, updated_at: justNow }),
      makeLog({ store: "Safeway #2" }), // open — never counts
    ]);

    render(<Dashboard />);

    expect(screen.getByText("Top Resolved Store")).toBeInTheDocument();
    // The store also appears in log-table rows, so target the stat card's
    // title-attributed heading specifically.
    expect(screen.getByTitle("QFC #1")).toBeInTheDocument();
    expect(
      screen.getByText(/2 resolved · rolling 7 days/i),
    ).toBeInTheDocument();
  });

  it("shows an empty state when nothing was resolved recently", () => {
    mockTracker([
      // resolved, but long ago
      makeLog({
        store: "QFC #1",
        is_worked: true,
        updated_at: "2026-01-01T00:00:00Z",
      }),
    ]);

    render(<Dashboard />);

    expect(screen.getByText("—")).toBeInTheDocument();
    expect(
      screen.getByText(/No resolutions in the past 7 days/i),
    ).toBeInTheDocument();
  });
});
