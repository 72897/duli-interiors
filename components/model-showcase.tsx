"use client";

/**
 * Interactive 3D viewer. <model-viewer> is already loaded globally in
 * app/layout.tsx, so this just places it.
 *
 * The model is Draco-compressed (~1.6MB) — light enough to sit on app screens.
 * `loading="lazy"` keeps it off the critical path until scrolled into view.
 */
export function ModelShowcase({
  src = "/3d/sofa-opt.glb",
  alt = "3D model of the Duli lounge sofa",
  className = "",
}: {
  src?: string;
  alt?: string;
  className?: string;
}) {
  return (
    <div
      className={
        "relative overflow-hidden rounded-2xl border border-stone bg-gradient-to-br from-white to-bg " +
        className
      }
    >
      {/* model-viewer adds attributes (ar-status) when the custom element
          upgrades, which React flags as a hydration mismatch. Benign. */}
      <model-viewer
        suppressHydrationWarning
        src={src}
        alt={alt}
        camera-controls
        auto-rotate
        rotation-per-second="16deg"
        shadow-intensity="1"
        exposure="0.95"
        interaction-prompt="none"
        loading="lazy"
        reveal="auto"
        style={{ width: "100%", height: "100%", backgroundColor: "transparent" }}
      />
      <span className="pointer-events-none absolute bottom-3 left-0 right-0 text-center text-[11px] text-muted">
        Drag to rotate · Scroll to zoom
      </span>
    </div>
  );
}
