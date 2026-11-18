"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { colorFamilies, festivalThemes, siteDataSchema } from "@/lib/schema";
import type { FestivalDeal, Product, SiteData } from "@/lib/schema";
import { ImageField } from "@/components/admin/ImageField";
import { signOut } from "@/app/admin/actions";
import { adminAuthEnabled } from "@/lib/admin-config";

const DRAFT_KEY = "mh-admin-draft-v1";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function moveItem<T>(list: T[], from: number, to: number) {
  if (to < 0 || to >= list.length) return;
  const [item] = list.splice(from, 1);
  list.splice(to, 0, item);
}

function uniqueSlug(taken: string[], base: string): string {
  const cleaned =
    base
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/^-+|-+$/g, "") || "item";
  let slug = cleaned;
  let counter = 2;
  while (taken.includes(slug)) {
    slug = `${cleaned}-${counter}`;
    counter += 1;
  }
  return slug;
}

function normalizeHex(value: string): string {
  const raw = value.trim().replace(/^#/, "").slice(0, 6);
  return raw ? `#${raw.toUpperCase()}` : "";
}

function rupees(value: number): string {
  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

function blankProduct(updatedAt: string, index: number): Product {
  return {
    slug: `new-phone-${index}`,
    brand: "Brand",
    name: "New phone",
    tagline: "One line about why this phone is on the shelf.",
    featured: false,
    fiveG: true,
    stock: "in_stock",
    colors: [{ name: "Black", hex: "#25262A", family: "Black", available: true }],
    variants: [{ ram: 8, storage: 128, price: 19999, available: true }],
    specs: {
      display: '6.7" AMOLED, 120Hz',
      camera: "50MP + 8MP",
      battery: "5000mAh",
      chipset: "Chipset",
    },
    updatedAt,
  };
}

function blankDeal(index: number): FestivalDeal {
  return {
    slug: `offer-${index}`,
    headline: "New festival offer",
    subhead: "One line about the offer.",
    badge: "Festival offer",
    image: "",
    width: 640,
    height: 640,
    offerPrice: 19999,
    details: ["First detail"],
  };
}

/* ------------------------------------------------------------------ */
/*  Fields                                                             */
/* ------------------------------------------------------------------ */

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="admin-field">
      <span className="admin-field__label">{label}</span>
      {children}
      {hint ? <span className="admin-field__hint">{hint}</span> : null}
    </label>
  );
}

function TextField({
  label,
  value,
  onChange,
  hint,
  placeholder,
  mono,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  placeholder?: string;
  mono?: boolean;
}) {
  return (
    <Field label={label} hint={hint}>
      <input
        className={`admin-input${mono ? " admin-input--mono" : ""}`}
        type="text"
        value={value}
        placeholder={placeholder}
        spellCheck={false}
        onChange={(event) => onChange(event.target.value)}
      />
    </Field>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  hint,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  rows?: number;
}) {
  return (
    <Field label={label} hint={hint}>
      <textarea
        className="admin-input admin-input--area"
        rows={rows}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </Field>
  );
}

function NumberField({
  label,
  value,
  onChange,
  hint,
  min = 0,
}: {
  label: string;
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  hint?: string;
  min?: number;
}) {
  return (
    <Field label={label} hint={hint}>
      <input
        className="admin-input"
        type="number"
        min={min}
        value={value ?? ""}
        onChange={(event) => {
          const raw = event.target.value;
          if (raw === "") {
            onChange(undefined);
            return;
          }
          const parsed = Number(raw);
          onChange(Number.isFinite(parsed) ? parsed : undefined);
        }}
      />
    </Field>
  );
}

function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
  hint,
}: {
  label: string;
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (value: T) => void;
  hint?: string;
}) {
  return (
    <Field label={label} hint={hint}>
      <select
        className="admin-input"
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

function CheckField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="admin-check">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span>{label}</span>
    </label>
  );
}

/** One row of the reorderable phone / offer lists. */
function ListRow({
  active,
  title,
  subtitle,
  canUp,
  canDown,
  onPick,
  onUp,
  onDown,
  onDuplicate,
  onDelete,
}: {
  active: boolean;
  title: string;
  subtitle: string;
  canUp: boolean;
  canDown: boolean;
  onPick: () => void;
  onUp: () => void;
  onDown: () => void;
  onDuplicate?: () => void;
  onDelete: () => void;
}) {
  return (
    <div className={`admin-list__row${active ? " is-active" : ""}`}>
      <button type="button" className="admin-list__pick" onClick={onPick}>
        <strong>{title}</strong>
        <span>{subtitle}</span>
      </button>
      <div className="admin-list__tools">
        <button type="button" className="admin-tool" aria-label="Move up" disabled={!canUp} onClick={onUp}>
          ↑
        </button>
        <button type="button" className="admin-tool" aria-label="Move down" disabled={!canDown} onClick={onDown}>
          ↓
        </button>
        {onDuplicate && (
          <button type="button" className="admin-tool" aria-label="Duplicate" onClick={onDuplicate}>
            ⧉
          </button>
        )}
        <button
          type="button"
          className="admin-tool admin-tool--danger"
          aria-label="Delete"
          onClick={onDelete}
        >
          ×
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Panel                                                              */
/* ------------------------------------------------------------------ */

type Tab = "counter" | "festival" | "export";
type Notice = { tone: "info" | "warn" | "error"; text: string } | null;

const stockOptions = [
  { value: "in_stock", label: "On the shelf" },
  { value: "low_stock", label: "Last few pieces" },
  { value: "on_order", label: "On order" },
] as const;

const themeOptions = festivalThemes.map((theme) => ({
  value: theme,
  label: theme.charAt(0).toUpperCase() + theme.slice(1),
}));

const familyOptions = colorFamilies.map((family) => ({ value: family, label: family }));

export function AdminApp({ initial }: { initial: SiteData }) {
  const [draft, setDraft] = useState<SiteData>(initial);
  const [tab, setTab] = useState<Tab>("counter");
  const [notice, setNotice] = useState<Notice>(null);
  const [savedLabel, setSavedLabel] = useState("Live content loaded");
  const [hydrated, setHydrated] = useState(false);
  const [productIndexRaw, setProductIndex] = useState(0);
  const [dealIndexRaw, setDealIndex] = useState(0);
  const importRef = useRef<HTMLInputElement>(null);

  /* ---- restore a draft from this browser ----
     Read after the first paint so the server-rendered draft and the client's
     first render agree; the swap happens on the next tick. */
  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const raw = window.localStorage.getItem(DRAFT_KEY);
        if (raw) {
          const parsed = siteDataSchema.safeParse(JSON.parse(raw));
          if (parsed.success) {
            setDraft(parsed.data);
            setSavedLabel("Draft restored from this browser");
          } else {
            setNotice({
              tone: "warn",
              text: "A draft saved in this browser no longer matches the schema, so the live content is showing.",
            });
          }
        }
      } catch {
        /* storage blocked — the panel still works in memory */
      }
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  /* ---- autosave ---- */
  useEffect(() => {
    if (!hydrated) return;
    const timer = window.setTimeout(() => {
      try {
        window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
        setSavedLabel(`Saved in this browser · ${new Date().toLocaleTimeString("en-IN")}`);
      } catch {
        setNotice({
          tone: "warn",
          text: "Browser storage is full. Download the JSON so you do not lose these edits.",
        });
      }
    }, 400);
    return () => window.clearTimeout(timer);
  }, [draft, hydrated]);

  const mutate = useCallback((recipe: (next: SiteData) => void) => {
    setDraft((prev) => {
      const next = clone(prev);
      recipe(next);
      return next;
    });
  }, []);

  const updateProduct = (index: number, recipe: (product: Product) => void) => {
    mutate((next) => {
      const product = next.products[index];
      if (product) recipe(product);
    });
  };

  const updateDeal = (index: number, recipe: (deal: FestivalDeal) => void) => {
    mutate((next) => {
      const target = next.festival.deals[index];
      if (target) recipe(target);
    });
  };

  const validation = useMemo(() => siteDataSchema.safeParse(draft), [draft]);
  const errors = validation.success
    ? []
    : validation.error.issues.map(
        (issue) => `${issue.path.join(".") || "content"} — ${issue.message}`,
      );

  /* Deletes and imports can leave the selection past the end of the list. */
  const productIndex = Math.min(productIndexRaw, Math.max(0, draft.products.length - 1));
  const dealIndex = Math.min(dealIndexRaw, Math.max(0, draft.festival.deals.length - 1));

  /* ---- export ---- */
  const downloadJson = () => {
    if (!validation.success) {
      setNotice({ tone: "error", text: "Fix the validation errors before downloading." });
      return;
    }
    const blob = new Blob([`${JSON.stringify(validation.data, null, 2)}\n`], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "mobile-house.json";
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1500);
    setNotice({
      tone: "info",
      text: "Downloaded mobile-house.json. Replace content/mobile-house.json with it, then redeploy.",
    });
  };

  const copyJson = async () => {
    if (!validation.success) {
      setNotice({ tone: "error", text: "Fix the validation errors before copying." });
      return;
    }
    try {
      await navigator.clipboard.writeText(JSON.stringify(validation.data, null, 2));
      setNotice({ tone: "info", text: "JSON copied to the clipboard." });
    } catch {
      setNotice({ tone: "warn", text: "Clipboard access was refused — use Download instead." });
    }
  };

  const handleImport = async (file: File | undefined) => {
    if (!file) return;
    try {
      const parsed = siteDataSchema.safeParse(JSON.parse(await file.text()));
      if (!parsed.success) {
        setNotice({
          tone: "error",
          text: `That file does not validate: ${parsed.error.issues[0]?.message ?? "unknown problem"}`,
        });
        return;
      }
      setDraft(parsed.data);
      setProductIndex(0);
      setDealIndex(0);
      setNotice({ tone: "info", text: `Imported ${file.name}.` });
    } catch {
      setNotice({ tone: "error", text: "That file is not valid JSON." });
    } finally {
      if (importRef.current) importRef.current.value = "";
    }
  };

  const resetDraft = () => {
    if (!window.confirm("Discard this draft and start again from the live content?")) return;
    try {
      window.localStorage.removeItem(DRAFT_KEY);
    } catch {
      /* ignore */
    }
    setDraft(initial);
    setProductIndex(0);
    setDealIndex(0);
    setSavedLabel("Live content loaded");
    setNotice({ tone: "info", text: "Back to the live content." });
  };

  const product = draft.products[productIndex];
  const deal = draft.festival.deals[dealIndex];

  /* ------------------------------------------------------------------ */
  /*  Counter tab                                                        */
  /* ------------------------------------------------------------------ */

  const counterTab = (
    <div className="admin-grid">
      <section className="admin-card">
        <div className="admin-card__head">
          <h2 className="admin-card__title">Section copy</h2>
          <p className="admin-card__hint">The heading above the phone grid on the homepage.</p>
        </div>

        <div className="admin-fields">
          <TextField
            label="Eyebrow"
            value={draft.counter.eyebrow}
            onChange={(value) => mutate((next) => { next.counter.eyebrow = value; })}
            hint="Shown small above the title, e.g. 01 / The Counter"
          />
          <TextField
            label="Title line 1"
            value={draft.counter.titleLine1}
            onChange={(value) => mutate((next) => { next.counter.titleLine1 = value; })}
          />
          <TextField
            label="Title line 2"
            value={draft.counter.titleLine2}
            onChange={(value) => mutate((next) => { next.counter.titleLine2 = value; })}
          />
          <TextField
            label="Updated date"
            value={draft.store.updatedAt}
            onChange={(value) => mutate((next) => { next.store.updatedAt = value; })}
            hint="YYYY-MM-DD. Drives the “Updated” label and the sitemap date."
            mono
          />
        </div>

        <div className="admin-fields admin-fields--single">
          <TextAreaField
            label="Intro paragraph"
            value={draft.counter.intro}
            onChange={(value) => mutate((next) => { next.counter.intro = value; })}
            rows={4}
          />
        </div>
      </section>

      <section className="admin-card">
        <div className="admin-card__head">
          <h2 className="admin-card__title">Offers board</h2>
          <p className="admin-card__hint">The “This week at the counter” strip above the filters.</p>
        </div>

        {draft.offers.length === 0 && <p className="admin-empty">No offers yet — the strip stays hidden.</p>}

        {draft.offers.map((offer, offerIndex) => (
          <div className="admin-row" key={offerIndex}>
            <SelectField
              label="Phone"
              value={offer.productSlug}
              options={draft.products.map((entry) => ({
                value: entry.slug,
                label: `${entry.brand} ${entry.name}`,
              }))}
              onChange={(value) =>
                mutate((next) => {
                  next.offers[offerIndex].productSlug = value;
                })
              }
            />
            <TextField
              label="Label"
              value={offer.label}
              onChange={(value) =>
                mutate((next) => {
                  next.offers[offerIndex].label = value;
                })
              }
            />
            <NumberField
              label="Price"
              value={offer.price}
              onChange={(value) =>
                mutate((next) => {
                  if (value) next.offers[offerIndex].price = value;
                })
              }
            />
            <NumberField
              label="MRP"
              value={offer.mrp}
              onChange={(value) =>
                mutate((next) => {
                  next.offers[offerIndex].mrp = value && value > 0 ? value : undefined;
                })
              }
            />
            <button
              type="button"
              className="admin-btn admin-btn--small admin-btn--danger admin-row__end"
              onClick={() =>
                mutate((next) => {
                  next.offers.splice(offerIndex, 1);
                })
              }
            >
              Remove
            </button>
          </div>
        ))}

        <button
          type="button"
          className="admin-btn admin-btn--small"
          onClick={() =>
            mutate((next) => {
              const first = next.products[0];
              next.offers.push({
                productSlug: first?.slug ?? "",
                label: "Counter price",
                price: first?.variants[0]?.price ?? 9999,
              });
            })
          }
        >
          + Add offer
        </button>
      </section>

      <section className="admin-card admin-card--wide">
        <div className="admin-card__head">
          <h2 className="admin-card__title">Phones on the shelf</h2>
          <p className="admin-card__hint">
            {draft.products.length} listed · every card, filter and WhatsApp message is built from these.
          </p>
        </div>

        <div className="admin-products">
          <div className="admin-products__list">
            <div className="admin-list">
              {draft.products.map((entry, index) => (
                <ListRow
                  key={`${entry.slug}-${index}`}
                  active={index === productIndex}
                  title={`${entry.brand} ${entry.name}`}
                  subtitle={`${rupees(
                    Math.min(...entry.variants.map((variant) => variant.price)),
                  )} · ${entry.colors.length} colour${entry.colors.length === 1 ? "" : "s"}`}
                  canUp={index > 0}
                  canDown={index < draft.products.length - 1}
                  onPick={() => setProductIndex(index)}
                  onUp={() => {
                    mutate((next) => moveItem(next.products, index, index - 1));
                    setProductIndex(index - 1);
                  }}
                  onDown={() => {
                    mutate((next) => moveItem(next.products, index, index + 1));
                    setProductIndex(index + 1);
                  }}
                  onDuplicate={() => {
                    mutate((next) => {
                      const copy = clone(next.products[index]);
                      copy.slug = uniqueSlug(
                        next.products.map((item) => item.slug),
                        `${copy.slug}-copy`,
                      );
                      copy.name = `${copy.name} (copy)`;
                      next.products.splice(index + 1, 0, copy);
                    });
                    setProductIndex(index + 1);
                  }}
                  onDelete={() => {
                    if (!window.confirm(`Delete ${entry.brand} ${entry.name}?`)) return;
                    mutate((next) => {
                      const [removed] = next.products.splice(index, 1);
                      next.offers = next.offers.filter((offer) => offer.productSlug !== removed?.slug);
                    });
                  }}
                />
              ))}
            </div>

            <button
              type="button"
              className="admin-btn admin-btn--small"
              onClick={() => {
                mutate((next) => {
                  next.products.push(blankProduct(next.store.updatedAt, next.products.length + 1));
                });
                setProductIndex(draft.products.length);
              }}
            >
              + Add phone
            </button>
          </div>

          <div className="admin-products__editor">
            {!product && <p className="admin-empty">Add a phone to start editing.</p>}

            {product && (
              <>
                <div className="admin-fields">
                  <TextField
                    label="Brand"
                    value={product.brand}
                    onChange={(value) => updateProduct(productIndex, (entry) => { entry.brand = value; })}
                  />
                  <TextField
                    label="Name"
                    value={product.name}
                    onChange={(value) => updateProduct(productIndex, (entry) => { entry.name = value; })}
                  />
                  <TextField
                    label="Slug"
                    value={product.slug}
                    onChange={(value) =>
                      updateProduct(productIndex, (entry) => { entry.slug = value.toLowerCase(); })
                    }
                    hint="lowercase-with-dashes"
                    mono
                  />
                  <SelectField
                    label="Stock"
                    value={product.stock}
                    options={stockOptions}
                    onChange={(value) => updateProduct(productIndex, (entry) => { entry.stock = value; })}
                  />
                </div>

                <div className="admin-fields admin-fields--single">
                  <TextAreaField
                    label="Tagline"
                    value={product.tagline}
                    rows={2}
                    onChange={(value) => updateProduct(productIndex, (entry) => { entry.tagline = value; })}
                  />
                </div>

                <div className="admin-checks">
                  <CheckField
                    label="Featured"
                    checked={product.featured}
                    onChange={(value) => updateProduct(productIndex, (entry) => { entry.featured = value; })}
                  />
                  <CheckField
                    label="5G"
                    checked={product.fiveG}
                    onChange={(value) => updateProduct(productIndex, (entry) => { entry.fiveG = value; })}
                  />
                </div>

                <div className="admin-subcard">
                  <div className="admin-subcard__head">
                    <h3 className="admin-subcard__title">Specs</h3>
                  </div>
                  <div className="admin-fields">
                    <TextField
                      label="Display"
                      value={product.specs.display}
                      onChange={(value) => updateProduct(productIndex, (entry) => { entry.specs.display = value; })}
                    />
                    <TextField
                      label="Camera"
                      value={product.specs.camera}
                      onChange={(value) => updateProduct(productIndex, (entry) => { entry.specs.camera = value; })}
                    />
                    <TextField
                      label="Battery"
                      value={product.specs.battery}
                      onChange={(value) => updateProduct(productIndex, (entry) => { entry.specs.battery = value; })}
                    />
                    <TextField
                      label="Chipset"
                      value={product.specs.chipset}
                      onChange={(value) => updateProduct(productIndex, (entry) => { entry.specs.chipset = value; })}
                    />
                  </div>
                </div>

                <div className="admin-subcard">
                  <div className="admin-subcard__head">
                    <h3 className="admin-subcard__title">Colours</h3>
                    <button
                      type="button"
                      className="admin-btn admin-btn--small"
                      onClick={() =>
                        updateProduct(productIndex, (entry) => {
                          entry.colors.push({
                            name: "New colour",
                            hex: "#8A8A8B",
                            family: "Other",
                            available: true,
                          });
                        })
                      }
                    >
                      + Add colour
                    </button>
                  </div>

                  {product.colors.map((color, colorIndex) => (
                    <div className="admin-subcard__body" key={colorIndex}>
                      <div className="admin-fields">
                        <TextField
                          label="Colour name"
                          value={color.name}
                          onChange={(value) =>
                            updateProduct(productIndex, (entry) => {
                              entry.colors[colorIndex].name = value;
                            })
                          }
                        />
                        <div className="admin-color-row">
                          <TextField
                            label="Hex"
                            value={color.hex}
                            mono
                            onChange={(value) =>
                              updateProduct(productIndex, (entry) => {
                                entry.colors[colorIndex].hex = normalizeHex(value);
                              })
                            }
                          />
                          <input
                            className="admin-color"
                            type="color"
                            aria-label="Pick colour"
                            value={/^#[0-9a-fA-F]{6}$/.test(color.hex) ? color.hex : "#25262A"}
                            onChange={(event) =>
                              updateProduct(productIndex, (entry) => {
                                entry.colors[colorIndex].hex = event.target.value.toUpperCase();
                              })
                            }
                          />
                        </div>
                        <SelectField
                          label="Family"
                          value={color.family}
                          options={familyOptions}
                          onChange={(value) =>
                            updateProduct(productIndex, (entry) => {
                              entry.colors[colorIndex].family = value;
                            })
                          }
                        />
                        <div className="admin-checks admin-checks--inline">
                          <CheckField
                            label="On the shelf"
                            checked={color.available}
                            onChange={(value) =>
                              updateProduct(productIndex, (entry) => {
                                entry.colors[colorIndex].available = value;
                              })
                            }
                          />
                        </div>
                      </div>

                      <ImageField
                        label="Colour photo"
                        value={color.image ?? ""}
                        nameHint={`${product.slug}-${color.name}`}
                        onChange={(value) =>
                          updateProduct(productIndex, (entry) => {
                            entry.colors[colorIndex].image = value || undefined;
                          })
                        }
                      />

                      <button
                        type="button"
                        className="admin-btn admin-btn--small admin-btn--danger"
                        disabled={product.colors.length === 1}
                        onClick={() =>
                          updateProduct(productIndex, (entry) => {
                            entry.colors.splice(colorIndex, 1);
                          })
                        }
                      >
                        Remove colour
                      </button>
                    </div>
                  ))}
                </div>

                <div className="admin-subcard">
                  <div className="admin-subcard__head">
                    <h3 className="admin-subcard__title">Variants</h3>
                    <button
                      type="button"
                      className="admin-btn admin-btn--small"
                      onClick={() =>
                        updateProduct(productIndex, (entry) => {
                          entry.variants.push({ ram: 8, storage: 128, price: 19999, available: true });
                        })
                      }
                    >
                      + Add variant
                    </button>
                  </div>

                  {product.variants.map((variant, variantIndex) => (
                    <div className="admin-row" key={variantIndex}>
                      <NumberField
                        label="RAM (GB)"
                        value={variant.ram}
                        onChange={(value) =>
                          updateProduct(productIndex, (entry) => {
                            if (value) entry.variants[variantIndex].ram = value;
                          })
                        }
                      />
                      <NumberField
                        label="Storage (GB)"
                        value={variant.storage}
                        onChange={(value) =>
                          updateProduct(productIndex, (entry) => {
                            if (value) entry.variants[variantIndex].storage = value;
                          })
                        }
                      />
                      <NumberField
                        label="Price"
                        value={variant.price}
                        onChange={(value) =>
                          updateProduct(productIndex, (entry) => {
                            if (value) entry.variants[variantIndex].price = value;
                          })
                        }
                      />
                      <NumberField
                        label="MRP"
                        value={variant.mrp}
                        onChange={(value) =>
                          updateProduct(productIndex, (entry) => {
                            entry.variants[variantIndex].mrp = value && value > 0 ? value : undefined;
                          })
                        }
                      />
                      <div className="admin-checks admin-checks--inline">
                        <CheckField
                          label="Available"
                          checked={variant.available}
                          onChange={(value) =>
                            updateProduct(productIndex, (entry) => {
                              entry.variants[variantIndex].available = value;
                            })
                          }
                        />
                      </div>
                      <button
                        type="button"
                        className="admin-btn admin-btn--small admin-btn--danger admin-row__end"
                        disabled={product.variants.length === 1}
                        onClick={() =>
                          updateProduct(productIndex, (entry) => {
                            entry.variants.splice(variantIndex, 1);
                          })
                        }
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );

  /* ------------------------------------------------------------------ */
  /*  Festival tab                                                       */
  /* ------------------------------------------------------------------ */

  const festivalTab = (
    <div className="admin-grid">
      <section className="admin-card">
        <div className="admin-card__head">
          <h2 className="admin-card__title">Festival band</h2>
          <p className="admin-card__hint">
            Powers the homepage band and the standalone /festival page.
          </p>
        </div>

        <div className="admin-checks">
          <CheckField
            label="Festival switched on"
            checked={draft.festival.enabled}
            onChange={(value) => mutate((next) => { next.festival.enabled = value; })}
          />
        </div>

        <div className="admin-fields">
          <SelectField
            label="Theme"
            value={draft.festival.theme}
            options={themeOptions}
            onChange={(value) => mutate((next) => { next.festival.theme = value; })}
            hint="diwali adds the fireworks; the others use a plain band."
          />
          <TextField
            label="Name"
            value={draft.festival.name}
            onChange={(value) => mutate((next) => { next.festival.name = value; })}
          />
          <TextField
            label="Season"
            value={draft.festival.season}
            onChange={(value) => mutate((next) => { next.festival.season = value; })}
          />
          <TextField
            label="Offer window"
            value={draft.festival.window}
            onChange={(value) => mutate((next) => { next.festival.window = value; })}
          />
        </div>

        <div className="admin-fields admin-fields--single">
          <TextField
            label="Headline"
            value={draft.festival.headline}
            onChange={(value) => mutate((next) => { next.festival.headline = value; })}
            hint="Type {name} where the festival name should appear."
          />
          <TextAreaField
            label="Intro"
            value={draft.festival.intro}
            rows={4}
            onChange={(value) => mutate((next) => { next.festival.intro = value; })}
          />
          <TextAreaField
            label="Window note"
            value={draft.festival.windowNote}
            rows={2}
            onChange={(value) => mutate((next) => { next.festival.windowNote = value; })}
          />
          <TextAreaField
            label="Fine print"
            value={draft.festival.fineprint}
            rows={3}
            onChange={(value) => mutate((next) => { next.festival.fineprint = value; })}
          />
        </div>
      </section>

      <section className="admin-card admin-card--wide">
        <div className="admin-card__head">
          <h2 className="admin-card__title">Offers</h2>
          <p className="admin-card__hint">
            Each offer is a poster plus its own WhatsApp call to action.
          </p>
        </div>

        <div className="admin-products">
          <div className="admin-products__list">
            <div className="admin-list">
              {draft.festival.deals.map((entry, index) => (
                <ListRow
                  key={`${entry.slug}-${index}`}
                  active={index === dealIndex}
                  title={entry.headline}
                  subtitle={entry.offerPrice ? rupees(entry.offerPrice) : (entry.discountLabel ?? "")}
                  canUp={index > 0}
                  canDown={index < draft.festival.deals.length - 1}
                  onPick={() => setDealIndex(index)}
                  onUp={() => {
                    mutate((next) => moveItem(next.festival.deals, index, index - 1));
                    setDealIndex(index - 1);
                  }}
                  onDown={() => {
                    mutate((next) => moveItem(next.festival.deals, index, index + 1));
                    setDealIndex(index + 1);
                  }}
                  onDelete={() => {
                    if (!window.confirm(`Delete the ${entry.headline} offer?`)) return;
                    mutate((next) => {
                      next.festival.deals.splice(index, 1);
                    });
                  }}
                />
              ))}
            </div>

            {draft.festival.deals.length === 0 && (
              <p className="admin-empty">No offers yet — /festival returns a 404 until one exists.</p>
            )}

            <button
              type="button"
              className="admin-btn admin-btn--small"
              onClick={() => {
                mutate((next) => {
                  next.festival.deals.push(blankDeal(next.festival.deals.length + 1));
                });
                setDealIndex(draft.festival.deals.length);
              }}
            >
              + Add offer
            </button>
          </div>

          <div className="admin-products__editor">
            {!deal && <p className="admin-empty">Add an offer to start editing.</p>}

            {deal && (
              <>
                <div className="admin-fields">
                  <TextField
                    label="Slug"
                    value={deal.slug}
                    mono
                    onChange={(value) =>
                      updateDeal(dealIndex, (entry) => {
                        entry.slug = value.toLowerCase();
                      })
                    }
                  />
                  <TextField
                    label="Headline"
                    value={deal.headline}
                    onChange={(value) =>
                      updateDeal(dealIndex, (entry) => {
                        entry.headline = value;
                      })
                    }
                  />
                  <TextField
                    label="Badge"
                    value={deal.badge ?? ""}
                    onChange={(value) =>
                      updateDeal(dealIndex, (entry) => {
                        entry.badge = value || undefined;
                      })
                    }
                  />
                  <TextField
                    label="Subhead"
                    value={deal.subhead}
                    onChange={(value) =>
                      updateDeal(dealIndex, (entry) => {
                        entry.subhead = value;
                      })
                    }
                  />
                </div>

                <ImageField
                  label="Poster"
                  value={deal.image}
                  nameHint={deal.slug || "festival-poster"}
                  onChange={(value) =>
                    updateDeal(dealIndex, (entry) => {
                      entry.image = value;
                    })
                  }
                  onDimensions={(width, height) =>
                    updateDeal(dealIndex, (entry) => {
                      entry.width = width;
                      entry.height = height;
                    })
                  }
                />

                <div className="admin-fields">
                  <NumberField
                    label="Poster width"
                    value={deal.width}
                    hint="Auto-filled from the image"
                    onChange={(value) =>
                      updateDeal(dealIndex, (entry) => {
                        entry.width = value;
                      })
                    }
                  />
                  <NumberField
                    label="Poster height"
                    value={deal.height}
                    hint="Auto-filled from the image"
                    onChange={(value) =>
                      updateDeal(dealIndex, (entry) => {
                        entry.height = value;
                      })
                    }
                  />
                  <NumberField
                    label="Regular price"
                    value={deal.regularPrice}
                    onChange={(value) =>
                      updateDeal(dealIndex, (entry) => {
                        entry.regularPrice = value;
                      })
                    }
                  />
                  <NumberField
                    label="Offer price"
                    value={deal.offerPrice}
                    onChange={(value) =>
                      updateDeal(dealIndex, (entry) => {
                        entry.offerPrice = value;
                      })
                    }
                    hint="Leave empty if the offer is a discount label instead."
                  />
                  <TextField
                    label="Discount label"
                    value={deal.discountLabel ?? ""}
                    onChange={(value) =>
                      updateDeal(dealIndex, (entry) => {
                        entry.discountLabel = value || undefined;
                      })
                    }
                    hint="e.g. Up to ₹5,000 off"
                  />
                  <TextField
                    label="Note"
                    value={deal.note ?? ""}
                    onChange={(value) =>
                      updateDeal(dealIndex, (entry) => {
                        entry.note = value || undefined;
                      })
                    }
                  />
                </div>

                <div className="admin-fields admin-fields--single">
                  <TextAreaField
                    label="Details"
                    value={deal.details.join("\n")}
                    rows={4}
                    hint="One bullet per line."
                    onChange={(value) =>
                      updateDeal(dealIndex, (entry) => {
                        entry.details = value.split("\n");
                      })
                    }
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="admin-card admin-card--wide">
        <div className="admin-card__head">
          <h2 className="admin-card__title">Perks</h2>
          <p className="admin-card__hint">The four small boxes under the offers.</p>
        </div>

        {draft.festival.perks.map((perk, perkIndex) => (
          <div className="admin-row" key={perkIndex}>
            <TextField
              label="Label"
              value={perk.label}
              onChange={(value) =>
                mutate((next) => {
                  next.festival.perks[perkIndex].label = value;
                })
              }
            />
            <TextField
              label="Detail"
              value={perk.detail}
              onChange={(value) =>
                mutate((next) => {
                  next.festival.perks[perkIndex].detail = value;
                })
              }
            />
            <button
              type="button"
              className="admin-btn admin-btn--small admin-btn--danger admin-row__end"
              onClick={() =>
                mutate((next) => {
                  next.festival.perks.splice(perkIndex, 1);
                })
              }
            >
              Remove
            </button>
          </div>
        ))}

        <button
          type="button"
          className="admin-btn admin-btn--small"
          onClick={() =>
            mutate((next) => {
              next.festival.perks.push({ label: "New perk", detail: "What the customer gets." });
            })
          }
        >
          + Add perk
        </button>
      </section>
    </div>
  );

  /* ------------------------------------------------------------------ */
  /*  Export tab                                                         */
  /* ------------------------------------------------------------------ */

  const exportTab = (
    <div className="admin-grid">
      <section className="admin-card">
        <div className="admin-card__head">
          <h2 className="admin-card__title">Validation</h2>
          <p className="admin-card__hint">The same rules the site build enforces.</p>
        </div>

        {validation.success ? (
          <p className="admin-ok">
            All checks pass — {draft.products.length} phones, {draft.offers.length} counter offers,{" "}
            {draft.festival.deals.length} festival offers.
          </p>
        ) : (
          <ul className="admin-errors">
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        )}
      </section>

      <section className="admin-card">
        <div className="admin-card__head">
          <h2 className="admin-card__title">Export</h2>
          <p className="admin-card__hint">The draft lives in this browser only.</p>
        </div>

        <div className="admin-actions">
          <button type="button" className="admin-btn admin-btn--primary" onClick={downloadJson}>
            Download mobile-house.json
          </button>
          <button type="button" className="admin-btn" onClick={copyJson}>
            Copy JSON
          </button>
          <button
            type="button"
            className="admin-btn admin-btn--ghost"
            onClick={() => importRef.current?.click()}
          >
            Import JSON
          </button>
          <input
            ref={importRef}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={(event) => handleImport(event.target.files?.[0])}
          />
          <button type="button" className="admin-btn admin-btn--ghost" onClick={resetDraft}>
            Reset to live content
          </button>
        </div>
      </section>

      <section className="admin-card admin-card--wide">
        <div className="admin-card__head">
          <h2 className="admin-card__title">How to publish</h2>
          <p className="admin-card__hint">This panel is static — it never writes to the site.</p>
        </div>

        <ol className="admin-steps">
          <li>Download mobile-house.json.</li>
          <li>
            Replace <code>content/mobile-house.json</code> in the project with the download.
          </li>
          <li>
            Move any uploaded photos into <code>public/images/uploads/</code> — the JSON already
            points at those paths.
          </li>
          <li>
            Run <code>npm run catalog:check</code> if you want the same checks in the terminal.
          </li>
          <li>The running dev server picks the new JSON up on refresh.</li>
          <li>Redeploy to publish.</li>
        </ol>
      </section>
    </div>
  );

  return (
    <div className="admin">
      <div className="admin__inner">
        <header className="admin__bar">
          <div>
            <span className="admin__eyebrow">Mobile House · content admin</span>
            <h1 className="admin__title">Counter &amp; festival editor</h1>
          </div>
          <div className="admin__bar-meta">
            <span className="admin__status">{savedLabel}</span>
            {adminAuthEnabled && (
              <form action={signOut}>
                <button type="submit" className="admin-btn admin-btn--small admin-btn--ghost">
                  Sign out
                </button>
              </form>
            )}
          </div>
        </header>

        <p className="admin__banner">
          <strong>Static admin.</strong> Edits live in this browser. Download the JSON, replace{" "}
          <code>content/mobile-house.json</code>, redeploy to publish. Images can be a pasted URL or
          an uploaded file saved into <code>public/images/uploads/</code> — either way the database
          only ever holds the path.
        </p>

        <nav className="admin__tabs" aria-label="Admin sections">
          {(
            [
              ["counter", "01 / The Counter"],
              ["festival", "Festival"],
              ["export", "Export"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={`admin__tab${tab === value ? " is-active" : ""}`}
              aria-pressed={tab === value}
              onClick={() => setTab(value)}
            >
              {label}
            </button>
          ))}
        </nav>

        {notice && (
          <p className={`admin__notice admin__notice--${notice.tone}`}>
            {notice.text}
            <button
              type="button"
              className="admin__notice-close"
              aria-label="Dismiss"
              onClick={() => setNotice(null)}
            >
              ×
            </button>
          </p>
        )}

        {tab === "counter" && counterTab}
        {tab === "festival" && festivalTab}
        {tab === "export" && exportTab}
      </div>
    </div>
  );
}
