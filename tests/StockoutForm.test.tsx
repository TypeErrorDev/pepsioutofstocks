import "@testing-library/jest-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import type { StockoutLog } from "@/context/TrackerContext";
import StockoutForm from "@/components/StockoutForm";

const mockAddSalesAlert = vi.fn();
const mockAddLog = vi.fn();
const mockResolveSalesAlert = vi.fn();
const mockUseTracker = vi.fn();

vi.mock("@/context/TrackerContext", () => ({
  useTracker: () => mockUseTracker(),
}));

function setTracker(overrides: Record<string, unknown> = {}) {
  mockUseTracker.mockReturnValue({
    addSalesAlert: mockAddSalesAlert,
    addLog: mockAddLog,
    resolveSalesAlert: mockResolveSalesAlert,
    salesAlerts: [],
    profile: {
      id: "user-1",
      username: "test",
      full_name: "Test User",
      gpid: "1234",
      role: "admin",
      created_at: new Date().toISOString(),
    },
    logs: [],
    ...overrides,
  });
}

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
    user_name: "Test User",
    updated_by: null,
    created_at: "2026-06-01T00:00:00Z",
    updated_at: "2026-06-01T00:00:00Z",
    last_verified_at: "2026-06-01T00:00:00Z",
    verification_count: 1,
    ...overrides,
  };
}

describe("StockoutForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setTracker();
  });

  it("shows validation error for missing broadcast fields", async () => {
    render(<StockoutForm />);

    fireEvent.click(
      screen.getByRole("button", { name: /broadcast rep alert/i }),
    );

    await screen.findByText(/Alert Content Message/i);

    fireEvent.change(screen.getByPlaceholderText(/e.g. Safeway/i), {
      target: { value: "   " },
    });
    fireEvent.change(
      screen.getByPlaceholderText(
        /e.g., Massive 2L Dew delivery incoming tomorrow/i,
      ),
      { target: { value: " " } },
    );

    const form =
      screen.queryByRole("form") ||
      (document.querySelector("form") as HTMLFormElement);
    fireEvent.submit(form);

    expect(
      await screen.findByText(/Store and broadcast message are required/i),
    ).toBeInTheDocument();
    expect(mockAddSalesAlert).not.toHaveBeenCalled();
  });

  it("submits a broadcast alert when required fields are provided", async () => {
    mockAddSalesAlert.mockResolvedValue(undefined);

    render(<StockoutForm />);

    fireEvent.click(
      screen.getByRole("button", { name: /broadcast rep alert/i }),
    );
    fireEvent.change(screen.getByPlaceholderText(/e.g. Safeway/i), {
      target: { value: "5406" },
    });
    fireEvent.change(
      screen.getByPlaceholderText(
        /e.g., Massive 2L Dew delivery incoming tomorrow/i,
      ),
      { target: { value: "Route alert" } },
    );

    fireEvent.click(
      screen.getByRole("button", { name: /broadcast store alert/i }),
    );

    expect(
      await screen.findByText(/Transaction Completed/i),
    ).toBeInTheDocument();
    expect(mockAddSalesAlert).toHaveBeenCalledWith("5406", "Route alert");
    expect(
      screen.getByPlaceholderText(
        /e.g., Massive 2L Dew delivery incoming tomorrow/i,
      ),
    ).toHaveValue("");
  });

  it("does not submit a gap log when required gap fields are missing", () => {
    render(<StockoutForm />);

    fireEvent.change(screen.getByPlaceholderText(/e.g. Pepsi/i), {
      target: { value: "STAR_PEPSI" },
    });
    fireEvent.change(screen.getByPlaceholderText(/e.g. Safeway/i), {
      target: { value: "5406" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: /log out of stock/i }),
    );
    expect(mockAddLog).not.toHaveBeenCalled();
  });

  it("prefills pack type and location from a picked autocomplete suggestion", async () => {
    mockAddLog.mockResolvedValue({ success: true, duplicated: false });
    setTracker({
      logs: [
        makeLog({
          product: "Pepsi",
          pack_type: "12 Pack",
          location: "Coolers",
        }),
      ],
    });

    render(<StockoutForm />);

    const productInput = screen.getByPlaceholderText(/e.g. Pepsi/i);
    fireEvent.change(productInput, { target: { value: "Pep" } });

    // Suggestion shows the full logged item; clicking it fills all three fields.
    fireEvent.click(
      screen.getByRole("button", { name: /Pepsi.*12 Pack.*Coolers/i }),
    );
    expect(productInput).toHaveValue("Pepsi");

    // Provide the store, then submit, and confirm pack + location flowed in.
    fireEvent.change(screen.getByPlaceholderText(/e.g. Safeway/i), {
      target: { value: "5406" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: /log out of stock/i }),
    );

    expect(mockAddLog).toHaveBeenCalledWith(
      expect.objectContaining({
        product: "Pepsi",
        pack_type: "12 Pack",
        location: "Coolers",
      }),
    );
  });

  it("prefills the store field from a store autocomplete suggestion", () => {
    setTracker({
      logs: [makeLog({ store: "Fred Meyers Greenwood #122" })],
    });

    render(<StockoutForm />);

    const storeInput = screen.getByPlaceholderText(/e.g. Safeway/i);
    fireEvent.change(storeInput, { target: { value: "fred" } });

    fireEvent.click(
      screen.getByRole("button", { name: /Fred Meyers Greenwood #122/i }),
    );

    // Picks the canonical existing spelling rather than the typed fragment.
    expect(storeInput).toHaveValue("Fred Meyers Greenwood #122");
  });
});
