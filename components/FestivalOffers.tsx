"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Festival, FestivalDeal } from "@/lib/schema";
import { formatINR } from "@/lib/catalog";
import { whatsappUrl } from "@/lib/whatsapp";
import { ArrowUpRight, WhatsAppIcon } from "@/components/Icons";

/* ================================================================ */
/*  WhatsApp URLs                                                    */
/* ================================================================ */

function counterWhatsAppUrl(festival: Festival) {
  return whatsappUrl(
    `Hi Mobile House, I'd like to know what's left from the ${festival.name} offers. (Sent from the Mobile House website)`,
  );
}

function dealWhatsAppUrl(festival: Festival, deal: FestivalDeal) {
  return whatsappUrl(
    `Hi Mobile House, I saw ${deal.headline} in your ${festival.name} offers. Is it still available at that price? (Sent from the Mobile House website)`,
  );
}

/* ================================================================ */
/*  Types                                                            */
/* ================================================================ */

type Spark = {
  id: string;
  angle: number;
  distance: number;
  hue: number;
  size: number;
  delay: number;
};

type Burst = {
  id: string;
  x: number;
  y: number;
  sparks: Spark[];
};

type Rocket = {
  id: string;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  duration: number;
  hue: number;
  sparkCount: number;
};

const BURST_COLORS = [20, 45, 0, 340, 280, 55];
const ROCKET_COLORS = [20, 45, 0, 340, 55];

/* ================================================================ */
/*  Unique id helper                                                 */
/* ================================================================ */

function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/* ================================================================ */
/*  Factories                                                        */
/* ================================================================ */

function createBurst(xPx: number, yPx: number, count = 24, hue?: number): Burst {
  const id = uid();
  const sparks: Spark[] = Array.from({ length: count }, (_, i) => {
    const base = (360 / count) * i;
    const jitter = (Math.random() - 0.5) * 28;
    return {
      id: uid(),
      angle: base + jitter,
      distance: 60 + Math.random() * 90,
      hue: hue ?? BURST_COLORS[Math.floor(Math.random() * BURST_COLORS.length)],
      size: 2 + Math.random() * 3,
      delay: Math.random() * 0.08,
    };
  });
  return { id, x: xPx, y: yPx, sparks };
}

function createRocket(): Rocket {
  const fromLeft = Math.random() < 0.5;
  const fromX = fromLeft
    ? 8 + Math.random() * 18
    : 74 + Math.random() * 18;
  const toX = 30 + Math.random() * 40;
  const toY = 12 + Math.random() * 18;
  const duration = 1.1 + Math.random() * 0.35;
  const hue = ROCKET_COLORS[Math.floor(Math.random() * ROCKET_COLORS.length)];
  return {
    id: uid(),
    fromX,
    fromY: 100,
    toX,
    toY,
    duration,
    hue,
    sparkCount: 26 + Math.floor(Math.random() * 8),
  };
}

/* ================================================================ */
/*  Hooks                                                            */
/* ================================================================ */

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);
  return reduced;
}

function useRocketShow(
  enabled: boolean,
  visible: boolean,
  sectionRef: React.RefObject<HTMLElement | null>,
  onLand: (xPx: number, yPx: number, hue: number, count: number) => void,
) {
  const [rockets, setRockets] = useState<Rocket[]>([]);
  const timeouts = useRef<number[]>([]);
  const intervalRef = useRef<number | null>(null);
  const startedRef = useRef(false);

  const clearAll = useCallback(() => {
    timeouts.current.forEach((t) => window.clearTimeout(t));
    timeouts.current = [];
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    startedRef.current = false;
  }, []);

  useEffect(() => {
    if (!enabled || !visible) {
      clearAll();
      setRockets([]);
      return;
    }

    // Strict-Mode / re-render guard: one interval at a time.
    if (startedRef.current) return;
    startedRef.current = true;

    const launch = () => {
      const el = sectionRef.current;
      if (!el) return;
      const rocket = createRocket();

      setRockets((prev) =>
        prev.some((r) => r.id === rocket.id) ? prev : [...prev, rocket],
      );

      const flightMs = rocket.duration * 1000;

      const landTimer = window.setTimeout(() => {
        const rect = el.getBoundingClientRect();
        const xPx = (rocket.toX / 100) * rect.width;
        const yPx = (rocket.toY / 100) * rect.height;
        onLand(xPx, yPx, rocket.hue, rocket.sparkCount);
      }, flightMs);

      const cleanupTimer = window.setTimeout(() => {
        setRockets((prev) => prev.filter((r) => r.id !== rocket.id));
      }, flightMs + 200);

      timeouts.current.push(landTimer, cleanupTimer);
    };

    launch();
    intervalRef.current = window.setInterval(launch, 3000);

    return () => {
      clearAll();
    };
  }, [enabled, visible, sectionRef, onLand, clearAll]);

  return rockets;
}

/* ================================================================ */
/*  Layers                                                           */
/* ================================================================ */

function RocketLayer({ rockets }: { rockets: Rocket[] }) {
  return (
    <div className="rocket-layer" aria-hidden="true">
      {rockets.map((r) => (
        <span
          key={r.id}
          className="rocket"
          style={
            {
              "--from-x": `${r.fromX}%`,
              "--from-y": `${r.fromY}%`,
              "--to-x": `${r.toX}%`,
              "--to-y": `${r.toY}%`,
              "--dur": `${r.duration}s`,
              "--hue": r.hue,
            } as React.CSSProperties
          }
        >
          <span className="rocket__body" />
          <span className="rocket__trail" />
        </span>
      ))}
    </div>
  );
}

function BurstLayer({ bursts }: { bursts: Burst[] }) {
  return (
    <div className="firecracker-layer" aria-hidden="true">
      {bursts.map((burst) => (
        <div
          key={burst.id}
          className="firecracker"
          style={{ left: burst.x, top: burst.y }}
        >
          <span className="firecracker__flash" />
          {burst.sparks.map((spark) => {
            const rad = (spark.angle * Math.PI) / 180;
            const dx = Math.cos(rad) * spark.distance;
            const dy = Math.sin(rad) * spark.distance;
            return (
              <span
                key={spark.id}
                className="firecracker__spark"
                style={
                  {
                    "--dx": `${dx}px`,
                    "--dy": `${dy}px`,
                    "--hue": spark.hue,
                    "--size": `${spark.size}px`,
                    animationDelay: `${spark.delay}s`,
                  } as React.CSSProperties
                }
              />
            );
          })}
          <span
            className="firecracker__ring"
            style={{ "--hue": burst.sparks[0]?.hue ?? 40 } as React.CSSProperties}
          />
        </div>
      ))}
    </div>
  );
}

/* ================================================================ */
/*  Main component                                                   */
/* ================================================================ */

export function FestivalOffers({ festival }: { festival: Festival }) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const hasAutoFired = useRef(false);

  const isDiwali =
    festival.enabled &&
    festival.deals.length > 0 &&
    (festival.theme === "diwali" ||
      /diwali|deepavali/i.test(festival.name) ||
      /diwali/i.test(festival.season));

  const prefersReducedMotion = usePrefersReducedMotion();
  const enabled = isDiwali && !prefersReducedMotion;

  /* ---- bursts ---- */
  const [bursts, setBursts] = useState<Burst[]>([]);
  const burstTimeouts = useRef<number[]>([]);

  const fire = useCallback(
    (xPx: number, yPx: number, hue?: number, count = 24) => {
      if (!enabled) return;
      const burst = createBurst(xPx, yPx, count, hue);
      setBursts((prev) =>
        prev.some((b) => b.id === burst.id) ? prev : [...prev, burst],
      );

      const t = window.setTimeout(() => {
        setBursts((prev) => prev.filter((b) => b.id !== burst.id));
      }, 1400);
      burstTimeouts.current.push(t);
    },
    [enabled],
  );

  useEffect(() => {
    return () => {
      burstTimeouts.current.forEach((t) => window.clearTimeout(t));
      burstTimeouts.current = [];
    };
  }, []);

  /* ---- visibility ---- */
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || !enabled) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          setVisible(entry.isIntersecting);
        }
      },
      { threshold: 0.15 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [enabled]);

  /* ---- rocket land handler ---- */
  const handleRocketLand = useCallback(
    (xPx: number, yPx: number, hue: number, count: number) => {
      fire(xPx, yPx, hue, count);
    },
    [fire],
  );

  const rockets = useRocketShow(enabled, visible, sectionRef, handleRocketLand);

  /* ---- one-time hero burst ---- */
  useEffect(() => {
    if (!enabled || !visible || hasAutoFired.current) return;
    const el = sectionRef.current;
    if (!el) return;
    hasAutoFired.current = true;
    const rect = el.getBoundingClientRect();
    fire(rect.width * 0.5, rect.height * 0.28, 45, 32);
  }, [enabled, visible, fire]);

  /* ---- click to burst ---- */
  const handleSectionClick = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (!enabled) return;
      const el = sectionRef.current;
      if (!el) return;
      if ((e.target as HTMLElement).closest("a, button")) return;
      const rect = el.getBoundingClientRect();
      fire(e.clientX - rect.left, e.clientY - rect.top, undefined, 26);
    },
    [enabled, fire],
  );

  if (!festival.enabled || festival.deals.length === 0) return null;

  const [headlineStart, headlineEnd] = festival.headline.split("{name}");

  return (
    <section
      ref={sectionRef}
      className={`festival festival--${isDiwali ? "diwali" : festival.theme}`}
      id="festival"
      data-theme={festival.theme}
      aria-labelledby="festival-heading"
      onClick={handleSectionClick}
    >
      {enabled && <RocketLayer rockets={rockets} />}
      {enabled && <BurstLayer bursts={bursts} />}

      <div className="container">
        {/* Ornament row — only renders meaningful content in Diwali theme */}
        {/* <div
          className={`festival__ornament${isDiwali ? " festival__ornament--diwali" : ""}`}
          aria-hidden="true"
        >
          {isDiwali
            ? Array.from({ length: 7 }, (_, index) => (
                <span
                  key={index}
                  className="diya"
                  style={{ "--i": index } as React.CSSProperties}
                >
                  🪔
                </span>
              ))
            : Array.from({ length: 7 }, (_, index) => (
                <span key={index} />
              ))}
        </div> */}

        <div className="festival__head">
          <div className="festival__head-copy">
            <span className="eyebrow">Festival counter · {festival.season}</span>

            <h2
              className={`festival__title${isDiwali ? " festival__title--diwali" : ""}`}
              id="festival-heading"
            >
              {headlineStart}
              {headlineEnd !== undefined ? <em>{festival.name}</em> : null}
              {headlineEnd}
              {isDiwali && (
                <span className="festival__spark-row" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                </span>
              )}
            </h2>

            <p className="festival__intro">{festival.intro}</p>
          </div>

          <div className="festival__window">
            <span className="festival__window-label">Offer window</span>
            <strong className="festival__window-value">{festival.window}</strong>
            <p className="festival__window-note">{festival.windowNote}</p>
            <a
              className="festival__window-link"
              href={counterWhatsAppUrl(festival)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <WhatsAppIcon />
              Ask what&apos;s left
              <ArrowUpRight />
            </a>
          </div>
        </div>

        <ul className="festival__deals">
          {festival.deals.map((deal, index) => {
            const saving =
              deal.regularPrice && deal.offerPrice ? deal.regularPrice - deal.offerPrice : 0;
            const highlight = saving > 0 ? `${formatINR(saving)} off` : deal.discountLabel;

            return (
              <li
                className={`festival-deal${isDiwali ? " festival-deal--diwali" : ""}`}
                key={deal.slug}
                style={{ "--deal-i": index } as React.CSSProperties}
              >
                <div className="festival-deal__poster">
                  <Image
                    src={deal.image}
                    alt={`${festival.name} offer poster at Mobile House: ${deal.headline}`}
                    width={deal.width}
                    height={deal.height}
                    loading="lazy"
                  />
                  {isDiwali && <span className="festival-deal__glow" aria-hidden="true" />}
                </div>

                <div className="festival-deal__body">
                  {deal.badge && <span className="festival-deal__badge">{deal.badge}</span>}
                  <h3>{deal.headline}</h3>
                  <p className="festival-deal__sub">{deal.subhead}</p>

                  {(deal.offerPrice || deal.discountLabel) && (
                    <p className="festival-deal__price">
                      {deal.regularPrice && (
                        <span className="festival-deal__was">
                          <s>{formatINR(deal.regularPrice)}</s>
                        </span>
                      )}
                      {deal.offerPrice && (
                        <span className="festival-deal__now">{formatINR(deal.offerPrice)}</span>
                      )}
                      {highlight && <span className="festival-deal__save">{highlight}</span>}
                    </p>
                  )}

                  <ul className="festival-deal__details">
                    {deal.details.map((detail) => (
                      <li key={detail}>{detail}</li>
                    ))}
                  </ul>

                  {deal.note && <p className="festival-deal__note">{deal.note}</p>}

                  <div className="festival-deal__cta">
                    <a
                      className="btn btn--small btn--wide"
                      href={dealWhatsAppUrl(festival, deal)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <WhatsAppIcon />
                      Check on WhatsApp
                    </a>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <ul className="festival__perks">
          {festival.perks.map((perk) => (
            <li className="festival__perk" key={perk.label}>
              <span className="festival__perk-label">{perk.label}</span>
              <p>{perk.detail}</p>
            </li>
          ))}
        </ul>

        <p className="festival__fineprint">{festival.fineprint}</p>
      </div>
    </section>
  );
}