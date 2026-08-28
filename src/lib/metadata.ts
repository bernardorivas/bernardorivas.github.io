import type { Metadata } from "next";
import { isDraftRoute } from "@/data/routes";

export const SITE_URL = "https://bernardorivas.github.io";

export const FAVICON = "/favicon.png";

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
