"use client";

import { useCallback, useEffect } from "react";
import { MoonIcon, SunIcon } from "@/components/Icons";

const STORAGE_KEY = "mh-theme";

/** Day runs 06:00–18:00 local time; the rest of the clock is night. */
const DAY_START = 6;
const DAY_END = 18;

type Theme = "light" | "dark";

function themeForNow(): Theme {
  const hour = new Date().getHours();
  return hour >= DAY_START && hour < DAY_END ? "light" : "dark";
}

function currentTheme(): Theme {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", theme === "light" ? "#FDFBF5" : "#0B0A09");
}

function storedTheme(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

/**
 * Sun/moon switch for the day (light) and night (dark) skins. The first paint
 * is already themed by the inline script in the root layout, so this only has
 * to flip the theme on click and keep following the clock until the visitor
 * picks a side by hand. Which icon shows is decided in CSS from the same
 * data-theme attribute, so nothing here has to re-render.
 */
export function ThemeToggle() {
  // Sync the browser chrome (color-scheme, theme-color) with the skin the
  // head script already picked.
  useEffect(() => {
    applyTheme(currentTheme());
  }, []);

  useEffect(() => {
    const tick = () => {
      if (storedTheme()) return;
      const next = themeForNow();
      if (currentTheme() === next) return;
      applyTheme(next);
    };

    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, []);

  const toggle = useCallback(() => {
    const next: Theme = currentTheme() === "light" ? "dark" : "light";
    applyTheme(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* private mode: the theme just won't be remembered */
    }
  }, []);

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggle}
      aria-label="Switch between the day and night theme"
      title="Day / night theme"
    >
      <SunIcon className="theme-toggle__sun" />
      <MoonIcon className="theme-toggle__moon" />
    </button>
  );
}
