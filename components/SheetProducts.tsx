import { readFileSync } from "node:fs";
import path from "node:path";
import { store } from "@/lib/catalog";
import { resolveSheetUrl } from "@/lib/sheet";
import { SheetProductsClient } from "@/components/SheetProductsClient";

/**
 * Sheet preview block — proof that the catalogue can be driven by a Google
 * Sheet instead of a hand-edited JSON file.
 *
 * This server half resolves the sheet link once at build time and hands the demo
 * rows over; the visitor's browser does the actual reading, so editing the sheet
 * needs no rebuild and no deploy. It stays self contained: removing the one
 * `<SheetProducts />` line in app/page.tsx takes the whole section away without
 * touching any other section.
 */

const DEMO_CSV_PATH = path.join(process.cwd(), "content", "sheet-demo.csv");

function readDemoCsv(): string {
  try {
    return readFileSync(DEMO_CSV_PATH, "utf8");
  } catch (error) {
    console.warn(`[sheet] could not read ${DEMO_CSV_PATH}:`, error);
    return "";
  }
}

export function SheetProducts() {
  const csvUrl = resolveSheetUrl(
    process.env.SHEET_CSV_URL?.trim() || process.env.SHEET_ID?.trim(),
    process.env.SHEET_TAB?.trim() || "Products",
  );

  return (
    <SheetProductsClient
      csvUrl={csvUrl}
      demoCsv={readDemoCsv()}
      whatsappRaw={store.whatsappRaw}
    />
  );
}
