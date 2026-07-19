"use client";

import { useFormState, useFormStatus } from "react-dom";
import { addVendorProduct, type CatalogItemState } from "@/lib/catalog/actions";
import { CATALOG_CATEGORIES, BUDGET_TIERS } from "@/lib/types";

const initial: CatalogItemState = {};

const inputCls =
  "h-11 w-full rounded-xl border border-ink/10 bg-white/70 px-3.5 text-[13.5px] text-ink placeholder:text-muted focus:border-olive focus:outline-none focus:ring-2 focus:ring-olive/20 aria-[invalid=true]:border-terracotta";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-solid h-11 text-[13px] disabled:opacity-60">
      {pending ? "Submitting…" : "Submit for approval"}
    </button>
  );
}

export function VendorProductForm() {
  const [state, formAction] = useFormState(addVendorProduct, initial);
  const err = (f: string) => state.fieldErrors?.[f]?.[0];

  if (state.ok) {
    return (
      <div className="rounded-xl border border-olive/30 bg-olive/[0.07] px-4 py-3.5 text-[13px]">
        Submitted — your product is a draft and goes live once a Duli admin
        approves it. It&apos;s already in your SKUs below.
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <p className="rounded-lg border border-terracotta/40 bg-terracotta/[0.08] px-3 py-2 text-[12.5px] text-terracotta" role="alert">
          {state.error}
        </p>
      )}

      <div>
        <label className="mb-1.5 block text-[12.5px] font-medium">Product name</label>
        <input name="name" className={inputCls} aria-invalid={!!err("name")} placeholder="e.g. Solid teak 3-seater sofa" />
        {err("name") && <p className="mt-1 text-[12px] text-terracotta">{err("name")}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-[12.5px] font-medium">Category</label>
          <select name="category" className={inputCls} defaultValue={CATALOG_CATEGORIES[0].value}>
            {CATALOG_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-[12.5px] font-medium">Budget tier</label>
          <select name="budgetTier" className={inputCls} defaultValue={BUDGET_TIERS[0].value}>
            {BUDGET_TIERS.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-[12.5px] font-medium">Price from (₹)</label>
          <input name="priceMin" inputMode="numeric" className={inputCls} aria-invalid={!!err("priceMin")} placeholder="45000" />
          {err("priceMin") && <p className="mt-1 text-[12px] text-terracotta">{err("priceMin")}</p>}
        </div>
        <div>
          <label className="mb-1.5 block text-[12.5px] font-medium">Price to (₹)</label>
          <input name="priceMax" inputMode="numeric" className={inputCls} aria-invalid={!!err("priceMax")} placeholder="60000" />
          {err("priceMax") && <p className="mt-1 text-[12px] text-terracotta">{err("priceMax")}</p>}
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-[12.5px] font-medium">Image URL</label>
        <input name="imageUrl" className={inputCls} aria-invalid={!!err("imageUrl")} placeholder="https://…" />
        {err("imageUrl") && <p className="mt-1 text-[12px] text-terracotta">{err("imageUrl")}</p>}
      </div>

      <div>
        <label className="mb-1.5 block text-[12.5px] font-medium">
          Dimensions <span className="text-muted">(optional)</span>
        </label>
        <input name="dimensions" className={inputCls} placeholder="210 × 90 × 85 cm" />
      </div>

      <SubmitButton />
    </form>
  );
}
