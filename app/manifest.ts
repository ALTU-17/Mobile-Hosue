import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Mobile House — Your Mobile Partner",
    short_name: "Mobile House",
    description:
      "Original smartphones, GST billing, exchange and finance at Mobile House, New Usmanpura, Chhatrapati Sambhajinagar (Aurangabad).",
    lang: "en-IN",
    dir: "ltr",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    categories: ["shopping", "business"],
    background_color: "#0B0A09",
    theme_color: "#0B0A09",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
