import { getSitemapUrls } from "@/lib/data/sitemap";
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const urls = await getSitemapUrls();
  return urls.map((u) => ({
    url: u.url,
    lastModified: u.lastModified ? new Date(u.lastModified) : new Date(),
  }));
}
