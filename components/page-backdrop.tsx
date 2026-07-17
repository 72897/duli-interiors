/**
 * Fixed interior backdrop for the app/feature routes (auth, dashboard,
 * pricing, partners) so they share the marketing site's photographic world.
 *
 * Scrims are intentionally very light (5%) — the photo should read at close to
 * full strength. Anything that needs contrast (text sitting directly on the
 * photo) gets its own frosted surface rather than washing out the whole image.
 */
export const BACKDROPS = {
  living:
    "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1600&q=60",
  warm:
    "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1920&q=70",
  minimal:
    "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1600&q=60",
} as const;

export function PageBackdrop({
  image = BACKDROPS.living,
  scrim = "none",
}: {
  image?: string;
  scrim?: "none" | "light" | "dark";
}) {
  return (
    <>
      <div
        aria-hidden
        className="fixed inset-0 -z-20 bg-cover bg-center"
        style={{ backgroundImage: `url('${image}')` }}
      />
      {scrim === "light" && (
        <div aria-hidden className="fixed inset-0 -z-10 bg-[#F8F7F4]/[0.05]" />
      )}
      {scrim === "dark" && (
        <div aria-hidden className="fixed inset-0 -z-10 bg-[#1f1f1f]/[0.05]" />
      )}
    </>
  );
}

/**
 * Frosted panel — the readability tool that replaces heavy scrims. Mirrors the
 * glass language already used by the floating pill header.
 */
export const GLASS =
  "rounded-2xl border border-white/60 bg-white/70 shadow-[0_18px_50px_-20px_rgba(31,31,31,0.28)] backdrop-blur-xl backdrop-saturate-150";
