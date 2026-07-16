"use client";

import { useEffect, useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Plus } from "lucide-react";
import { addCatalogItem, type CatalogItemState } from "@/lib/catalog/actions";
import { CATALOG_CATEGORIES, BUDGET_TIERS } from "@/lib/types";

const initial: CatalogItemState = {};

const fieldCls =
  "h-10 w-full rounded-lg border border-ink/10 bg-white/70 px-3 text-[13px] text-ink placeholder:text-muted focus:border-olive focus:outline-none focus:ring-2 focus:ring-olive/20 aria-[invalid=true]:border-terracotta";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn-solid h-10 text-[13px] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Adding…" : "Add item"}
    </button>
  );
}

export function CatalogItemForm() {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useFormState(addCatalogItem, initial);
  const formRef = useRef<HTMLFormElement>(null);
  const err = (f: string) => state.fieldErrors?.[f]?.[0];

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state.ok]);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn-solid h-10 text-[13px]"
      >
        <Plus size={15} strokeWidth={2} /> Add a design
      </button>
    );
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      className="w-full rounded-2xl border border-white/70 bg-gradient-to-b from-white to-bg/60 p-5 backdrop-blur-xl"
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-[14px] font-semibold">Add a design</h3>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-[12px] text-muted underline underline-offset-2"
        >
          Close
        </button>
      </div>

      {state.ok && (
        <p className="mb-3 rounded-lg border border-olive/30 bg-olive/[0.07] px-3 py-2 text-[12.5px]" role="status">
          Added — it&apos;s live in the catalog.
        </p>
      )}
      {state.error && (
        <p className="mb-3 rounded-lg border border-terracotta/40 bg-terracotta/[0.08] px-3 py-2 text-[12.5px] text-terracotta" role="alert">
          {state.error}
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1 block text-[12px] font-medium">Name</label>
          <input name="name" className={fieldCls} aria-invalid={!!err("name")} placeholder="e.g. Solid teak 3-seater" />
          {err("name") && <p className="mt-1 text-[11.5px] text-terracotta">{err("name")}</p>}
        </div>

        <div>
          <label className="mb-1 block text-[12px] font-medium">Category</label>
          <select name="category" className={fieldCls} defaultValue={CATALOG_CATEGORIES[0].value}>
            {CATALOG_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-[12px] font-medium">Budget tier</label>
          <select name="budgetTier" className={fieldCls} defaultValue={BUDGET_TIERS[0].value}>
            {BUDGET_TIERS.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-[12px] font-medium">Price from (₹)</label>
          <input name="priceMin" inputMode="numeric" className={fieldCls} aria-invalid={!!err("priceMin")} placeholder="45000" />
          {err("priceMin") && <p className="mt-1 text-[11.5px] text-terracotta">{err("priceMin")}</p>}
        </div>

        <div>
          <label className="mb-1 block text-[12px] font-medium">Price to (₹)</label>
          <input name="priceMax" inputMode="numeric" className={fieldCls} aria-invalid={!!err("priceMax")} placeholder="60000" />
          {err("priceMax") && <p className="mt-1 text-[11.5px] text-terracotta">{err("priceMax")}</p>}
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1 block text-[12px] font-medium">Image URL</label>
          <input name="imageUrl" className={fieldCls} aria-invalid={!!err("imageUrl")} placeholder="https://…" />
          {err("imageUrl") && <p className="mt-1 text-[11.5px] text-terracotta">{err("imageUrl")}</p>}
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1 block text-[12px] font-medium">Dimensions <span className="text-muted">(optional)</span></label>
          <input name="dimensions" className={fieldCls} placeholder="210 × 90 × 85 cm" />
        </div>
      </div>

      <div className="mt-4">
        <SubmitButton />
      </div>
    </form>
  );
}
