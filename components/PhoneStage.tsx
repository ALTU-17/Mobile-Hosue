"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";
import { StaticPhone } from "@/components/StaticPhone";
import { DragIcon } from "@/components/Icons";

const PhoneScene = dynamic(() => import("@/components/three/PhoneScene"), {
  ssr: false,
  loading: () => null,
});

const finishes = [
  { name: "Midnight", hex: "#232326" },
  { name: "Brass", hex: "#B9894F" },
  { name: "Jade", hex: "#385F53" },
  { name: "Bone", hex: "#D8D2C4" },
];

function canUseWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")),
    );
  } catch {
    return false;
  }
}

export function PhoneStage() {
  const reduceMotion = useReducedMotion();
  const [finish, setFinish] = useState(finishes[1]);
  const [mode, setMode] = useState<"static" | "loading" | "live">("static");
  const [requested3D, setRequested3D] = useState(false);

  useEffect(() => {
    if (reduceMotion || requested3D) return;
    if (!canUseWebGL()) return;

    const connection = (
      navigator as Navigator & { connection?: { saveData?: boolean } }
    ).connection;
    const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
    const finePointer = window.matchMedia("(pointer: fine)").matches;

    if (!finePointer || connection?.saveData || (memory !== undefined && memory < 4)) {
      return;
    }

    const timer = window.setTimeout(() => {
      setRequested3D(true);
      setMode("loading");
    }, 1100);

    return () => window.clearTimeout(timer);
  }, [reduceMotion, requested3D]);

  useEffect(() => {
    if (mode !== "loading") return;
    const timeout = window.setTimeout(() => {
      setRequested3D(false);
      setMode("static");
    }, 12_000);
    return () => window.clearTimeout(timeout);
  }, [mode]);

  const handleReady = useCallback(() => setMode("live"), []);

  const request3D = () => {
    if (!canUseWebGL()) return;
    setRequested3D(true);
    setMode("loading");
  };

  return (
    <div className={`phone-stage${mode === "live" ? " is-live" : ""}`}>
      <div className="phone-stage__glow" aria-hidden="true" />
      <div className="phone-stage__orbit" aria-hidden="true" />
      <div className="phone-stage__ground" aria-hidden="true" />

      <span className="stage-label stage-label--1">
        <span>●</span> Sealed & original
      </span>
      <span className="stage-label stage-label--2 stage-label--ghost">GST bill, every time</span>
      <span className="stage-label stage-label--3">All brands · one counter</span>

      <div className="phone-stage__visual">
        <StaticPhone color={finish.hex} />

        {requested3D && (
          <div className="phone-stage__3d">
            <PhoneScene color={finish.hex} onReady={handleReady} />
          </div>
        )}
      </div>

      {mode === "loading" && <span className="phone-stage__loading">Warming up the phone</span>}

      {mode === "live" && (
        <span className="stage-drag-hint">
          <DragIcon /> Drag to inspect
        </span>
      )}

      {mode === "static" && (
        <button type="button" className="stage-view-btn" onClick={request3D}>
          View in 3D ↗
        </button>
      )}

      <div className="finishes" role="group" aria-label="Choose a phone finish">
        {finishes.map((item) => (
          <button
            key={item.name}
            type="button"
            className="finish"
            aria-pressed={finish.name === item.name}
            onClick={() => setFinish(item)}
          >
            <span
              className="finish__dot"
              style={{ "--finish-dot": item.hex } as React.CSSProperties}
            />
            {item.name}
          </button>
        ))}
      </div>
    </div>
  );
}
