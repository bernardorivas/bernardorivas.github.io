export type RouteStatus = "public" | "draft";

type SiteRoute = {
  href: `/${string}`;
  navLabel?: string;
  status: RouteStatus;
};

// Draft routes are still reachable by direct URL. Their status only keeps them
// out of the primary navigation, sitemap, and search-engine index.
export const siteRoutes = [
  { href: "/", status: "public" },
  { href: "/research", navLabel: "Research", status: "public" },
  { href: "/teaching", navLabel: "Teaching", status: "public" },
  { href: "/teaching/calc-i", status: "draft" },
  { href: "/teaching/diffeq", status: "draft" },
  { href: "/teaching/math300", status: "draft" },
  { href: "/teaching/real-analysis", status: "draft" },
  { href: "/talks", navLabel: "Talks", status: "public" },
  { href: "/lean", navLabel: "Lean", status: "draft" },
] satisfies readonly SiteRoute[];

export const publicNavItems = siteRoutes.flatMap((route) =>
  route.status === "public" && route.navLabel
    ? [{ label: route.navLabel, href: route.href }]
    : [],
);

export const publicSitemapPaths = siteRoutes
  .filter((route) => route.status === "public")
  .map((route) => route.href);

export function isDraftRoute(path: string): boolean {
  return siteRoutes.some((route) => route.href === path && route.status === "draft");
}
