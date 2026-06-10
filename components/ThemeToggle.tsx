"use client";
import React from "react";
import { Sun, Moon } from "lucide-react";

/**
 * Light/dark toggle. The active theme is the `data-theme` attribute on <html>
 * (applied before paint by the inline script in the root layout) and is
 * persisted in a cookie. The sun/moon icons are driven purely by CSS off that
 * attribute, so this component holds no state — no hydration mismatch, and the
 * markup is identical on server and client.
 *
 * During a switch we add `theme-no-transition` to the root so every element
 * flips instantly and in sync — no animation desync that would read as a glitch.
 */
export default function ThemeToggle() {
  const toggle = () => {
    const root = document.documentElement;
    const next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
    root.classList.add("theme-no-transition");
    root.setAttribute("data-theme", next);
    document.cookie = `theme=${next}; path=/; max-age=31536000; SameSite=Lax`;
    // Re-enable transitions after the paint that applied the new theme.
    requestAnimationFrame(() =>
      requestAnimationFrame(() =>
        root.classList.remove("theme-no-transition"),
      ),
    );
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle light or dark theme"
      title="Toggle theme"
      className="group relative p-2.5 rounded-xl bg-app-card border border-app-border text-app-muted hover:text-pepsi-blue hover:border-pepsi-blue/30 transition-all active:scale-90 cursor-pointer"
    >
      <div className="relative w-5 h-5">
        <Sun
          size={20}
          className="theme-icon-sun absolute inset-0 transition-all duration-500"
        />
        <Moon
          size={20}
          className="theme-icon-moon absolute inset-0 transition-all duration-500"
        />
      </div>
    </button>
  );
}
