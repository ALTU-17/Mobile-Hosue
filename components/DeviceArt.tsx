import type { CSSProperties } from "react";
import type { Product, ProductColor } from "@/lib/schema";

type DeviceArtProps = {
  product: Product;
  color: ProductColor;
  size?: "card" | "large";
};

export function DeviceArt({ product, color, size = "card" }: DeviceArtProps) {
  return (
    <div
      className={`device-art${size === "large" ? " device-art--large" : ""}`}
      style={{ "--device-color": color.hex } as CSSProperties}
      role="img"
      aria-label={`${product.brand} ${product.name} in ${color.name}`}
    >
      <div className="device-art__ring" aria-hidden="true" />
      <div className="device-art__phone" aria-hidden="true">
        <div className="device-art__camera">
          <span className="device-art__lens" />
          <span className="device-art__lens" />
          <span className="device-art__lens" />
          <span className="device-art__flash" />
        </div>
        <span className="device-art__wordmark">MH</span>
      </div>
      <span className="device-art__tag">{product.fiveG ? "5G · MH-20" : "MH-20"}</span>
      <span className="device-art__caption">{color.name}</span>
    </div>
  );
}
