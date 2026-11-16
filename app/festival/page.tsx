import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { site } from "@/lib/catalog";
import { FestivalOffers } from "@/components/FestivalOffers";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { MobileBar } from "@/components/MobileBar";

const festival = site.festival;

const description = `${festival.season} offers at Mobile House, New Usmanpura, Chhatrapati Sambhajinagar (Aurangabad) — ${festival.window}. Counter prices, card discounts and gifts on selected phones.`;

export const metadata: Metadata = {
  title: `${festival.name} offers`,
  description,
  alternates: { canonical: "/festival" },
  openGraph: {
    type: "website",
    url: "/festival",
    siteName: "Mobile House",
    title: `${festival.name} offers · Mobile House`,
    description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${festival.name} offers · Mobile House`,
    description,
  },
};

export default function FestivalPage() {
  if (!festival.enabled || festival.deals.length === 0) notFound();

  return (
    <>
      <SiteHeader />

      <main id="top">
        <FestivalOffers festival={festival} showPageLink={false} />
      </main>

      <SiteFooter />
      <MobileBar />
    </>
  );
}
