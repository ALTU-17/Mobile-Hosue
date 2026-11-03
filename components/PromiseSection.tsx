import type { ComponentType, SVGProps } from "react";
import { site } from "@/lib/catalog";
import { ExplodedPhone } from "@/components/ExplodedPhone";
import Image from "next/image";
import {
  AccessoryIcon,
  ArrowUpRight,
  ExchangeIcon,
  FinanceIcon,
  GoogleIcon,
  ReceiptIcon,
  ServiceIcon,
  ShieldIcon,
} from "@/components/Icons";

type TrustPoint = {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  title: string;
  copy: string;
};

const trustPoints: TrustPoint[] = [
  {
    icon: ShieldIcon,
    title: "Original products",
    copy: "Sealed box, checkable IMEI and the brand's warranty — not a parallel-import promise.",
  },
  {
    icon: ReceiptIcon,
    title: "GST bill",
    copy: "A proper invoice on every phone, so the purchase is on record and the warranty is clean.",
  },
  {
    icon: ExchangeIcon,
    title: "Easy exchange",
    copy: "Bring your old phone. We value it in front of you, before you pay for the new one.",
  },
  {
    icon: FinanceIcon,
    title: "Finance available",
    copy: "Ask for the current EMI and finance options at the counter; we will walk you through it.",
  },
  {
    icon: AccessoryIcon,
    title: "Authentic accessories",
    copy: "Cases, chargers and glass that fit the phone you bought, not a universal guess.",
  },
  {
    icon: ServiceIcon,
    title: "Quick service",
    copy: "A real person to call after the sale. If something is wrong, bring it back to the counter.",
  },
];

export function PromiseSection() {
  return (
    <section className="promise paper section" id="promise" aria-labelledby="promise-heading">
      <div className="promise__grain" aria-hidden="true" />
      <div className="container">
        <div className="promise__head">
          <div className="section-head__top">
            <span className="eyebrow">02 / The Promise</span>
            <h2 className="section-title" id="promise-heading">
              The seal is the promise.
            </h2>
            <p className="section-intro">
              Any shop can say original. We show you the seal, the bill and the IMEI before you pay
              — and we are still here after you leave.
            </p>
          </div>
          <div className="promise__stamp" aria-hidden="true">
            100% original
            <br />
            checked in front of you
            <br />
            GST billed
          </div>
        </div>

        <div className="promise__layout">
          <div className="promise__copy">
            <div className="promise-list">
              {trustPoints.map((point, index) => {
                const Icon = point.icon;
                return (
                  <div className="promise-item" key={point.title}>
                    <div className="promise-item__top">
                      <span>0{index + 1}</span>
                      <Icon />
                    </div>
                    <h3>{point.title}</h3>
                    <p>{point.copy}</p>
                  </div>
                );
              })}
            </div>

            <div className="promise__owner">
              <div className="promise__owner-image">
                <Image
                  src="/images/owner.webp"
                  alt="Imran Shaikh, owner of Mobile House, New Usmanpura"
                  width={900}
                  height={1317}
                  sizes="(max-width: 700px) 92vw, 190px"
                  loading="lazy"
                />
              </div>

              <div className="promise__owner-content">
                <span className="eyebrow">A promise from the owner</span>

                <h3>Trust built over years.</h3>

                <p>
                  Every customer at Mobile House gets genuine stock, honest advice and no pressure
                  to buy. That is why people come back — and send their family with the next
                  upgrade.
                </p>

                <strong>Imran Shaikh</strong>
                <span>Founder &amp; Owner · Mobile House</span>
              </div>
            </div>

            <a
              className="text-link"
              href={site.store.reviewUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <GoogleIcon style={{ width: "0.9rem", height: "0.9rem" }} />
              {site.store.rating} / 5 · {site.store.reviewCount} Google reviews
              <ArrowUpRight />
            </a>
          </div>

          <ExplodedPhone />
        </div>
      </div>
    </section>
  );
}
