import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/metadata";
import { publicSitemapPaths } from "@/data/routes";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return publicSitemapPaths.map((path) => ({
    url: path === "/" ? SITE_URL + "/" : SITE_URL + path + "/",
  }));
}
