import type { Metadata } from "next";
import { getEstimates } from "@/lib/services";
import { PageHead, Panel, Pill, MockNotice, inr, shortDate } from "@/components/app-ui";
import { EmptyState, StatCard } from "@/components/dashboard-ui";
import type { EstimateStatus } from "@/lib/types";

export const metadata: Metadata = { title: "Estimates — Duli Interiors" };

const STATUS_TONE: Record<EstimateStatus, "neutral" | "brass" | "olive" | "terracotta"> = {
  draft: "neutral",
  sent: "brass",
  approved: "olive",
  revision_requested: "terracotta",
  expired: "neutral",
};

export default async function EstimatesPage() {
  const estimates = await getEstimates();

  const approvedValue = estimates
    .filter((e) => e.status === "approved")
    .reduce((sum, e) => sum + e.total, 0);
  const awaiting = estimates.filter((e) => e.status === "sent").length;

  return (
    <div>
      <PageHead
        eyebrow="Sourcing"
        title="Estimates"
        intro="Bills of quantity for your rooms — line items, GST and totals in one place."
      />

      <MockNotice>
        Sample estimates. Line items are illustrative and the tax line is a
        placeholder, not a GST calculation.
      </MockNotice>

      {estimates.length === 0 ? (
        <EmptyState
          title="No estimates yet"
          description="Once a design is approved we'll price it room by room and the BOQ shows up here."
          ctaHref="/projects"
          ctaLabel="View your projects"
        />
      ) : (
        <>
          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            <StatCard label="Estimates" value={estimates.length} />
            <StatCard label="Awaiting you" value={awaiting} />
            <StatCard label="Approved value" value={inr(approvedValue)} />
          </div>

          <div className="space-y-4">
            {estimates.map((e) => (
              <Panel key={e.id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h3 className="font-serif text-[19px]">{e.title}</h3>
                      <Pill tone={STATUS_TONE[e.status]}>
                        {e.status.replace(/_/g, " ")}
                      </Pill>
                    </div>
                    <p className="mt-1 text-[12px] text-muted">
                      {e.items.length} line items · updated {shortDate(e.updatedAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted">
                      Total
                    </p>
                    <p className="font-serif text-[26px] leading-none tracking-tight">
                      {inr(e.total)}
                    </p>
                  </div>
                </div>

                {/* Top lines only — the full BOQ lives on the project workspace */}
                <div className="mt-4 space-y-1.5 border-t border-ink/[0.07] pt-4">
                  {e.items.slice(0, 3).map((li) => (
                    <div
                      key={li.id}
                      className="flex items-center justify-between gap-4 text-[12.5px]"
                    >
                      <span className="min-w-0 truncate text-muted">
                        {li.roomName ? `${li.roomName} · ` : ""}
                        {li.description}
                      </span>
                      <span className="shrink-0 tabular-nums">{inr(li.amount)}</span>
                    </div>
                  ))}
                  {e.items.length > 3 && (
                    <p className="pt-1 text-[12px] text-muted">
                      +{e.items.length - 3} more lines
                    </p>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap gap-4 border-t border-ink/[0.07] pt-3 text-[12px] text-muted">
                  <span>Subtotal {inr(e.subtotal)}</span>
                  {e.discount > 0 && <span>Discount −{inr(e.discount)}</span>}
                  <span>Tax {inr(e.tax)}</span>
                </div>

                <a
                  href={`/projects/${e.projectId}`}
                  className="mt-4 inline-flex text-[12.5px] font-medium text-olive underline underline-offset-2"
                >
                  Open project workspace →
                </a>
              </Panel>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
