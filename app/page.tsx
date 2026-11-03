import { site, formatUpdated } from "@/lib/catalog";
import { faqs } from "@/lib/faq";
import { faqSchema, storeSchema } from "@/lib/seo";
import { Preloader } from "@/components/Preloader";
import { SiteHeader } from "@/components/SiteHeader";
import { Hero } from "@/components/Hero";
import { BrandRail } from "@/components/BrandRail";
import { FestivalOffers } from "@/components/FestivalOffers";
import { Catalog } from "@/components/Catalog";
import { PromiseSection } from "@/components/PromiseSection";
import { ReelsSection } from "@/components/ReelsSection";
import { ReviewsSection } from "@/components/ReviewsSection";
import { AwardsSection } from "@/components/AwardsSection";
import { VisitSection } from "@/components/VisitSection";
import { FaqSection } from "@/components/FaqSection";
import { SiteFooter } from "@/components/SiteFooter";
import { MobileBar } from "@/components/MobileBar";

export default function HomePage() {
  const jsonLd = [storeSchema(), faqSchema([...faqs])];

  return (
    <>
      <a className="skip-link" href="#counter">
        Skip to the phones
      </a>

      <Preloader />
      <SiteHeader />

      <main id="top">
        <Hero />
        <BrandRail />
        <FestivalOffers festival={site.festival} />
        <Catalog
          products={site.products}
          offers={site.offers}
          whatsappRaw={site.store.whatsappRaw}
          phoneDisplay={site.store.phoneDisplay}
          phoneRaw={site.store.phoneRaw}
          sampleData={site.store.sampleData}
          updatedAt={formatUpdated(site.store.updatedAt)}
        />
        <PromiseSection />
        <ReelsSection reels={site.reels} store={site.store} />
        <ReviewsSection />
        <AwardsSection awards={site.awards} />
        <VisitSection />
        <FaqSection />
      </main>

      <SiteFooter />
      <MobileBar />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
    </>
  );
}
