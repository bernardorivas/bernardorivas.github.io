import type { Metadata } from "next";
import { isDraftRoute } from "@/data/routes";

export const SITE_URL = "https://bernardorivas.github.io";

export const FAVICON = "/favicon.png";
export const SOCIAL_IMAGE = "/og-lorenz-postdoc-2026.jpg";
export const SOCIAL_IMAGE_ALT = "Bernardo Rivas — Postdoc in Mathematics, with a Lorenz system trajectory";

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
      images: [{
        url: SOCIAL_IMAGE,
        width: 1200,
        height: 630,
        alt: opts.ogImageAlt ?? SOCIAL_IMAGE_ALT,
      }],
    },
    twitter: {
      card: "summary_large_image",
      title: opts.ogTitle ?? opts.title,
      description: opts.ogDescription ?? opts.description,
      images: [{
        url: SOCIAL_IMAGE,
        width: 1200,
        height: 630,
        alt: opts.ogImageAlt ?? SOCIAL_IMAGE_ALT,
      }],
    },
    ...(isDraftRoute(opts.path) ? { robots: { index: false, follow: false } } : {}),
  };
}
