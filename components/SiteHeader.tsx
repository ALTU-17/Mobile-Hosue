"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { site, store } from "@/lib/catalog";
import { generalWhatsAppUrl } from "@/lib/whatsapp";
import { BrandLockup } from "@/components/BrandMark";
import { PhoneIcon, WhatsAppIcon } from "@/components/Icons";

const tickerItems = [
  "GST bill with every phone",
  "Sealed & original",
  "Easy exchange",
  "Finance available",
  "All brands under one roof",
  "4.9★ on Google",
];

type NavItem = { label: string; href: string; id: string };

const baseNavItems: NavItem[] = [
  { label: "Counter", href: "#counter", id: "counter" },
  { label: "Promise", href: "#promise", id: "promise" },
  { label: "Reels", href: "#reels", id: "reels" },
  { label: "Reviews", href: "#reviews", id: "reviews" },
  { label: "Awards", href: "#awards", id: "awards" },
  { label: "Visit", href: "#visit", id: "visit" },
];

/** The festival link only exists while the festival band is switched on in content. */
const navItems: NavItem[] = [
  ...(site.festival.enabled
    ? [{ label: site.festival.name, href: "#festival", id: "festival" }]
    : []),
  ...baseNavItems,
];

function TickerGroup() {
  return (
    <span className="ticker__group">
      {tickerItems.map((item) => (
        <span key={item}>
          {item} <span className="ticker__dot" aria-hidden="true">◆</span>
        </span>
      ))}
    </span>
  );
}

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeId, setActiveId] = useState<string>("");
  const menuPanelRef = useRef<HTMLDivElement | null>(null);
  const toggleBtnRef = useRef<HTMLButtonElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

  /* -------- Scroll state -------- */
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        setScrolled(window.scrollY > 14);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  /* -------- Active section -------- */
  useEffect(() => {
    const sections = navItems
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] }
    );
    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  /* -------- Body scroll lock -------- */
  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  /* -------- Hardware Back button closes drawer -------- */
  useEffect(() => {
    if (!menuOpen) return;

    // Push a sentinel state so the first Back press closes the drawer
    // instead of leaving the page.
    window.history.pushState({ mobileNav: true }, "");

    const onPopState = () => {
      setMenuOpen(false);
    };

    window.addEventListener("popstate", onPopState);
    return () => {
      window.removeEventListener("popstate", onPopState);
      // If the drawer was closed programmatically (burger, Escape, link click)
      // and the sentinel is still on the stack, pop it silently.
      if (window.history.state?.mobileNav) {
        window.history.back();
      }
    };
  }, [menuOpen]);

  /* -------- Escape closes -------- */
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        toggleBtnRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  /* -------- Focus first interactive element on open -------- */
  useEffect(() => {
    if (!menuOpen) return;
    // Focus the in-drawer close button (visible + predictable)
    closeBtnRef.current?.focus();
  }, [menuOpen]);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  const handleNavClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
      const id = href.slice(1);
      const target = document.getElementById(id);
      if (target) {
        e.preventDefault();
        const headerOffset = 90;
        const top = target.getBoundingClientRect().top + window.scrollY - headerOffset;
        window.scrollTo({ top, behavior: "smooth" });
        history.replaceState(null, "", href);
      }
      setMenuOpen(false);
    },
    []
  );

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <div className="ticker" aria-hidden="true">
        <div className="ticker__track">
          <TickerGroup />
          <TickerGroup />
        </div>
      </div>

      <header className={`site-header${scrolled ? " is-scrolled" : ""}${menuOpen ? " is-open" : ""}`}>
        <div className="container">
          <div className="nav__inner">
            <a href="#top" aria-label="Mobile House — back to top" className="nav__brand" onClick={closeMenu}>
              <BrandLockup />
            </a>

            <nav className="nav__links" aria-label="Main navigation">
              {navItems.map((item) => {
                const isActive = activeId === item.id;
                return (
                  <a
                    key={item.href}
                    className={`nav__link${isActive ? " is-active" : ""}`}
                    href={item.href}
                    onClick={(e) => handleNavClick(e, item.href)}
                    aria-current={isActive ? "true" : undefined}
                  >
                    {item.label}
                  </a>
                );
              })}
            </nav>

            <div className="nav__actions">
              <a className="nav__call" href={`tel:${store.phoneRaw}`} aria-label={`Call ${store.phoneDisplay}`}>
                <PhoneIcon />
                <span className="nav__call-text">{store.phoneDisplay}</span>
              </a>

              <a
                className="btn btn--small nav__wa"
                href={generalWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <WhatsAppIcon />
                <span className="nav__wa-text">WhatsApp</span>
              </a>

              <button
                ref={toggleBtnRef}
                type="button"
                className={`nav__burger${menuOpen ? " is-open" : ""}`}
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                aria-expanded={menuOpen}
                aria-controls="mobile-nav"
                onClick={() => setMenuOpen((v) => !v)}
              >
                <span aria-hidden="true" />
                <span aria-hidden="true" />
                <span aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <div
        id="mobile-nav"
        ref={menuPanelRef}
        className={`mobile-nav${menuOpen ? " is-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
        hidden={!menuOpen}
      >
        {/* NEW: in-drawer header with back/close button */}
        <div className="mobile-nav__head">
          <button
            ref={closeBtnRef}
            type="button"
            className="mobile-nav__back"
            aria-label="Back — close menu"
            onClick={closeMenu}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path
                d="M12.5 4.5 7 10l5.5 5.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>Back</span>
          </button>
          <span className="mobile-nav__title">Menu</span>
        </div>

        <nav className="mobile-nav__links" aria-label="Mobile navigation">
          {navItems.map((item) => {
            const isActive = activeId === item.id;
            return (
              <a
                key={item.href}
                href={item.href}
                className={`mobile-nav__link${isActive ? " is-active" : ""}`}
                onClick={(e) => handleNavClick(e, item.href)}
                aria-current={isActive ? "true" : undefined}
              >
                {item.label}
              </a>
            );
          })}
        </nav>

        <div className="mobile-nav__actions">
          <a className="btn btn--ghost" href={`tel:${store.phoneRaw}`}>
            <PhoneIcon />
            {store.phoneDisplay}
          </a>
          <a
            className="btn"
            href={generalWhatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <WhatsAppIcon />
            WhatsApp us
          </a>
        </div>
      </div>

      {menuOpen && (
        <button
          type="button"
          className="mobile-nav__backdrop"
          aria-label="Close menu"
          onClick={closeMenu}
        />
      )}
    </>
  );
}