import type { Metadata } from "next";
import { CustomCursor, SiteInteractions } from "@/components/site-interactions";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ScrollEngine } from "@/components/scroll-engine";
import { AIDesignTagline } from "@/components/ai-design-tagline";
import { AIDesignRoomPicker } from "@/components/ai-design-room-picker";
import { DesignChat } from "@/components/design-chat";
import { PageBackdrop, BACKDROPS } from "@/components/page-backdrop";

export const metadata: Metadata = {
  title: "AI Design — Duli Interiors",
  description: "Duli's AI Design tool turns a brief into mood boards, material palettes and layout options — refined by our studio."
};

const FEATURES = [
  {
    num: "01",
    title: "Instant Mood Boards",
    desc: "Upload a few reference images and your brief — get back a curated palette and material direction in minutes, not weeks."
  },
  {
    num: "02",
    title: "Material Matching",
    desc: "Our model cross-references your brief against the same vendor library our studio uses, so every suggestion is sourceable."
  },
  {
    num: "03",
    title: "Layout Drafts",
    desc: "Feed in your room dimensions and get spatial layout options to react to, before a single hour of drafting begins."
  }
];

export default function AIDesignPage() {
  return (
    <>
      {/* Preload critical above-the-fold images before JS runs */}
      <link rel="preload" as="image" href="/assets/home%20page/Bedroom.webp" />
      <link rel="preload" as="image" href="/assets/home%20page/Living%20Room.webp" />
      <link rel="preload" as="image" href="/assets/home%20page/Kitchen.webp" />

      <CustomCursor />
      <SiteInteractions />
      <ScrollEngine />
      <SiteHeader />

      {/* ═══ ANIMATED TAGLINE ═══ */}
      <AIDesignTagline />

      {/* ═══ AI STUDIO — prompt to concept ═══ */}
      <section
        data-app-ui
        id="studio"
        className="relative scroll-mt-24 font-sans text-ink"
      >
        <PageBackdrop image={BACKDROPS.minimal} scrim="light" />
        <div className="mx-auto max-w-[1000px] px-6 py-20 md:py-24">
          <div className="text-center">
            <p
              data-reveal="up"
              className="text-[13px] font-semibold uppercase tracking-[0.16em] text-brass"
            >
              AI Studio
            </p>
            <h2
              data-reveal="up"
              data-delay="80"
              className="mx-auto mt-3 max-w-[18ch] font-serif text-[32px] leading-[1.05] tracking-tight md:text-[46px]"
            >
              Describe it. See it.
            </h2>
            <p
              data-reveal="up"
              data-delay="160"
              className="mx-auto mt-4 max-w-[54ch] text-[16px] text-muted"
            >
              Tell the studio what you want — a room, a style, a feeling — and
              get a photorealistic concept back. Every concept is reviewed by a
              Duli designer before it becomes a plan.
            </p>
          </div>

          <div className="mt-10" data-reveal="up" data-delay="220">
            <DesignChat />
          </div>
        </div>
      </section>

      {/* ═══ ROOM PICKER ═══ */}
      <AIDesignRoomPicker />

      {/* ═══ FEATURES ═══ */}
      <section style={{ maxWidth: "1680px", margin: "0 auto", padding: "clamp(56px,7vw,108px) clamp(20px,4.5vw,70px)" }}>
        <div data-reveal="up" style={{ marginBottom: "clamp(34px,4.5vw,64px)" }}>
          <span style={{ fontSize: "11px", letterSpacing: ".24em", textTransform: "uppercase", color: "#8C8576", fontWeight: 500 }}>
            (How it helps)
          </span>
          <h2
            style={{
              margin: "14px 0 0",
              fontFamily: "'Inter',sans-serif",
              fontWeight: 800,
              letterSpacing: "-.03em",
              lineHeight: 0.95,
              fontSize: "clamp(32px,5vw,72px)"
            }}
          >
            Three ways AI speeds up the studio process
          </h2>
        </div>
        <div className="ai-features-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", border: "1px solid rgba(22,20,15,.14)" }}>
          {FEATURES.map((f, i) => (
            <div
              key={f.num}
              className="ai-feature-item"
              data-reveal="up"
              data-delay={i * 80}
              style={{
                padding: "clamp(28px,3.5vw,52px)",
                borderRight: i < FEATURES.length - 1 ? "1px solid rgba(22,20,15,.14)" : "none"
              }}
            >
              <div
                style={{
                  fontFamily: "'Inter',sans-serif",
                  fontWeight: 800,
                  fontSize: "clamp(32px,3.6vw,56px)",
                  lineHeight: 1,
                  color: "rgba(22,20,15,.18)",
                  marginBottom: "20px"
                }}
              >
                {f.num}
              </div>
              <h3 style={{ margin: "0 0 12px", fontFamily: "'Inter',sans-serif", fontSize: "clamp(17px,1.7vw,23px)", fontWeight: 700, letterSpacing: "-.01em" }}>
                {f.title}
              </h3>
              <p style={{ margin: 0, fontSize: "13px", lineHeight: 1.68, color: "#5A554B" }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section id="contact" style={{ background: "#ECEADE", padding: "clamp(56px,7vw,96px) clamp(20px,4.5vw,70px)" }}>
        <div
          style={{
            maxWidth: "1520px",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "28px",
            borderTop: "1px solid rgba(22,20,15,.15)",
            paddingTop: "clamp(36px,4.5vw,56px)"
          }}
        >
          <h2
            data-reveal="up"
            style={{
              margin: 0,
              fontFamily: "'Inter',sans-serif",
              fontWeight: 800,
              letterSpacing: "-.03em",
              lineHeight: 0.95,
              fontSize: "clamp(26px,4vw,52px)",
              maxWidth: "20ch"
            }}
          >
            Want early access to AI Design?
          </h2>
          <a href="mailto:info@duliinteriors.com" data-reveal="up" className="btn-solid">
            info@duliinteriors.com <span style={{ fontSize: ".8em" }}>↗</span>
          </a>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
