"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, Sparkles } from "lucide-react";
import { createEstimate } from "@/lib/estimate/actions";

type Line = {
  roomName: string;
  category: string;
  description: string;
  quantity: string;
  unitRate: string;
  unit: string;
};

/**
 * A pre-fillable line seeded from the project — the "design → quote" bridge.
 * Numbers here become editable string cells the designer can adjust.
 */
export type EstimateSeedLine = {
  roomName: string;
  category: string;
  description: string;
  quantity: number;
  unit?: string;
  unitRate: number;
};

/**
 * One starting point for a new estimate (e.g. the product selections, or the
 * drawn floor-plan rooms). Each becomes a "Build from…" button.
 */
export type EstimateSeedSource = {
  key: string;
  /** Button suffix, e.g. "3 selected products". */
  label: string;
  /** Estimate title when this source is chosen. */
  title: string;
  lines: EstimateSeedLine[];
};

const blank: Line = {
  roomName: "",
  category: "",
  description: "",
  quantity: "1",
  unit: "no",
  unitRate: "",
};

const seedToLine = (s: EstimateSeedLine): Line => ({
  roomName: s.roomName,
  category: s.category,
  description: s.description,
  quantity: String(s.quantity),
  unit: s.unit ?? "no",
  unitRate: String(s.unitRate),
});

const inr = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

const cell =
  "h-9 w-full rounded-lg border border-ink/10 bg-white/70 px-2.5 text-[12.5px] focus:border-olive focus:outline-none focus:ring-2 focus:ring-olive/20";

export function EstimateBuilder({
  projectId,
  seeds = [],
}: {
  projectId: string;
  seeds?: EstimateSeedSource[];
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("Interior estimate");
  const [discount, setDiscount] = useState("0");
  const [lines, setLines] = useState<Line[]>([{ ...blank }]);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  const usableSeeds = seeds.filter((s) => s.lines.length > 0);

  const openBlank = () => {
    setLines([{ ...blank }]);
    setTitle("Interior estimate");
    setOpen(true);
  };
  const openFromSeed = (source: EstimateSeedSource) => {
    setLines(source.lines.map(seedToLine));
    setTitle(source.title);
    setOpen(true);
  };

  const set = (i: number, k: keyof Line, v: string) =>
    setLines((ls) => ls.map((l, idx) => (idx === i ? { ...l, [k]: v } : l)));
  const addRow = () => setLines((ls) => [...ls, { ...blank }]);
  const removeRow = (i: number) =>
    setLines((ls) => (ls.length > 1 ? ls.filter((_, idx) => idx !== i) : ls));

  const subtotal = lines.reduce(
    (s, l) => s + (Number(l.quantity) || 0) * (Number(l.unitRate) || 0),
    0,
  );
  const disc = Math.min(Number(discount) || 0, subtotal);
  const tax = Math.round((subtotal - disc) * 0.18);
  const total = subtotal - disc + tax;

  const submit = () =>
    startTransition(async () => {
      setError(null);
      const res = await createEstimate({
        projectId,
        title,
        discount: Number(discount) || 0,
        items: lines.map((l) => ({
          roomName: l.roomName || undefined,
          category: l.category,
          description: l.description,
          quantity: Number(l.quantity) || 0,
          unit: l.unit,
          unitRate: Number(l.unitRate) || 0,
        })),
      });
      if (res?.error) setError(res.error);
      else setOk(true);
    });

  if (ok) {
    return (
      <div className="rounded-xl border border-olive/30 bg-olive/[0.07] px-4 py-3 text-[13px]">
        Estimate created and shared with the customer.
      </div>
    );
  }

  if (!open) {
    const hasSeeds = usableSeeds.length > 0;
    return (
      <div className="flex flex-wrap items-center gap-3">
        {usableSeeds.map((source) => (
          <button
            key={source.key}
            type="button"
            onClick={() => openFromSeed(source)}
            className="btn-solid h-10 text-[13px]"
          >
            <Sparkles size={15} strokeWidth={2} /> Build from {source.label}
          </button>
        ))}
        <button
          type="button"
          onClick={openBlank}
          className={
            hasSeeds
              ? "inline-flex h-10 items-center gap-1.5 rounded-full border border-ink/15 px-4 text-[13px] font-medium text-ink hover:bg-ink/[0.05]"
              : "btn-solid h-10 text-[13px]"
          }
        >
          <Plus size={15} strokeWidth={2} /> {hasSeeds ? "Start blank" : "Create an estimate"}
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/70 bg-gradient-to-b from-white to-bg/60 p-5 backdrop-blur-xl">
      <div className="mb-3 flex items-center justify-between">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="h-9 w-[min(320px,60%)] rounded-lg border border-ink/10 bg-white/70 px-3 text-[14px] font-semibold focus:border-olive focus:outline-none"
        />
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-[12px] text-muted underline underline-offset-2"
        >
          Cancel
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-[12.5px]">
          <thead>
            <tr className="text-left text-[10.5px] uppercase tracking-[0.1em] text-muted">
              <th className="px-1 py-1 font-semibold">Room</th>
              <th className="px-1 py-1 font-semibold">Category</th>
              <th className="px-1 py-1 font-semibold">Description</th>
              <th className="px-1 py-1 font-semibold">Qty</th>
              <th className="px-1 py-1 font-semibold">Unit</th>
              <th className="px-1 py-1 font-semibold">Rate</th>
              <th className="px-1 py-1 text-right font-semibold">Amount</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {lines.map((l, i) => (
              <tr key={i}>
                <td className="px-1 py-1"><input className={cell} value={l.roomName} onChange={(e) => set(i, "roomName", e.target.value)} placeholder="Living" /></td>
                <td className="px-1 py-1"><input className={cell} value={l.category} onChange={(e) => set(i, "category", e.target.value)} placeholder="Carpentry" /></td>
                <td className="px-1 py-1"><input className={cell} value={l.description} onChange={(e) => set(i, "description", e.target.value)} placeholder="TV unit" /></td>
                <td className="px-1 py-1 w-[64px]"><input className={cell} inputMode="decimal" value={l.quantity} onChange={(e) => set(i, "quantity", e.target.value)} /></td>
                <td className="px-1 py-1 w-[64px]"><input className={cell} value={l.unit} onChange={(e) => set(i, "unit", e.target.value)} /></td>
                <td className="px-1 py-1 w-[90px]"><input className={cell} inputMode="numeric" value={l.unitRate} onChange={(e) => set(i, "unitRate", e.target.value)} placeholder="4800" /></td>
                <td className="px-1 py-1 text-right tabular-nums">{inr((Number(l.quantity) || 0) * (Number(l.unitRate) || 0))}</td>
                <td className="px-1 py-1">
                  <button type="button" onClick={() => removeRow(i)} className="cursor-pointer text-muted hover:text-terracotta" aria-label="Remove row">
                    <Trash2 size={14} strokeWidth={1.9} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button type="button" onClick={addRow} className="mt-2 inline-flex items-center gap-1 text-[12.5px] font-medium text-olive">
        <Plus size={13} strokeWidth={2.2} /> Add line
      </button>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-4 border-t border-ink/[0.07] pt-4">
        <label className="text-[12px] text-muted">
          Discount (₹)
          <input className={`${cell} mt-1 w-[120px]`} inputMode="numeric" value={discount} onChange={(e) => setDiscount(e.target.value)} />
        </label>
        <dl className="text-right text-[12.5px]">
          <div className="flex justify-end gap-6"><dt className="text-muted">Subtotal</dt><dd className="tabular-nums">{inr(subtotal)}</dd></div>
          <div className="flex justify-end gap-6"><dt className="text-muted">Tax (18%)</dt><dd className="tabular-nums">{inr(tax)}</dd></div>
          <div className="flex justify-end gap-6 font-semibold"><dt>Total</dt><dd className="font-serif text-[16px] tabular-nums">{inr(total)}</dd></div>
        </dl>
      </div>

      {error && <p className="mt-2 text-[12px] text-terracotta">{error}</p>}

      <button type="button" disabled={pending} onClick={submit} className="btn-solid mt-4 h-10 text-[13px] disabled:opacity-60">
        {pending ? "Creating…" : "Create & share estimate"}
      </button>
    </div>
  );
}
