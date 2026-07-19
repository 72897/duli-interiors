"use client";

import { useState, useTransition } from "react";
import { setUserActive } from "@/lib/account/actions";

/**
 * Admin toggle to deactivate/reactivate a user (soft). Deactivating asks for a
 * confirm — it locks the person out — while reactivating is a plain click.
 */
export function UserActiveToggle({
  userId,
  active,
}: {
  userId: string;
  active: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = (next: boolean) =>
    startTransition(async () => {
      setError(null);
      const res = await setUserActive(userId, next);
      if (res?.error) setError(res.error);
      setConfirming(false);
    });

  if (!active) {
    return (
      <div className="flex flex-col items-end gap-1">
        <button
          type="button"
          disabled={pending}
          onClick={() => run(true)}
          className="cursor-pointer rounded-full border border-olive/40 bg-olive/10 px-3 py-1 text-[11.5px] font-medium text-olive transition-colors duration-200 hover:bg-olive/20 disabled:opacity-60"
        >
          {pending ? "…" : "Reactivate"}
        </button>
        {error && <span className="text-[10.5px] text-terracotta">{error}</span>}
      </div>
    );
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={pending}
          onClick={() => run(false)}
          className="cursor-pointer rounded-full bg-terracotta px-3 py-1 text-[11.5px] font-medium text-bg disabled:opacity-60"
        >
          {pending ? "…" : "Confirm"}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="cursor-pointer rounded-full px-2 py-1 text-[11.5px] text-muted hover:text-ink"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="cursor-pointer rounded-full border border-ink/10 px-3 py-1 text-[11.5px] font-medium text-muted transition-colors duration-200 hover:border-terracotta/40 hover:text-terracotta"
      >
        Deactivate
      </button>
      {error && <span className="text-[10.5px] text-terracotta">{error}</span>}
    </div>
  );
}
