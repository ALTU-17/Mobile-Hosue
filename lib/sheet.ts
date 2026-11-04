import { z } from "zod";

/**
 * Sheet feed parsing — pure, so it runs in the browser.
 *
 * The visitor's browser reads the sheet on every page load, which is why editing
 * a price, a colour or a photo shows up on refresh with no rebuild, no deploy and
 * no server. The sheet URL is baked in at build time by
 * components/SheetProducts.tsx; the rows never are.
 *
 * Google serves both endpoints with `Access-Control-Allow-Origin`, so a plain
 * `fetch` works:
 *   .../d/<id>/gviz/tq?tqx=out:csv&sheet=Products   any shared sheet
 *   .../d/e/<id>/pub?output=csv                     Publish to web
 *
 * The address bar gives you different link shapes, so resolveSheetUrl() accepts
 * an edit link, a share link, a bare id or an already-CSV link.
 *
 * Rows are one per colour × variant. `image` is optional and holds the photo for
 * that colour — a full https URL or a site path like /images/phones/x.jpg.
 */

export type SheetSource = "sheet" | "demo" | "demo-fallback";

export type SheetColor = {
  name: string;
  hex: string;
  family: string;
  available: boolean;
  /** Photo for this colour. Missing means the drawn phone in this hex is used. */
  image?: string;
};

export type SheetVariant = {
  ram: number;
  storage: number;
  price: number;
  mrp?: number;
  available: boolean;
};

export type SheetProduct = {
  slug: string;
  brand: string;
  name: string;
  tagline: string;
  stock: "in_stock" | "low_stock" | "on_order";
  colors: SheetColor[];
  variants: SheetVariant[];
};

export type SheetFeed = {
  products: SheetProduct[];
  meta: {
    source: SheetSource;
    label: string;
    note: string;
    rows: number;
    skipped: number;
    updatedAt: string;
  };
};

const DEFAULT_TAB = "Products";

/* ---------------------------------------------------------------- */
/*  CSV                                                              */
/* ---------------------------------------------------------------- */

/** Quote-aware CSV reader — enough for a sheet export, no dependency. */
function parseCsv(input: string): string[][] {
  const text = input.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n");
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];

    if (quoted) {
      if (char === '"') {
        if (text[index + 1] === '"') {
          field += '"';
          index += 1;
        } else {
          quoted = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((entry) => entry.some((cell) => cell.trim() !== ""));
}

function toNumber(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const cleaned = value.replace(/[^0-9.]/g, "");
  if (!cleaned) return undefined;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function toBoolean(value: string | undefined): boolean {
  if (!value) return false;
  return /^(true|yes|y|1|available|in ?stock|x)$/i.test(value.trim());
}

function toHex(value: string | undefined, fallback: string): string {
  if (!value) return fallback;
  const raw = value.trim().replace(/^#/, "");
  if (/^[0-9a-fA-F]{6}$/.test(raw)) return `#${raw.toUpperCase()}`;
  if (/^[0-9a-fA-F]{3}$/.test(raw)) {
    const expanded = raw
      .split("")
      .map((char) => char + char)
      .join("");
    return `#${expanded.toUpperCase()}`;
  }
  return fallback;
}

function toStock(value: string | undefined): SheetProduct["stock"] {
  const normalised = (value ?? "").trim().toLowerCase().replace(/[\s-]+/g, "_");
  if (/^(in_stock|instock|available|yes|1|x)$/.test(normalised)) return "in_stock";
  if (/^(low_stock|lowstock|low|last_few|few|2|hurry)$/.test(normalised)) return "low_stock";
  if (/^(on_order|onorder|order|out_of_stock|outofstock|sold_out|0)$/.test(normalised)) {
    return "on_order";
  }
  return "in_stock";
}

/**
 * Accepts a hosted photo (Cloudinary, R2, any https host) or a path inside
 * public/. Bare filenames and Drive share links are dropped rather than guessed
 * at, so a broken URL can never take the card down — the drawn phone stays.
 */
function toImage(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const raw = value.trim();
  if (!raw || /\s/.test(raw)) return undefined;
  if (/^https?:\/\//i.test(raw)) return raw;
  if (raw.startsWith("/")) return raw;
  return undefined;
}

/* ---------------------------------------------------------------- */
/*  Row -> product                                                   */
/* ---------------------------------------------------------------- */

const productSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  brand: z.string().min(1),
  name: z.string().min(1),
  tagline: z.string().min(1),
  stock: z.enum(["in_stock", "low_stock", "on_order"]),
  colors: z
    .array(
      z.object({
        name: z.string().min(1),
        hex: z.string().regex(/^#[0-9a-fA-F]{6}$/),
        family: z.string().min(1),
        available: z.boolean(),
        image: z.string().min(1).optional(),
      }),
    )
    .min(1),
  variants: z
    .array(
      z.object({
        ram: z.number().int().positive(),
        storage: z.number().int().positive(),
        price: z.number().int().positive(),
        mrp: z.number().int().positive().optional(),
        available: z.boolean(),
      }),
    )
    .min(1),
});

type Draft = {
  slug: string;
  brand: string;
  name: string;
  tagline: string;
  stock: SheetProduct["stock"];
  colors: Map<string, SheetColor>;
  variants: Map<string, SheetVariant>;
};

const REQUIRED_COLUMNS = [
  "slug",
  "brand",
  "name",
  "tagline",
  "stock",
  "ram",
  "storage",
  "price",
  "colour",
  "hex",
] as const;

export function buildProducts(csv: string): {
  products: SheetProduct[];
  rows: number;
  skipped: number;
} {
  const [headerRow, ...dataRows] = parseCsv(csv);
  if (!headerRow) return { products: [], rows: 0, skipped: 0 };

  const header = headerRow.map((cell) => cell.trim().toLowerCase().replace(/\s+/g, "_"));
  const column = (name: string) => header.indexOf(name);
  const missing = REQUIRED_COLUMNS.filter((name) => column(name) === -1);

  if (missing.length > 0) {
    console.warn(
      `[sheet] CSV is missing required columns: ${missing.join(", ")}. Expected: ${REQUIRED_COLUMNS.join(", ")}.`,
    );
    return { products: [], rows: dataRows.length, skipped: dataRows.length };
  }

  const cell = (row: string[], name: string) => {
    const index = column(name);
    if (index === -1) return undefined;
    const value = row[index];
    return value === undefined ? undefined : value.trim();
  };

  const drafts = new Map<string, Draft>();
  let skipped = 0;

  for (const [rowIndex, row] of dataRows.entries()) {
    const slug = (cell(row, "slug") ?? "")
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "-");
    const price = toNumber(cell(row, "price"));
    const ram = toNumber(cell(row, "ram"));
    const storage = toNumber(cell(row, "storage"));

    if (!slug || !price || !ram || !storage) {
      skipped += 1;
      console.warn(`[sheet] skipping row ${rowIndex + 2}: needs slug, price, ram and storage.`);
      continue;
    }

    let draft = drafts.get(slug);
    if (!draft) {
      draft = {
        slug,
        brand: cell(row, "brand") ?? "",
        name: cell(row, "name") ?? "",
        tagline: cell(row, "tagline") ?? "",
        stock: toStock(cell(row, "stock")),
        colors: new Map(),
        variants: new Map(),
      };
      drafts.set(slug, draft);
    }

    const hex = toHex(cell(row, "hex"), "#8A8A8B");
    const image = toImage(cell(row, "image"));
    const colorAvailable = toBoolean(
      cell(row, "colour_available") ?? cell(row, "color_available") ?? "TRUE",
    );
    const existingColor = draft.colors.get(hex);
    if (existingColor) {
      existingColor.available = existingColor.available || colorAvailable;
      existingColor.image = existingColor.image ?? image;
    } else {
      draft.colors.set(hex, {
        name: cell(row, "colour") ?? cell(row, "color") ?? "Standard",
        hex,
        family: cell(row, "family") ?? "Other",
        available: colorAvailable,
        ...(image ? { image } : {}),
      });
    }

    const variantKey = `${ram}-${storage}`;
    const variantAvailable = toBoolean(cell(row, "available") ?? "TRUE");
    const mrp = toNumber(cell(row, "mrp"));
    const existingVariant = draft.variants.get(variantKey);
    if (existingVariant) {
      existingVariant.available = existingVariant.available || variantAvailable;
    } else {
      draft.variants.set(variantKey, {
        ram,
        storage,
        price,
        mrp: mrp && mrp > price ? mrp : undefined,
        available: variantAvailable,
      });
    }
  }

  const products: SheetProduct[] = [];
  for (const draft of drafts.values()) {
    const parsed = productSchema.safeParse({
      slug: draft.slug,
      brand: draft.brand,
      name: draft.name,
      tagline: draft.tagline,
      stock: draft.stock,
      colors: [...draft.colors.values()],
      variants: [...draft.variants.values()].sort((a, b) => a.price - b.price),
    });

    if (!parsed.success) {
      skipped += 1;
      const first = parsed.error.issues[0];
      console.warn(
        `[sheet] skipping "${draft.slug}": ${first?.path.join(".") || "row"} — ${first?.message ?? "invalid"}`,
      );
      continue;
    }

    products.push(parsed.data);
  }

  return { products, rows: dataRows.length, skipped };
}

/* ---------------------------------------------------------------- */
/*  Source                                                           */
/* ---------------------------------------------------------------- */

function gvizUrl(id: string, tab: string, gid?: string): string {
  const params = new URLSearchParams({ tqx: "out:csv" });
  if (gid) params.set("gid", gid);
  else params.set("sheet", tab);
  return `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?${params.toString()}`;
}

/**
 * Turns whatever the sheet's address bar gave you into a CSV endpoint.
 * An edit link, a share link, a bare id or an existing CSV link all work.
 */
export function resolveSheetUrl(input: string | undefined, tab = DEFAULT_TAB): string {
  const raw = input?.trim();
  if (!raw) return "";

  // Already an endpoint — leave it exactly as pasted.
  if (raw.includes("/gviz/tq") || /[?&]output=csv\b/i.test(raw) || /\/pub\?/.test(raw)) {
    return raw;
  }

  const idMatch = raw.match(/\/spreadsheets\/d\/(?:e\/)?([a-zA-Z0-9-_]+)/);
  const id = idMatch?.[1] ?? (/^[a-zA-Z0-9-_]{20,}$/.test(raw) ? raw : "");
  if (!id) return raw; // unknown shape: let the fetch fail and say so in the note

  let gid = "";
  let sheet = tab;
  try {
    const parsed = new URL(
      raw.startsWith("http") ? raw : `https://docs.google.com/spreadsheets/d/${id}`,
    );
    gid = parsed.searchParams.get("gid") ?? "";
    sheet = parsed.searchParams.get("sheet") || tab;
  } catch {
    /* keep the defaults */
  }

  return gvizUrl(id, sheet, gid);
}

export function describeSource(url: string): string {
  try {
    const parsed = new URL(url);
    const idMatch = parsed.pathname.match(/\/spreadsheets\/d\/(?:e\/)?([a-zA-Z0-9-_]+)/);
    const tab = parsed.searchParams.get("sheet");
    if (idMatch) {
      const id = idMatch[1] ?? "";
      return `Google Sheet · ${id.slice(0, 10)}…${tab ? ` · ${tab}` : ""}`;
    }
    return parsed.hostname;
  } catch {
    return "pasted CSV link";
  }
}

const NOTES: Record<SheetSource, string> = {
  sheet:
    "Read live in your browser from the Google Sheet — edit a price, a colour or a photo, then refresh this page. Nothing to rebuild, nothing to deploy.",
  demo:
    "Demo rows from content/sheet-demo.csv, so the section can be reviewed before the real sheet exists. Set SHEET_CSV_URL to your published sheet and these rows are replaced by your stock.",
  "demo-fallback":
    "The configured sheet could not be read, so the demo rows are showing. Check that the tab is published to the web as CSV, that the link is right, and that the column names match.",
};

export function feedFromCsv(csv: string, source: SheetSource, label: string): SheetFeed {
  const { products, rows, skipped } = buildProducts(csv);
  return {
    products,
    meta: {
      source,
      label,
      note: NOTES[source],
      rows,
      skipped,
      updatedAt: new Date().toISOString(),
    },
  };
}
