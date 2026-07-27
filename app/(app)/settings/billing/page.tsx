import type { Metadata } from "next";
import { Check } from "lucide-react";
import { getCurrentUser } from "@/lib/services";
import { Panel, Pill } from "@/components/app-ui";

export const metadata: Metadata = { title: "Billing — Duli Interiors" };

const INCLUDED = [
  "Unlimited projects",
  "AI room and floor-plan analysis",
  "3D previews and the design studio",
  "Reviewed concepts from Duli designers",
];

export default async function BillingPage() {
  const user = await getCurrentUser();
  const { used, total } = user?.credits ?? { used: 0, total: 0 };
  const remaining = Math.max(0, total - used);
  const pct = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Panel className="p-6">
        <div className="flex items-center justify-between">
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted">
            Your plan
          </p>
          <Pill tone="olive">Free</Pill>
        </div>
        <h2 className="mt-2 font-serif text-[28px] leading-none">
          Duli Free
          <span className="ml-2 align-middle text-[14px] text-muted">
            while in preview
          </span>
        </h2>
        <p className="mt-3 text-[13px] leading-relaxed text-muted">
          Everything is free right now. There&apos;s no card on file and no paid
          gateway — when paid plans arrive, nothing switches on without you
          choosing it.
        </p>

        <ul className="mt-5 space-y-2.5">
          {INCLUDED.map((f) => (
            <li key={f} className="flex items-start gap-2.5 text-[13px]">
              <Check size={15} strokeWidth={2.2} className="mt-0.5 shrink-0 text-olive" />
              {f}
            </li>
          ))}
        </ul>
      </Panel>

      <Panel className="p-6">
        <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted">
          AI credits
        </p>
        <p className="mt-2 font-serif text-[32px] leading-none tracking-tight">
          {remaining}
          <span className="text-[16px] text-muted"> / {total}</span>
        </p>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-ink/[0.07]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-olive to-brass"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-3 text-[12.5px] leading-relaxed text-muted">
          Credits track AI usage only — a meter, not a bill. They reset with each
          preview cycle and cost nothing.
        </p>

        <a
          href="/pricing"
          className="mt-6 flex h-11 w-full items-center justify-center rounded-full border border-ink text-[13px] font-medium text-ink transition-colors duration-200 hover:bg-ink hover:text-bg"
        >
          View plans <span aria-hidden="true" className="ml-1">→</span>
        </a>
        <p className="mt-2 text-center text-[11.5px] text-muted">
          Paid plans aren&apos;t billable yet — the team activates them manually.
        </p>
      </Panel>
    </div>
  );
}
