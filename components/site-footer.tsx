"use client";

import { useState } from "react";
import { submitToWeb3Forms } from "@/lib/web3forms";

function InstagramIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function LinkedinIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <line x1="7.5" y1="10.5" x2="7.5" y2="17" />
      <circle cx="7.5" cy="7" r="0.4" fill="currentColor" />
      <path d="M11.5 17v-3.6c0-1.6 1-2.4 2.2-2.4 1.2 0 2 .8 2 2.4V17" />
      <line x1="11.5" y1="10.5" x2="11.5" y2="17" />
    </svg>
  );
}

function YoutubeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="3" y="5.5" width="18" height="13" rx="4" />
      <path d="M10.5 9.5l5 2.5-5 2.5v-5z" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M14 21v-7h2.5l.5-3H14V9c0-.9.3-1.5 1.6-1.5H17V4.8c-.3 0-1.3-.1-2.4-.1-2.4 0-4.1 1.5-4.1 4.2V11H8v3h2.5v7H14z" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 2L11 13" />
      <path d="M22 2l-7 20-4-9-9-4 20-7z" />
    </svg>
  );
}

export function SiteFooter() {
  const [newsletterStatus, setNewsletterStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const onNewsletterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const email = String(new FormData(form).get("email") || "");
    if (!email) return;

    setNewsletterStatus("sending");
    try {
      await submitToWeb3Forms(
        "New Newsletter Signup — Duli Interiors",
        `Email: ${email}`,
        "Duli Interiors — Newsletter"
      );
      setNewsletterStatus("sent");
      form.reset();
    } catch {
      setNewsletterStatus("error");
    }
  };

  return (
    <footer
      className="site-footer"
      style={{
        background: "var(--primary)",
        color: "var(--white)",
        padding: "clamp(30px,3.2vw,44px) clamp(20px,4.5vw,70px) clamp(18px,2.2vw,26px)"
      }}
    >
      <div style={{ maxWidth: "1680px", margin: "0 auto" }}>
        <div className="footer-grid">
          <div className="footer-col footer-col-brand" data-reveal="up">
            <span className="footer-logo-word">Duli</span>
            <p className="footer-tagline">
              Designing homes people love living in. Premium interiors with complete transparency.
            </p>
            <p className="footer-heading" style={{ marginTop: "30px" }}>Newsletter</p>
            <form className="footer-newsletter" onSubmit={onNewsletterSubmit}>
              <input
                type="email"
                name="email"
                placeholder="Your email address"
                required
                aria-label="Email address"
                disabled={newsletterStatus === "sending" || newsletterStatus === "sent"}
              />
              <button type="submit" aria-label="Subscribe" disabled={newsletterStatus === "sending" || newsletterStatus === "sent"}>
                <SendIcon />
              </button>
            </form>
            {newsletterStatus === "sent" && (
              <p style={{ fontSize: "12px", color: "rgba(255,255,255,.55)", marginTop: "8px" }}>Subscribed — thank you!</p>
            )}
            {newsletterStatus === "error" && (
              <p style={{ fontSize: "12px", color: "#e07070", marginTop: "8px" }}>Something went wrong. Please try again.</p>
            )}
          </div>
          <div className="footer-col" data-reveal="up" data-delay="80">
            <p className="footer-heading">Explore</p>
            <a href="/design" className="footer-link">Design</a>
            <a href="/about" className="footer-link">About Us</a>
            <a href="/ai-design" className="footer-link">AI Design</a>
          </div>
          <div className="footer-col" data-reveal="up" data-delay="140">
            <p className="footer-heading">Cities</p>
            <a href="/#work" className="footer-link">Delhi</a>
            <a href="/#work" className="footer-link">Mumbai</a>
            <a href="/#work" className="footer-link">Pune</a>
            <a href="/#work" className="footer-link">Bengaluru</a>
          </div>
          <div className="footer-col" data-reveal="up" data-delay="200">
            <p className="footer-heading">Connect</p>
            <a href="mailto:info@duliinteriors.com" className="footer-link">info@duliinteriors.com</a>
            <div className="footer-social-row">
              <a href="https://www.instagram.com/duliinteriors" target="_blank" rel="noopener noreferrer" className="footer-social-btn" title="Instagram" aria-label="Instagram">
                <InstagramIcon />
              </a>
              <a href="https://www.facebook.com/duliinteriors" target="_blank" rel="noopener noreferrer" className="footer-social-btn" title="Facebook" aria-label="Facebook">
                <FacebookIcon />
              </a>
              <a href="https://www.linkedin.com/company/duliinteriors/" target="_blank" rel="noopener noreferrer" className="footer-social-btn" title="LinkedIn" aria-label="LinkedIn">
                <LinkedinIcon />
              </a>
              <a href="https://www.youtube.com/@duliinteriors" target="_blank" rel="noopener noreferrer" className="footer-social-btn" title="YouTube" aria-label="YouTube">
                <YoutubeIcon />
              </a>
            </div>
          </div>
        </div>

        <div
          className="footer-bottom-row"
          style={{
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
            paddingTop: "clamp(16px,2vw,22px)",
            fontSize: "13px",
            letterSpacing: ".04em",
            color: "rgba(255,255,255,.5)"
          }}
        >
          <span>© 2025 Duli Interiors. All rights reserved.</span>
          <a href="/#hero" className="footer-link">Back to top ↑</a>
        </div>
      </div>
    </footer>
  );
}
