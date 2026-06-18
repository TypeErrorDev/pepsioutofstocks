import "@testing-library/jest-dom";
import { describe, expect, it } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import Roadmap from "@/components/Roadmap";

describe("Roadmap", () => {
  it("opens a modal listing roadmap items and closes again", () => {
    render(<Roadmap />);

    // Closed by default.
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /road map/i }));

    const dialog = screen.getByRole("dialog");
    expect(
      within(dialog).getByText(/time-to-resolve/i),
    ).toBeInTheDocument();
    // Status badges render too.
    expect(within(dialog).getAllByText(/planned/i).length).toBeGreaterThan(0);

    fireEvent.click(within(dialog).getByRole("button", { name: /close/i }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
