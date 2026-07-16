import type { ReactNode } from "react";
import { ArrowRight, MapPin, Sparkles } from "lucide-react";
import { PHOTOS } from "@/lib/services/mock-data";

/**
 * Shared dashboard primitives.
 *
 * Design rules applied (ui-ux-pro-max): no flat opaque panels — depth via
 * layered shadow + hairline + glass; the NUMBER/IMAGE is the hero, labels are
 * captions; never a blank grey box (spec: "no blank gray boxes").
 */

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="mb-2 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-brass">
      {children}
    </p>
  );
}

export function PageTitle({ children }: { children: ReactNode }) {
  return (
    <h1 className="font-serif text-[28px] leading-[1.05] tracking-tight sm:text-[40px]">
      {children}
    </h1>
  );
}

export function StatCard({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/70 bg-gradient-to-b from-white to-bg/60 p-5 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_16px_38px_-24px_rgba(31,31,31,0.35)] backdrop-blur-xl">
      <span
        aria-hidden
        className="pointer-events-none absolute -right-8 -top-10 h-24 w-24 rounded-full bg-brass/20 blur-2xl"
      />
      <div className="relative text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted">
        {label}
      </div>
      <div className="relative mt-1 font-serif text-[34px] leading-none tracking-tight">
        {value}
      </div>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  ctaHref,
  ctaLabel,
}: {
  title: string;
  description: string;
  ctaHref: string;
  ctaLabel: string;
}) {
  return (
    <div className="relative mt-7 overflow-hidden rounded-[20px] border border-white/70 bg-gradient-to-b from-white to-bg/60 px-6 py-14 text-center shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_20px_50px_-30px_rgba(31,31,31,0.35)] backdrop-blur-xl">
      {/* A real room, softly — never an empty grey panel. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.16]"
        style={{
          backgroundImage: `url(https://images.unsplash.com/${PHOTOS.livingWarm}?auto=format&fit=crop&w=900&q=55)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/70 via-white/85 to-white"
      />
      <div className="relative">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-brass/12 text-brass ring-1 ring-brass/20">
          <Sparkles size={20} strokeWidth={1.7} />
        </span>
        <h3 className="mt-4 font-serif text-[22px]">{title}</h3>
        <p className="mx-auto mt-2 max-w-[46ch] text-[13.5px] leading-relaxed text-muted">
          {description}
        </p>
        <a href={ctaHref} className="btn-solid mt-6 inline-flex">
          {ctaLabel} <span aria-hidden="true">→</span>
        </a>
      </div>
    </div>
  );
}

export type ProjectCardData = {
  id: string;
  code: string;
  name: string;
  status: string;
  city?: string | null;
  coverImageUrl?: string | null;
  progress?: number;
};

/** Status → tone. Colour carries meaning instead of being decoration. */
const STATUS_TONE: Record<string, string> = {
  draft: "bg-ink/8 text-muted",
  submitted: "bg-brass/15 text-brass",
  in_review: "bg-brass/15 text-brass",
  in_design: "bg-brass/15 text-brass",
  concepts_ready: "bg-olive/15 text-olive",
  revision_requested: "bg-terracotta/12 text-terracotta",
  approved: "bg-olive/18 text-olive",
  completed: "bg-olive/18 text-olive",
};

const COVERS = [PHOTOS.livingWarm, PHOTOS.bedroom, PHOTOS.kitchen, PHOTOS.livingLuxe];

export function ProjectCard({ project }: { project: ProjectCardData }) {
  // Deterministic cover so a card doesn't change image between renders.
  const idx =
    Math.abs(
      project.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0),
    ) % COVERS.length;
  const cover =
    project.coverImageUrl ??
    `https://images.unsplash.com/${COVERS[idx]}?auto=format&fit=crop&w=700&q=60`;
  const progress = project.progress ?? 0;
  const tone = STATUS_TONE[project.status] ?? "bg-ink/8 text-muted";

  return (
    <a
      href={`/projects/${project.id}`}
      className="group relative block overflow-hidden rounded-[18px] border border-white/70 bg-white shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_16px_38px_-26px_rgba(31,31,31,0.4)] transition-[transform,box-shadow,border-color] duration-500 ease-premium hover:-translate-y-1 hover:border-brass/40 hover:shadow-[0_30px_60px_-30px_rgba(31,31,31,0.5)]"
    >
      {/* Real interior render — not a grey placeholder */}
      <div className="relative h-[152px] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={cover}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-[900ms] ease-premium group-hover:scale-[1.06]"
        />
        <span
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent"
        />
        <span
          className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide backdrop-blur-md ${tone}`}
        >
          {project.status.replace(/_/g, " ")}
        </span>
        <div className="absolute bottom-3 left-3 right-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-blush">
            {project.code}
          </p>
          <h4 className="truncate font-serif text-[17px] text-white">
            {project.name}
          </h4>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between text-[11.5px] text-muted">
          <span className="inline-flex items-center gap-1">
            <MapPin size={12} strokeWidth={1.8} />
            {project.city || "City TBC"}
          </span>
          <span className="font-semibold text-ink">{progress}%</span>
        </div>
        {/* Progress — a real signal, not decoration */}
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink/[0.07]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-olive to-brass transition-[width] duration-700 ease-premium"
            style={{ width: `${Math.max(4, progress)}%` }}
          />
        </div>
        <span className="mt-3 inline-flex items-center gap-1 text-[12px] font-medium text-olive">
          Open project
          <ArrowRight
            size={13}
            strokeWidth={2}
            className="transition-transform duration-300 group-hover:translate-x-1"
          />
        </span>
      </div>
    </a>
  );
}
