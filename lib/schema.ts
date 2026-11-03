import { z } from "zod";

const colorFamilies = [
  "Black",
  "White",
  "Silver",
  "Blue",
  "Green",
  "Purple",
  "Gold",
  "Pink",
  "Other",
] as const;

const colorSchema = z.object({
  name: z.string().min(1),
  hex: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Use a six-digit hex colour"),
  family: z.enum(colorFamilies),
  available: z.boolean(),
});

const variantSchema = z.object({
  ram: z.number().int().positive(),
  storage: z.number().int().positive(),
  price: z.number().int().positive(),
  mrp: z.number().int().positive().optional(),
  available: z.boolean(),
});

const productSchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  brand: z.string().min(1),
  name: z.string().min(1),
  tagline: z.string().min(1),
  featured: z.boolean(),
  fiveG: z.boolean(),
  stock: z.enum(["in_stock", "low_stock", "on_order"]),
  colors: z.array(colorSchema).min(1),
  variants: z.array(variantSchema).min(1),
  specs: z.object({
    display: z.string().min(1),
    camera: z.string().min(1),
    battery: z.string().min(1),
    chipset: z.string().min(1),
  }),
  updatedAt: z.string().min(1),
});

const storeSchema = z.object({
  name: z.string().min(1),
  tagline: z.string().min(1),
  owner: z.string().min(1),
  phoneDisplay: z.string().min(1),
  phoneRaw: z.string().min(1),
  whatsappDisplay: z.string().min(1),
  whatsappRaw: z.string().regex(/^\d{10,15}$/),
  instagramHandle: z.string().min(1),
  instagramUrl: z.string().url(),
  instagramFollowers: z.number().int().nonnegative(),
  rating: z.number().min(0).max(5),
  reviewCount: z.number().int().nonnegative(),
  reviewUrl: z.string().url(),
  address: z.object({
    line1: z.string().min(1),
    line2: z.string().min(1),
    line3: z.string().min(1),
    city: z.string().min(1),
    state: z.string().min(1),
    postalCode: z.string().min(1),
  }),
  hoursLabel: z.string().min(1),
  hoursNote: z.string().min(1),
  mapsUrl: z.string().url(),
  directionsUrl: z.string().url(),
  sampleData: z.boolean(),
  updatedAt: z.string().min(1),
});

const reelSchema = z.object({
  url: z.string().url(),
  title: z.string().min(1),
  cover: z.string().optional(),
});

const awardSchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  issuer: z.string().min(1),
  period: z.string().min(1),
  summary: z.string().min(1),
  image: z.string().min(1),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});

const festivalDealSchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  headline: z.string().min(1),
  subhead: z.string().min(1),
  badge: z.string().min(1).optional(),
  image: z.string().min(1),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  regularPrice: z.number().int().positive().optional(),
  offerPrice: z.number().int().positive().optional(),
  discountLabel: z.string().min(1).optional(),
  details: z.array(z.string().min(1)).min(1),
  note: z.string().min(1).optional(),
});

export const festivalThemes = ["diwali", "eid", "navratri", "christmas", "plain"] as const;

const festivalSchema = z.object({
  enabled: z.boolean(),
  theme: z.enum(["diwali", "eid", "navratri", "christmas", "plain"]),
  name: z.string().min(1),
  season: z.string().min(1),
  headline: z.string().min(1),
  intro: z.string().min(1),
  window: z.string().min(1),
  windowNote: z.string().min(1),
  deals: z.array(festivalDealSchema),
  perks: z.array(
    z.object({
      label: z.string().min(1),
      detail: z.string().min(1),
    }),
  ),
  fineprint: z.string().min(1),
});

export const siteDataSchema = z
  .object({
    store: storeSchema,
    festival: festivalSchema,
    brands: z.array(z.string().min(1)).min(1),
    products: z.array(productSchema).min(1),
    offers: z.array(
      z.object({
        productSlug: z.string().min(1),
        label: z.string().min(1),
        price: z.number().int().positive(),
        mrp: z.number().int().positive().optional(),
      }),
    ),
    reels: z.array(reelSchema),
    awards: z.array(awardSchema),
    reviews: z.object({
      quotes: z.array(
        z.object({
          name: z.string().min(1),
          text: z.string().min(1),
          rating: z.number().min(1).max(5),
        }),
      ),
    }),
  })
  .superRefine((data, ctx) => {
    const slugs = new Set<string>();
    for (const [index, product] of data.products.entries()) {
      if (slugs.has(product.slug)) {
        ctx.addIssue({
          code: "custom",
          path: ["products", index, "slug"],
          message: `Duplicate product slug "${product.slug}"`,
        });
      }
      slugs.add(product.slug);
      if (product.stock !== "on_order" && !product.colors.some((color) => color.available)) {
        ctx.addIssue({
          code: "custom",
          path: ["products", index, "colors"],
          message: "At least one colour must be marked available unless the phone is on order",
        });
      }
      for (const [variantIndex, variant] of product.variants.entries()) {
        if (variant.mrp && variant.mrp < variant.price) {
          ctx.addIssue({
            code: "custom",
            path: ["products", index, "variants", variantIndex, "mrp"],
            message: "MRP cannot be lower than the selling price",
          });
        }
      }
    }
    for (const [index, offer] of data.offers.entries()) {
      if (!slugs.has(offer.productSlug)) {
        ctx.addIssue({
          code: "custom",
          path: ["offers", index, "productSlug"],
          message: `Offer points at unknown product "${offer.productSlug}"`,
        });
      }
    }

    const dealSlugs = new Set<string>();
    for (const [index, deal] of data.festival.deals.entries()) {
      if (dealSlugs.has(deal.slug)) {
        ctx.addIssue({
          code: "custom",
          path: ["festival", "deals", index, "slug"],
          message: `Duplicate festival deal slug "${deal.slug}"`,
        });
      }
      dealSlugs.add(deal.slug);
      if (!deal.offerPrice && !deal.discountLabel) {
        ctx.addIssue({
          code: "custom",
          path: ["festival", "deals", index, "offerPrice"],
          message: "Give the deal an offer price or a discount label",
        });
      }
      if (deal.offerPrice && deal.regularPrice && deal.offerPrice > deal.regularPrice) {
        ctx.addIssue({
          code: "custom",
          path: ["festival", "deals", index, "offerPrice"],
          message: "The festival offer price cannot be higher than the regular price",
        });
      }
    }
  });

export type SiteData = z.infer<typeof siteDataSchema>;
export type Product = SiteData["products"][number];
export type ProductVariant = Product["variants"][number];
export type ProductColor = Product["colors"][number];
export type Store = SiteData["store"];
export type Reel = SiteData["reels"][number];
export type Award = SiteData["awards"][number];
export type Festival = SiteData["festival"];
export type FestivalDeal = Festival["deals"][number];
export type ReviewQuote = SiteData["reviews"]["quotes"][number];
export type ColorFamily = (typeof colorFamilies)[number];
