import "@testing-library/jest-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import StockoutForm from "@/components/StockoutForm";

const mockAddSalesAlert = vi.fn();
const mockAddLog = vi.fn();
const mockResolveSalesAlert = vi.fn();

vi.mock("@/context/TrackerContext", () => ({
  useTracker: () => ({
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
  }),
}));

describe("StockoutForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows validation error for missing broadcast fields", async () => {
    render(<StockoutForm />);

    fireEvent.click(
      screen.getByRole("button", { name: /broadcast rep alert/i }),
    );

    await screen.findByText(/Alert Content Message/i);

    fireEvent.change(screen.getByPlaceholderText(/e.g. 5406/i), {
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
    fireEvent.change(screen.getByPlaceholderText(/e.g. 5406/i), {
      target: { value: "5406" },
    });
    fireEvent.change(
      screen.getByPlaceholderText(
        /e.g., Massive 2L Dew delivery incoming tomorrow/i,
      ),
      { target: { value: "Route alert" } },
    );

    fireEvent.click(
      screen.getByRole("button", { name: /broadcast field alert/i }),
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

    fireEvent.change(screen.getByPlaceholderText(/e.g. STAR_PEPSI/i), {
      target: { value: "STAR_PEPSI" },
    });
    fireEvent.change(screen.getByPlaceholderText(/e.g. 5406/i), {
      target: { value: "5406" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: /log field gap \/ verify/i }),
    );
    expect(mockAddLog).not.toHaveBeenCalled();
  });
});
