import { store } from "@/lib/catalog";
import type { Product, ProductColor, ProductVariant } from "@/lib/schema";

const base = `https://wa.me/${store.whatsappRaw}`;

export function whatsappUrl(message: string): string {
  return `${base}?text=${encodeURIComponent(message)}`;
}

export const generalWhatsAppUrl = whatsappUrl(
  "Hi Mobile House, I'd like to know what's in stock today. (Sent from the Mobile House website)",
);

export function productWhatsAppUrl(
  product: Product,
  variant: ProductVariant,
  color: ProductColor,
): string {
  const availability = variant.available && color.available ? "Is it in stock?" : "When can you get this?";
  return whatsappUrl(
    `Hi Mobile House, I'm interested in the ${product.brand} ${product.name} — ${variant.ram}GB/${variant.storage}GB, ${color.name}. ${availability} (Sent from the Mobile House website)`,
  );
}

export function offerWhatsAppUrl(product: Product, price: number): string {
  return whatsappUrl(
    `Hi Mobile House, I saw the ${product.brand} ${product.name} at ₹${price.toLocaleString("en-IN")} on your website. Is that price still available? (Sent from the Mobile House website)`,
  );
}

export function callUrl(): string {
  return `tel:${store.phoneRaw}`;
}

export function directionsUrl(): string {
  return store.directionsUrl;
}
