import { CustomCursor, SiteInteractions } from "@/components/site-interactions";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ScrollEngine } from "@/components/scroll-engine";
import { BeforeAfterSlider } from "@/components/before-after-slider";
import { ConsultForm } from "@/components/consult-form";
import { ProjectGallery } from "@/components/project-gallery";
import { Testimonials } from "@/components/testimonials";
import { SplitText } from "@/components/split-text";

const FEATURE_ICON_PROPS = {
  width: 26,
  height: 26,
  viewBox: "0 0 32 32",
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true as const
};

const NEXT_FEATURES = [
  {
    label: "Track Materials",
    icon: (
      <svg {...FEATURE_ICON_PROPS}>
        <rect x="11" y="9" width="15" height="11" rx="1.5" />
        <rect x="6" y="14" width="15" height="11" rx="1.5" />
      </svg>
    )
  },
  {
    label: "Track Timelines",
    icon: (
      <svg {...FEATURE_ICON_PROPS}>
        <rect x="5" y="8" width="22" height="19" rx="2" />
        <path d="M5 14h22M11 5v6M21 5v6" />
      </svg>
    )
  },
  {
    label: "Track Progress",
    icon: (
      <svg {...FEATURE_ICON_PROPS}>
        <path d="M6 9l2 2 4-4" />
        <path d="M16 10h10" />
        <path d="M6 16l2 2 4-4" />
        <path d="M16 17h10" />
        <path d="M6 23l2 2 4-4" opacity=".35" />
        <path d="M16 24h10" opacity=".35" />
      </svg>
    )
  },
  {
    label: "Approve Decisions Faster",
    icon: (
      <svg {...FEATURE_ICON_PROPS}>
        <circle cx="16" cy="16" r="11" />
        <path d="M11 16.5l3.2 3.2L21.5 12" />
      </svg>
    )
  }
];

const BETTER_FEATURES = [
  {
    label: "Transparent Pricing",
    icon: (
      <svg {...FEATURE_ICON_PROPS}>
        <path d="M9 4h14v24l-3-2-3 2-3-2-3 2-2-2V4z" />
        <path d="M12.5 10h7M12.5 15h7M12.5 20h4" />
      </svg>
    )
  },
  {
    label: "Dedicated Project Manager",
    icon: (
      <svg {...FEATURE_ICON_PROPS}>
        <circle cx="16" cy="11" r="5" />
        <path d="M6 27c0-6 4.5-10 10-10s10 4 10 10" />
      </svg>
    )
  },
  {
    label: "End-to-End Execution",
    icon: (
      <svg {...FEATURE_ICON_PROPS}>
        <circle cx="16" cy="16" r="4.5" />
        <path d="M16 4v4M16 24v4M4 16h4M24 16h4M7.5 7.5l2.8 2.8M21.7 21.7l2.8 2.8M24.5 7.5l-2.8 2.8M9.8 21.7l-2.8 2.8" />
      </svg>
    )
  },
  {
    label: "On-Time Delivery",
    icon: (
      <svg {...FEATURE_ICON_PROPS}>
        <circle cx="13" cy="16" r="9" />
        <path d="M13 10.5v5.5l4 2.5" />
        <circle cx="24" cy="23" r="5.5" />
        <path d="M21.7 23l1.3 1.3 3-3.3" />
      </svg>
    )
  }
];

const CATEGORIES = ["Living Rooms", "Bedrooms", "Kitchens", "Wardrobes", "Bathrooms", "Dining Areas", "Home Offices"];

const REAL_LIFE_ICON_PROPS = {
  width: 50,
  height: 50,
  viewBox: "0 0 64 64",
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true as const
};

const REAL_LIFE_ITEMS = [
  {
    title: "Daily Routines",
    desc: "Layouts planned around mornings, workdays, evenings, and everyday movement.",
    icon: (
      <svg {...REAL_LIFE_ICON_PROPS}>
        <path d="M6 31 20 19 34 31" />
        <path d="M10 31V50H30V31" />
        <path d="M17 50V39H23V50" />
        <circle cx="47" cy="18" r="6.5" />
        <path d="M47 5v4M47 27v4M33 18h4M57 18h4M37.7 8.7l2.8 2.8M53.5 8.7l-2.8 2.8M37.7 27.3l2.8-2.8M53.5 27.3l-2.8-2.8" />
      </svg>
    )
  },
  {
    title: "Pet-Friendly Living",
    desc: "Durable finishes, fabrics, and surfaces that handle paws, spills, and play.",
    icon: (
      <svg {...REAL_LIFE_ICON_PROPS}>
        <circle cx="16" cy="21" r="7" />
        <path d="M10 16c-2-3-1.5-7 1.5-8.5" />
        <ellipse cx="22" cy="35" rx="15" ry="11" />
        <path d="M19 41v9M28 41v9" />
        <path d="M37 32c4-1.5 7.5 1.5 6.5 5.5" />
      </svg>
    )
  },
  {
    title: "Senior-Safe Comfort",
    desc: "Clear circulation, safe surfaces, and comfort for every generation at home.",
    icon: (
      <svg {...REAL_LIFE_ICON_PROPS}>
        <circle cx="26" cy="11" r="6" />
        <path d="M23 17c-2.5 4-2.5 9-4 13" />
        <path d="M19 30 14 50" />
        <path d="M23 30l3 20" />
        <path d="M27 19l11 6.5" />
        <path d="M38 25.5V50" />
      </svg>
    )
  },
  {
    title: "Built Around You",
    desc: "Furniture, lighting, storage, and finishes shaped around how your family lives.",
    icon: (
      <svg {...REAL_LIFE_ICON_PROPS}>
        <path d="M11 39v-7c0-3.3 2.7-6 6-6h14c3.3 0 6 2.7 6 6v7" />
        <path d="M8 39h32v8a4 4 0 0 1-4 4H12a4 4 0 0 1-4-4z" />
        <path d="M8 39v6M40 39v6" />
        <path d="M48 18v33" />
        <path d="M40 14h16l-3.5 9h-9z" />
      </svg>
    )
  },
  {
    title: "Family-First Design",
    desc: "Proportions and details that make the home calmer, warmer, and easier to use.",
    icon: (
      <svg {...REAL_LIFE_ICON_PROPS}>
        <circle cx="32" cy="33" r="22" />
        <circle cx="25" cy="21" r="5" />
        <path d="M25 26v15" />
        <path d="M18 22l7 4.5M32 22l-7 4.5" />
        <path d="M21 41l4-8M29 41l-4-8" />
        <circle cx="39" cy="27" r="3.6" />
        <path d="M39 30.6v9.4" />
        <path d="M34.5 27l4.5 3.6M43.5 27l-4.5 3.6" />
        <path d="M36 41l3-5.6M42 41l-3-5.6" />
      </svg>
    )
  }
];

const REAL_LIFE_PARA_LINES = [
  "Every home moves to its own rhythm — quick mornings, slow evenings,",
  "and the small routines in between. We design around how your family",
  "actually lives, shaping rooms that adapt to pets, elders, and children",
  "with the same quiet, lasting ease."
];

export default function Home() {
  return (
    <>
      {/* Preload the LCP hero image before any JS runs */}
      <link rel="preload" as="image" href="/assets/home%20page/extra.webp" />

      <CustomCursor />
      <SiteInteractions />
      <ScrollEngine />

      {/* ═══ HEADER ═══ */}
      <SiteHeader />

      {/* ═══ SECTION 1 — HERO ═══ */}
      <section id="hero">
        <div id="hero-bg">
          <img src="/assets/home%20page/extra.webp" alt="A sunlit living room with city skyline views" fetchPriority="high" loading="eager" />
        </div>
        <div className="hero-overlay" />
        <div className="hero-content">
          <h1
            style={{
              margin: "0 0 clamp(18px,2.5vw,28px)",
              fontWeight: 700,
              lineHeight: 1.02,
              letterSpacing: "-.03em",
              fontSize: "clamp(40px,6.4vw,98px)",
              maxWidth: "18ch",
              perspective: "600px"
            }}
          >
            <SplitText text="Designing Homes People Love Living In." />
          </h1>
          <p
            data-reveal="up"
            data-delay="100"
            style={{ margin: "0 0 clamp(28px,3.5vw,40px)", maxWidth: "40ch", fontSize: "clamp(18px,1.8vw,25px)", lineHeight: 1.5, color: "rgba(255,255,255,.82)" }}
          >
            Premium interiors with complete <span id="hero-cycle">transparency</span>.
          </p>
          <div data-reveal="up" data-delay="200" style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            <a href="#contact" className="btn-solid">Start Your Project</a>
            <a href="/style-quiz" className="btn-ghost">Know My Style</a>
          </div>
        </div>
      </section>

      {/* ═══ SECTION 2 — STATEMENT ═══ */}
      <section style={{ padding: "clamp(64px,9vw,124px) clamp(20px,4.5vw,70px)", textAlign: "center" }}>
        <h2
          data-reveal="up"
          style={{
            margin: "0 auto clamp(24px,3vw,40px)",
            maxWidth: "20ch",
            fontWeight: 700,
            lineHeight: 1.06,
            letterSpacing: "-.03em",
            fontSize: "clamp(30px,5vw,70px)"
          }}
        >
          5-Star Interior Design, Built Around Your Life.
        </h2>
        <div
          data-reveal="up"
          data-delay="120"
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "clamp(18px,3vw,40px)",
            fontSize: "clamp(12px,1.2vw,15px)",
            letterSpacing: ".22em",
            textTransform: "uppercase",
            fontWeight: 600,
            color: "var(--olive)"
          }}
        >
          <span>Design.</span>
          <span>Build.</span>
          <span>Deliver.</span>
        </div>
      </section>

      {/* ═══ SECTION 2.5 — DESIGNED AROUND REAL LIFE ═══ */}
      <section className="real-life-section" id="real-life">
        <div className="real-life-inner">
          <h2 className="real-life-heading">Designed Around Real Life</h2>
          <p className="real-life-para">
            {REAL_LIFE_PARA_LINES.map((line) => (
              <span className="real-life-line" key={line}>
                {line}
              </span>
            ))}
          </p>
          <div className="real-life-row">
            <svg className="real-life-line-svg" preserveAspectRatio="none" aria-hidden="true">
              <path id="real-life-path" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {REAL_LIFE_ITEMS.map((item) => (
              <div className="real-life-item" key={item.title}>
                <div className="real-life-icon">{item.icon}</div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SECTIONS 3–5 — PINNED PROJECT CROSS-FADE ═══ */}
      <section id="projects" className="project-scene">
        <div className="project-scene-stage">
          <div className="project-scene-layer">
            <div className="project-banner-img">
              <picture>
                <source media="(max-width:900px)" srcSet="/before%20and%20after/s1,2.png" />
                <img src="/assets/home%20page/Living%20Room.webp" alt="A thoughtfully designed living room with warm evening lighting" loading="eager" />
              </picture>
            </div>
            <div className="project-banner-overlay" />
            <div className="project-banner-content">
              <h2 style={{ margin: 0, fontWeight: 700, lineHeight: 1, letterSpacing: "-.03em", fontSize: "clamp(32px,5.5vw,80px)" }}>
                Thoughtfully Designed.
              </h2>
              <a href="#work" className="btn-solid">View Project</a>
            </div>
          </div>
          <div className="project-scene-layer">
            <div className="project-banner-img">
              <picture>
                <source media="(max-width:900px)" srcSet="/assets/images/Cozy%20pastel%20kids'%20room%20with%20modern%20touches.webp" />
                <img src="/assets/home%20page/Kitchen.webp" alt="An expertly executed kitchen with natural daylight" loading="lazy" />
              </picture>
            </div>
            <div className="project-banner-overlay" />
            <div className="project-banner-content">
              <h2 style={{ margin: 0, fontWeight: 700, lineHeight: 1, letterSpacing: "-.03em", fontSize: "clamp(32px,5.5vw,80px)" }}>
                Expertly Executed.
              </h2>
            </div>
          </div>
          <div className="project-scene-layer">
            <div className="project-banner-img">
              <picture>
                <source media="(max-width:900px)" srcSet="/before%20and%20after/s4,2.png" />
                <img src="/assets/home%20page/Bedroom.webp" alt="A bedroom delivered with transparent craftsmanship and warm morning light" loading="lazy" />
              </picture>
            </div>
            <div className="project-banner-overlay" />
            <div className="project-banner-content">
              <h2 style={{ margin: 0, fontWeight: 700, lineHeight: 1, letterSpacing: "-.03em", fontSize: "clamp(32px,5.5vw,80px)" }}>
                Delivered With Transparency.
              </h2>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SECTION 6 — CATEGORIES ═══ */}
      <section style={{ maxWidth: "1680px", margin: "0 auto", padding: "clamp(56px,7vw,108px) clamp(20px,4.5vw,70px)" }}>
        <h2
          data-reveal="up"
          style={{
            margin: "0 0 clamp(40px,5vw,72px)",
            fontWeight: 700,
            lineHeight: 1.04,
            letterSpacing: "-.03em",
            fontSize: "clamp(30px,5vw,68px)"
          }}
        >
          Every Detail Considered.
        </h2>
        <div style={{ borderTop: "1px solid var(--stone)" }}>
          {CATEGORIES.map((cat, i) => (
            <a key={cat} href="#contact" className="category-row" data-reveal="up" data-delay={i * 50}>
              <span className="category-num">{String(i + 1).padStart(2, "0")}</span>
              <span className="category-label">{cat}</span>
              <span className="category-arrow">↗</span>
            </a>
          ))}
        </div>
      </section>

      {/* ═══ SECTION 6.5 — RECENT PROJECTS (HORIZONTAL GALLERY) ═══ */}
      <section className="gallery-section" id="work">
        <div className="gallery-head" data-reveal="up">
          <h2 className="gallery-heading">Recent Projects.</h2>
          <p className="gallery-sub">A closer look at homes we&apos;ve designed, built, and delivered across India.</p>
        </div>
        <ProjectGallery />
      </section>

      {/* ═══ SECTION 7 — SEE WHAT HAPPENS NEXT ═══ */}
      <section className="feature-section">
        <div className="feature-head">
          <p className="feature-eyebrow">The Process</p>
          <h2 className="feature-heading" data-reveal="up">See What Happens Next.</h2>
        </div>
        <div className="feature-grid">
          {NEXT_FEATURES.map((f, i) => (
            <div className="feature-item" key={f.label} data-reveal="up" data-delay={i * 60}>
              <span className="feature-num">{String(i + 1).padStart(2, "0")}</span>
              <span className="feature-icon-ring">
                <span className="feature-icon">{f.icon}</span>
              </span>
              <p className="feature-label">{f.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ SECTION 8 — A BETTER WAY TO DESIGN YOUR HOME ═══ */}
      <section className="feature-section feature-tint">
        <div className="feature-inner">
          <div className="feature-head">
            <p className="feature-eyebrow">Why Duli</p>
            <h2 className="feature-heading" data-reveal="up">A Better Way To Design Your Home.</h2>
          </div>
          <div className="feature-grid">
            {BETTER_FEATURES.map((f, i) => (
              <div className="feature-item" key={f.label} data-reveal="up" data-delay={i * 60}>
                <span className="feature-num">{String(i + 1).padStart(2, "0")}</span>
                <span className="feature-icon-ring">
                  <span className="feature-icon">{f.icon}</span>
                </span>
                <p className="feature-label">{f.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SECTION 9 — BEFORE & AFTER ═══ */}
      <section className="ba-section">
        <div className="ba-head" data-reveal="up">
          <h2 className="ba-heading">One Transformation At A&nbsp;Time.</h2>
          <p className="ba-sub">Drag to compare. Real homes, before our team began and after handover.</p>
        </div>
        <div data-reveal="up" data-delay="100">
          <BeforeAfterSlider />
        </div>
      </section>

      {/* ═══ SECTION 10 — TESTIMONIALS ═══ */}
      <Testimonials />

      {/* ═══ SECTION 11 — LET'S DESIGN YOUR HOME ═══ */}
      <section className="consult-section" id="contact">
        <div className="consult-inner">
          <div data-reveal="up">
            <h2 className="consult-heading">Let&apos;s Design Your Home.</h2>
            <p className="consult-sub">
              Tell us a little about your space. A designer will reach out to schedule your free consultation.
            </p>
          </div>
          <ConsultForm />
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
