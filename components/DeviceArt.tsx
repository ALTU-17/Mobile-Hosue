/* eslint-disable @next/next/no-img-element */
import Image from "next/image";
import type { CSSProperties } from "react";
import type { Product, ProductColor } from "@/lib/schema";
import { isRemoteImage } from "@/lib/images";

type DeviceArtProps = {
  product: Product;
  color: ProductColor;
  size?: "card" | "large";
};

export function DeviceArt({ product, color, size = "card" }: DeviceArtProps) {
  const photo = color.image?.trim();
  const alt = `${product.brand} ${product.name} in ${color.name}`;

  return (
    <div
      className={`device-art${size === "large" ? " device-art--large" : ""}`}
      style={{ "--device-color": color.hex } as CSSProperties}
      role={photo ? undefined : "img"}
      aria-label={photo ? undefined : alt}
    >
      <div className="device-art__ring" aria-hidden="true" />

      {photo ? (
        isRemoteImage(photo) ? (
          <img
            className="device-art__photo"
            src={photo}
            alt={alt}
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
          />
        ) : (
          <Image
            className="device-art__photo"
            src={photo}
            alt={alt}
            width={720}
            height={720}
            sizes={size === "large" ? "(max-width: 900px) 70vw, 420px" : "(max-width: 900px) 70vw, 300px"}
          />
        )
      ) : (
        <div className="device-art__phone" aria-hidden="true">
          <div className="device-art__camera">
            <span className="device-art__lens" />
            <span className="device-art__lens" />
            <span className="device-art__lens" />
            <span className="device-art__flash" />
          </div>
          <span className="device-art__wordmark">MH</span>
        </div>
      )}

      <span className="device-art__tag">{product.fiveG ? "5G · MH-20" : "MH-20"}</span>
      <span className="device-art__caption">{color.name}</span>
    </div>
  );
}
