"use client";

import { useState, useTransition } from "react";
import { Check, Plus } from "lucide-react";
import { addItemToProject } from "@/lib/project-items/actions";

/** Adds one catalog item to the project. Optimistic "Added" state. */
export function AddToProjectButton({
  projectId,
  catalogItemId,
}: {
  projectId: string;
  catalogItemId: string;
}) {
  const [pending, startTransition] = useTransition();
  const [added, setAdded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const add = () =>
    startTransition(async () => {
      setError(null);
      const res = await addItemToProject({ projectId, catalogItemId });
      if (res?.error) setError(res.error);
      else {
        setAdded(true);
        setTimeout(() => setAdded(false), 1800);
      }
    });

  return (
    <div>
      <button
        type="button"
        disabled={pending}
        onClick={add}
        className={
          "flex h-9 w-full cursor-pointer items-center justify-center gap-1.5 rounded-full text-[12px] font-medium transition-colors duration-200 disabled:opacity-60 " +
          (added
            ? "bg-olive text-bg"
            : "border border-ink text-ink hover:bg-ink hover:text-bg")
        }
      >
        {added ? (
          <>
            <Check size={13} strokeWidth={2.4} /> Added
          </>
        ) : (
          <>
            <Plus size={13} strokeWidth={2.2} /> {pending ? "Adding…" : "Add to project"}
          </>
        )}
      </button>
      {error && <p className="mt-1 text-[11px] text-terracotta">{error}</p>}
    </div>
  );
}
