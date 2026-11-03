import { site } from "@/lib/catalog";
import { callUrl, directionsUrl, generalWhatsAppUrl } from "@/lib/whatsapp";
import { OpenStatus } from "@/components/OpenStatus";
import { MapCard } from "@/components/MapCard";
import { ShopWall } from "@/components/ShopWall";
import {
  ArrowUpRight,
  InfoIcon,
  PhoneIcon,
  PinIcon,
  WhatsAppIcon,
} from "@/components/Icons";

export function VisitSection() {
  const address = site.store.address;
  const mapQuery = `${site.store.name}, ${address.line1}, ${address.line2}, ${address.line3}, ${address.city}, ${address.state} ${address.postalCode}`;

  return (
    <section className="visit section" id="visit" aria-labelledby="visit-heading">
      <div className="container">
        <div className="section-head">
          <div className="section-head__top">
            <span className="eyebrow">06 / The Shop</span>
            <h2 className="section-title" id="visit-heading">
              Come hold it before you buy it.
            </h2>
          </div>
          <div className="section-head__aside">
            <p className="section-intro">
              On Government Engineering College Road, opposite Badi Masjid. Walk in, see the phone
              in your hand, check the seal, then decide. That is the whole point of a shop.
            </p>
          </div>
        </div>

        <div className="visit__grid">
          <div className="visit__copy">
            <address className="visit__address">
              <span>{address.line1}</span>
              <span>{address.line2}</span>
              <span>{address.line3}</span>
              <span>
                {address.city}, {address.state} <strong>{address.postalCode}</strong>
              </span>
            </address>

            <div className="visit__meta">
              <div className="visit__meta-item">
                <span className="visit__meta-label">Today at the counter</span>
                <span className="visit__meta-value">
                  <OpenStatus />
                  <br />
                  {site.store.hoursLabel}
                </span>
              </div>
              <div className="visit__meta-item">
                <span className="visit__meta-label">Ask for</span>
                <span className="visit__meta-value">
                  {site.store.owner}
                  <br />
                  Owner · Mobile House
                </span>
              </div>
              <div className="visit__meta-item">
                <span className="visit__meta-label">Landmark</span>
                <span className="visit__meta-value">
                  Opposite Badi Masjid
                  <br />
                  Hari Om Complex, Shop 8–9
                </span>
              </div>
              <div className="visit__meta-item">
                <span className="visit__meta-label">WhatsApp</span>
                <span className="visit__meta-value">
                  {site.store.whatsappDisplay}
                  <br />
                  Calls: {site.store.phoneDisplay}
                </span>
              </div>
            </div>

            <div className="visit__actions">
              <a
                className="btn"
                href={generalWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <WhatsAppIcon />
                Message the shop
                <ArrowUpRight />
              </a>
              <a className="btn btn--ghost" href={callUrl()}>
                <PhoneIcon />
                Call
              </a>
              <a
                className="btn btn--ghost"
                href={directionsUrl()}
                target="_blank"
                rel="noopener noreferrer"
              >
                <PinIcon />
                Get directions
              </a>
            </div>

            <p className="visit__note">
              <InfoIcon />
              {site.store.hoursNote} The shop is open all seven days, but the last hour can be
              busy — message before a long trip.
            </p>
          </div>

          <MapCard query={mapQuery} directionsUrl={directionsUrl()} />
        </div>

        <div style={{ height: "clamp(3rem, 6vw, 5rem)" }} aria-hidden="true" />
        <ShopWall />
      </div>
    </section>
  );
}
