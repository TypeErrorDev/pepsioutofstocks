import "@testing-library/jest-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ReactNode } from "react";
import { render, screen } from "@testing-library/react";

vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  BarChart: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  Bar: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  XAxis: () => <div />,
  YAxis: () => <div />,
  Tooltip: () => <div />,
  Cell: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

import Insights from "@/components/Insights";

const mockUseTracker = vi.fn();

vi.mock("@/context/TrackerContext", () => ({
  useTracker: () => mockUseTracker(),
}));

describe("Insights analytics", () => {
  beforeEach(() => {
    mockUseTracker.mockReset();
  });

  it("renders a fallback when there are no logs", () => {
    mockUseTracker.mockReturnValue({ logs: [], loading: false });
    render(<Insights />);

    expect(screen.getByText(/No Data Available/i)).toBeInTheDocument();
  });

  it("renders store summaries and top product analytics", () => {
    const logs = [
      {
        id: "1",
        store: "101",
        product: "STAR_PEPSI",
        pack_type: "24 Pack",
        location: "Main Shelf",
        root_cause: "Warehouse OOS",
        notes: null,
        gpid: null,
        is_worked: false,
        is_hidden: false,
        user_name: "Test User",
        updated_by: null,
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
        last_verified_at: "2026-01-01T00:00:00Z",
        verification_count: 0,
      },
      {
        id: "2",
        store: "101",
        product: "STAR_PEPSI",
        pack_type: "12 Pack",
        location: "Coolers",
        root_cause: "Backstock",
        notes: null,
        gpid: null,
        is_worked: false,
        is_hidden: false,
        user_name: "Test User",
        updated_by: null,
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
        last_verified_at: "2026-01-01T00:00:00Z",
        verification_count: 0,
      },
    ];

    mockUseTracker.mockReturnValue({ logs, loading: false });
    render(<Insights />);

    expect(screen.getByText(/Top At-Risk Products/i)).toBeInTheDocument();
    expect(screen.getByText(/Store 101/i)).toBeInTheDocument();
    expect(screen.getByText(/Logistical Gaps/i)).toBeInTheDocument();
  });
});
