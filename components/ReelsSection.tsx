"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties, MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent } from "react";
import type { Reel, Store } from "@/lib/schema";
import { formatFollowers } from "@/lib/hours";
import { ArrowUpRight, InstagramIcon, PlayIcon } from "@/components/Icons";

const placeholderReels = [
  {
    title: "New arrivals, straight off the shelf",
    label: "Shop floor / 01",
    phone: "#36363c",
    glow: "rgba(240, 163, 58, 0.3)",
  },
  {
    title: "This week's colour check",
    label: "Counter notes / 02",
    phone: "#4e655a",
    glow: "rgba(139, 216, 176, 0.18)",
  },
  {
    title: "What's actually in the box",
    label: "Before you buy / 03",
    phone: "#6e4f3a",
    glow: "rgba(226, 74, 51, 0.24)",
  },
];

function embedUrl(url: string) {
  const match = url.match(/instagram\.com\/(?:reel|p)\/([^/?#]+)/);
  return match ? `https://www.instagram.com/reel/${match[1]}/embed/` : null;
}

function Cover({
  phone,
  glow,
}: {
  phone: string;
  glow: string;
}) {
  return (
    <span
      className="reel-card__cover"
      style={{ "--reel-phone": phone, "--reel-glow": glow } as CSSProperties}
    />
  );
}

function ReelDialog({ reel, onClose }: { reel: Reel; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const src = embedUrl(reel.url);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (!dialog.open) dialog.showModal();
    document.body.classList.add("modal-open");
    return () => {
      if (dialog.open) dialog.close();
      document.body.classList.remove("modal-open");
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className="reel-modal"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      aria-label={reel.title}
    >
      {src ? (
        <iframe
          className="reel-modal__frame"
          src={src}
          title={reel.title}
          loading="lazy"
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
          allowFullScreen
        />
      ) : (
        <div className="reel-modal__fallback">
          <InstagramIcon />
          <p>This reel is best opened inside Instagram.</p>
          <a href={reel.url} target="_blank" rel="noopener noreferrer">
            Open the reel <ArrowUpRight />
          </a>
        </div>
      )}
      <div className="reel-modal__bar">
        <strong>{reel.title}</strong>
        <div style={{ display: "flex", gap: "0.8rem", alignItems: "center" }}>
          <a href={reel.url} target="_blank" rel="noopener noreferrer">
            Open in Instagram
          </a>
          <button type="button" className="reel-modal__close" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </dialog>
  );
}

type RailDrag = { pointerId: number; startX: number; startLeft: number; moved: boolean };

export function ReelsSection({ reels, store }: { reels: Reel[]; store: Store }) {
  const [active, setActive] = useState<Reel | null>(null);
  const isPlaceholder = reels.length === 0;
  const railRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<RailDrag | null>(null);
  const suppressClickRef = useRef(false);

  /* On phones the rail scrolls natively; with a mouse (and in the desktop
     preview at a phone width) there is no touch and the scrollbar is hidden,
     so drag-to-scroll is the only way to reach the next cards. */
  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    const rail = railRef.current;
    if (!rail || event.pointerType !== "mouse" || event.button !== 0) return;
    if (rail.scrollWidth <= rail.clientWidth) return;

    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startLeft: rail.scrollLeft,
      moved: false,
    };
    rail.classList.add("is-dragging");
    try {
      rail.setPointerCapture(event.pointerId);
    } catch {
      /* synthetic pointers have nothing to capture */
    }
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const rail = railRef.current;
    const drag = dragRef.current;
    if (!rail || !drag || drag.pointerId !== event.pointerId) return;

    const delta = event.clientX - drag.startX;
    if (Math.abs(delta) > 4) drag.moved = true;
    rail.scrollLeft = drag.startLeft - delta;
  };

  const endDrag = () => {
    const rail = railRef.current;
    const drag = dragRef.current;
    if (!drag) return;

    suppressClickRef.current = drag.moved;
    dragRef.current = null;
    rail?.classList.remove("is-dragging");
    if (rail?.hasPointerCapture(drag.pointerId)) rail.releasePointerCapture(drag.pointerId);
    if (drag.moved) window.setTimeout(() => (suppressClickRef.current = false), 400);
  };

  const handleClickCapture = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (!suppressClickRef.current) return;
    suppressClickRef.current = false;
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <section className="reels section" id="reels" aria-labelledby="reels-heading">
      <div className="container reels__layout">
        <div className="reels__copy">
          <span className="eyebrow">03 / On camera</span>
          <h2 className="section-title" id="reels-heading">
            The counter, on camera.
          </h2>
          <p className="section-intro">
            No studio, no script. New stock, colour checks and the odd unboxing, filmed at the
            counter in New Usmanpura.
          </p>

          <a
            className="instagram-card"
            href={store.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="instagram-card__icon">
              <InstagramIcon />
            </span>
            <span className="instagram-card__text">
              <strong>{store.instagramHandle}</strong>
              <span>{formatFollowers(store.instagramFollowers)} people following the shop floor</span>
            </span>
            <ArrowUpRight style={{ width: "0.9rem", height: "0.9rem", color: "var(--brass)" }} />
          </a>

          <a
            className="btn btn--ghost btn--small"
            href={store.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <InstagramIcon />
            Follow the shop
          </a>
        </div>

        <div>
          <div
            className="reels__rail"
            ref={railRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onClickCapture={handleClickCapture}
          >
            {isPlaceholder
              ? placeholderReels.map((reel) => (
                  <a
                    className="reel-card"
                    key={reel.title}
                    href={store.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Open ${store.instagramHandle} on Instagram`}
                  >
                    <Cover phone={reel.phone} glow={reel.glow} />
                    <span className="reel-card__top">
                      <span>{reel.label}</span>
                      <InstagramIcon style={{ width: "0.8rem", height: "0.8rem" }} />
                    </span>
                    <span className="reel-card__play">
                      <PlayIcon />
                    </span>
                    <span className="reel-card__bottom">
                      <span>On Instagram</span>
                      <strong>{reel.title}</strong>
                    </span>
                  </a>
                ))
              : reels.map((reel, index) => (
                  <button
                    className="reel-card"
                    key={reel.url}
                    type="button"
                    onClick={() => setActive(reel)}
                    aria-label={`Play reel: ${reel.title}`}
                  >
                    {reel.cover ? (
                      <img className="reel-card__img" src={reel.cover} alt="" />
                    ) : (
                      <Cover
                        phone={index % 2 === 0 ? "#34343a" : "#4e655a"}
                        glow="rgba(240, 163, 58, 0.26)"
                      />
                    )}
                    <span className="reel-card__top">
                      <span>Reel / 0{index + 1}</span>
                      <InstagramIcon style={{ width: "0.8rem", height: "0.8rem" }} />
                    </span>
                    <span className="reel-card__play">
                      <PlayIcon />
                    </span>
                    <span className="reel-card__bottom">
                      <span>Tap to play</span>
                      <strong>{reel.title}</strong>
                    </span>
                  </button>
                ))}
          </div>
          <p className="reels__footnote">
            {isPlaceholder
              ? "Real reels drop in here from the shop's Instagram. Until then, the feed is one tap away."
              : "Reels play through Instagram's official embed. If it doesn't load, open the reel in the app."}
          </p>
        </div>
      </div>

      {active && <ReelDialog reel={active} onClose={() => setActive(null)} />}
    </section>
  );
}
