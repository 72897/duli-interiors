"use client";

import { motion } from "motion/react";

function CubeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z" />
      <path d="M4 7.5l8 4.5 8-4.5M12 12v9" />
    </svg>
  );
}

function ArrowDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 5v14M6 13l6 6 6-6" />
    </svg>
  );
}

function DesignHeroRing() {
  return (
    <div className="design-hero-ring-wrap" aria-hidden="true">
      <motion.div
        className="design-hero-ring"
        animate={{ rotate: 360 }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
      >
        <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none">
          <circle cx="50" cy="50" r="46" stroke="rgba(255,255,255,.35)" strokeWidth="1" strokeDasharray="4 7" />
        </svg>
      </motion.div>
      <span className="design-hero-ring-label">360°</span>
    </div>
  );
}

function DesignHeroStat() {
  return (
    <motion.div
      initial={{ y: 16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.5 }}
      className="design-hero-stat"
    >
      <p className="design-hero-stat-num">0</p>
      <p className="design-hero-stat-label">Surprises At Handover</p>
    </motion.div>
  );
}

export function DesignHero() {
  return (
    <div className="design-hero-wrap">
      <section className="design-hero-card">
        <img
          src="/assets/home%20page/Wardrobe.webp"
          alt="A wardrobe interior designed and built by Duli"
          className="design-hero-bg"
          fetchPriority="high"
          loading="eager"
        />
        <div className="design-hero-scrim" />
        <DesignHeroRing />

        <div className="design-hero-content">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="design-hero-badge"
          >
            <CubeIcon />
            <span>3D-First Process</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="design-hero-heading"
          >
            See Every Piece Before It&apos;s Built.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="design-hero-sub"
          >
            From first sketch to final delivery — every Duli design is modeled, measured, and shown to you before
            a single cut is made.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="design-hero-actions"
          >
            <a href="#contact" className="btn-solid">Start Your Project</a>
            <a href="#model" className="btn-ghost">
              Explore In 3D <ArrowDownIcon className="design-hero-arrow" />
            </a>
          </motion.div>
        </div>

        <DesignHeroStat />
      </section>
    </div>
  );
}
