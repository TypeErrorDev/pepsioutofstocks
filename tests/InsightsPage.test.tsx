import "@testing-library/jest-dom";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import InsightsPage from "@/app/insights/page";

const mockUseTracker = vi.fn();

vi.mock("@/context/TrackerContext", () => ({
  useTracker: () => mockUseTracker(),
}));

describe("Insights page access", () => {
  it("shows the loading state while the tracker is still initializing", () => {
    mockUseTracker.mockReturnValue({
      profile: null,
      loading: true,
      logs: [],
      toggleWorkedStatus: vi.fn(),
    });
    render(<InsightsPage />);

    expect(screen.getByText(/Loading Insights.../i)).toBeInTheDocument();
  });

  it("blocks access for non-elevated users", () => {
    mockUseTracker.mockReturnValue({
      profile: {
        id: "user-1",
        username: "test",
        full_name: "Test User",
        gpid: "1234",
        role: "merchandiser",
        created_at: new Date().toISOString(),
      },
      loading: false,
      logs: [],
      toggleWorkedStatus: vi.fn(),
    });

    render(<InsightsPage />);

    expect(screen.getByText(/Access Denied/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Insights are only available to elevated users/i),
    ).toBeInTheDocument();
  });
});
