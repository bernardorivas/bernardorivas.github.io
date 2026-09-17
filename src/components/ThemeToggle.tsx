"use client";
import { useCallback, useEffect, useState } from "react";
import { MoonIcon, SunIcon } from "@/components/icons";

function systemTheme(): "dark" | "light" {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
function currentTheme(): "dark" | "light" {
  const t = document.documentElement.getAttribute("data-theme");
  return t === "dark" || t === "light" ? t : systemTheme();
}
function applyMeta(theme: "dark" | "light") {
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", theme === "dark" ? "#14171c" : "#faf9f5");
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light" | null>(null);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- SSR-safe hydration: state must start at the server-rendered default and sync to browser state after mount
    setTheme(currentTheme());
    applyMeta(currentTheme());
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (!document.documentElement.getAttribute("data-theme")) {
        setTheme(systemTheme()); applyMeta(systemTheme());
      }
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  const toggle = useCallback(() => {
    const next = currentTheme() === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try { localStorage.setItem("br-theme", next); } catch {}
    setTheme(next); applyMeta(next);
  }, []);
  const dark = theme === "dark";
  const label = dark ? "Use light theme" : "Use dark theme";
  return (
    <button
      type="button"
      className="theme-toggle"
      data-theme-toggle
      aria-pressed={dark}
      aria-label={label}
      title={label}
      onClick={toggle}
    >
      {dark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
