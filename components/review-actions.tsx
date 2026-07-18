"use client";

import { useState, useTransition } from "react";
import { Check, AlertTriangle, ArrowRight } from "lucide-react";
import { reviewAnalysis, setProjectStatus } from "@/lib/review/actions";

/** Confirm / flag an AI analysis. */
export function AnalysisReviewButtons({ analysisId }: { analysisId: string }) {
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const act = (decision: "confirmed" | "needs_correction") =>
    startTransition(async () => {
      setError(null);
      const res = await reviewAnalysis(analysisId, decision);
      if (res?.error) setError(res.error);
      else setDone(decision === "confirmed" ? "Confirmed" : "Flagged");
    });

  if (done) {
    return <span className="text-[12px] font-medium text-olive">{done} ✓</span>;
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={() => act("confirmed")}
        className="inline-flex cursor-pointer items-center gap-1 rounded-full bg-olive px-3 py-1.5 text-[12px] font-medium text-bg transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        <Check size={13} strokeWidth={2.4} /> Confirm
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => act("needs_correction")}
        className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-terracotta/40 px-3 py-1.5 text-[12px] font-medium text-terracotta transition-colors hover:bg-terracotta/10 disabled:opacity-60"
      >
        <AlertTriangle size={13} strokeWidth={2} /> Flag
      </button>
      {error && <span className="text-[11px] text-terracotta">{error}</span>}
    </div>
  );
}

/** Advance a submitted project into design. */
export function ProjectAdvanceButton({ projectId }: { projectId: string }) {
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const advance = () =>
    startTransition(async () => {
      setError(null);
      const res = await setProjectStatus(projectId, "in_review");
      if (res?.error) setError(res.error);
      else setDone(true);
    });

  if (done) {
    return <span className="text-[12px] font-medium text-olive">In review ✓</span>;
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={advance}
        className="inline-flex cursor-pointer items-center gap-1 rounded-full bg-ink px-3.5 py-1.5 text-[12px] font-medium text-bg transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "…" : "Accept for review"}
        <ArrowRight size={13} strokeWidth={2} />
      </button>
      {error && <span className="text-[11px] text-terracotta">{error}</span>}
    </div>
  );
}
