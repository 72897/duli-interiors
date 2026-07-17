"use client";

import { useMemo, useState } from "react";
import {
  IDEA_TEMPLATES,
  SPACES,
  STYLES,
  spaceLabel,
  styleLabel,
  thumbUrl,
  type Space,
  type Style,
} from "@/lib/ideas/templates";

type SpaceFilter = "all" | Space;
type StyleFilter = "all" | Style;

const selectCls =
  "h-9 cursor-pointer rounded-full border border-stone bg-surface px-3 text-[13px] text-ink transition-colors duration-200 hover:border-olive focus:border-olive focus:outline-none focus:ring-2 focus:ring-olive/20";

export function IdeaGallery({ limit }: { limit?: number }) {
  const [space, setSpace] = useState<SpaceFilter>("all");
  const [style, setStyle] = useState<StyleFilter>("all");

  const items = useMemo(() => {
    const filtered = IDEA_TEMPLATES.filter(
      (t) =>
        (space === "all" || t.space === space) &&
        (style === "all" || t.style === style),
    );
    return limit ? filtered.slice(0, limit) : filtered;
  }, [space, style, limit]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor="f-space" className="sr-only">
          Filter by space
        </label>
        <select
          id="f-space"
          className={selectCls}
          value={space}
          onChange={(e) => setSpace(e.target.value as SpaceFilter)}
        >
          <option value="all">All spaces</option>
          {SPACES.map((s) => (
            <option key={s.key} value={s.key}>
              {s.label}
            </option>
          ))}
        </select>

        <label htmlFor="f-style" className="sr-only">
          Filter by style
        </label>
        <select
          id="f-style"
          className={selectCls}
          value={style}
          onChange={(e) => setStyle(e.target.value as StyleFilter)}
        >
          <option value="all">All styles</option>
          {STYLES.map((s) => (
            <option key={s.key} value={s.key}>
              {s.label}
            </option>
          ))}
        </select>

        {(space !== "all" || style !== "all") && (
          <button
            type="button"
            onClick={() => {
              setSpace("all");
              setStyle("all");
            }}
            className="h-9 cursor-pointer rounded-full px-3 text-[13px] text-muted underline underline-offset-2 transition-colors duration-200 hover:text-ink"
          >
            Clear
          </button>
        )}

        <span className="ml-auto text-[13px] text-muted">
          {items.length} idea{items.length === 1 ? "" : "s"}
        </span>
      </div>

      {items.length === 0 ? (
        <p className="mt-8 rounded-xl border border-dashed border-stone p-10 text-center text-sm text-muted">
          No ideas match those filters yet — try clearing them.
        </p>
      ) : (
        <div className="mt-5 grid grid-cols-[repeat(auto-fill,minmax(210px,1fr))] gap-4">
          {items.map((t) => (
            <a
              key={t.slug}
              href={`/ideas/${t.slug}`}
              className="group cursor-pointer overflow-hidden rounded-xl border border-stone bg-surface transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-olive"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={thumbUrl(t.photoId)}
                  alt={`${t.title} — ${styleLabel(t.style)} ${spaceLabel(t.space)}`}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 ease-premium group-hover:scale-[1.04]"
                />
                <span className="absolute left-2.5 top-2.5 rounded-full bg-bg/90 px-2 py-[3px] text-[10px] font-medium uppercase tracking-wide text-ink">
                  {spaceLabel(t.space)}
                </span>
              </div>
              <div className="p-3.5">
                <p className="text-[14px] font-semibold">{t.title}</p>
                <p className="mt-0.5 text-[12px] text-muted">
                  {styleLabel(t.style)} · {t.city}
                </p>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
