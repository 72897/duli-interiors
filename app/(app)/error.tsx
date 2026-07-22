"use client";

import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";

/**
 * Error boundary for app routes (spec §13: a real error state, not a blank
 * screen). `reset()` re-renders the segment, which recovers from a transient
 * failure without a full reload.
 */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Server errors reach the client as a digest only; log so it's visible.
    console.error("App route error:", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-[34rem] rounded-2xl border border-white/60 bg-white/80 px-8 py-12 text-center backdrop-blur-xl">
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-terracotta/10 text-terracotta">
        <TriangleAlert size={26} strokeWidth={1.6} />
      </span>
      <h1 className="mt-5 font-serif text-[26px] leading-tight">
        Something went wrong
      </h1>
      <p className="mx-auto mt-3 max-w-[44ch] text-[14px] leading-relaxed text-muted">
        This page didn&apos;t load. Your work isn&apos;t lost — nothing was saved
        or changed by this error.
      </p>

      {error.digest && (
        <p className="mt-4 text-[11.5px] text-muted">
          Reference: <span className="font-mono text-ink">{error.digest}</span>
        </p>
      )}

      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={reset} className="btn-solid h-11">
          Try again
        </button>
        <a
          href="/dashboard"
          className="inline-flex h-11 cursor-pointer items-center rounded-full border border-ink px-5 text-sm font-medium transition-colors duration-200 hover:bg-ink hover:text-bg"
        >
          Back to dashboard
        </a>
      </div>
    </div>
  );
}
