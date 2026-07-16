"use client";

import { useState, useTransition } from "react";
import { deactivateOwnAccount } from "@/lib/account/actions";

/**
 * Self-serve account deactivation (soft). Two-step confirm — it signs you out
 * and locks the account until an admin reactivates it. On success the action
 * redirects, so this component just triggers it.
 */
export function DeactivateAccount() {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const deactivate = () =>
    startTransition(async () => {
      setError(null);
      const res = await deactivateOwnAccount();
      // Success redirects (never returns); only an error comes back here.
      if (res?.error) setError(res.error);
    });

  return (
    <div className="rounded-2xl border border-terracotta/25 bg-terracotta/[0.04] p-6">
      <h2 className="text-[15px] font-semibold text-terracotta">Deactivate account</h2>
      <p className="mt-1.5 max-w-[62ch] text-[12.5px] leading-relaxed text-muted">
        This signs you out and locks your account. Your projects and history are
        kept — nothing is permanently deleted — and you can reactivate by
        contacting us.
      </p>

      {error && (
        <p className="mt-3 text-[12.5px] text-terracotta" role="alert">
          {error}
        </p>
      )}

      {confirming ? (
        <div className="mt-4 flex flex-wrap items-center gap-2.5">
          <span className="text-[12.5px] font-medium">Are you sure?</span>
          <button
            type="button"
            disabled={pending}
            onClick={deactivate}
            className="h-9 cursor-pointer rounded-full bg-terracotta px-4 text-[12.5px] font-medium text-bg disabled:opacity-60"
          >
            {pending ? "Deactivating…" : "Yes, deactivate my account"}
          </button>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            className="h-9 cursor-pointer rounded-full px-4 text-[12.5px] text-muted hover:text-ink"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="mt-4 h-9 cursor-pointer rounded-full border border-terracotta/40 px-4 text-[12.5px] font-medium text-terracotta transition-colors duration-200 hover:bg-terracotta/10"
        >
          Deactivate my account
        </button>
      )}
    </div>
  );
}
