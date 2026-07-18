"use client";

import { useState, useTransition } from "react";
import { Trash2, Minus, Plus } from "lucide-react";
import {
  removeProjectItem,
  setProjectItemQuantity,
} from "@/lib/project-items/actions";
import type { ProjectSelection } from "@/lib/services";

const inr = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

export function ProjectSelections({
  projectId,
  items,
}: {
  projectId: string;
  items: ProjectSelection[];
}) {
  const [pending, startTransition] = useTransition();
  // Optimistic local copy so quantity/remove feel instant.
  const [list, setList] = useState(items);

  const total = list.reduce((s, i) => s + i.unitPrice * i.quantity, 0);

  const setQty = (id: string, q: number) => {
    if (q < 1 || q > 999) return;
    setList((l) => l.map((i) => (i.id === id ? { ...i, quantity: q } : i)));
    startTransition(() => {
      void setProjectItemQuantity({ id, projectId, quantity: q });
    });
  };
  const remove = (id: string) => {
    setList((l) => l.filter((i) => i.id !== id));
    startTransition(() => {
      void removeProjectItem({ id, projectId });
    });
  };

  if (list.length === 0) {
    return (
      <p className="text-[13px] text-muted">
        No products selected yet — add pieces from the catalog below.
      </p>
    );
  }

  return (
    <div>
      <ul className="divide-y divide-ink/[0.06]">
        {list.map((it) => (
          <li key={it.id} className="flex items-center gap-3 py-3">
            {it.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={it.imageUrl}
                alt=""
                className="h-12 w-12 shrink-0 rounded-lg object-cover"
              />
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13.5px] font-medium">{it.name}</p>
              <p className="text-[11.5px] capitalize text-muted">
                {it.category.replace(/_/g, " ")}
                {it.roomName ? ` · ${it.roomName}` : ""} · {inr(it.unitPrice)} each
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={pending || it.quantity <= 1}
                onClick={() => setQty(it.id, it.quantity - 1)}
                aria-label="Decrease"
                className="grid h-7 w-7 cursor-pointer place-items-center rounded-full border border-ink/10 text-muted hover:bg-ink/[0.06] disabled:opacity-40"
              >
                <Minus size={13} strokeWidth={2} />
              </button>
              <span className="w-6 text-center text-[13px] tabular-nums">{it.quantity}</span>
              <button
                type="button"
                disabled={pending}
                onClick={() => setQty(it.id, it.quantity + 1)}
                aria-label="Increase"
                className="grid h-7 w-7 cursor-pointer place-items-center rounded-full border border-ink/10 text-muted hover:bg-ink/[0.06] disabled:opacity-40"
              >
                <Plus size={13} strokeWidth={2} />
              </button>
            </div>
            <p className="w-24 shrink-0 text-right text-[13px] font-medium tabular-nums">
              {inr(it.unitPrice * it.quantity)}
            </p>
            <button
              type="button"
              disabled={pending}
              onClick={() => remove(it.id)}
              aria-label="Remove"
              className="grid h-7 w-7 shrink-0 cursor-pointer place-items-center rounded-full text-muted hover:bg-terracotta/10 hover:text-terracotta"
            >
              <Trash2 size={14} strokeWidth={1.9} />
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex items-center justify-between border-t border-ink/[0.09] pt-3">
        <span className="text-[13px] text-muted">
          {list.length} product{list.length === 1 ? "" : "s"} · products only, before labour
        </span>
        <span className="font-serif text-[18px] tabular-nums">{inr(total)}</span>
      </div>
    </div>
  );
}
