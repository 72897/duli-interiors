"use client";

import { motion } from "motion/react";

const GALLERY_IMAGES = [
  "/assets/home%20page/Living%20Room.webp",
  "/assets/home%20page/Bedroom.webp",
  "/assets/home%20page/Kitchen.webp",
  "/assets/home%20page/Wardrobe.webp"
];

const IMG_LIVING = "/assets/home%20page/Living%20Room.webp";
const IMG_BEDROOM = "/assets/home%20page/Bedroom.webp";
const IMG_WARDROBE = "/assets/home%20page/Wardrobe.webp";
const IMG_LOUNGE = "/assets/home%20page/extra.webp";
const IMG_ENTRYWAY = "/assets/images/Elegant%20Mediterranean%20entryway%20with%20warm%20tones.webp";
const IMG_HOME_OFFICE = "/assets/images/Luxurious%20modern%20home%20office%20setup.webp";

function GalleryShowcase() {
  return (
    <section className="about-gallery-section">
      <div className="about-gallery-inner">
        <div className="about-gallery-text">
          <p className="wc-v2-eyebrow" data-reveal="up">Real Projects, Real Homes</p>
          <h2 className="wc-overview-v2-h2" data-reveal="up" data-delay="80">
            Crafted For The Way You Actually Live.
          </h2>
          <p className="wc-overview-v2-text" data-reveal="up" data-delay="160" style={{ margin: "20px 0 32px" }}>
            Every space we deliver starts with how a family really uses a room — not just how it photographs. From
            kitchens built for daily life to bedrooms designed for rest, our work is judged by how it holds up after
            move-in.
          </p>
          <div data-reveal="up" data-delay="220">
            <a href="/#work" className="btn-solid">
              See Our Work
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>

        <div className="about-gallery-grid">
          {GALLERY_IMAGES.map((src, i) => (
            <div key={src} className={"about-gallery-cell about-gallery-cell-" + (i + 1)} data-reveal="up" data-delay={i * 70}>
              <img src={src} alt="Duli-designed interior" loading="lazy" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const PROCESS_STEPS = [
  { num: "01", title: "Understand the Space", body: "We begin by understanding your space, requirement, budget, timeline, and style preference." },
  { num: "02", title: "Plan the Scope", body: "We define what needs to be done, what materials are required, and what sequence of work should be followed." },
  { num: "03", title: "Share a Clear Quote", body: "We provide a transparent quotation with scope, pricing, and execution details." },
  { num: "04", title: "Execute with Supervision", body: "Our team coordinates the site work, vendors, materials, and progress updates." },
  { num: "05", title: "Final Quality Check", body: "Before handover, we review finishing, functionality, and pending corrections." }
];

function ProcessStep({ step, index }: { step: (typeof PROCESS_STEPS)[0]; index: number }) {
  return (
    <div className="wc-feat-item" data-reveal="up" data-delay={index * 70}>
      <span className="wc-feat-icon about-step-num">{step.num}</span>
      <div className="wc-feat-body">
        <div className="wc-feat-row">
          <h3 className="wc-feat-label">{step.title}</h3>
        </div>
        <p className="wc-feat-desc">{step.body}</p>
      </div>
    </div>
  );
}

const TRUST_REASONS = [
  {
    num: "01",
    title: "Complete Interior Solutions",
    body: "From painting, furniture, modular work, carpentry, false ceiling, electrical, plumbing, waterproofing, décor, and office fit-outs — we handle everything under one roof.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 13.5L16 4l12 9.5V28H4V13.5z" /><rect x="11" y="20" width="10" height="8" rx="1" />
      </svg>
    )
  },
  {
    num: "02",
    title: "Clear Written Quotations",
    body: "No vague estimates. We provide clear scope, material details, timelines, and pricing before work begins — so you know exactly what you are paying for.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9 4h14v24l-3-2-3 2-3-2-3 2-2-2V4z" /><path d="M12.5 10h7M12.5 15h7M12.5 20h4" />
      </svg>
    )
  },
  {
    num: "03",
    title: "Verified Execution Partners",
    body: "We work with selected contractors, designers, carpenters, painters, and site teams who are evaluated for skill, finishing, reliability, and discipline.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="16" cy="11" r="5" /><path d="M6 27c0-6 4.5-10 10-10s10 4 10 10" />
      </svg>
    )
  },
  {
    num: "04",
    title: "Quality-Focused Supervision",
    body: "A Duli Interiors representative monitors the work, coordinates vendors, checks quality, and keeps the project moving.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="16" cy="16" r="11" /><path d="M11 16.5l3.2 3.2L21.5 12" />
      </svg>
    )
  },
  {
    num: "05",
    title: "Design + Practical Execution",
    body: "We balance good design with real-world execution. Your space should look good, function well, and remain practical for daily use.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M7 25l2-7 14-14a2.5 2.5 0 013.5 3.5L12.5 21.5z" /><path d="M21 7.5l3.5 3.5" />
      </svg>
    )
  },
  {
    num: "06",
    title: "Transparent Project Updates",
    body: "We keep clients informed through site updates, progress photos, and regular communication so there are fewer surprises.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M6 9l2 2 4-4" /><path d="M16 10h10" /><path d="M6 16l2 2 4-4" /><path d="M16 17h10" /><path d="M6 23l2 2 4-4" opacity=".35" /><path d="M16 24h10" opacity=".35" />
      </svg>
    )
  },
  {
    num: "07",
    title: "Material Guidance",
    body: "We help you choose the right materials based on budget, durability, appearance, and maintenance — not just looks.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="11" y="9" width="15" height="11" rx="1.5" /><rect x="6" y="14" width="15" height="11" rx="1.5" />
      </svg>
    )
  },
  {
    num: "08",
    title: "Timely Handover Mindset",
    body: "Interior projects often get delayed because no one takes ownership. Duli Interiors works with defined timelines and active follow-up.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="5" y="8" width="22" height="19" rx="2" /><path d="M5 14h22M11 5v6M21 5v6" />
      </svg>
    )
  }
];

function TrustReasonItem({ reason, index }: { reason: (typeof TRUST_REASONS)[0]; index: number }) {
  return (
    <div className="wc-feat-item" data-reveal="up" data-delay={(index % 2) * 80}>
      <span className="wc-feat-icon">{reason.icon}</span>
      <div className="wc-feat-body">
        <div className="wc-feat-row">
          <h3 className="wc-feat-label">{reason.title}</h3>
          <span className="wc-feat-num">{reason.num}</span>
        </div>
        <p className="wc-feat-desc">{reason.body}</p>
      </div>
    </div>
  );
}

const APPROACH_STATS = ["Coordinated Team", "Clear Quotation", "Execution Partner"];

export function AboutContent() {
  return (
    <>
      {/* ── WHO WE ARE ── */}
      <section className="wc-overview-v2">
        <div className="wc-overview-v2-inner">
          <div>
            <div data-reveal="up">
              <p className="wc-v2-eyebrow">About The Studio</p>
              <h2 className="wc-overview-v2-h2">Who We Are</h2>
              <div className="wc-v2-brass-line" />
            </div>
            <div data-reveal="up" data-delay="120">
              <p className="wc-overview-v2-text" style={{ marginTop: "24px", marginBottom: "20px" }}>
                Duli Interiors was created for clients who want more than just ideas on paper. We focus on real
                execution — the actual work that happens on site. Whether it is a full home interior, office setup,
                renovation, painting, modular furniture, carpentry, false ceiling, or finishing work, our approach is
                based on clarity, quality, and accountability.
              </p>
              <p className="wc-overview-v2-text">
                We work with homeowners, businesses, builders, property owners, and commercial clients who need
                dependable interiors delivered with proper planning and supervision.
              </p>
            </div>
          </div>
          <div className="about-split-image" data-reveal="up" data-delay="160">
            <img src={IMG_ENTRYWAY} alt="An elegant Duli-designed entryway" loading="lazy" />
          </div>
        </div>
      </section>

      <GalleryShowcase />

      {/* ── WHAT WE DO ── */}
      <section className="wc-overview-v2" style={{ paddingTop: 0 }}>
        <div className="wc-overview-v2-inner">
          <div className="about-split-image" data-reveal="up" data-delay="160">
            <img src={IMG_HOME_OFFICE} alt="A Duli-designed home office" loading="lazy" />
          </div>
          <div>
            <div data-reveal="up">
              <p className="wc-v2-eyebrow">Our Services</p>
              <h2 className="wc-overview-v2-h2">What We Do</h2>
              <div className="wc-v2-brass-line" />
            </div>
            <div data-reveal="up" data-delay="120">
              <p className="wc-overview-v2-text" style={{ marginTop: "24px", marginBottom: "20px" }}>
                We provide complete interior and renovation services for homes and commercial spaces. Our services
                include interior design, furniture, modular work, painting, wall finishes, false ceiling, electrical,
                plumbing, waterproofing, décor, repairs, and office fit-outs.
              </p>
              <p className="wc-overview-v2-text">
                Our role is to understand the client&apos;s requirement, prepare a clear scope, coordinate the right
                professionals, manage execution, and deliver a finished space that is functional, attractive, and
                durable.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── OUR APPROACH / PROCESS ── */}
      <section className="wc-feats-section feature-tint">
        <div className="feature-inner">
          <div className="about-split about-split-intro">
            <div>
              <p className="wc-v2-eyebrow" data-reveal="up">Our Approach</p>
              <h2 className="wc-feats-h2" data-reveal="up" data-delay="60" style={{ margin: "0 0 24px" }}>
                A Structured Process, Start To Finish
              </h2>
              <p
                className="wc-overview-v2-text"
                data-reveal="up"
                data-delay="120"
                style={{ marginBottom: "clamp(28px,3.4vw,40px)" }}
              >
                We believe good interiors need three things: good design, good materials, and good execution.
                Missing any one of these leads to poor results. That is why Duli Interiors follows a structured
                process from the first discussion to final handover — giving you one coordinated team, one clear
                quotation, and one responsible execution partner.
              </p>
              <div className="wc-v2-stats" data-reveal="up" data-delay="180" style={{ marginTop: 0 }}>
                {APPROACH_STATS.map((label, i) => (
                  <div className="wc-stat-pill" key={label}>
                    <span className="wc-stat-pill-badge">{i + 1}</span>
                    <span className="wc-stat-pill-label">{label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="about-split-image" data-reveal="up" data-delay="200">
              <img src={IMG_BEDROOM} alt="A Duli-designed bedroom" loading="lazy" />
            </div>
          </div>

          <div className="wc-feats-grid">
            {PROCESS_STEPS.map((step, i) => (
              <ProcessStep key={step.num} step={step} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── EIGHT REASONS TO TRUST DULI ── */}
      <section className="wc-feats-section">
        <div className="feature-inner">
          <div className="about-split about-split-intro">
            <div className="about-split-image" data-reveal="up">
              <img src={IMG_WARDROBE} alt="A Duli-designed wardrobe and storage" loading="lazy" />
            </div>
            <div>
              <p className="wc-v2-eyebrow" data-reveal="up" data-delay="80">Why Choose Us</p>
              <h2 className="wc-feats-h2" data-reveal="up" data-delay="140" style={{ margin: 0 }}>
                Eight Reasons to Trust Duli
              </h2>
            </div>
          </div>

          <div className="wc-feats-grid" style={{ marginTop: "clamp(40px,5vw,64px)" }}>
            {TRUST_REASONS.map((reason, i) => (
              <TrustReasonItem key={reason.num} reason={reason} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── MISSION / VISION ── */}
      <section className="about-mv-section">
        <div className="about-mv-grid">
          <div className="about-mv-image" data-reveal="up">
            <img src={IMG_LIVING} alt="A Duli-designed living room" loading="lazy" />
          </div>
          <div className="about-mv-card" data-reveal="up" data-delay="80">
            <p className="wc-v2-eyebrow">Our Mission</p>
            <p className="about-mv-text">
              To make interior work more trustworthy, transparent, and professionally managed for Indian homes and
              businesses.
            </p>
          </div>
          <div className="about-mv-card" data-reveal="up" data-delay="160">
            <p className="wc-v2-eyebrow">Our Vision</p>
            <p className="about-mv-text">
              To become a reliable interior execution brand known for practical design, honest communication, strong
              supervision, and dependable project delivery.
            </p>
          </div>
        </div>
      </section>

      {/* ── WHAT MAKES US DIFFERENT ── */}
      <section className="wc-promise-v2">
        <img src={IMG_LOUNGE} alt="" className="wc-promise-v2-bg" aria-hidden="true" loading="lazy" />
        <div className="wc-promise-v2-scrim" />
        <div className="wc-promise-v2-quote">&ldquo;</div>
        <motion.div
          className="wc-v2-ring wc-v2-ring-a"
          animate={{ rotate: 360 }}
          transition={{ duration: 70, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="wc-v2-ring wc-v2-ring-b"
          animate={{ rotate: -360 }}
          transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
        />
        <div className="wc-promise-v2-inner">
          <p className="wc-v2-eyebrow" data-reveal="up" style={{ color: "rgba(255,234,220,0.6)" }}>
            What Makes Us Different
          </p>
          <h2 className="wc-promise-v2-h2" data-reveal="up" data-delay="80">
            Execution Discipline, Not Just Design.
          </h2>
          <p className="wc-promise-v2-text" data-reveal="up" data-delay="160">
            Many interior projects fail not because of bad design, but because of weak execution. Duli Interiors
            is built around execution discipline. We focus on site coordination, material clarity, vendor
            accountability, daily progress, and final finishing.
          </p>
          <p
            className="wc-promise-v2-text"
            data-reveal="up"
            data-delay="220"
            style={{ marginTop: "-24px", fontWeight: 600, color: "var(--ivory)" }}
          >
            Our aim is not to overpromise. Our aim is to deliver what is agreed.
          </p>
        </div>
      </section>

      {/* ── CLOSING CTA ── */}
      <section className="wc-cta-v2">
        <img src={IMG_LIVING} alt="" className="wc-cta-v2-bg" aria-hidden="true" loading="lazy" />
        <div className="wc-cta-v2-scrim" />
        <motion.div
          className="wc-cta-v2-blob"
          animate={{ scale: [1, 1.08, 1], opacity: [0.06, 0.11, 0.06] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="wc-cta-v2-inner">
          <h2 className="wc-cta-v2-h2" data-reveal="up">Let&apos;s Build Your Space Properly</h2>
          <p className="wc-cta-v2-text" data-reveal="up" data-delay="100">
            Whether you are renovating a room, setting up an office, or planning complete home interiors, Duli
            Interiors can help you plan and execute the work with clarity.
          </p>
          <div className="wc-cta-v2-buttons" data-reveal="up" data-delay="180">
            <motion.a
              href="/#contact"
              className="btn-solid"
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 380, damping: 22 }}
            >
              Start Your Project
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </motion.a>
          </div>
        </div>
      </section>
    </>
  );
}
