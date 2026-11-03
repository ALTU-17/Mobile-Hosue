"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { Product, ProductColor, ProductVariant, SiteData } from "@/lib/schema";
import { DeviceArt } from "@/components/DeviceArt";
import {
  ArrowUpRight,
  CloseIcon,
  InfoIcon,
  SearchIcon,
  WhatsAppIcon,
  PhoneIcon,
} from "@/components/Icons";

type Offer = SiteData["offers"][number];

type CatalogProps = {
  products: Product[];
  offers: Offer[];
  whatsappRaw: string;
  phoneDisplay: string;
  phoneRaw: string;
  sampleData: boolean;
  updatedAt: string;
};

const budgetOptions = [
  { value: "all", label: "Any budget" },
  { value: "under-30", label: "Under ₹30,000" },
  { value: "30-60", label: "₹30,000–₹60,000" },
  { value: "60-plus", label: "₹60,000+" },
];

function formatINR(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function stockCopy(stock: Product["stock"]) {
  if (stock === "in_stock") return "On the shelf";
  if (stock === "low_stock") return "Last few pieces";
  return "Ask about the next lot";
}

function stockTone(stock: Product["stock"]) {
  if (stock === "in_stock") return "positive";
  if (stock === "low_stock") return "warm";
  return "neutral";
}

function waLink(raw: string, message: string) {
  return `https://wa.me/${raw}?text=${encodeURIComponent(message)}`;
}

function enquiryMessage(
  product: Product,
  variant: ProductVariant,
  color: ProductColor,
) {
  const available = variant.available && color.available;
  return `Hi Mobile House, I'm interested in the ${product.brand} ${product.name} — ${variant.ram}GB/${variant.storage}GB, ${color.name}. ${
    available ? "Is it in stock?" : "When can you get this colour/variant?"
  } (Sent from the Mobile House website)`;
}

function ProductDialog({
  product,
  initialColor,
  onClose,
  whatsappRaw,
  phoneDisplay,
  phoneRaw,
  sampleData,
  updatedAt,
}: {
  product: Product;
  initialColor: ProductColor;
  onClose: () => void;
  whatsappRaw: string;
  phoneDisplay: string;
  phoneRaw: string;
  sampleData: boolean;
  updatedAt: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const firstAvailableVariant =
    product.variants.find((variant) => variant.available) ?? product.variants[0];
  const [color, setColor] = useState(initialColor);
  const [variant, setVariant] = useState(firstAvailableVariant);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (!dialog.open) dialog.showModal();
    document.body.classList.add("modal-open");
    return () => {
      document.body.classList.remove("modal-open");
    };
  }, []);

  const message = enquiryMessage(product, variant, color);
  const hasCombo = variant.available && color.available;

  return (
    <dialog
      ref={dialogRef}
      className="product-modal"
      aria-labelledby="product-modal-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <button
        type="button"
        className="product-modal__close"
        onClick={onClose}
        aria-label="Close product details"
      >
        <CloseIcon />
      </button>

      <div className="product-modal__grid">
        <div className="product-modal__visual">
          <DeviceArt product={product} color={color} size="large" />
        </div>

        <div className="product-modal__content">
          <div className="product-modal__kicker">
            {product.brand} · {stockCopy(product.stock)}
          </div>
          <h2 className="product-modal__title" id="product-modal-title">
            {product.name}
          </h2>
          <p className="product-modal__tagline">{product.tagline}</p>

          {sampleData && (
            <div className="sample-note" style={{ marginTop: 0 }}>
              <InfoIcon />
              <span>
                <strong>Sample listing.</strong> Confirm the live colour, variant and price on
                WhatsApp before you visit.
              </span>
            </div>
          )}

          <div className="modal-section">
            <div className="modal-label">
              <span>Colour</span>
              <strong>{color.name}</strong>
            </div>
            <div className="colour-options" role="group" aria-label="Choose a colour">
              {product.colors.map((option) => (
                <button
                  key={option.name}
                  type="button"
                  className="colour-option"
                  aria-pressed={option.name === color.name}
                  data-unavailable={!option.available}
                  onClick={() => setColor(option)}
                  title={`${option.name}${option.available ? "" : " — not currently on the shelf"}`}
                >
                  <span
                    className="colour-option__dot"
                    style={{ "--swatch": option.hex } as React.CSSProperties}
                  />
                  {option.name}
                  {!option.available && <em>not on shelf</em>}
                </button>
              ))}
            </div>
          </div>

          <div className="modal-section">
            <div className="modal-label">
              <span>Variant</span>
              <strong>
                {variant.ram}GB RAM + {variant.storage}GB
              </strong>
            </div>
            <div className="variant-options" role="group" aria-label="Choose a variant">
              {product.variants.map((option) => (
                <button
                  key={`${option.ram}-${option.storage}`}
                  type="button"
                  className="variant-option"
                  aria-pressed={
                    option.ram === variant.ram && option.storage === variant.storage
                  }
                  data-unavailable={!option.available}
                  onClick={() => setVariant(option)}
                >
                  <span className="variant-option__name">
                    {option.ram}GB + {option.storage}GB
                  </span>
                  <span className="variant-option__price">{formatINR(option.price)}</span>
                  {!option.available && (
                    <span className="variant-option__status">ask about this variant</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="product-modal__buy">
            <div className="product-modal__price">
              <strong>{formatINR(variant.price)}</strong>
              <span>
                {variant.mrp && variant.mrp > variant.price ? (
                  <>
                    MRP <s>{formatINR(variant.mrp)}</s> · indicative
                  </>
                ) : (
                  "Indicative counter price"
                )}
              </span>
            </div>
            <div className="product-modal__actions">
              <a
                className="btn btn--wide"
                href={waLink(whatsappRaw, message)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <WhatsAppIcon />
                {hasCombo ? "Check this combo on WhatsApp" : "Ask when this is available"}
              </a>
              <a className="btn btn--ghost btn--wide btn--small" href={`tel:${phoneRaw}`}>
                <PhoneIcon />
                Call {phoneDisplay}
              </a>
            </div>
          </div>

          <div className="spec-grid">
            <div className="spec">
              <div className="spec__label">Display</div>
              <div className="spec__value">{product.specs.display}</div>
            </div>
            <div className="spec">
              <div className="spec__label">Camera</div>
              <div className="spec__value">{product.specs.camera}</div>
            </div>
            <div className="spec">
              <div className="spec__label">Battery</div>
              <div className="spec__value">{product.specs.battery}</div>
            </div>
            <div className="spec">
              <div className="spec__label">Chipset</div>
              <div className="spec__value">{product.specs.chipset}</div>
            </div>
          </div>

          <p className="product-modal__fineprint">
            <InfoIcon />
            Stock shown is a snapshot from {updatedAt}. Colours and variants move quickly; WhatsApp
            us and we&apos;ll confirm what is physically on the shelf. Final price may change with
            exchange or finance.
          </p>
        </div>
      </div>
    </dialog>
  );
}

function ProductCard({
  product,
  sampleData,
  onOpen,
}: {
  product: Product;
  sampleData: boolean;
  onOpen: (product: Product, color: ProductColor) => void;
}) {
  const availableColor = product.colors.find((color) => color.available) ?? product.colors[0];
  const [activeColor, setActiveColor] = useState(availableColor);
  const shouldReduce = useReducedMotion() ?? false;
  const minPrice = Math.min(...product.variants.map((variant) => variant.price));
  const availableColors = product.colors.filter((color) => color.available).length;
  const variantSummary = product.variants
    .slice(0, 2)
    .map((variant) => `${variant.ram}+${variant.storage}`)
    .join(" · ");

  return (
    <motion.article
      layout={!shouldReduce}
      initial={shouldReduce ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={shouldReduce ? undefined : { opacity: 0, scale: 0.985 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      className={`product-card${product.featured ? " product-card--featured" : ""}`}
    >
      <button
        type="button"
        className="product-card__visual"
        onClick={() => onOpen(product, activeColor)}
        aria-label={`View ${product.brand} ${product.name} stock and colours`}
      >
        {sampleData && <span className="product-card__sample">Sample</span>}
        <DeviceArt product={product} color={activeColor} />
      </button>

      <div className="product-card__body">
        <div className="product-card__topline">
          <span className="product-card__brand">{product.brand}</span>
          <span className={`stock-pill stock-pill--${stockTone(product.stock)}`}>
            {stockCopy(product.stock)}
          </span>
        </div>

        <h3 className="product-card__name">{product.name}</h3>
        <p className="product-card__tagline">{product.tagline}</p>

        <div className="product-card__colours" aria-label="Colour availability">
          {product.colors.map((color) => (
            <button
              key={color.name}
              type="button"
              className="swatch"
              style={{ "--swatch": color.hex } as React.CSSProperties}
              aria-pressed={activeColor.name === color.name}
              aria-label={`${color.name}${color.available ? "" : " — not on shelf"}`}
              title={`${color.name}${color.available ? "" : " — not on shelf"}`}
              disabled={!color.available}
              onClick={() => setActiveColor(color)}
            />
          ))}
          <span className="product-card__colours-label">
            {availableColors} {availableColors === 1 ? "colour" : "colours"} on the shelf
          </span>
        </div>

        <div className="product-card__bottom">
          <div className="product-card__price">
            <span className="product-card__price-label">From</span>
            <span className="product-card__price-value">
              {formatINR(minPrice)} <span>onwards</span>
            </span>
          </div>
          <div className="product-card__variants">
            {variantSummary}
            <br />
            {product.stock === "on_order" ? "ask for arrival" : "variants"}
          </div>
          <button
            type="button"
            className="product-card__open"
            onClick={() => onOpen(product, activeColor)}
            aria-label={`See ${product.name} availability`}
          >
            <ArrowUpRight />
          </button>
        </div>
      </div>
    </motion.article>
  );
}

export function Catalog({
  products,
  offers,
  whatsappRaw,
  phoneDisplay,
  phoneRaw,
  sampleData,
  updatedAt,
}: CatalogProps) {
  const [brand, setBrand] = useState("All");
  const [budget, setBudget] = useState("all");
  const [family, setFamily] = useState("all");
  const [fiveGOnly, setFiveGOnly] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("featured");
  const [selected, setSelected] = useState<{
    product: Product;
    color: ProductColor;
  } | null>(null);

  const brands = useMemo(
    () => [...new Set(products.map((product) => product.brand))].sort((a, b) => a.localeCompare(b)),
    [products],
  );
  const families = useMemo(
    () =>
      [...new Set(products.flatMap((product) => product.colors.map((color) => color.family)))].sort(
        (a, b) => a.localeCompare(b),
      ),
    [products],
  );

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const result = products.filter((product) => {
      const minPrice = Math.min(...product.variants.map((variant) => variant.price));
      const matchesBrand = brand === "All" || product.brand === brand;
      const matchesBudget =
        budget === "all" ||
        (budget === "under-30" && minPrice < 30_000) ||
        (budget === "30-60" && minPrice >= 30_000 && minPrice < 60_000) ||
        (budget === "60-plus" && minPrice >= 60_000);
      const matchesFamily =
        family === "all" || product.colors.some((color) => color.family === family);
      const matchesFiveG = !fiveGOnly || product.fiveG;
      const matchesStock =
        !inStockOnly ||
        (product.stock !== "on_order" && product.variants.some((variant) => variant.available));
      const matchesQuery =
        !normalized ||
        `${product.brand} ${product.name} ${product.tagline}`.toLowerCase().includes(normalized);
      return (
        matchesBrand &&
        matchesBudget &&
        matchesFamily &&
        matchesFiveG &&
        matchesStock &&
        matchesQuery
      );
    });

    return result.sort((a, b) => {
      const aPrice = Math.min(...a.variants.map((variant) => variant.price));
      const bPrice = Math.min(...b.variants.map((variant) => variant.price));
      if (sort === "price-asc") return aPrice - bPrice;
      if (sort === "price-desc") return bPrice - aPrice;
      if (sort === "name") return `${a.brand} ${a.name}`.localeCompare(`${b.brand} ${b.name}`);
      return Number(b.featured) - Number(a.featured);
    });
  }, [products, brand, budget, family, fiveGOnly, inStockOnly, query, sort]);

  const activeFilters =
    Number(brand !== "All") +
    Number(budget !== "all") +
    Number(family !== "all") +
    Number(fiveGOnly) +
    Number(inStockOnly) +
    Number(query.trim().length > 0);

  const deals = offers
    .map((offer) => ({
      offer,
      product: products.find((product) => product.slug === offer.productSlug),
    }))
    .filter((entry): entry is { offer: Offer; product: Product } => Boolean(entry.product));

  const openProduct = (product: Product, color?: ProductColor) => {
    setSelected({
      product,
      color: color ?? product.colors.find((entry) => entry.available) ?? product.colors[0],
    });
  };

  const clearFilters = () => {
    setBrand("All");
    setBudget("all");
    setFamily("all");
    setFiveGOnly(false);
    setInStockOnly(false);
    setQuery("");
    setSort("featured");
  };

  return (
    <section className="section catalog" id="counter" aria-labelledby="counter-heading">
      <div className="container">
        <div className="catalog__head">
          <div className="section-head">
            <div className="section-head__top">
              <span className="eyebrow">01 / The Counter</span>
              <h2 className="section-title" id="counter-heading">
                Pick a phone.
                <br />
                Pick a colour.
              </h2>
            </div>
            <div className="section-head__aside">
              <p className="section-intro">
                The shelf, as it stands. Filter by brand, budget or colour, then open a phone to see
                exactly which variants and finishes are available. No guesswork, no fake &ldquo;in
                stock&rdquo; badges.
              </p>
              <span className="text-link" aria-hidden="true">
                Updated {updatedAt}
              </span>
            </div>
          </div>

          {sampleData && (
            <div className="sample-note">
              <InfoIcon />
              <span>
                <strong>This is sample stock.</strong> The layout and colour controls are live, but
                the models and prices below are placeholders. Confirm the actual shelf on WhatsApp
                before visiting — the shop&apos;s real catalogue drops into one file.
              </span>
            </div>
          )}
        </div>

        {deals.length > 0 && (
          <div className="deal-board">
            <div className="deal-board__head">
              <span className="deal-board__title">This week at the counter</span>
              <span className="deal-board__title">Indicative · confirm on WhatsApp</span>
            </div>
            <div className="deals">
              {deals.map(({ offer, product }) => (
                <button
                  key={`${offer.productSlug}-${offer.label}`}
                  type="button"
                  className="deal"
                  onClick={() => openProduct(product)}
                >
                  <span className="deal__label">{offer.label}</span>
                  <span className="deal__name">
                    {product.brand} {product.name}
                  </span>
                  <span className="deal__price">
                    {formatINR(offer.price)}
                    {offer.mrp && <span className="deal__mrp">{formatINR(offer.mrp)}</span>}
                  </span>
                  <ArrowUpRight className="deal__arrow" />
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="filters" aria-label="Filter the phone catalogue">
          <div className="filters__row">
            <div className="chip-scroll" role="group" aria-label="Filter by brand">
              <button
                type="button"
                className="chip"
                aria-pressed={brand === "All"}
                onClick={() => setBrand("All")}
              >
                All brands
              </button>
              {brands.map((item) => (
                <button
                  key={item}
                  type="button"
                  className="chip"
                  aria-pressed={brand === item}
                  onClick={() => setBrand(item)}
                >
                  {item}
                </button>
              ))}
            </div>

            <label className="filter-search">
              <SearchIcon />
              <span className="sr-only">Search phones by model or brand</span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search a model…"
              />
            </label>
          </div>

          <div className="filters__row">
            <label className="filter-field">
              <span>Budget</span>
              <select value={budget} onChange={(event) => setBudget(event.target.value)}>
                {budgetOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="filter-field">
              <span>Colour</span>
              <select value={family} onChange={(event) => setFamily(event.target.value)}>
                <option value="all">Any colour</option>
                {families.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="button"
              className="filter-toggle"
              aria-pressed={fiveGOnly}
              onClick={() => setFiveGOnly((value) => !value)}
            >
              5G only
            </button>
            <button
              type="button"
              className="filter-toggle"
              aria-pressed={inStockOnly}
              onClick={() => setInStockOnly((value) => !value)}
            >
              On the shelf
            </button>

            {activeFilters > 0 && (
              <button type="button" className="filter-clear" onClick={clearFilters}>
                Clear {activeFilters} filter{activeFilters === 1 ? "" : "s"}
              </button>
            )}
          </div>
        </div>

        <div className="filters__meta">
          <p className="result-count" aria-live="polite">
            <strong>{filtered.length}</strong> {filtered.length === 1 ? "phone" : "phones"} on the
            counter <span>·</span> colours reflect the shelf
          </p>
          <label className="sort-select filter-field">
            <span>Sort</span>
            <select value={sort} onChange={(event) => setSort(event.target.value)}>
              <option value="featured">Featured</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
              <option value="name">Name</option>
            </select>
          </label>
        </div>

        {filtered.length > 0 ? (
          <AnimatePresence mode="popLayout" initial={false}>
            <div className="product-grid">
              {filtered.map((product) => (
                <ProductCard
                  key={product.slug}
                  product={product}
                  sampleData={sampleData}
                  onOpen={openProduct}
                />
              ))}
            </div>
          </AnimatePresence>
        ) : (
          <div className="empty-state">
            <span className="eyebrow">No match on the shelf</span>
            <h3>We can probably still get it.</h3>
            <p>
              Try a wider budget or another colour. Or send us the model you want — the shop sources
              phones every week.
            </p>
            <a
              className="btn"
              href={waLink(
                whatsappRaw,
                "Hi Mobile House, I'm looking for a specific phone that isn't on the website. Can you help? (Sent from the Mobile House website)",
              )}
              target="_blank"
              rel="noopener noreferrer"
            >
              <WhatsAppIcon />
              Ask Imran
            </a>
          </div>
        )}
      </div>

      {selected && (
        <ProductDialog
          key={`${selected.product.slug}-${selected.color.name}`}
          product={selected.product}
          initialColor={selected.color}
          onClose={() => setSelected(null)}
          whatsappRaw={whatsappRaw}
          phoneDisplay={phoneDisplay}
          phoneRaw={phoneRaw}
          sampleData={sampleData}
          updatedAt={updatedAt}
        />
      )}
    </section>
  );
}
