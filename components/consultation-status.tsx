"use client";

import { useState, useTransition } from "react";
import { setConsultationStatus } from "@/lib/collaboration/actions";

/**
 * Staff control to move a consultation forward. Shown only to staff on the
 * consultations page; customers just see the status.
 */
export function ConsultationStatusControl({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const [pending, startTransition] = useTransition();
  const [current, setCurrent] = useState(status);
  const [error, setError] = useState<string | null>(null);

  const act = (next: "scheduled" | "completed" | "cancelled") =>
    startTransition(async () => {
      setError(null);
      const res = await setConsultationStatus({ id, status: next });
      if (res?.error) setError(res.error);
      else setCurrent(next);
    });

  const btn =
    "cursor-pointer rounded-full px-3 py-1.5 text-[11.5px] font-medium transition-colors disabled:opacity-60";

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex flex-wrap gap-1.5">
        {current === "requested" && (
          <button
            type="button"
            disabled={pending}
            onClick={() => act("scheduled")}
            className={`${btn} bg-olive text-bg hover:opacity-90`}
          >
            Confirm
          </button>
        )}
        {(current === "requested" || current === "scheduled") && (
          <button
            type="button"
            disabled={pending}
            onClick={() => act("completed")}
            className={`${btn} border border-ink/10 text-ink hover:bg-ink/[0.06]`}
          >
            Mark done
          </button>
        )}
        {current !== "cancelled" && current !== "completed" && (
          <button
            type="button"
            disabled={pending}
            onClick={() => act("cancelled")}
            className={`${btn} border border-terracotta/30 text-terracotta hover:bg-terracotta/10`}
          >
            Cancel
          </button>
        )}
      </div>
      {error && <span className="text-[10.5px] text-terracotta">{error}</span>}
    </div>
  );
}
