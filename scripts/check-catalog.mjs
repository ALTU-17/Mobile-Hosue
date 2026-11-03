#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const path = resolve(process.cwd(), "content/mobile-house.json");
const data = JSON.parse(readFileSync(path, "utf8"));
const errors = [];

if (!data.store?.name) errors.push("store.name is required");
if (!/^\d{10,15}$/.test(data.store?.whatsappRaw ?? "")) {
  errors.push("store.whatsappRaw must be 10–15 digits with no spaces or plus sign");
}
if (!Array.isArray(data.products) || data.products.length === 0) {
  errors.push("At least one product is required");
}

const slugs = new Set();
for (const [index, product] of (data.products ?? []).entries()) {
  const label = product.slug || `products[${index}]`;
  if (!product.slug || slugs.has(product.slug)) errors.push(`${label}: slug is missing or duplicated`);
  slugs.add(product.slug);
  if (!product.name || !product.brand) errors.push(`${label}: brand and name are required`);
  if (!["in_stock", "low_stock", "on_order"].includes(product.stock)) {
    errors.push(`${label}: stock must be in_stock, low_stock or on_order`);
  }
  if (!product.colors?.length) errors.push(`${label}: add at least one colour`);
  if (!product.variants?.length) errors.push(`${label}: add at least one variant`);
  for (const [colorIndex, color] of (product.colors ?? []).entries()) {
    if (!/^#[0-9a-fA-F]{6}$/.test(color.hex ?? "")) {
      errors.push(`${label}: colors[${colorIndex}].hex must be a six-digit hex value`);
    }
  }
  for (const [variantIndex, variant] of (product.variants ?? []).entries()) {
    if (!(variant.price > 0)) errors.push(`${label}: variants[${variantIndex}].price must be positive`);
    if (variant.mrp && variant.mrp < variant.price) {
      errors.push(`${label}: variants[${variantIndex}].mrp is below the selling price`);
    }
  }
}

for (const [index, offer] of (data.offers ?? []).entries()) {
  if (!slugs.has(offer.productSlug)) {
    errors.push(`offers[${index}].productSlug does not match a product`);
  }
}

const festival = data.festival;
if (festival) {
  const themes = ["diwali", "eid", "navratri", "christmas", "plain"];
  if (!themes.includes(festival.theme)) {
    errors.push(`festival.theme must be one of: ${themes.join(", ")}`);
  }
  if (festival.enabled && (!Array.isArray(festival.deals) || festival.deals.length === 0)) {
    errors.push("festival.enabled is true but no festival deals are listed");
  }
  for (const [index, deal] of (festival.deals ?? []).entries()) {
    const label = deal.slug ? `festival.deals[${deal.slug}]` : `festival.deals[${index}]`;
    if (!deal.headline) errors.push(`${label}: headline is required`);
    if (!deal.image) errors.push(`${label}: image is required`);
    if (!deal.offerPrice && !deal.discountLabel) {
      errors.push(`${label}: add offerPrice or discountLabel`);
    }
    if (deal.offerPrice && deal.regularPrice && deal.offerPrice > deal.regularPrice) {
      errors.push(`${label}: offerPrice is higher than regularPrice`);
    }
  }
}

if (errors.length) {
  console.error(`\nCatalogue check failed (${errors.length}):`);
  for (const error of errors) console.error(`  • ${error}`);
  process.exit(1);
}

const festivalStatus = data.festival?.enabled
  ? `${data.festival.deals.length} ${data.festival.name} deals (${data.festival.theme} theme)`
  : "festival section off";

console.log(
  `Catalogue OK — ${data.products.length} products, ${data.offers?.length ?? 0} offers, ${data.brands.length} brands, ${festivalStatus}.`,
);
