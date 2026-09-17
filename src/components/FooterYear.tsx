"use client";
import { useEffect, useState } from "react";

export default function FooterYear() {
  const [year, setYear] = useState("2026"); // static fallback, matches old markup
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- SSR-safe hydration: state must start at the server-rendered default and sync to browser state after mount
    setYear(String(new Date().getFullYear()));
  }, []);
  return <span data-current-year>{year}</span>;
}
