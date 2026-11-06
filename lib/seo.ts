import { site } from "@/lib/catalog";
import { siteUrl } from "@/lib/site-url";

export const storeId = `${siteUrl}/#store`;
export const websiteId = `${siteUrl}/#website`;

/** Schema.org availability for one variant, derived from the catalogue. */
function availability(stock: string, available: boolean): string {
  if (!available) return "https://schema.org/OutOfStock";
  if (stock === "on_order") return "https://schema.org/PreOrder";
  if (stock === "low_stock") return "https://schema.org/LimitedAvailability";
  return "https://schema.org/InStock";
}

/** Prices shown in the catalogue change; tell crawlers for how long to trust them. */
function priceValidUntil(updatedAt: string): string {
  const start = new Date(`${updatedAt}T00:00:00Z`).getTime();
  if (Number.isNaN(start)) return updatedAt;
  return new Date(start + 60 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

export function storeSchema() {
  const { store } = site;

  return {
    "@type": ["MobilePhoneStore", "ElectronicsStore"],
    "@id": storeId,
    name: store.name,
    alternateName: [
      "Mobile House Aurangabad",
      "Mobile House CSN",
      "Mobile House New Usmanpura",
      "Mobile House Chhatrapati Sambhajinagar",
    ],
    slogan: store.tagline,
    description: `Multi-brand mobile and electronics store at ${store.address.line1}, ${store.address.line2}, ${store.address.line3}. Sealed original smartphones from ${site.brands.length} brands — including Apple, Samsung, OnePlus, Xiaomi, Google, Realme, Nothing and Vivo — sold with GST billing, exchange, finance and accessories in Chhatrapati Sambhajinagar (CSN) / Aurangabad, Maharashtra 431005.`,
    url: siteUrl,
    image: [`${siteUrl}/opengraph-image`],
    logo: `${siteUrl}/icon.svg`,
    telephone: store.phoneRaw,
    priceRange: "₹₹",
    currenciesAccepted: "INR",
    paymentAccepted: "Cash, UPI, Debit card, Credit card, EMI",
    founder: {
      "@type": "Person",
      name: store.owner,
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: `${store.address.line1}, ${store.address.line2}, ${store.address.line3}`,
      addressLocality: "Chhatrapati Sambhajinagar",
      addressRegion: store.address.state,
      postalCode: store.address.postalCode,
      addressCountry: "IN",
    },
    areaServed: [
      {
        "@type": "City",
        name: "Chhatrapati Sambhajinagar",
        alternateName: ["Aurangabad", "CSN"],
        containedInPlace: { "@type": "State", name: "Maharashtra" },
      },
      {
        "@type": "AdministrativeArea",
        name: "Marathwada, Maharashtra",
      },
    ],
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
      ratingValue: store.rating,
      reviewCount: store.reviewCount,
      bestRating: 5,
    },
    makesOffer: {
      "@type": "OfferCatalog",
      name: "What you can buy and do at Mobile House",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Sealed smartphones with brand warranty",
            description: `Original, sealed phones from ${site.brands.length} brands. Seal and IMEI can be checked at the counter before paying.`,
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "GST billing",
            description:
              "GST invoice carrying the model and IMEI, for company reimbursement and warranty claims.",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Exchange your old phone",
            description:
              "Old phone valued in front of you; the final exchange value depends on model and condition.",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Finance and EMI",
            description:
              "Current EMI options and the required paperwork are explained at the counter or on WhatsApp.",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Mobile accessories",
            description:
              "Cases, chargers, cables and screen protection for the phones on the shelf.",
          },
        },
      ],
    },
    knowsAbout: [
      "smartphones",
      "5G phones",
      "iPhone",
      "Samsung Galaxy",
      "OnePlus",
      "Xiaomi and Redmi",
      "mobile exchange",
      "EMI and finance",
      "GST billing",
      "mobile accessories",
    ],
    sameAs: [store.instagramUrl, store.mapsUrl, store.reviewUrl],
    hasMap: store.mapsUrl,
    isAccessibleForFree: true,
    publicAccess: true,
  };
}

export function websiteSchema() {
  return {
    "@type": "WebSite",
    "@id": websiteId,
    url: siteUrl,
    name: "Mobile House",
    alternateName: [
      "Mobile House Chhatrapati Sambhajinagar",
      "Mobile House Aurangabad",
    ],
    inLanguage: "en-IN",
    publisher: { "@id": storeId },
    about: { "@id": storeId },
  };
}

/** The brands on the shelf, so assistants can answer "who keeps Apple in CSN?". */
function brandListSchema() {
  return {
    "@type": "ItemList",
    "@id": `${siteUrl}/#brands`,
    name: "Mobile brands sold at Mobile House, Chhatrapati Sambhajinagar (Aurangabad)",
    numberOfItems: site.brands.length,
    itemListElement: site.brands.map((brand, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: { "@type": "Brand", name: brand },
    })),
  };
}

function productSchemas() {
  return site.products.map((product) => ({
    "@type": "Product",
    "@id": `${siteUrl}/#${product.slug}`,
    name: `${product.brand} ${product.name}`,
    brand: { "@type": "Brand", name: product.brand },
    category: product.fiveG ? "5G smartphone" : "Smartphone",
    description: product.tagline,
    sku: product.slug,
    image: [`${siteUrl}/opengraph-image`],
    additionalProperty: [
      { "@type": "PropertyValue", name: "Display", value: product.specs.display },
      { "@type": "PropertyValue", name: "Camera", value: product.specs.camera },
      { "@type": "PropertyValue", name: "Battery", value: product.specs.battery },
      { "@type": "PropertyValue", name: "Chipset", value: product.specs.chipset },
    ],
    offers: product.variants.map((variant) => ({
      "@type": "Offer",
      price: variant.price,
      priceCurrency: "INR",
      availability: availability(product.stock, variant.available),
      itemCondition: "https://schema.org/NewCondition",
      priceValidUntil: priceValidUntil(product.updatedAt),
      url: `${siteUrl}/#counter`,
      seller: { "@id": storeId },
      offeredBy: { "@id": storeId },
    })),
  }));
}

function productListSchema() {
  return {
    "@type": "ItemList",
    "@id": `${siteUrl}/#catalog`,
    name: "Smartphones in stock at Mobile House, New Usmanpura, Chhatrapati Sambhajinagar (Aurangabad)",
    numberOfItems: site.products.length,
    itemListElement: site.products.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: { "@id": `${siteUrl}/#${product.slug}` },
    })),
  };
}

export function faqSchema(faqs: ReadonlyArray<{ question: string; answer: string }>) {
  return {
    "@type": "FAQPage",
    "@id": `${siteUrl}/#faq`,
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

/**
 * One JSON-LD graph for the page: the shop, the site, its brands,
 * the catalogue with live prices and the FAQ block.
 */
export function seoGraph(faqs: ReadonlyArray<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      storeSchema(),
      websiteSchema(),
      brandListSchema(),
      productListSchema(),
      ...productSchemas(),
      faqSchema(faqs),
    ],
  };
}
