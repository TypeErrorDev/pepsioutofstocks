import "@testing-library/jest-dom";
import { beforeEach, describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import ThemeToggle from "@/components/ThemeToggle";

describe("ThemeToggle", () => {
  beforeEach(() => {
    document.documentElement.removeAttribute("data-theme");
    document.cookie = "theme=; path=/; max-age=0";
  });

  it("flips data-theme to light and persists to a cookie", () => {
    render(<ThemeToggle />);
    const btn = screen.getByRole("button", { name: /toggle/i });

    fireEvent.click(btn);
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    expect(document.cookie).toContain("theme=light");

    fireEvent.click(btn);
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(document.cookie).toContain("theme=dark");
  });

  it("toggles back to dark from an existing light theme", () => {
    document.documentElement.setAttribute("data-theme", "light");
    render(<ThemeToggle />);

    fireEvent.click(screen.getByRole("button", { name: /toggle/i }));
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });
});
