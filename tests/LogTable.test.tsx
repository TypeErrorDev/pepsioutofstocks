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

  it("shows recurrence history for that exact item at that store", () => {
    const logs = [
      makeLog({
        id: "a",
        store: "Safeway #100",
        product: "Pepsi",
        pack_type: "24 Pack",
        verification_count: 2,
        is_worked: true,
        created_at: "2026-05-01T00:00:00Z",
      }),
      makeLog({
        id: "b",
        store: "Safeway #100",
        product: "Pepsi",
        pack_type: "24 Pack",
        verification_count: 4,
        is_worked: false,
        created_at: "2026-06-01T00:00:00Z",
      }),
      // Different product at the same store must NOT appear in the drawer.
      makeLog({
        id: "c",
        store: "Safeway #100",
        product: "Mountain Dew",
        pack_type: "24 Pack",
        verification_count: 1,
      }),
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

    // Click the open Pepsi episode (streak "4d" is unique in the table).
    fireEvent.click(screen.getByText("4d"));

    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText(/History at this store/i)).toBeInTheDocument();
    // The viewed episode is marked, and both Pepsi episodes are listed.
    expect(within(dialog).getByText(/Viewing/i)).toBeInTheDocument();
    // The other product at the store is still excluded.
    expect(within(dialog).queryByText(/Mountain Dew/)).not.toBeInTheDocument();
  });

  it("search narrows by store and product together", () => {
    const logs = [
      makeLog({ id: "1", store: "5406", product: "Pepsi" }),
      makeLog({ id: "2", store: "5406", product: "Starry" }),
      makeLog({ id: "3", store: "1143", product: "Pepsi" }),
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

    fireEvent.change(
      screen.getByPlaceholderText(/search store or product/i),
      { target: { value: "5406 pepsi" } },
    );

    // Only "5406 / Pepsi" survives: "5406 / Starry" lacks the product term and
    // "1143 / Pepsi" lacks the store term.
    expect(screen.getByText("5406")).toBeInTheDocument();
    expect(screen.getByText(/Pepsi/)).toBeInTheDocument();
    expect(screen.queryByText(/Starry/)).not.toBeInTheDocument();
    expect(screen.queryByText("1143")).not.toBeInTheDocument();
  });
});
