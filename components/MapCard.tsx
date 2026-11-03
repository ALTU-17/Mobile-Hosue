"use client";

import { useState } from "react";
import { ArrowUpRight, MapIcon } from "@/components/Icons";

type MapCardProps = {
  query: string;
  directionsUrl: string;
};

export function MapCard({ query, directionsUrl }: MapCardProps) {
  const [loaded, setLoaded] = useState(false);
  const embedUrl = `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;

  return (
    <div className="map-card">
      {loaded ? (
        <iframe
          src={embedUrl}
          title="Google map showing Mobile House, Hari Om Complex, New Usmanpura"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      ) : (
        <>
          <div className="map-card__grid" aria-hidden="true" />
          <div className="map-card__road" aria-hidden="true" />
          <div className="map-card__pin" aria-hidden="true">
            <span className="map-card__pin-mark">
              <span>MH</span>
            </span>
            <span className="map-card__pin-label">Hari Om Complex · Shop 8–9</span>
          </div>
        </>
      )}

      <div className="map-card__content">
        <div className="map-card__content-text">
          <strong>Mobile House, New Usmanpura</strong>
          <span>Opposite Badi Masjid · 431005</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          {!loaded && (
            <button
              type="button"
              className="btn btn--small"
              onClick={() => setLoaded(true)}
            >
              <MapIcon />
              Load map
            </button>
          )}
          <a
            className="text-link"
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Directions
            <ArrowUpRight />
          </a>
        </div>
      </div>
    </div>
  );
}
