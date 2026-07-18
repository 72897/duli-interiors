"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AuthNav } from "@/components/auth-nav";
import { BackButton } from "@/components/back-button";
import { getPortalRoot } from "@/lib/portal-root";

const CITIES = ["Delhi", "Mumbai", "Pune", "Bengaluru"];

/** Mega-menu contents. Every destination below is a real page. */
const DESIGN_MENU = [
  {
    heading: "Design",
    links: [
      { href: "/design", label: "Interior Design" },
      { href: "/style-quiz", label: "Know My Style" },
    ],
  },
  {
    heading: "Cities",
    links: CITIES.map((c) => ({
      href: `/projects?city=${encodeURIComponent(c)}`,
      label: c,
    })),
  },
];

// No entry is repeated across menus — each destination appears exactly once.
const RESOURCES_MENU = [
  {
    heading: "Explore",
    links: [
      { href: "/projects", label: "Recent Projects" },
      { href: "/ideas", label: "Design Ideas" },
    ],
  },
  {
    heading: "Company",
    links: [
      { href: "/about", label: "About Us" },
      { href: "/contact", label: "Contact Us" },
    ],
  },
];

const BUSINESS_MENU = [
  {
    heading: "Partner programmes",
    links: [
      { href: "/partners#execution", label: "Execution Partner" },
      { href: "/partners#design_studio", label: "Design Studio Partner" },
      { href: "/partners#affiliate", label: "Affiliate Partner" },
      { href: "/partners#education", label: "Education Partner" },
    ],
  },
  {
    heading: "Work with us",
    links: [
      { href: "/partners", label: "All programmes" },
      { href: "/partners#apply", label: "Apply now" },
    ],
  },
];

function SparkleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19 9l1.25-2.75L23 5l-2.75-1.25L19 1l-1.25 2.75L15 5l2.75 1.25L19 9zm-7.5.5L9 4 6.5 9.5 1 12l5.5 2.5L9 20l2.5-5.5L17 12l-5.5-2.5zM19 15l-1.25 2.75L15 19l2.75 1.25L19 23l1.25-2.75L23 19l-2.75-1.25L19 15z" />
    </svg>
  );
}

// Rendered via a portal straight onto <body> — #header has a backdrop-filter
// for its glass-pill look, and backdrop-filter (like transform/filter) makes
// an element a containing block for its position:fixed descendants. Nesting
// this drawer inside #header would clip "fixed; inset:0" to the pill's own
// small box instead of the viewport, so it has to live outside that subtree.
function MobileNavDrawer({
  open,
  citiesOpen,
  onToggleCities,
  onClose,
}: {
  open: boolean;
  citiesOpen: boolean;
  onToggleCities: () => void;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div className="mobile-nav-overlay">
      <div className="mobile-nav-topbar">
        <a href="/" className="logo-link" onClick={onClose}>
          <span className="logo-word">Duli</span>
        </a>
        <button type="button" className="mobile-nav-close" onClick={onClose}>
          Close
        </button>
      </div>
      <nav className="mobile-nav-list">
        <a href="/design" onClick={onClose}>Design</a>
        <div className={"mobile-nav-cities" + (citiesOpen ? " open" : "")}>
          <button type="button" className="mobile-nav-cities-trigger" aria-expanded={citiesOpen} onClick={onToggleCities}>
            Cities <span className="nav-caret">⌄</span>
          </button>
          <div className="mobile-nav-cities-panel">
            {CITIES.map((city) => (
              <a key={city} href="/#work" onClick={onClose}>
                {city}
              </a>
            ))}
          </div>
        </div>
        <a href="/style-quiz" onClick={onClose}>Know My Style</a>
        <a href="/our-work" onClick={onClose}>Our work</a>
        <a href="/pricing" onClick={onClose}>Pricing</a>
        <a href="/partners" onClick={onClose}>Partner With Us</a>
        <a href="/about" onClick={onClose}>About Us</a>
        <a href="/contact" onClick={onClose}>Contact Us</a>
        <a href="/ai-design" className="nav-ai" onClick={onClose}>
          AI Design <SparkleIcon />
        </a>
        {/* Account lives in the top-right corner circle on mobile — not here —
            so only one AccountDropdown is ever mounted. */}
      </nav>
    </div>
  );
}

export function SiteHeader() {
  // Which desktop dropdown is open: "design" | "resources" | null
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [citiesOpen, setCitiesOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  // Exactly ONE AuthNav/AccountDropdown mounts at a time — nav on desktop, the
  // corner circle on mobile. Two mounted instances each add a document
  // mousedown listener + a body portal, which stepped on each other's link
  // clicks. Gating the render (not just CSS-hiding) keeps only one alive.
  const [isMobile, setIsMobile] = useState(false);
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setPortalRoot(getPortalRoot());
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 760px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (menuOpen) return; // the mobile drawer manages its own toggles
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [menuOpen]);

  // Reuses Lenis's own "stopped" class (already defined in globals.css) to
  // freeze background scroll while the full-screen mobile menu is open.
  useEffect(() => {
    document.documentElement.classList.toggle("lenis-stopped", menuOpen);
    return () => document.documentElement.classList.remove("lenis-stopped");
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    const onResize = () => {
      if (window.innerWidth > 760) setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [menuOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenMenu(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const closeAll = () => {
    setMenuOpen(false);
    setCitiesOpen(false);
    setOpenMenu(null);
  };

  const renderMega = (
    id: string,
    label: string,
    groups: { heading: string; links: { href: string; label: string }[] }[],
  ) => (
    <div className={"nav-dropdown" + (openMenu === id && !menuOpen ? " open" : "")}>
      <button
        type="button"
        className="nav-dropdown-trigger"
        aria-expanded={openMenu === id}
        aria-haspopup="true"
        onClick={() => setOpenMenu((v) => (v === id ? null : id))}
      >
        {label} <span className="nav-caret">⌄</span>
      </button>
      <div className="nav-dropdown-panel nav-mega">
        {groups.map((g) => (
          <div className="nav-mega-col" key={g.heading}>
            <span className="nav-mega-heading">{g.heading}</span>
            {g.links.map((l) => (
              <a key={l.label + l.href} href={l.href} onClick={() => setOpenMenu(null)}>
                {l.label}
              </a>
            ))}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <header id="header">
      <BackButton />
      <a href="/" className="logo-link" onClick={closeAll}>
        <span className="logo-word">Duli</span>
      </a>

      <button
        type="button"
        className={"nav-toggle" + (menuOpen ? " open" : "")}
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((v) => !v)}
      >
        <span />
        <span />
        <span />
      </button>

      <nav ref={navRef}>
        {renderMega("design", "Design", DESIGN_MENU)}
        {renderMega("resources", "Resources", RESOURCES_MENU)}
        {renderMega("business", "Business", BUSINESS_MENU)}
        <a href="/pricing">Pricing</a>
        <a href="/ai-design" className="nav-ai">
          AI Design <SparkleIcon />
          <span className="nav-badge">Beta</span>
        </a>
        {/* Desktop only — the mobile corner circle owns the account on mobile. */}
        {!isMobile && <AuthNav />}
      </nav>

      {portalRoot &&
        createPortal(
          <MobileNavDrawer
            open={menuOpen}
            citiesOpen={citiesOpen}
            onToggleCities={() => setCitiesOpen((v) => !v)}
            onClose={closeAll}
          />,
          portalRoot,
        )}

      {/* Mobile-only account circle pinned to the screen's top-right corner.
          Portaled to <body> so it's viewport-fixed, not clipped by #header's
          backdrop-filter. Only mounted on mobile so there's never a second
          AccountDropdown fighting the desktop one for clicks. */}
      {portalRoot &&
        isMobile &&
        createPortal(
          <div className="mobile-account">
            <AuthNav />
          </div>,
          portalRoot,
        )}
    </header>
  );
}
