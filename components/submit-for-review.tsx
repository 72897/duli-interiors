"use client";

import { useState, useTransition } from "react";
import { Send } from "lucide-react";
import { submitProjectForReview } from "@/lib/review/actions";

/**
 * Customer action: hand the project to Duli's designers. Moves it to
 * 'submitted' and alerts the reviewers. Hidden once already past draft.
 */
export function SubmitForReview({ projectId }: { projectId: string }) {
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = () =>
    startTransition(async () => {
      setError(null);
      const res = await submitProjectForReview(projectId);
      if (res?.error) setError(res.error);
      else setDone(true);
    });

  if (done) {
    return (
      <p className="rounded-xl border border-olive/30 bg-olive/[0.07] px-4 py-3 text-[13px]">
        Submitted — a Duli designer will review your project and get back to you.
      </p>
    );
  }

  return (
    <div>
      <button
        type="button"
        disabled={pending}
        onClick={submit}
        className="btn-solid h-11 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Send size={15} strokeWidth={2} />
        {pending ? "Submitting…" : "Submit for designer review"}
      </button>
      {error && <p className="mt-2 text-[12px] text-terracotta">{error}</p>}
    </div>
  );
}
