import { site } from "@/lib/catalog";
import { generalWhatsAppUrl } from "@/lib/whatsapp";
import { BrandMark } from "@/components/BrandMark";
import {
  CodeIcon,
  InstagramIcon,
  MailIcon,
  PhoneIcon,
  PinIcon,
  WhatsAppIcon,
} from "@/components/Icons";

export function SiteFooter() {
  const address = site.store.address;

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__top">
          <div className="footer__brand">
            <div className="footer__wordmark">
              <BrandMark className="brand-lockup__mark" />
              <span>MOBILE HOUSE</span>
            </div>
            <p>
              Your mobile partner in New Usmanpura. Sealed, original phones from every brand,
              with a GST bill and a person behind the counter who picks up the phone.
            </p>
            <a
              className="text-link"
              href={site.store.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <InstagramIcon style={{ width: "0.9rem", height: "0.9rem" }} />
              {site.store.instagramHandle}
            </a>
          </div>

          <div className="footer__col">
            <span className="footer__col-title">Browse</span>
            <a href="#counter">The counter</a>
            <a href="#promise">Originality</a>
            <a href="#reels">On camera</a>
            <a href="#reviews">Reviews</a>
            <a href="#visit">Visit the shop</a>
          </div>

          <div className="footer__col">
            <span className="footer__col-title">Talk to us</span>
            <a href={generalWhatsAppUrl} target="_blank" rel="noopener noreferrer">
              <WhatsAppIcon style={{ width: "0.9rem", height: "0.9rem", display: "inline" }} />{" "}
              {site.store.whatsappDisplay}
            </a>
            <a href={`tel:${site.store.phoneRaw}`}>
              <PhoneIcon style={{ width: "0.9rem", height: "0.9rem", display: "inline" }} />{" "}
              {site.store.phoneDisplay}
            </a>
            <a
              href={site.store.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <InstagramIcon style={{ width: "0.9rem", height: "0.9rem", display: "inline" }} />{" "}
              {site.store.instagramHandle}
            </a>
            <a href={site.store.directionsUrl} target="_blank" rel="noopener noreferrer">
              <PinIcon style={{ width: "0.9rem", height: "0.9rem", display: "inline" }} /> Get
              directions
            </a>
          </div>

          <div className="footer__col">
            <span className="footer__col-title">Visit</span>
            <address>
              {address.line1}
              <br />
              {address.line2}
              <br />
              {address.line3}
              <br />
              {address.city} {address.postalCode}
            </address>
            <span>{site.store.hoursLabel}</span>
            <span>Owner: {site.store.owner}</span>
          </div>
        </div>

        <div className="footer__brands" aria-label="Brands stocked">
          {site.brands.map((brand) => (
            <span key={brand}>{brand}</span>
          ))}
        </div>

        <div className="footer__bottom">
          <p>
            © {new Date().getFullYear()} Mobile House · Your Mobile Partner. Prices and stock are
            indicative; confirm availability on WhatsApp. Brand names belong to their respective
            owners.
          </p>
          <span>MH-20 · Chhatrapati Sambhajinagar (Aurangabad)</span>
        </div>

        <div className="footer__credit">
          <a
            href="https://altamash-shaikh-portfolio.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Visit developer portfolio"
          >
            <CodeIcon />
            <span>
              Developed by <strong>ALTAMASH SHAIKH</strong>
            </span>
          </a>

          <span className="footer__credit-sep" aria-hidden="true" />

          <a href="tel:+919766220055" aria-label="Call developer">
            <PhoneIcon />
            <span>+91 9766220055</span>
          </a>

          <span className="footer__credit-sep" aria-hidden="true" />

          <a href="mailto:skaltamsh789@gmail.com" aria-label="Email developer">
            <MailIcon />
            <span>skaltamsh789@gmail.com</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
