import "@testing-library/jest-dom";
import { describe, expect, it } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import Roadmap from "@/components/Roadmap";

describe("Roadmap", () => {
  it("opens a modal grouped by category and closes again", () => {
    render(<Roadmap />);

    // Closed by default.
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /road map/i }));

    const dialog = screen.getByRole("dialog");
    // Category headers render...
    expect(within(dialog).getByText("Major")).toBeInTheDocument();
    expect(within(dialog).getByText("Background")).toBeInTheDocument();
    // ...with items under them.
    expect(within(dialog).getByText(/Offline-first/i)).toBeInTheDocument();
    expect(within(dialog).getByText(/time-to-resolve/i)).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole("button", { name: /close/i }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
