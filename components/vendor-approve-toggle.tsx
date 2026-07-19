"use client";

import { useState, useTransition } from "react";
import { setVendorApproved } from "@/lib/catalog/actions";

/** Admin approve/un-approve toggle for a vendor. Only approved vendors are public. */
export function VendorApproveToggle({
  vendorId,
  approved,
}: {
  vendorId: string;
  approved: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const run = (next: boolean) =>
    startTransition(async () => {
      setError(null);
      const res = await setVendorApproved(vendorId, next);
      if (res?.error) setError(res.error);
    });

  return (
    <div className="flex flex-col items-end gap-1">
      {approved ? (
        <button
          type="button"
          disabled={pending}
          onClick={() => run(false)}
          className="cursor-pointer rounded-full border border-ink/10 px-4 py-1.5 text-[12px] font-medium text-muted transition-colors duration-200 hover:border-terracotta/40 hover:text-terracotta disabled:opacity-60"
        >
          {pending ? "…" : "Un-approve"}
        </button>
      ) : (
        <button
          type="button"
          disabled={pending}
          onClick={() => run(true)}
          className="cursor-pointer rounded-full bg-olive px-4 py-1.5 text-[12px] font-medium text-bg transition-opacity duration-200 hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "…" : "Approve"}
        </button>
      )}
      {error && <span className="text-[10.5px] text-terracotta">{error}</span>}
    </div>
  );
}
