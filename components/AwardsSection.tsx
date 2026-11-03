"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { Award } from "@/lib/schema";
import { ArrowUpRight, CloseIcon } from "@/components/Icons";

function AwardDialog({ award, onClose }: { award: Award; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (!dialog.open) dialog.showModal();
    document.body.classList.add("modal-open");
    return () => {
      document.body.classList.remove("modal-open");
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className="award-modal"
      aria-labelledby="award-modal-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="award-modal__panel">
        <button
          type="button"
          className="award-modal__close"
          onClick={onClose}
          aria-label="Close certificate"
        >
          <CloseIcon />
        </button>

        <div className="award-modal__frame">
          <Image
            className="award-modal__image"
            src={award.image}
            alt={`${award.title} certificate awarded to Mobile House`}
            width={award.width}
            height={award.height}
            sizes="(max-width: 900px) 92vw, 70vw"
          />
        </div>

        <div className="award-modal__meta">
          <div className="award-modal__text">
            <span className="award-modal__kicker">{award.period}</span>
            <h3 id="award-modal-title">{award.title}</h3>
            <p>{award.summary}</p>
          </div>
          <span className="award-modal__issuer">{award.issuer}</span>
        </div>
      </div>
    </dialog>
  );
}

export function AwardsSection({ awards }: { awards: Award[] }) {
  const [active, setActive] = useState<Award | null>(null);

  if (awards.length === 0) return null;

  return (
    <section className="awards section" id="awards" aria-labelledby="awards-heading">
      <div className="awards__glow" aria-hidden="true" />
      <div className="container">
        <div className="awards__head">
          <div className="awards__head-copy">
            <span className="eyebrow">05 / On the wall</span>
            <h2 className="section-title" id="awards-heading">
              Certificates, not claims.
            </h2>
            <p className="section-intro">
              Two Xiaomi honours and a Government of India participation certificate — earned
              behind this counter and kept on the wall, where anyone who walks in can read them.
            </p>
          </div>

          <div className="awards__tally">
            <span className="awards__tally-number">
              {String(awards.length).padStart(2, "0")}
            </span>
            <span className="awards__tally-label">
              awards &amp; recognitions
              <br />
              on display at the shop
            </span>
          </div>
        </div>

        <ul className="awards__wall">
          {awards.map((award, index) => (
            <li key={award.slug}>
              <button
                type="button"
                className="award-card"
                onClick={() => setActive(award)}
                aria-label={`View the ${award.title} certificate`}
              >
                <span className="award-card__frame">
                  <span className="award-card__mat">
                    <Image
                      src={award.image}
                      alt={`${award.title} certificate awarded to Mobile House`}
                      width={award.width}
                      height={award.height}
                      sizes="(max-width: 900px) 88vw, 30vw"
                    />
                  </span>
                  <span className="award-card__zoom" aria-hidden="true">
                    <ArrowUpRight />
                  </span>
                </span>

                <span className="award-card__label">
                  <span className="award-card__index">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="award-card__text">
                    <strong>{award.title}</strong>
                    <span>{award.issuer}</span>
                  </span>
                  <span className="award-card__period">{award.period}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>

        <p className="awards__note">
          <span className="awards__note-dot" aria-hidden="true" />
          Photographed at the counter. Ask to see the originals on your next visit.
        </p>
      </div>

      {active && <AwardDialog award={active} onClose={() => setActive(null)} />}
    </section>
  );
}
