import "@testing-library/jest-dom";
import { describe, expect, it } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import Roadmap from "@/components/Roadmap";

describe("Roadmap", () => {
  it("opens the modal and shows every category by default", () => {
    render(<Roadmap />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /road map/i }));

    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText(/Offline-first/i)).toBeInTheDocument();
    expect(within(dialog).getByText(/time-to-resolve/i)).toBeInTheDocument();
    expect(
      within(dialog).getByText(/Tighten row-level security/i),
    ).toBeInTheDocument();
  });

  it("filters to a single category via the toggle, then back to All", () => {
    render(<Roadmap />);
    fireEvent.click(screen.getByRole("button", { name: /road map/i }));
    const dialog = screen.getByRole("dialog");

    // Filter to Background only.
    fireEvent.click(within(dialog).getByRole("button", { name: "Background" }));
    expect(
      within(dialog).getByText(/Tighten row-level security/i),
    ).toBeInTheDocument();
    expect(within(dialog).queryByText(/Offline-first/i)).not.toBeInTheDocument();

    // Back to All restores the other categories.
    fireEvent.click(within(dialog).getByRole("button", { name: "All" }));
    expect(within(dialog).getByText(/Offline-first/i)).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole("button", { name: /close/i }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("resets the filter to All when the modal is reopened", () => {
    render(<Roadmap />);

    // Open, narrow to Background, then close.
    fireEvent.click(screen.getByRole("button", { name: /road map/i }));
    let dialog = screen.getByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Background" }));
    expect(within(dialog).queryByText(/Offline-first/i)).not.toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole("button", { name: /close/i }));

    // Reopen → back to All, so the Major items are visible again.
    fireEvent.click(screen.getByRole("button", { name: /road map/i }));
    dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText(/Offline-first/i)).toBeInTheDocument();
  });
});
