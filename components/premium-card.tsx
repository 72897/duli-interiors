"use client";

import { useRef, type ReactNode } from "react";

/**
 * Premium 3D card. Tilts toward the pointer with a real perspective transform
 * and tracks a soft specular highlight under the cursor.
 *
 * Perf: transforms only (never width/height), driven straight from the pointer
 * event with no React state per-frame, and disabled entirely under
 * prefers-reduced-motion.
 */
export function PremiumCard({
  children,
  className = "",
  as = "div",
  href,
  intensity = 6,
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "a";
  href?: string;
  intensity?: number;
}) {
  const ref = useRef<HTMLDivElement | HTMLAnchorElement>(null);

  const onMove = (e: React.PointerEvent<HTMLElement>) => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;

    el.style.setProperty("--rx", `${(0.5 - py) * intensity}deg`);
    el.style.setProperty("--ry", `${(px - 0.5) * intensity}deg`);
    el.style.setProperty("--mx", `${px * 100}%`);
    el.style.setProperty("--my", `${py * 100}%`);
  };

  const reset = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  };

  const Tag = as as "div";
  return (
    <Tag
      // @ts-expect-error - ref type varies with the rendered tag
      ref={ref}
      href={href}
      onPointerMove={onMove}
      onPointerLeave={reset}
      className={`card3d ${className}`}
    >
      <span className="card3d-sheen" aria-hidden />
      <span className="card3d-inner">{children}</span>
    </Tag>
  );
}
