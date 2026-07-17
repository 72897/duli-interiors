"use client";

import { useState } from "react";
import { PLANS, YEARLY_SAVE_PCT, inr, type Billing } from "@/lib/pricing/plans";

export function PricingTable() {
  const [billing, setBilling] = useState<Billing>("yearly");
  const yearly = billing === "yearly";

  return (
    <div data-app-ui className="font-sans text-ink">
      {/* Billing toggle */}
      <div className="flex justify-center">
        <div
          className="inline-flex items-center gap-1 rounded-full border border-stone bg-surface p-1"
          role="group"
          aria-label="Billing period"
        >
          {(["monthly", "yearly"] as Billing[]).map((b) => {
            const active = billing === b;
            return (
              <button
                key={b}
                type="button"
                onClick={() => setBilling(b)}
                aria-pressed={active}
                className={
                  "cursor-pointer rounded-full px-5 py-2 text-sm capitalize transition-colors duration-200 " +
                  (active ? "bg-ink text-bg" : "text-muted hover:text-ink")
                }
              >
                {b}
                {b === "yearly" && (
                  <span
                    className={
                      "ml-2 rounded-full px-2 py-[2px] text-[10px] font-semibold uppercase tracking-wide " +
                      (active ? "bg-brass text-bg" : "bg-brass/15 text-brass")
                    }
                  >
                    Save {YEARLY_SAVE_PCT}%
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Plans */}
      <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {PLANS.map((p) => {
          const custom = p.monthly === null;
          const price = yearly ? p.yearlyPerMonth : p.monthly;
          const showStrike = yearly && !custom && p.monthly! > 0;

          return (
            <div
              key={p.id}
              className={
                "relative flex flex-col rounded-2xl border bg-surface p-6 " +
                (p.popular
                  ? "border-brass shadow-card"
                  : "border-stone")
              }
            >
              {p.popular && (
                <span className="absolute -top-3 left-6 rounded-full bg-brass px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-bg">
                  Most popular
                </span>
              )}

              <div className="flex items-center gap-2">
                <h3 className="font-serif text-2xl">{p.name}</h3>
                <span className="rounded-full border border-stone px-2 py-[2px] text-[10px] uppercase tracking-wide text-muted">
                  {p.audience}
                </span>
              </div>

              <div className="mt-5 min-h-[74px]">
                {custom ? (
                  <p className="font-serif text-3xl">Let’s talk</p>
                ) : (
                  <>
                    <div className="flex items-end gap-2">
                      {showStrike && (
                        <span className="text-base text-muted line-through">
                          {inr(p.monthly!)}
                        </span>
                      )}
                      <span className="font-serif text-4xl leading-none">
                        {inr(price!)}
                      </span>
                      {p.monthly! > 0 && (
                        <span className="pb-1 text-sm text-muted">/month</span>
                      )}
                    </div>
                    <p className="mt-1.5 text-xs text-muted">
                      {p.monthly === 0
                        ? "Free forever — no card needed"
                        : yearly
                          ? `Billed yearly, ${inr(p.yearlyTotal!)}/year`
                          : "Billed monthly"}
                    </p>
                  </>
                )}
              </div>

              <p className="text-[13px] text-muted">{p.blurb}</p>

              <ul className="mt-5 flex-1 space-y-2.5">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-2.5 text-[13.5px]">
                    <Check />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <a
                href={p.cta.href}
                className={
                  p.popular
                    ? "btn-solid mt-6 justify-center"
                    : "mt-6 inline-flex h-11 cursor-pointer items-center justify-center rounded-full border border-ink px-6 text-sm font-medium transition-colors duration-200 hover:bg-ink hover:text-bg"
                }
              >
                {p.cta.label}
              </a>
            </div>
          );
        })}
      </div>

      {/* Sits on the photo backdrop — give it its own surface to stay legible. */}
      <p className="mx-auto mt-8 max-w-[70ch] rounded-full border border-white/60 bg-white/70 px-5 py-2.5 text-center text-xs text-muted backdrop-blur-md">
        Prices in INR, inclusive of applicable taxes shown at checkout. Online
        payment is being connected — until then our team helps you activate a
        paid plan after you sign up.
      </p>
    </div>
  );
}

function Check() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mt-[3px] shrink-0 text-olive"
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
