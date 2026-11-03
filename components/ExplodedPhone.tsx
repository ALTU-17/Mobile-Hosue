"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";

const theatreState = {
  sheetsById: {
    "Exploded Phone": {
      staticOverrides: {
        byObject: {
          Assembly: { spread: 0 },
        },
      },
      sequence: {
        subUnitsPerUnit: 30,
        length: 1.5,
        type: "PositionalSequence",
        tracksByObject: {
          Assembly: {
            trackData: {
              "track-spread": {
                type: "BasicKeyframedTrack",
                __debugName: 'Assembly:["spread"]',
                keyframes: [
                  {
                    id: "mh-keyframe-0",
                    position: 0,
                    connectedRight: true,
                    handles: [0.5, 1, 0.5, 0],
                    value: 0,
                  },
                  {
                    id: "mh-keyframe-1",
                    position: 1.5,
                    connectedRight: true,
                    handles: [0.5, 1, 0.5, 0],
                    value: 100,
                  },
                ],
              },
            },
            trackIdByPropPath: {
              '["spread"]': "track-spread",
            },
          },
        },
      },
    },
  },
  definitionVersion: "0.4.0",
  revisionHistory: ["mh-exploded-v1"],
};

const layers = [
  { key: "back", label: "Back glass" },
  { key: "frame", label: "Frame" },
  { key: "battery", label: "Battery" },
  { key: "board", label: "Mainboard" },
  { key: "screen", label: "Display" },
  { key: "camera", label: "Camera" },
] as const;

const TIMELINE_LENGTH = 1.5;

export function ExplodedPhone() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);
  const sequenceRef = useRef<{ position: number; length: number } | null>(null);
  const assemblyRef = useRef<{ value: { spread: number } } | null>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const wrap = wrapRef.current;
    const phone = phoneRef.current;
    if (!wrap || !phone || reduceMotion) return;

    let disposed = false;
    let frame = 0;
    let theatreStarted = false;
    const narrow = window.matchMedia("(max-width: 900px)");

    const setSpread = (spread: number) => {
      phone.style.setProperty("--spread", String(Math.max(0, Math.min(1, spread))));
    };

    const applyProgress = (progress: number) => {
      if (narrow.matches) {
        // Phones get a short sticky stage, so run a full cycle as it passes:
        // assembled at the edges, fully apart as the scene crosses the middle.
        const cycle = progress < 0.5 ? progress * 2 : (1 - progress) * 2;
        setSpread(cycle * 0.72);
        return;
      }

      if (sequenceRef.current) {
        sequenceRef.current.position = progress * TIMELINE_LENGTH;
        const spread = assemblyRef.current?.value.spread;
        if (typeof spread === "number" && Number.isFinite(spread) && spread > 0) {
          setSpread(spread / 100);
          return;
        }
      }
      setSpread(progress * 0.92);
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const rect = wrap.getBoundingClientRect();
        const scrollable = Math.max(1, rect.height - window.innerHeight);
        const progress = Math.min(1, Math.max(0, -rect.top / scrollable));
        applyProgress(progress);
      });
    };

    const startTheatre = () => {
      if (theatreStarted || disposed) return;
      theatreStarted = true;

      import("@theatre/core")
        .then((theatre) => {
          if (disposed) return;
          try {
            const config = { state: theatreState } as unknown as Parameters<
              typeof theatre.getProject
            >[1];
            const project = theatre.getProject("Mobile House Exploded Phone", config);
            const sheet = project.sheet("Exploded Phone");
            const assembly = sheet.object("Assembly", { spread: 0 });

            project.ready.then(() => {
              if (disposed) return;
              sequenceRef.current = {
                get position() {
                  return sheet.sequence.position;
                },
                set position(value: number) {
                  sheet.sequence.position = value;
                },
                length: TIMELINE_LENGTH,
              };
              assemblyRef.current = assembly;
              assembly.onValuesChange(({ spread }) => {
                if (Number.isFinite(spread) && !narrow.matches) setSpread(spread / 100);
              });
              onScroll();
            });
          } catch {
            // The direct scroll fallback still runs if the Theatre state is unavailable.
          }
        })
        .catch(() => {
          // The direct scroll fallback remains active.
        });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          startTheatre();
          observer.disconnect();
        }
      },
      { rootMargin: "320px" },
    );
    observer.observe(wrap);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    narrow.addEventListener("change", onScroll);
    onScroll();

    return () => {
      disposed = true;
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      narrow.removeEventListener("change", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [reduceMotion]);

  return (
    <div className="exploded-wrap" ref={wrapRef}>
      <div className="exploded-sticky">
        <div className="exploded-scene">
          <div className="exploded-scene__arc" aria-hidden="true" />
          <div className="exploded-scene__axis" aria-hidden="true" />

          <div
            className="exploded-phone"
            ref={phoneRef}
            role="img"
            aria-label="Exploded view of an original phone showing its frame, display, battery, mainboard, camera and back glass"
          >
            <div className="exploded-assembled" aria-hidden="true">
              <div className="exploded-assembled__camera" />
            </div>

            <div className="exploded-parts" aria-hidden="true">
              {layers.map((layer) => (
                <div
                  key={layer.key}
                  className={`exploded-part exploded-part--${layer.key}`}
                >
                  <span className="exploded-part__label">{layer.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="exploded__caption">
          <span>Scroll to take it apart</span>
          <span>Every layer, checked · Theatre timeline</span>
        </div>
      </div>
    </div>
  );
}
