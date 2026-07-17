"use client";

import { motion, useReducedMotion } from "motion/react";
import { CSSProperties, ReactNode } from "react";

// ─── Design tokens ────────────────────────────────────────────────────────────
const PALETTE = {
  // Backgrounds
  bgDeep:        "rgba(10, 8, 28, 0.92)",
  glass:         "rgba(255, 255, 255, 0.06)",
  glassBorder:   "rgba(255, 255, 255, 0.14)",
  glassHighlight:"rgba(255, 255, 255, 0.22)",

  // Brand gradient  —  warm gold → champagne (Duli Interiors feel)
  accentA: "#C9A96E",   // warm gold
  accentB: "#E8D5B0",   // champagne
  accentC: "#9B6F3B",   // deep amber

  // Glow
  glowA: "rgba(201, 169, 110, 0.35)",
  glowB: "rgba(232, 213, 176, 0.15)",

  textPrimary:   "#F5F0E8",
  textSecondary: "rgba(245, 240, 232, 0.60)",
};

// ─── Animation variants ───────────────────────────────────────────────────────
const cardVariants = {
  hidden: { opacity: 0, y: 48, scale: 0.96 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.72, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const iconVariants = {
  hidden: { opacity: 0, scale: 0.6, rotate: -12 },
  visible: {
    opacity: 1, scale: 1, rotate: 0,
    transition: { duration: 0.6, delay: 0.18, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const contentVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.55, delay: 0.28 + i * 0.1, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const shimmerVariants = {
  initial: { x: "-100%", opacity: 0 },
  hover:   { x: "100%",  opacity: 1, transition: { duration: 0.65, ease: "easeInOut" as const } },
};

// ─── Sub-components ───────────────────────────────────────────────────────────
function DefaultIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="fc-icon-grad" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor={PALETTE.accentA} />
          <stop offset="1" stopColor={PALETTE.accentB} />
        </linearGradient>
      </defs>
      <path
        d="M14 2.5L17.09 9.76L25 10.91L19.5 16.26L20.93 24.13L14 20.5L7.07 24.13L8.5 16.26L3 10.91L10.91 9.76L14 2.5Z"
        fill="url(#fc-icon-grad)"
        stroke="rgba(201,169,110,0.4)"
        strokeWidth="0.5"
      />
    </svg>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────
export interface FeatureCardProps {
  icon?: ReactNode;
  eyebrow?: string;
  title: string;
  description: string;
  ctaLabel?: string;
  onCtaClick?: () => void;
  /** Stagger index when used in a grid (0, 1, 2 …) */
  index?: number;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function FeatureCard({
  icon,
  eyebrow = "Feature",
  title,
  description,
  ctaLabel = "Learn more",
  onCtaClick,
  index = 0,
}: FeatureCardProps) {
  const reduce = useReducedMotion();

  const s: Record<string, CSSProperties> = {
    // Wrapper — provides the glow halo
    wrapper: {
      position: "relative",
      display: "inline-flex",
      borderRadius: 24,
      padding: 1.5,
      background: `linear-gradient(135deg, ${PALETTE.glassHighlight}, rgba(255,255,255,0.04) 60%, ${PALETTE.accentA}33)`,
      boxShadow: [
        `0 0 0 1px ${PALETTE.glassBorder}`,
        `0 24px 64px -12px ${PALETTE.glowA}`,
        `0 8px 32px -8px ${PALETTE.glowB}`,
        "0 2px 0 0 rgba(255,255,255,0.08) inset",
      ].join(", "),
      maxWidth: 380,
      width: "100%",
      cursor: "default",
    },

    // Glass card body
    card: {
      position: "relative",
      borderRadius: 22.5,
      padding: "36px 32px 32px",
      overflow: "hidden",
      background: PALETTE.glass,
      backdropFilter: "blur(24px) saturate(180%)",
      WebkitBackdropFilter: "blur(24px) saturate(180%)",
      display: "flex",
      flexDirection: "column",
      gap: 0,
      width: "100%",
    },

    // Mesh gradient blob (decorative)
    blob: {
      position: "absolute",
      top: -60,
      right: -60,
      width: 200,
      height: 200,
      borderRadius: "50%",
      background: `radial-gradient(circle, ${PALETTE.glowA} 0%, transparent 70%)`,
      pointerEvents: "none",
    },

    // Shimmer overlay (animated on hover)
    shimmer: {
      position: "absolute",
      inset: 0,
      background: "linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.12) 50%, transparent 65%)",
      pointerEvents: "none",
    },

    // Icon container
    iconWrap: {
      position: "relative",
      zIndex: 1,
      width: 56,
      height: 56,
      borderRadius: 16,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: `linear-gradient(135deg, rgba(201,169,110,0.22), rgba(155,111,59,0.12))`,
      border: `1px solid rgba(201,169,110,0.28)`,
      boxShadow: `0 4px 16px -4px ${PALETTE.glowA}`,
      marginBottom: 24,
      flexShrink: 0,
    },

    // Eyebrow label
    eyebrow: {
      position: "relative",
      zIndex: 1,
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: "0.14em",
      textTransform: "uppercase" as const,
      background: `linear-gradient(90deg, ${PALETTE.accentA}, ${PALETTE.accentB})`,
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
      marginBottom: 8,
    },

    title: {
      position: "relative",
      zIndex: 1,
      fontSize: 22,
      fontWeight: 700,
      lineHeight: 1.25,
      color: PALETTE.textPrimary,
      marginBottom: 12,
      letterSpacing: "-0.02em",
    },

    description: {
      position: "relative",
      zIndex: 1,
      fontSize: 15,
      lineHeight: 1.65,
      color: PALETTE.textSecondary,
      marginBottom: 28,
    },

    // CTA button
    cta: {
      position: "relative",
      zIndex: 1,
      alignSelf: "flex-start",
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      padding: "10px 22px",
      borderRadius: 999,
      fontSize: 13,
      fontWeight: 600,
      letterSpacing: "0.02em",
      color: PALETTE.bgDeep,
      background: `linear-gradient(135deg, ${PALETTE.accentA} 0%, ${PALETTE.accentB} 60%, ${PALETTE.accentA} 100%)`,
      backgroundSize: "200% 100%",
      border: "none",
      cursor: "pointer",
      boxShadow: `0 4px 20px -4px ${PALETTE.glowA}, 0 0 0 1px rgba(201,169,110,0.3)`,
      transition: "box-shadow 0.25s ease, transform 0.2s ease, background-position 0.4s ease",
      outline: "none",
    },
  };

  const viewportOptions = { once: true, margin: "-60px" };

  return (
    <motion.div
      style={s.wrapper}
      variants={reduce ? undefined : cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOptions}
      whileHover={{ scale: 1.025, transition: { duration: 0.3, ease: "easeOut" } }}
    >
      <div style={s.card}>
        {/* Decorative blob */}
        <div style={s.blob} aria-hidden="true" />

        {/* Shimmer on hover */}
        <motion.div
          style={s.shimmer}
          aria-hidden="true"
          variants={reduce ? undefined : shimmerVariants}
          initial="initial"
          whileHover="hover"
        />

        {/* Icon */}
        <motion.div
          style={s.iconWrap}
          variants={reduce ? undefined : iconVariants}
        >
          {icon ?? <DefaultIcon />}
        </motion.div>

        {/* Eyebrow */}
        <motion.p
          style={s.eyebrow}
          custom={0}
          variants={reduce ? undefined : contentVariants}
        >
          {eyebrow}
        </motion.p>

        {/* Title */}
        <motion.h3
          style={s.title}
          custom={1}
          variants={reduce ? undefined : contentVariants}
        >
          {title}
        </motion.h3>

        {/* Description */}
        <motion.p
          style={s.description}
          custom={2}
          variants={reduce ? undefined : contentVariants}
        >
          {description}
        </motion.p>

        {/* CTA */}
        <motion.button
          style={s.cta}
          custom={3}
          variants={reduce ? undefined : contentVariants}
          onClick={onCtaClick}
          whileHover={{
            boxShadow: `0 8px 32px -4px ${PALETTE.glowA}, 0 0 0 1px rgba(201,169,110,0.5)`,
            scale: 1.04,
          }}
          whileTap={{ scale: 0.97 }}
          aria-label={ctaLabel}
        >
          {ctaLabel}
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M2.5 7h9M8 3.5L11.5 7 8 10.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.button>
      </div>
    </motion.div>
  );
}

// ─── Demo grid (for easy page-level usage) ────────────────────────────────────
const DEMO_CARDS: FeatureCardProps[] = [
  {
    eyebrow: "Spatial Design",
    title: "Curated Luxury Interiors",
    description: "Every space is a canvas. Our designers craft environments that merge classical proportions with contemporary sensibilities — resulting in rooms that feel effortlessly alive.",
    ctaLabel: "Explore spaces",
  },
  {
    eyebrow: "Material Sourcing",
    title: "Rare & Bespoke Materials",
    description: "From hand-loomed silk drapes to book-matched onyx surfaces, we source materials with provenance — so every finish tells a story worth living inside.",
    ctaLabel: "View materials",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id="fc-gem-grad" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
            <stop stopColor="#C9A96E" /><stop offset="1" stopColor="#E8D5B0" />
          </linearGradient>
        </defs>
        <path d="M14 4L22 10L18 22H10L6 10L14 4Z" fill="url(#fc-gem-grad)" opacity="0.9" />
        <path d="M6 10L14 14L22 10" stroke="rgba(201,169,110,0.5)" strokeWidth="0.8" />
        <path d="M14 14V22" stroke="rgba(232,213,176,0.4)" strokeWidth="0.8" />
      </svg>
    ),
  },
  {
    eyebrow: "White-Glove Service",
    title: "End-to-End Project Stewardship",
    description: "From initial concept through final installation, a dedicated project director oversees every detail — eliminating friction and safeguarding your timeline.",
    ctaLabel: "How it works",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id="fc-shield-grad" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
            <stop stopColor="#C9A96E" /><stop offset="1" stopColor="#E8D5B0" />
          </linearGradient>
        </defs>
        <path d="M14 4L22 8V15C22 19.4 18.4 23.2 14 24C9.6 23.2 6 19.4 6 15V8L14 4Z" fill="url(#fc-shield-grad)" opacity="0.85" />
        <path d="M10.5 14.5L13 17L18 11.5" stroke={`rgba(10,8,28,0.8)`} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export function FeatureCardGrid() {
  const gridStyle: CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: 24,
    padding: "48px 32px",
    background: "linear-gradient(135deg, #0A081C 0%, #12103A 50%, #0A081C 100%)",
    minHeight: "100vh",
    alignItems: "start",
  };

  return (
    <section style={gridStyle}>
      {DEMO_CARDS.map((card, i) => (
        <FeatureCard key={i} {...card} index={i} />
      ))}
    </section>
  );
}
