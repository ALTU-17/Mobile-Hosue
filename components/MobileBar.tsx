import { store } from "@/lib/catalog";
import { generalWhatsAppUrl } from "@/lib/whatsapp";
import { PinIcon, PhoneIcon, WhatsAppIcon } from "@/components/Icons";

export function MobileBar() {
  return (
    <nav className="mobile-bar" aria-label="Quick contact">
      <a
        className="mobile-bar__item mobile-bar__item--primary"
        href={generalWhatsAppUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        <WhatsAppIcon />
        WhatsApp
      </a>
      <a className="mobile-bar__item" href={`tel:${store.phoneRaw}`}>
        <PhoneIcon />
        Call
      </a>
      <a
        className="mobile-bar__item"
        href={store.directionsUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        <PinIcon />
        Directions
      </a>
    </nav>
  );
}
