"use client";

import { useEffect, useRef } from "react";

/**
 * The battery beside the page is the scrollbar: it fills from the bottom as
 * you read and the readout underneath shows how far through the page you are.
 * Both the fill and the number are written straight to the DOM inside a single
 * animation frame, so scrolling never re-renders React.
 */
export function ScrollBattery() {
  const fillRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const fill = fillRef.current;
    const label = labelRef.current;
    if (!fill || !label) return;

    let frame = 0;

    const paint = () => {
      frame = 0;
      const root = document.documentElement;
      const travel = root.scrollHeight - window.innerHeight;
      const progress = travel > 0 ? Math.min(1, Math.max(0, window.scrollY / travel)) : 0;
      const percent = Math.round(progress * 100);

      fill.style.height = `${percent}%`;
      label.textContent = `${percent}%`;
      label.dataset.charging = percent > 99 ? "full" : "idle";
    };

    const schedule = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(paint);
    };

    paint();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  return (
    <div className="scroll-battery" aria-hidden="true">
      <span className="scroll-battery__nub" />
      <span className="scroll-battery__body">
        <span className="scroll-battery__fill" ref={fillRef} />
      </span>
      <span className="scroll-battery__label" ref={labelRef}>
        0%
      </span>
    </div>
  );
}
