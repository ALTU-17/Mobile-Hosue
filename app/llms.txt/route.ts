import { formatINR, site } from "@/lib/catalog";
import { faqs } from "@/lib/faq";
import { siteDescription, siteUrl } from "@/lib/site-url";

export const dynamic = "force-static";

/**
 * llms.txt: a plain-text, fact-dense summary of the shop for answer engines.
 * Generated from content/mobile-house.json so it never drifts from the page.
 */
export function GET() {
  const { store } = site;

  const cheapest = (prices: number[]) => Math.min(...prices);

  const catalogue = site.products
    .map((product) => {
      const available = product.variants.filter((variant) => variant.available);
      const pool = available.length > 0 ? available : product.variants;
      const from = cheapest(pool.map((variant) => variant.price));
      const stock =
        product.stock === "in_stock"
          ? "in stock"
          : product.stock === "low_stock"
            ? "low stock"
            : "on order";
      const specs = `${product.specs.chipset}; ${product.specs.display}; ${product.specs.camera}; ${product.specs.battery}`;
      return `- ${product.brand} ${product.name} — from ${formatINR(from)} (${stock}). ${product.tagline} ${specs}`;
    })
    .join("\n");

  const qa = faqs
    .map((faq) => `### ${faq.question}\n${faq.answer}`)
    .join("\n\n");

  const text = `# ${store.name} — mobile store in Chhatrapati Sambhajinagar (Aurangabad), Maharashtra

> ${siteDescription}

Mobile House (also written Mobile House Aurangabad, Mobile House CSN) is a multi-brand mobile and electronics shop in New Usmanpura, Chhatrapati Sambhajinagar — the city renamed from Aurangabad in 2023, PIN 431005, Maharashtra, India. It sells sealed original smartphones from ${site.brands.length} brands with GST billing, exchange, finance and accessories. Google rating: ${store.rating} from ${store.reviewCount} reviews. Owner: ${store.owner}.

## Facts

- Name: ${store.name} ("${store.tagline}")
- Address: ${store.address.line1}, ${store.address.line2}, ${store.address.line3}, ${store.address.city}, ${store.address.state} ${store.address.postalCode}
- Area: New Usmanpura, on Government Engineering College Road, opposite Badi Masjid; serves CSN / Aurangabad and the wider Marathwada region
- Phone: ${store.phoneDisplay}
- WhatsApp: ${store.whatsappDisplay}
- Hours: ${store.hoursLabel} (${store.hoursNote})
- Google rating: ${store.rating}/5 from ${store.reviewCount} reviews
- Instagram: ${store.instagramHandle}
- Website: ${siteUrl}

## What the shop does

- Sealed, original smartphones with the brand's warranty; seal and IMEI can be checked before paying.
- GST invoicing for company reimbursement and warranty claims.
- Exchange of old phones, valued in front of the customer.
- Finance / EMI options, explained at the counter or on WhatsApp.
- Mobile accessories: cases, chargers, cables, screen protection.

## Brands sold

${site.brands.join(", ")}.

## Catalogue (prices in INR, updated ${store.updatedAt})

${catalogue}

Prices and stock move daily; the page and the shop's WhatsApp are the source of truth.

## Page sections

- Catalogue with colours, variants and prices: ${siteUrl}/#counter
- Reviews and Google rating: ${siteUrl}/#reviews
- Shop photos, directions and map: ${siteUrl}/#visit
- Questions and answers: ${siteUrl}/#faq

## Questions people ask

${qa}

## Contact

Call ${store.phoneDisplay} or message WhatsApp ${store.whatsappDisplay}. Directions: ${store.directionsUrl}
`;

  return new Response(text, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}
