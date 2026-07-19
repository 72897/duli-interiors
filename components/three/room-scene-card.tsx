"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { PALETTES } from "@/components/three/room-preview-3d";

/**
 * Lazy shell around the 3D room.
 *
 * ssr:false because R3F needs a real WebGL context — server-rendering it would
 * throw. The dynamic import also keeps three.js out of the initial bundle, so
 * pages stay fast and 3D only loads when this card mounts.
 */
const RoomPreview3D = dynamic(
  () => import("@/components/three/room-preview-3d").then((m) => m.RoomPreview3D),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-stone/30 to-blush/30">
        <div className="flex items-center gap-2 text-[12px] text-muted">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brass" />
          Building your room…
        </div>
      </div>
    ),
  },
);

const SWATCHES: { key: keyof typeof PALETTES; label: string; dot: string }[] = [
  { key: "warm", label: "Warm Teak", dot: "#9B6E4B" },
  { key: "olive", label: "Olive", dot: "#66705A" },
  { key: "luxe", label: "Luxe", dot: "#3A3A38" },
  { key: "minimal", label: "Minimal", dot: "#E8E4DC" },
];

export function RoomSceneCard({
  className = "",
  title = "Live 3D preview",
  subtitle = "Drag to orbit · pick a material",
}: {
  className?: string;
  title?: string;
  subtitle?: string;
}) {
  const [palette, setPalette] = useState<keyof typeof PALETTES>("warm");

  return (
    <div
      className={
        "relative overflow-hidden rounded-2xl border border-stone bg-gradient-to-br from-white to-bg " +
        className
      }
    >
      {/* Full-flow (not absolute): R3F's react-use-measure reads a normal
          in-flow element reliably, but reports 0 for an absolutely-positioned
          one inside this dynamically-imported subtree — which left the canvas
          stuck at its 300x150 default. */}
      <RoomPreview3D palette={palette} className="h-full w-full" />

      {/* Header chip */}
      <div className="pointer-events-none absolute left-4 top-4 rounded-full border border-white/60 bg-white/70 px-3 py-1.5 backdrop-blur-md">
        <p className="text-[11px] font-semibold text-ink">{title}</p>
        <p className="text-[10px] text-muted">{subtitle}</p>
      </div>

      {/* Material swatches — real, they drive the scene */}
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-full border border-white/60 bg-white/70 p-1.5 backdrop-blur-md">
        {SWATCHES.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => setPalette(s.key)}
            aria-label={s.label}
            aria-pressed={palette === s.key}
            title={s.label}
            className={
              "h-6 w-6 cursor-pointer rounded-full border transition-transform duration-200 hover:scale-110 " +
              (palette === s.key ? "border-ink ring-2 ring-ink/20" : "border-stone")
            }
            style={{ backgroundColor: s.dot }}
          />
        ))}
      </div>
    </div>
  );
}
