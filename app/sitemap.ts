import type { MetadataRoute } from "next";
import { site } from "@/lib/catalog";
import { siteUrl } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date(`${site.store.updatedAt}T00:00:00Z`);

  return [
    {
      url: siteUrl,
      lastModified: Number.isNaN(lastModified.getTime()) ? new Date() : lastModified,
      changeFrequency: "daily",
      priority: 1,
    },
  ];
}
