"use client";

import { useState, useTransition } from "react";
import { Check, MessageSquare } from "lucide-react";
import { setEstimateStatus } from "@/lib/estimate/actions";
import type { EstimateStatus } from "@/lib/types";

/**
 * The customer's call on a sent estimate: approve it, or request changes with
 * an optional note. Once decided, it shows the resulting state instead of the
 * buttons. Staff never see this — they build the estimate.
 */
export function EstimateDecision({
  estimateId,
  projectId,
  status,
}: {
  estimateId: string;
  projectId: string;
  status: EstimateStatus;
}) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<EstimateStatus>(status);
  const [error, setError] = useState<string | null>(null);
  const [noteOpen, setNoteOpen] = useState(false);
  const [note, setNote] = useState("");

  const decide = (next: "approved" | "revision_requested") =>
    startTransition(async () => {
      setError(null);
      const res = await setEstimateStatus({
        estimateId,
        projectId,
        status: next,
        note: note.trim() || undefined,
      });
      if (res?.error) setError(res.error);
      else setResult(next);
    });

  if (result === "approved") {
    return (
      <div className="flex items-center gap-2.5 rounded-2xl border border-olive/30 bg-olive/[0.08] px-5 py-4 text-[13.5px]">
        <Check size={17} strokeWidth={2.2} className="text-olive" />
        <span>
          <span className="font-semibold">You approved this estimate.</span> Your
          designer will move the project forward.
        </span>
      </div>
    );
  }

  if (result === "revision_requested") {
    return (
      <div className="flex items-center gap-2.5 rounded-2xl border border-terracotta/30 bg-terracotta/[0.07] px-5 py-4 text-[13.5px]">
        <MessageSquare size={17} strokeWidth={2} className="text-terracotta" />
        <span>
          <span className="font-semibold">Changes requested.</span> We&apos;ll
          revise the estimate and send it back.
        </span>
      </div>
    );
  }

  // Only a 'sent' estimate is actionable.
  if (result !== "sent") return null;

  return (
    <div className="rounded-2xl border border-white/70 bg-gradient-to-b from-white to-bg/60 p-5 backdrop-blur-xl">
      <p className="text-[14px] font-semibold">Happy with this estimate?</p>
      <p className="mt-0.5 text-[12.5px] text-muted">
        Approve to move ahead, or tell us what you&apos;d like changed.
      </p>

      {noteOpen && (
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          placeholder="What would you like changed? (optional)"
          className="mt-3 w-full rounded-xl border border-ink/10 bg-white/80 px-3 py-2 text-[13px] focus:border-olive focus:outline-none focus:ring-2 focus:ring-olive/20"
        />
      )}

      <div className="mt-3 flex flex-wrap gap-2.5">
        <button
          type="button"
          disabled={pending}
          onClick={() => decide("approved")}
          className="btn-solid h-10 text-[13px] disabled:opacity-60"
        >
          <Check size={15} strokeWidth={2.2} /> {pending ? "Saving…" : "Approve estimate"}
        </button>
        {noteOpen ? (
          <button
            type="button"
            disabled={pending}
            onClick={() => decide("revision_requested")}
            className="inline-flex h-10 items-center gap-1.5 rounded-full border border-terracotta/40 px-4 text-[13px] font-medium text-terracotta hover:bg-terracotta/[0.06] disabled:opacity-60"
          >
            <MessageSquare size={15} strokeWidth={2} /> Send change request
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setNoteOpen(true)}
            className="inline-flex h-10 items-center gap-1.5 rounded-full border border-ink/15 px-4 text-[13px] font-medium text-ink hover:bg-ink/[0.05]"
          >
            <MessageSquare size={15} strokeWidth={2} /> Request changes
          </button>
        )}
      </div>
      {error && <p className="mt-2 text-[12px] text-terracotta">{error}</p>}
    </div>
  );
}
