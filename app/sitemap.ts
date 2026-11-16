import type { MetadataRoute } from "next";
import { site } from "@/lib/catalog";
import { siteUrl } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date(`${site.store.updatedAt}T00:00:00Z`);

  const stamp = Number.isNaN(lastModified.getTime()) ? new Date() : lastModified;

  return [
    {
      url: siteUrl,
      lastModified: stamp,
      changeFrequency: "daily",
      priority: 1,
    },
    ...(site.festival.enabled && site.festival.deals.length > 0
      ? [
          {
            url: `${siteUrl}/festival`,
            lastModified: stamp,
            changeFrequency: "weekly" as const,
            priority: 0.8,
          },
        ]
      : []),
  ];
}
