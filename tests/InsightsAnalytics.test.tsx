import "@testing-library/jest-dom";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import type { ReactNode } from "react";
import type { StockoutLog } from "@/context/TrackerContext";
import type { PromoCalendarRow } from "@/lib/analytics";

// recharts needs real layout dimensions; stub it to passthrough containers so we
// can test the tile/modal behavior (the lists/headlines render outside charts).
vi.mock("recharts", () => {
  const Pass = ({ children }: { children?: ReactNode }) => <div>{children}</div>;
  const Null = () => null;
  return {
    ResponsiveContainer: Pass,
    PieChart: Pass,
    Pie: Pass,
    Cell: Null,
    BarChart: Pass,
    Bar: Pass,
    LineChart: Pass,
    Line: Null,
    XAxis: Null,
    YAxis: Null,
    Tooltip: Null,
    Legend: Null,
  };
});

import InsightsAnalytics from "@/components/InsightsAnalytics";

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

const promos: PromoCalendarRow[] = [
  {
    id: "promo-1",
    brand_name: "Pepsi",
    promo_desc: "Endcap",
    start_date: "2026-06-01",
    end_date: "2026-06-30",
    discount_type: "BOGO",
    created_at: "2026-05-20T00:00:00Z",
  },
];

const logs = [
  makeLog({ product: "Pepsi", root_cause: "Ordering Error" }),
  makeLog({ product: "Pepsi", root_cause: "Ordering Error" }),
  makeLog({ product: "Starry", root_cause: "Warehouse OOS", is_worked: true }),
];

describe("InsightsAnalytics", () => {
  it("renders KPI tiles and visualization cards", () => {
    render(<InsightsAnalytics logs={logs} promos={promos} />);
    expect(screen.getByText("Open Gaps")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Root-Cause Mix/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Promo Impact/i }),
    ).toBeInTheDocument();
  });

  it("opens a charted modal when a card is clicked and closes again", async () => {
    render(<InsightsAnalytics logs={logs} promos={promos} />);

    fireEvent.click(screen.getByRole("button", { name: /Root-Cause Mix/i }));

    const dialog = await screen.findByRole("dialog");
    expect(
      within(dialog).getByText(/Reflects the active filters/i),
    ).toBeInTheDocument();
    expect(within(dialog).getByText(/Ordering Error/i)).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole("button", { name: /close/i }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows promo overlap detail in the promo modal", async () => {
    render(<InsightsAnalytics logs={logs} promos={promos} />);

    fireEvent.click(screen.getByRole("button", { name: /Promo Impact/i }));

    const dialog = await screen.findByRole("dialog");
    expect(
      within(dialog).getByText(/coincided with an active promotion/i),
    ).toBeInTheDocument();
  });

  it("is safe with no logs", () => {
    render(<InsightsAnalytics logs={[]} promos={[]} />);
    // 3 KPI tiles + 4 visualization cards still render
    expect(screen.getByText("Open Gaps")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Chronic Offenders/i })).toBeInTheDocument();
  });

  it("shows resolution-centric KPIs on the resolved view", () => {
    const resolvedLogs = [
      makeLog({
        is_worked: true,
        store: "QFC #1",
        created_at: "2026-06-01T00:00:00Z",
        updated_at: "2026-06-04T00:00:00Z", // 3 days to resolve
      }),
      makeLog({
        is_worked: true,
        store: "Safeway #2",
        created_at: "2026-06-02T00:00:00Z",
        updated_at: "2026-06-07T00:00:00Z", // 5 days to resolve
      }),
    ];

    render(
      <InsightsAnalytics
        logs={resolvedLogs}
        promos={[]}
        statusView="resolved"
      />,
    );

    expect(screen.getByText("Resolved Gaps")).toBeInTheDocument();
    expect(screen.getByText("Avg Days To Resolve")).toBeInTheDocument();
    expect(screen.getByText("4.0d")).toBeInTheDocument(); // (3 + 5) / 2
    expect(screen.getByText("Stores Covered")).toBeInTheDocument();
    // The open-centric tiles are replaced on this view.
    expect(screen.queryByText("Open Gaps")).not.toBeInTheDocument();
  });
});
