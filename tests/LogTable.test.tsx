import "@testing-library/jest-dom";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import type { StockoutLog } from "@/context/TrackerContext";

const mockUseTracker = vi.fn();
vi.mock("@/context/TrackerContext", () => ({
  useTracker: () => mockUseTracker(),
}));

import LogTable from "@/components/LogTable";

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
    created_at: "2026-06-05T00:00:00Z",
    updated_at: "2026-06-05T00:00:00Z",
    last_verified_at: "2026-06-05T00:00:00Z",
    verification_count: 1,
    ...overrides,
  };
}

describe("LogTable detail drawer", () => {
  it("shows only the clicked item, not every gap at its store", () => {
    const logs = [
      makeLog({ id: "1", store: "Safeway #100", product: "Diet Pepsi" }),
      makeLog({ id: "2", store: "Safeway #100", product: "Mountain Dew" }),
    ];
    mockUseTracker.mockReturnValue({
      logs,
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
    });

    render(<LogTable />);

    // Click the Diet Pepsi row (the cell bubbles to the row's onClick).
    fireEvent.click(screen.getByText(/Diet Pepsi/));

    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText(/Diet Pepsi/)).toBeInTheDocument();
    expect(within(dialog).queryByText(/Mountain Dew/)).not.toBeInTheDocument();
    // It shows item-level detail, not a store roll-up.
    expect(within(dialog).getByText(/Activity History/i)).toBeInTheDocument();
  });
});
