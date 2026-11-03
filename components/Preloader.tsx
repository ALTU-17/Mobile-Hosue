"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function Preloader() {
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismiss = useCallback(() => {
    setLeaving(true);
    if (dismissTimer.current) clearTimeout(dismissTimer.current);
    dismissTimer.current = setTimeout(() => setGone(true), 700);
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem("mh-intro", "1");
    } catch {
      // Storage can be unavailable in private browsing; the loader still auto-hides.
    }

    const timer = setTimeout(dismiss, 2250);
    return () => {
      clearTimeout(timer);
      if (dismissTimer.current) clearTimeout(dismissTimer.current);
    };
  }, [dismiss]);

  if (gone) return null;

  return (
    <div
      className={`preloader${leaving ? " is-leaving" : ""}`}
      role="status"
      aria-label="Loading Mobile House"
    >
      <div className="preloader__inner">
        <div className="loader-scene" aria-hidden="true">
          <div className="loader-scene__halo" />
          <div className="loader-scene__shelf" />
          <div className="loader-box">
            <div className="loader-box__flap loader-box__flap--left" />
            <div className="loader-box__flap loader-box__flap--right" />
          </div>
          <div className="loader-phone">
            <div className="loader-phone__screen" />
            <span className="loader-phone__mark">MH</span>
            <span className="loader-phone__camera" />
          </div>
        </div>

        <div className="loader-wordmark">
          <span className="loader-wordmark__name">MOBILE HOUSE</span>
          <span className="loader-wordmark__sub">your mobile partner · MH-20</span>
        </div>

        <div className="loader-progress">
          <div className="loader-progress__meta">
            <span>Unboxing the counter</span>
            <span>Sealed · Original · GST</span>
          </div>
          <div className="loader-progress__bar" aria-hidden="true" />
        </div>
      </div>

      <button type="button" className="loader-skip" onClick={dismiss}>
        Skip intro
      </button>
    </div>
  );
}
