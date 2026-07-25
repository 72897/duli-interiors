import type { Metadata } from "next";
import { CustomCursor, SiteInteractions } from "@/components/site-interactions";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ScrollEngine } from "@/components/scroll-engine";
import { ConsultForm } from "@/components/consult-form";
import { DesignHero } from "@/components/design-hero";

const SHOWCASE_IMAGES = {
  main: "/assets/images/Modern%20kitchen.webp",
  top: "/assets/images/Cozy%20modern%20living%20room%20with%20natural%20light.webp",
  bottom: "/assets/images/bedroom%20with%20city%20view.webp"
};

export const metadata: Metadata = {
  title: "Design — Duli Interiors",
  description: "Every Duli design is modeled, measured, and shown to you in 3D before a single cut is made."
};

const MODEL_SPECS = [
  { label: "Dimensions", value: "220 × 95 × 80 cm" },
  { label: "Frame", value: "Solid hardwood" },
  { label: "Upholstery", value: "Performance weave" },
  { label: "Lead Time", value: "6–8 weeks" }
];

const PROCESS_ICON_PROPS = {
  width: 34,
  height: 34,
  viewBox: "0 0 32 32",
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true as const
};

const PROCESS_STEPS = [
  {
    label: "Concept & Brief",
    icon: (
      <svg {...PROCESS_ICON_PROPS}>
        <path d="M7 25l2-7 14-14a2.5 2.5 0 0 1 3.5 3.5L12.5 21.5z" />
        <path d="M21 7.5l3.5 3.5" />
      </svg>
    )
  },
  {
    label: "Material Selection",
    icon: (
      <svg {...PROCESS_ICON_PROPS}>
        <rect x="6" y="14" width="14" height="11" rx="1.5" />
        <rect x="12" y="8" width="14" height="11" rx="1.5" />
      </svg>
    )
  },
  {
    label: "Design Approval",
    icon: (
      <svg {...PROCESS_ICON_PROPS}>
        <path d="M10 4h12a2 2 0 0 1 2 2v20a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
        <path d="M12 4v-1a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1" />
        <path d="M11.5 17l3 3 6-7" />
      </svg>
    )
  },
  {
    label: "Build & Deliver",
    icon: (
      <svg {...PROCESS_ICON_PROPS}>
        <path d="M6 16l10-9 10 9" />
        <path d="M9 15v11h14V15" />
        <path d="M13 22l2.5 2.5L21 19" />
      </svg>
    )
  }
];

export default function DesignPage() {
  return (
    <>
      <link rel="preload" as="image" href="/assets/home%20page/Wardrobe.webp" />

      <CustomCursor />
      <SiteInteractions />
      <ScrollEngine />
      <SiteHeader />

      {/* ═══ HERO ═══ */}
      <DesignHero />

      {/* ═══ 3D SHOWCASE ═══ */}
      <section className="model-section" id="model">
        <div className="model-grid">
          <div className="model-visual">
            <div className="model-hero-stage">
              <model-viewer
                suppressHydrationWarning
                src="/3d/sofa-opt.glb"
                alt="3D model of the Duli lounge sofa"
                camera-controls
                auto-rotate
                rotation-per-second="14deg"
                shadow-intensity="1"
                exposure="0.95"
                interaction-prompt="none"
                loading="eager"
                reveal="auto"
              />
            </div>
            <p className="model-hint">Drag to rotate · Scroll to zoom</p>
          </div>

          <div className="model-text">
            <div data-reveal="up">
              <p className="model-eyebrow">Explore In 3D</p>
              <h2 className="model-hero-heading">The Duli Lounge Sofa</h2>
              <p className="model-hero-sub">
                Built on a solid hardwood frame with high-density foam and a performance weave that holds up to
                everyday life. The model stays put — keep scrolling to see what&apos;s underneath it.
              </p>
            </div>

            <div data-reveal="up">
              <h2 className="model-hero-heading">Crafted For Comfort.</h2>
              <p className="model-hero-sub">
                A high-density foam core wrapped in a performance weave that resists stains and spills, and holds
                its shape through years of everyday use.
              </p>
            </div>

            <div data-reveal="up">
              <h2 className="model-hero-heading">Built To Spec.</h2>
              <div className="model-specs">
                {MODEL_SPECS.map((s) => (
                  <div className="model-spec" key={s.label}>
                    <span className="model-spec-label">{s.label}</span>
                    <span className="model-spec-value">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div data-reveal="up">
              <h2 className="model-hero-heading">Ready When You Are.</h2>
              <p className="model-hero-sub" style={{ marginBottom: "24px" }}>
                We&apos;ll model your own pieces the same way before anything is built.
              </p>
              <a href="#contact" className="btn-solid">Enquire About This Piece</a>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FROM MODEL TO REALITY ═══ */}
      <section className="design-showcase-section">
        <div className="design-showcase-inner">
          <div className="design-showcase-text">
            <p className="wc-v2-eyebrow" data-reveal="up">From Model To Reality</p>
            <h2 className="wc-overview-v2-h2" data-reveal="up" data-delay="80">
              What You See Is What You Get.
            </h2>
            <p className="wc-overview-v2-text" data-reveal="up" data-delay="160" style={{ margin: "20px 0 32px" }}>
              Every render is built to true scale and finish before it ever reaches your home — so the piece that
              arrives on site looks exactly like the one you approved on screen, down to the grain and the stitch.
            </p>
            <div data-reveal="up" data-delay="220">
              <a href="/#work" className="btn-solid">
                See Real Projects
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>

          <div className="design-showcase-grid">
            <div className="design-showcase-cell design-showcase-cell-main" data-reveal="up">
              <img src={SHOWCASE_IMAGES.main} alt="A Duli-designed kitchen, built to its modeled specification" loading="lazy" />
            </div>
            <div className="design-showcase-cell design-showcase-cell-top" data-reveal="up" data-delay="80">
              <img src={SHOWCASE_IMAGES.top} alt="A Duli-designed living room, built to its modeled specification" loading="lazy" />
            </div>
            <div className="design-showcase-cell design-showcase-cell-bottom" data-reveal="up" data-delay="160">
              <img src={SHOWCASE_IMAGES.bottom} alt="A Duli-designed bedroom, built to its modeled specification" loading="lazy" />
            </div>
          </div>
        </div>
      </section>

      {/* ═══ PROCESS ═══ */}
      <section className="feature-section feature-tint">
        <div className="feature-inner">
          <h2 className="feature-heading" data-reveal="up">How We Design.</h2>
          <div className="feature-grid">
            {PROCESS_STEPS.map((step, i) => (
              <div className="feature-item" key={step.label} data-reveal="up" data-delay={i * 60}>
                <span className="feature-icon">{step.icon}</span>
                <p className="feature-label">{step.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="consult-section" id="contact">
        <div className="consult-inner">
          <div data-reveal="up">
            <h2 className="consult-heading">Let&apos;s Bring Your Space To Life.</h2>
            <p className="consult-sub">
              Tell us about your space — we&apos;ll model it before we build it.
            </p>
          </div>
          <ConsultForm />
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
