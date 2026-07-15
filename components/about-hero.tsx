"use client";

import { motion } from "motion/react";

function SparkleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19 9l1.25-2.75L23 5l-2.75-1.25L19 1l-1.25 2.75L15 5l2.75 1.25L19 9zm-7.5.5L9 4 6.5 9.5 1 12l5.5 2.5L9 20l2.5-5.5L17 12l-5.5-2.5zM19 15l-1.25 2.75L15 19l2.75 1.25L19 23l1.25-2.75L23 19l-2.75-1.25L19 15z" />
    </svg>
  );
}

function ArrowUpRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7 17L17 7" />
      <path d="M9 7h8v8" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

function AboutHeroBadge() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="about-hero-badge"
    >
      <SparkleIcon />
      <span>Our Story</span>
    </motion.div>
  );
}

function AboutHeroStatCard() {
  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="about-hero-stat-card"
    >
      <div>
        <p className="about-hero-stat-num">180+</p>
        <p className="about-hero-stat-label">Homes Delivered</p>
      </div>
      <motion.a
        href="/#work"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="about-hero-stat-btn"
      >
        <span className="about-hero-stat-btn-icon">
          <ArrowUpRightIcon className="about-hero-icon-sm" />
        </span>
        See Our Work
      </motion.a>
    </motion.div>
  );
}

function AboutHeroProcessCorner() {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.4 }}
      className="about-hero-corner"
    >
      <div className="about-hero-corner-mask about-hero-corner-mask-top" aria-hidden="true">
        <svg width="100%" height="100%" viewBox="0 0 56 56" fill="none">
          <path d="M56 56V0C56 30.9279 30.9279 56 0 56H56Z" style={{ fill: "var(--bg)" }} />
        </svg>
      </div>
      <div className="about-hero-corner-mask about-hero-corner-mask-left" aria-hidden="true">
        <svg width="100%" height="100%" viewBox="0 0 56 56" fill="none">
          <path d="M56 56H0C30.9279 56 56 30.9279 56 0V56Z" style={{ fill: "var(--bg)" }} />
        </svg>
      </div>

      <div className="about-hero-corner-icon">
        <ArrowUpRightIcon className="about-hero-icon-lg" />
      </div>
      <div>
        <p className="about-hero-corner-title">Our Process</p>
        <a href="/design" className="about-hero-corner-link">
          <span>Explore In 3D</span>
          <ChevronRightIcon className="about-hero-icon-sm" />
        </a>
      </div>
    </motion.div>
  );
}

export function AboutHero() {
  return (
    <div className="about-hero-wrap">
      <section className="about-hero-section">
        <img
          src="/assets/home%20page/Living%20Room.webp"
          alt="A Duli-designed living room"
          className="about-hero-bg"
          fetchPriority="high"
          loading="eager"
        />
        <div className="about-hero-scrim" />
        <div className="about-hero-content">
          <div className="about-hero-text">
            <AboutHeroBadge />
            <motion.h1
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="about-hero-heading"
            >
              The People Behind Every Home.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="about-hero-sub"
            >
              Designers, project managers, and craftsmen working from one studio — so every home we deliver carries
              the same standard of care, start to finish.
            </motion.p>
          </div>

          <AboutHeroStatCard />
          <AboutHeroProcessCorner />
        </div>
      </section>
    </div>
  );
}
