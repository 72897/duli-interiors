"use client";

import { useState, useTransition } from "react";
import { Check } from "lucide-react";
import { updateMyVendor } from "@/lib/catalog/actions";
import { CATALOG_CATEGORIES } from "@/lib/types";

const field =
  "h-10 w-full rounded-lg border border-ink/10 bg-white/70 px-3 text-[13.5px] focus:border-olive focus:outline-none focus:ring-2 focus:ring-olive/20";

export function VendorProfileForm({
  initialName,
  initialCity,
  initialCategories,
}: {
  initialName: string;
  initialCity: string;
  initialCategories: string[];
}) {
  const [name, setName] = useState(initialName);
  const [city, setCity] = useState(initialCity);
  const [cats, setCats] = useState<string[]>(initialCategories);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const toggle = (v: string) =>
    setCats((c) => (c.includes(v) ? c.filter((x) => x !== v) : [...c, v]));

  const submit = () =>
    startTransition(async () => {
      setError(null);
      setSaved(false);
      const res = await updateMyVendor({ name, city, categories: cats });
      if (res?.error) setError(res.error);
      else setSaved(true);
    });

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted">
            Brand name
          </span>
          <input
            className={`${field} mt-1`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your brand"
          />
        </label>
        <label className="block">
          <span className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted">
            City
          </span>
          <input
            className={`${field} mt-1`}
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Mumbai"
          />
        </label>
      </div>

      <div>
        <span className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted">
          Categories
        </span>
        <div className="mt-2 flex flex-wrap gap-2">
          {CATALOG_CATEGORIES.map((c) => {
            const on = cats.includes(c.value);
            return (
              <button
                key={c.value}
                type="button"
                onClick={() => toggle(c.value)}
                className={
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12.5px] font-medium transition-colors " +
                  (on
                    ? "border-olive bg-olive/12 text-olive"
                    : "border-ink/12 text-ink/70 hover:bg-ink/[0.04]")
                }
              >
                {on && <Check size={12} strokeWidth={2.6} />}
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-1">
        <button
          type="button"
          disabled={pending}
          onClick={submit}
          className="btn-solid h-10 text-[13px] disabled:opacity-60"
        >
          {pending ? "Saving…" : saved ? (
            <>
              <Check size={15} strokeWidth={2.4} /> Saved
            </>
          ) : (
            "Save profile"
          )}
        </button>
        {error && <p className="text-[12px] text-terracotta">{error}</p>}
      </div>
    </div>
  );
}
