import { GLASS } from "@/components/page-backdrop";

/**
 * Skeleton for app routes. Mirrors the real layout's shape (frosted header
 * block, then content) so the page doesn't jump when it swaps in.
 */
export default function AppLoading() {
  return (
    <div aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading…</span>

      <div className={`mb-6 px-6 py-5 ${GLASS}`}>
        <div className="h-3 w-24 animate-pulse rounded-full bg-ink/[0.08]" />
        <div className="mt-3 h-8 w-64 animate-pulse rounded-lg bg-ink/[0.08]" />
        <div className="mt-3 h-3 w-[min(420px,80%)] animate-pulse rounded-full bg-ink/[0.06]" />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-[104px] animate-pulse rounded-2xl border border-white/60 bg-white/60 backdrop-blur-xl"
          />
        ))}
      </div>

      <div className="mt-5 space-y-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-[86px] animate-pulse rounded-[18px] border border-white/60 bg-white/60 backdrop-blur-xl"
          />
        ))}
      </div>
    </div>
  );
}
