import type { Metadata } from "next";
import { isDraftRoute } from "@/data/routes";

export const SITE_URL = "https://bernardorivas.github.io";

// Copied verbatim from the favicon data URI in $OLD/index.html <head>
export const FAVICON =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%23faf9f5'/%3E%3Cg stroke='%231c3d61' stroke-width='2' fill='none'%3E%3Cline x1='6' y1='16' x2='16' y2='8'/%3E%3Cline x1='6' y1='16' x2='16' y2='24'/%3E%3Cline x1='16' y1='8' x2='26' y2='16'/%3E%3Cline x1='16' y1='24' x2='26' y2='16'/%3E%3C/g%3E%3Cg fill='%231c3d61'%3E%3Ccircle cx='6' cy='16' r='3'/%3E%3Ccircle cx='26' cy='16' r='3'/%3E%3C/g%3E%3Cg fill='%23faf9f5' stroke='%231c3d61' stroke-width='2'%3E%3Ccircle cx='16' cy='8' r='2.6'/%3E%3Ccircle cx='16' cy='24' r='2.6'/%3E%3C/g%3E%3C/svg%3E";

export function buildMetadata(opts: {
  title: string;
  description: string;
  path: string; // "/" or "/research" etc.
  ogTitle?: string;
  ogDescription?: string;
  ogType?: "profile" | "website";
  ogImageAlt?: string;
}): Metadata {
  const url = opts.path === "/" || opts.path.endsWith("/")
    ? opts.path
    : opts.path + "/";
  return {
    title: opts.title,
    description: opts.description,
    metadataBase: new URL(SITE_URL),
    alternates: { canonical: url },
    icons: [{ url: FAVICON }],
    openGraph: {
      type: opts.ogType ?? "website",
      title: opts.ogTitle ?? opts.title,
      description: opts.ogDescription ?? opts.description,
      url,
      images: [{ url: "/og.png", ...(opts.ogImageAlt ? { alt: opts.ogImageAlt } : {}) }],
    },
    twitter: {
      card: "summary_large_image",
      title: opts.ogTitle ?? opts.title,
      description: opts.ogDescription ?? opts.description,
      images: ["/og.png"],
    },
    ...(isDraftRoute(opts.path) ? { robots: { index: false, follow: false } } : {}),
  };
}
