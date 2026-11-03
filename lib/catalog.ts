import raw from "@/content/mobile-house.json";
import { siteDataSchema, type Product, type SiteData } from "@/lib/schema";

const parsed = siteDataSchema.safeParse(raw);

if (!parsed.success) {
  throw new Error(
    `Invalid content/mobile-house.json — fix the catalogue before building:\n${JSON.stringify(
      parsed.error.issues,
      null,
      2,
    )}`,
  );
}

export const site: SiteData = parsed.data;
export const products: Product[] = site.products;
export const store = site.store;

export const brandsInStock = [...new Set(products.map((product) => product.brand))].sort(
  (a, b) => a.localeCompare(b),
);

export const colorFamilies = [
  ...new Set(products.flatMap((product) => product.colors.map((color) => color.family))),
].sort((a, b) => a.localeCompare(b));

export function getProduct(slug: string): Product {
  const product = products.find((entry) => entry.slug === slug);
  if (!product) throw new Error(`Unknown product slug "${slug}"`);
  return product;
}

/** The lowest asking price, whether or not that variant is currently on the shelf. */
export function fromPrice(product: Product): number {
  return Math.min(...product.variants.map((variant) => variant.price));
}

export function availableVariantCount(product: Product): number {
  return product.variants.filter((variant) => variant.available).length;
}

export function availableColorCount(product: Product): number {
  return product.colors.filter((color) => color.available).length;
}

export function formatINR(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatCompactINR(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function stockCopy(stock: Product["stock"]): string {
  if (stock === "in_stock") return "On the shelf";
  if (stock === "low_stock") return "Last few pieces";
  return "Ask about the next lot";
}

export function stockTone(stock: Product["stock"]): "positive" | "warm" | "neutral" {
  if (stock === "in_stock") return "positive";
  if (stock === "low_stock") return "warm";
  return "neutral";
}

export function formatUpdated(iso: string): string {
  const date = new Date(`${iso}T00:00:00`);
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}
