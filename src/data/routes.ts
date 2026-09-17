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
  { href: "/software", navLabel: "Software", status: "public" },
  { href: "/talks", navLabel: "Talks", status: "public" },
  { href: "/lean", navLabel: "Lean", status: "draft" },
  { href: "/hobbies", navLabel: "Hobbies", status: "draft" },
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
