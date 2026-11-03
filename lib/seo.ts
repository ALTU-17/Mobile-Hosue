import { site } from "@/lib/catalog";
import { siteUrl } from "@/lib/site-url";

export function storeSchema() {
  const address = site.store.address;

  return {
    "@context": "https://schema.org",
    "@type": "MobilePhoneStore",
    "@id": `${siteUrl}/#store`,
    name: site.store.name,
    description:
      "Multi-brand mobile and electronics shop in New Usmanpura, Chhatrapati Sambhajinagar (Aurangabad). Original smartphones, GST billing, exchange, finance and accessories.",
    url: siteUrl,
    image: `${siteUrl}/opengraph-image`,
    telephone: site.store.phoneDisplay,
    priceRange: "₹₹",
    founder: {
      "@type": "Person",
      name: site.store.owner,
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: `${address.line1}, ${address.line2}, ${address.line3}`,
      addressLocality: address.city,
      addressRegion: address.state,
      postalCode: address.postalCode,
      addressCountry: "IN",
    },
    areaServed: {
      "@type": "City",
      name: address.city,
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      opens: "10:30",
      closes: "22:30",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: site.store.rating,
      reviewCount: site.store.reviewCount,
      bestRating: 5,
    },
    sameAs: [site.store.instagramUrl],
    hasMap: site.store.mapsUrl,
  };
}

export function faqSchema(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}
