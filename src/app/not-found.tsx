import type { Metadata } from "next";
import Link from "next/link";
import { FAVICON } from "@/lib/metadata";
import { notFoundCopy } from "@/data/copy";

export const metadata: Metadata = {
  title: "Page not found — Bernardo Rivas",
  robots: { index: false },
  icons: [{ url: FAVICON }],
};

export default function NotFound() {
  return (
    <main id="main-content" tabIndex={-1}>
      <div className="wrap not-found">
        <h1 className="page-title">{notFoundCopy.h1}</h1>
        <p className="page-intro">{notFoundCopy.lede}</p>
        <p className="more-line"><Link href="/">{notFoundCopy.backLabel}</Link></p>
      </div>
    </main>
  );
}
