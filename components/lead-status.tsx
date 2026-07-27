"use client";

import { useState, useTransition } from "react";
import { setLeadStatus, LEAD_STATUSES } from "@/lib/leads/actions";

const LABELS: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  not_qualified: "Not qualified",
  consultation_booked: "Consultation booked",
  converted_to_project: "Converted",
  lost: "Lost",
};

export function LeadStatusControl({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const [value, setValue] = useState(status);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const onChange = (next: string) => {
    const prev = value;
    setValue(next);
    startTransition(async () => {
      setError(null);
      const res = await setLeadStatus(id, next);
      if (res?.error) {
        setError(res.error);
        setValue(prev);
      }
    });
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <select
        value={value}
        disabled={pending}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 rounded-lg border border-ink/12 bg-white/80 px-2.5 text-[12.5px] font-medium focus:border-olive focus:outline-none disabled:opacity-60"
      >
        {LEAD_STATUSES.map((s) => (
          <option key={s} value={s}>
            {LABELS[s] ?? s}
          </option>
        ))}
      </select>
      {error && <span className="text-[11px] text-terracotta">{error}</span>}
    </div>
  );
}
