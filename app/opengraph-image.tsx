import { ImageResponse } from "next/og";

export const alt = "Mobile House — all brands. Zero doubt. Chhatrapati Sambhajinagar (Aurangabad).";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#0B0A09",
          color: "#F2EBDD",
          position: "relative",
          overflow: "hidden",
          padding: "64px 70px",
          border: "1px solid #C9A25E",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 780,
            height: 780,
            borderRadius: 999,
            background: "radial-gradient(circle, rgba(240,163,58,0.2), rgba(11,10,9,0) 68%)",
            right: -190,
            top: -160,
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 480,
            height: 480,
            borderRadius: 999,
            border: "1px solid rgba(201,162,94,0.35)",
            right: 40,
            top: 80,
            display: "flex",
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            zIndex: 2,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div
              style={{
                width: 62,
                height: 62,
                borderRadius: 14,
                border: "1px solid #C9A25E",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#C9A25E",
                fontSize: 25,
                fontWeight: 700,
                letterSpacing: 2,
              }}
            >
              MH
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: 22, letterSpacing: 8, fontWeight: 700 }}>MOBILE HOUSE</div>
              <div style={{ fontSize: 15, letterSpacing: 4, color: "#C9A25E" }}>
                YOUR MOBILE PARTNER · MH-20
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                fontSize: 88,
                lineHeight: 0.92,
                fontWeight: 800,
                letterSpacing: -4,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <span>All brands.</span>
              <span style={{ color: "#F0A33A" }}>Zero doubt.</span>
            </div>
            <div style={{ fontSize: 22, color: "#B9AF9E", marginTop: 26, letterSpacing: 1 }}>
              Sealed phones. GST bills. Every brand at one trusted counter.
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              borderTop: "1px solid rgba(201,162,94,0.35)",
              paddingTop: 22,
              fontSize: 18,
              letterSpacing: 2,
            }}
          >
            <div style={{ display: "flex", gap: 28 }}>
              <span style={{ color: "#F0A33A" }}>4.9 / 5 · 53 GOOGLE REVIEWS</span>
              <span style={{ color: "#C9A25E" }}>8.8K ON INSTAGRAM</span>
            </div>
            <span style={{ color: "#B9AF9E" }}>NEW USMANPURA · 431005</span>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
