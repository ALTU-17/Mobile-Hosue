import { BrandMark } from "@/components/BrandMark";

export function StaticPhone({ color }: { color: string }) {
  return (
    <div
      className="static-phones"
      style={{ "--finish": color } as React.CSSProperties}
      aria-hidden="true"
    >
      <div className="static-phone static-phone--back">
        <div className="static-phone__camera">
          <span className="static-phone__lens" />
          <span className="static-phone__lens" />
          <span className="static-phone__lens" />
          <span className="static-phone__flash" />
        </div>
        <span className="static-phone__wordmark">MOBILE HOUSE</span>
      </div>

      <div className="static-phone static-phone--front">
        <div className="static-phone__screen">
          <span className="static-phone__time">10:30 · MH-20</span>
          <BrandMark className="static-phone__mark" />
          <span className="static-phone__label">SEALED · ORIGINAL</span>
        </div>
        <span className="static-phone__island" />
        <span className="static-phone__screen-camera" />
      </div>
    </div>
  );
}
