import { site } from "@/lib/catalog";
import { formatFollowers } from "@/lib/hours";
import { generalWhatsAppUrl } from "@/lib/whatsapp";
import { PhoneStage } from "@/components/PhoneStage";
import { OpenStatus } from "@/components/OpenStatus";
import { ArrowDown, ArrowUpRight, WhatsAppIcon } from "@/components/Icons";

export function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-heading">
      <div className="hero__bg" aria-hidden="true" />
      <div className="hero__watermark" aria-hidden="true">
        MH·20
      </div>

      <div className="container hero__grid">
        <div className="hero__copy">
          <span className="eyebrow">New Usmanpura · MH-20</span>

          <h1 className="hero__title" id="hero-heading">
            <span>All brands.</span>
            <span className="hero__title-gold">Zero doubt.</span>
          </h1>

          <p className="hero__sub">
            Sealed phones, straight answers and every brand you know — at one trusted counter in
            Chhatrapati Sambhajinagar (Aurangabad). <strong>GST bill, brand warranty</strong> and a WhatsApp
            reply from Imran.
          </p>

          <div className="hero__actions">
            <a className="btn" href="#counter">
              See what&apos;s on the shelf
              <ArrowDown />
            </a>
            <a
              className="btn btn--ghost"
              href={generalWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <WhatsAppIcon />
              WhatsApp Imran
              <ArrowUpRight />
            </a>
          </div>

          <div className="hero__proof">
            <div className="proof">
              <span className="proof__value">
                4.9 <span className="stars" aria-hidden="true">★★★★★</span>
              </span>
              <span className="proof__label">{site.store.reviewCount} Google reviews</span>
            </div>
            <div className="proof">
              <span className="proof__value">{formatFollowers(site.store.instagramFollowers)}</span>
              <span className="proof__label">on Instagram</span>
            </div>
            <div className="proof">
              <OpenStatus />
              <span className="proof__label">10:30 am–10:30 pm, all days</span>
            </div>
          </div>
        </div>

        <div className="hero__stage">
          <PhoneStage />
          <span className="hero__side-note">New Usmanpura · 431005</span>
        </div>
      </div>
    </section>
  );
}
