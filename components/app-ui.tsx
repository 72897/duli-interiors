import type { ReactNode } from "react";
import { Eyebrow, PageTitle } from "@/components/dashboard-ui";
import { GLASS } from "@/components/page-backdrop";

/**
 * Shared primitives for the authenticated app pages, so every page speaks the
 * same visual language instead of re-inventing headers and panels.
 */

/** Indian grouping (₹1,50,000 — not ₹150,000). Whole rupees; paise never shown. */
export const inr = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

export const shortDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

/**
 * Page header on a frosted surface.
 *
 * The backdrop photo runs at near-full strength by design (scrim ~5%), so text
 * must never sit directly on it — it gets its own glass panel instead. See
 * page-backdrop.tsx.
 */
export function PageHead({
  eyebrow,
  title,
  intro,
  actions,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  actions?: ReactNode;
}) {
  return (
    <header
      className={`mb-6 flex flex-wrap items-end justify-between gap-4 px-6 py-5 ${GLASS}`}
    >
      <div className="min-w-0">
        <Eyebrow>{eyebrow}</Eyebrow>
        <PageTitle>{title}</PageTitle>
        {intro && (
          <p className="mt-2.5 max-w-[62ch] text-sm leading-relaxed text-muted">
            {intro}
          </p>
        )}
      </div>
      {actions && <div className="flex flex-wrap gap-2.5">{actions}</div>}
    </header>
  );
}

/**
 * Section heading. Also frosted — a bare heading on the backdrop photo is
 * legible on a pale wall and invisible on a dark one.
 */
export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="mb-3 inline-flex rounded-full border border-white/60 bg-white/70 px-4 py-1.5 font-serif text-[19px] backdrop-blur-xl">
      {children}
    </h2>
  );
}

/** Glass panel — the standard surface for app content. */
export function Panel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={
        "relative overflow-hidden rounded-[18px] border border-white/70 bg-gradient-to-b from-white to-bg/60 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_16px_38px_-26px_rgba(31,31,31,0.35)] backdrop-blur-xl " +
        className
      }
    >
      {children}
    </div>
  );
}

const TONES: Record<string, string> = {
  neutral: "bg-ink/[0.07] text-muted",
  brass: "bg-brass/15 text-brass",
  olive: "bg-olive/15 text-olive",
  terracotta: "bg-terracotta/12 text-terracotta",
};

export function Pill({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: keyof typeof TONES;
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${TONES[tone] ?? TONES.neutral}`}
    >
      {children}
    </span>
  );
}

/**
 * Marks a surface that renders mock data, so nobody mistakes a placeholder for
 * a live integration. Every page carrying @mock service data shows this.
 */
export function MockNotice({ children }: { children: ReactNode }) {
  // Opaque, not tinted-transparent: this sits over a full-strength photo.
  return (
    <p className="mb-5 flex items-start gap-2 rounded-xl border border-brass/25 bg-[#FBF7EF] px-3.5 py-2.5 text-[12px] leading-relaxed text-muted shadow-[0_10px_30px_-22px_rgba(31,31,31,0.5)]">
      <span className="mt-[1px] shrink-0 rounded-full bg-brass/20 px-1.5 py-[1px] text-[9px] font-bold uppercase tracking-wide text-brass">
        Preview
      </span>
      {children}
    </p>
  );
}
