"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { describeSource, feedFromCsv, type SheetFeed, type SheetProduct } from "@/lib/sheet";
import { ArrowUpRight, WhatsAppIcon } from "@/components/Icons";

/**
 * The sheet preview, read by the visitor's browser instead of the build.
 *
 * `SheetProducts` resolves the CSV URL once at build time and passes it here, so
 * the URL is stable in the static HTML while the rows are always fresh. Editing
 * the sheet — price, colour, photo — shows up on refresh; nothing to deploy.
 *
 * Photos come from the optional `image` column. One row per colour means each
 * swatch can own its own photo: tap a colour and the stage swaps to that colour's
 * image. No photo (or a photo that fails to load) falls back to the drawn phone
 * in that colour's hex, so a half-filled sheet never breaks a card.
 */

const FETCH_TIMEOUT_MS = 12_000;

const stockLabels: Record<SheetProduct["stock"], string> = {
  in_stock: "On the shelf",
  low_stock: "Last few pieces",
  on_order: "On order",
};

const sourceLabels: Record<SheetFeed["meta"]["source"], string> = {
  sheet: "Live sheet",
  demo: "Demo rows",
  "demo-fallback": "Sheet unreadable",
};

function formatINR(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function lowestPrice(product: SheetProduct): number {
  return Math.min(...product.variants.map((variant) => variant.price));
}

function cardWhatsAppUrl(product: SheetProduct, price: number, whatsappRaw: string): string {
  const message = `Hi Mobile House, I saw the ${product.brand} ${product.name} on your website (from ${formatINR(price)}). Is it available today? (Sent from the Mobile House website)`;
  return `https://wa.me/${whatsappRaw}?text=${encodeURIComponent(message)}`;
}

function SheetCard({ product, whatsappRaw }: { product: SheetProduct; whatsappRaw: string }) {
  const firstColor = product.colors.find((color) => color.available) ?? product.colors[0];
  const [activeHex, setActiveHex] = useState(firstColor?.hex ?? "");
  const [brokenImage, setBrokenImage] = useState<string | null>(null);

  const activeColor = product.colors.find((color) => color.hex === activeHex) ?? firstColor;
  const swatch = activeColor?.hex ?? "#8A8A8B";
  const image = activeColor?.image && activeColor.image !== brokenImage ? activeColor.image : null;
  const hasPhotos = product.colors.some((color) => color.image);
  const price = lowestPrice(product);
  const inStock = product.stock !== "on_order";

  return (
    <li className="sheet-card">
      <div className="sheet-card__stage" style={{ "--swatch": swatch } as CSSProperties}>
        {image ? (
          <div className="sheet-card__photo">
            {/* A plain img on purpose: the photo host changes with the sheet row,
                so there is no fixed hostname to allow in next.config. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image}
              alt={`${product.brand} ${product.name} in ${activeColor?.name ?? "the selected colour"}`}
              loading="lazy"
              decoding="async"
              onError={() => setBrokenImage(image)}
            />
          </div>
        ) : (
          <div className="sheet-card__device" aria-hidden="true">
            <span className="sheet-card__screen" />
            <span className="sheet-card__glint" />
          </div>
        )}

        <span className={`sheet-card__stock sheet-card__stock--${product.stock}`}>
          {stockLabels[product.stock]}
        </span>
      </div>

      <div className="sheet-card__body">
        <span className="sheet-card__brand">{product.brand}</span>
        <h3 className="sheet-card__name">{product.name}</h3>
        <p className="sheet-card__tagline">{product.tagline}</p>

        <ul className="sheet-card__swatches" aria-label={`Colours listed for the ${product.name}`}>
          {product.colors.map((color) => (
            <li key={color.hex} className={color.available ? undefined : "is-out"}>
              <button
                type="button"
                className="sheet-card__swatch"
                aria-pressed={color.hex === activeColor?.hex}
                onClick={() => setActiveHex(color.hex)}
              >
                <span
                  className="sheet-card__dot"
                  style={{ "--dot": color.hex } as CSSProperties}
                  aria-hidden="true"
                />
                {color.name}
                {!color.available && <span className="sr-only"> — not in stock</span>}
              </button>
            </li>
          ))}
        </ul>

        {hasPhotos && product.colors.length > 1 && (
          <p className="sheet-card__hint">Tap a colour to switch the photo</p>
        )}

        <ul
          className="sheet-card__variants"
          aria-label={`Variants listed for the ${product.name}`}
        >
          {product.variants.map((variant) => (
            <li
              key={`${variant.ram}-${variant.storage}`}
              className={variant.available ? undefined : "is-out"}
            >
              <span className="sheet-card__variant">
                {variant.ram}GB / {variant.storage}GB
              </span>
              {variant.mrp && <s className="sheet-card__mrp">{formatINR(variant.mrp)}</s>}
              <span className="sheet-card__price">{formatINR(variant.price)}</span>
              {!variant.available && <span className="sheet-card__status">On order</span>}
            </li>
          ))}
        </ul>

        <div className="sheet-card__foot">
          <span className="sheet-card__from">
            <span>From</span>
            <strong>{formatINR(price)}</strong>
          </span>

          <a
            className="btn btn--small sheet-card__cta"
            href={cardWhatsAppUrl(product, price, whatsappRaw)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <WhatsAppIcon />
            {inStock ? "Ask availability" : "Ask arrival"}
            <ArrowUpRight />
          </a>
        </div>
      </div>
    </li>
  );
}

function SkeletonGrid() {
  return (
    <ul className="sheetstock__grid" aria-hidden="true">
      {[0, 1].map((index) => (
        <li className="sheet-card sheet-card--skeleton" key={index}>
          <div className="sheet-card__stage">
            <span className="sheet-card__skeleton sheet-card__skeleton--device" />
            <span className="sheet-card__skeleton sheet-card__skeleton--chip" />
          </div>

          <div className="sheet-card__body">
            <span className="sheet-card__skeleton sheet-card__skeleton--line" style={{ width: "26%" }} />
            <span className="sheet-card__skeleton sheet-card__skeleton--line" style={{ width: "58%" }} />
            <span className="sheet-card__skeleton sheet-card__skeleton--line" style={{ width: "86%" }} />
            <span className="sheet-card__skeleton sheet-card__skeleton--line" style={{ width: "44%" }} />
            <span
              className="sheet-card__skeleton sheet-card__skeleton--line"
              style={{ width: "100%", marginTop: "0.5rem" }}
            />
            <span className="sheet-card__skeleton sheet-card__skeleton--line" style={{ width: "72%" }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

type Props = {
  csvUrl: string;
  demoCsv: string;
  whatsappRaw: string;
};

type LoadState = { status: "loading" } | { status: "ready"; feed: SheetFeed };

export function SheetProductsClient({ csvUrl, demoCsv, whatsappRaw }: Props) {
  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    let timer = 0;

    const run = async () => {
      if (!csvUrl) {
        // No sheet configured yet: the bundled demo rows are the feed.
        const feed = feedFromCsv(demoCsv, "demo", "content/sheet-demo.csv");
        if (!cancelled) setState({ status: "ready", feed });
        return;
      }

      timer = window.setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

      try {
        const response = await fetch(csvUrl, {
          cache: "no-store",
          signal: controller.signal,
          headers: { accept: "text/csv,text/plain,*/*" },
        });

        if (!response.ok) throw new Error(`sheet responded ${response.status}`);

        const csv = await response.text();
        if (!csv.trim() || /^\s*<(!doctype|html)/i.test(csv)) {
          throw new Error("sheet did not return CSV");
        }

        if (!cancelled) {
          setState({ status: "ready", feed: feedFromCsv(csv, "sheet", describeSource(csvUrl)) });
        }
      } catch {
        if (!cancelled) {
          setState({
            status: "ready",
            feed: feedFromCsv(demoCsv, "demo-fallback", "demo rows · sheet unreadable"),
          });
        }
      } finally {
        window.clearTimeout(timer);
      }
    };

    void run();

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [csvUrl, demoCsv]);

  const feed = state.status === "ready" ? state.feed : null;
  const products = feed?.products ?? [];
  const updatedAt = feed
    ? new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Asia/Kolkata",
      }).format(new Date(feed.meta.updatedAt))
    : null;

  return (
    <section
      className="section sheetstock"
      id="sheet-sample"
      aria-labelledby="sheet-sample-heading"
      aria-busy={state.status === "loading"}
    >
      <div className="sheetstock__wash" aria-hidden="true" />

      <div className="container">
        <div className="section-head">
          <div className="section-head__top">
            <span className="eyebrow">Preview · sheet feed</span>

            <h2 className="section-title" id="sheet-sample-heading">
              The stock sheet, <em>rendered</em>.
            </h2>

            <p className="section-intro">
              Every card below is built from spreadsheet rows — one row per variant, one column
              per detail. Change a price, a colour or a photo in the sheet and refresh: your
              browser reads it fresh, with nothing to rebuild or deploy. Tap a colour to see that
              colour&rsquo;s photo.
            </p>
          </div>

          <div className="section-head__aside">
            <dl className="sheetstock__meta">
              <div className="sheetstock__meta-item sheetstock__meta-item--wide">
                <dt>Source</dt>
                <dd>{feed ? feed.meta.label : "Connecting to the sheet…"}</dd>
              </div>
              <div className="sheetstock__meta-item">
                <dt>Rows read</dt>
                <dd>
                  {feed
                    ? `${feed.meta.rows}${feed.meta.skipped > 0 ? ` · ${feed.meta.skipped} skipped` : ""}`
                    : "—"}
                </dd>
              </div>
              <div className="sheetstock__meta-item">
                <dt>Models</dt>
                <dd>{feed ? feed.products.length : "—"}</dd>
              </div>
              <div className="sheetstock__meta-item sheetstock__meta-item--wide">
                <dt>Updated</dt>
                <dd>{updatedAt ? `${updatedAt} IST` : "—"}</dd>
              </div>
            </dl>

            <span className="sheetstock__badge" data-source={feed?.meta.source ?? "loading"}>
              {feed ? sourceLabels[feed.meta.source] : "Reading sheet…"}
            </span>
          </div>
        </div>

        {!feed ? (
          <SkeletonGrid />
        ) : products.length === 0 ? (
          <p className="sheetstock__empty">
            No rows could be read yet. Check that the header row uses the expected column names,
            then refresh this page.
          </p>
        ) : (
          <ul className="sheetstock__grid">
            {products.map((product) => (
              <SheetCard key={product.slug} product={product} whatsappRaw={whatsappRaw} />
            ))}
          </ul>
        )}

        <p className="sheetstock__note">
          {feed
            ? feed.meta.note
            : "Reading your stock sheet in the browser — these rows are never baked into a build."}
        </p>
      </div>
    </section>
  );
}
