import type { Metadata } from "next";
import { requireProject } from "@/lib/projects/workspace";
import {
  getEstimate,
  getProjectItems,
  getMyRoles,
  isStaffRole,
} from "@/lib/services";
import { getFloorPlan } from "@/lib/floor-plan/data";
import { polygonAreaSqFt } from "@/lib/floor-plan/types";
import { Panel, Pill, MockNotice, inr, shortDate } from "@/components/app-ui";
import { EstimateBuilder, type EstimateSeedSource } from "@/components/estimate-builder";
import { EstimateDecision } from "@/components/estimate-decision";
import type { EstimateStatus } from "@/lib/types";

export const metadata: Metadata = { title: "Estimate — Duli Interiors" };

const STATUS_TONE: Record<EstimateStatus, "neutral" | "brass" | "olive" | "terracotta"> = {
  draft: "neutral",
  sent: "brass",
  approved: "olive",
  revision_requested: "terracotta",
  expired: "neutral",
};

export default async function ProjectEstimatePage({
  params,
}: {
  params: { id: string };
}) {
  const [{ project }, roles] = await Promise.all([
    requireProject(params.id),
    getMyRoles(),
  ]);
  const staff = isStaffRole(roles);
  const [estimate, selections, plan] = await Promise.all([
    getEstimate(project.id),
    // Only staff can create an estimate, so only they need the seeds.
    staff ? getProjectItems(project.id) : Promise.resolve([]),
    staff ? getFloorPlan(project.id) : Promise.resolve(null),
  ]);

  // Two starting points for a new estimate ("design → quote"), both fully
  // editable once opened. Products carry real prices; drawn rooms carry real
  // carpet areas for ₹/sqft area-work lines (ceiling, flooring, painting…).
  const seeds: EstimateSeedSource[] = [];
  if (selections.length > 0) {
    seeds.push({
      key: "products",
      label: `${selections.length} selected product${selections.length === 1 ? "" : "s"}`,
      title: "Estimate from selected products",
      lines: selections.map((s) => ({
        roomName: s.roomName ?? "",
        category: s.category ? s.category.replace(/_/g, " ") : "Furniture",
        description: s.name,
        quantity: s.quantity,
        unitRate: s.unitPrice,
      })),
    });
  }
  const drawnRooms = (plan?.rooms ?? [])
    .map((r) => ({ name: r.name, area: Math.round(polygonAreaSqFt(r.points)) }))
    .filter((r) => r.area > 0);
  if (drawnRooms.length > 0) {
    seeds.push({
      key: "rooms",
      label: `${drawnRooms.length} drawn room${drawnRooms.length === 1 ? "" : "s"}`,
      title: "Estimate from floor plan",
      lines: drawnRooms.map((r) => ({
        roomName: r.name,
        category: "Area work",
        description: `${r.name} — carpet area`,
        quantity: r.area,
        unit: "sqft",
        unitRate: 0,
      })),
    });
  }
  // The mock fallback has the fixed id "e-1"; a real estimate has a uuid.
  const isReal = estimate.id !== "e-1";

  // Group by room so the BOQ reads like a walkthrough of the home, not a
  // flat ledger. Items without a room fall into "Other".
  const groups = new Map<string, typeof estimate.items>();
  for (const item of estimate.items) {
    const key = item.roomName ?? "Other";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(item);
  }

  return (
    <div className="space-y-5">
      {/* Staff can create a real estimate; replaces the sample below once made.
          Seedable from product selections and/or the drawn floor plan. */}
      {staff && <EstimateBuilder projectId={project.id} seeds={seeds} />}

      {/* Customer's call on a real, sent estimate: approve or request changes. */}
      {!staff && isReal && (
        <EstimateDecision
          estimateId={estimate.id}
          projectId={project.id}
          status={estimate.status}
        />
      )}

      {!isReal && (
        <MockNotice>
          A sample bill of quantity until a designer creates the real one. The
          tax line is an 18% GST placeholder, not a binding quote.
        </MockNotice>
      )}

      <Panel className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="font-serif text-[21px]">{estimate.title}</h2>
              <Pill tone={STATUS_TONE[estimate.status]}>
                {estimate.status.replace(/_/g, " ")}
              </Pill>
            </div>
            <p className="mt-1 text-[12px] text-muted">
              Updated {shortDate(estimate.updatedAt)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted">
              Total
            </p>
            <p className="font-serif text-[30px] leading-none tracking-tight">
              {inr(estimate.total)}
            </p>
          </div>
        </div>
      </Panel>

      {[...groups.entries()].map(([room, items]) => (
        <Panel key={room} className="overflow-hidden">
          <div className="border-b border-ink/[0.07] px-5 py-3">
            <h3 className="text-[14px] font-semibold">{room}</h3>
          </div>
          {/* Table scrolls inside its own container on narrow screens */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-[12.5px]">
              <thead>
                <tr className="text-left text-[10.5px] uppercase tracking-[0.12em] text-muted">
                  <th className="px-5 py-2.5 font-semibold">Description</th>
                  <th className="px-3 py-2.5 font-semibold">Qty</th>
                  <th className="px-3 py-2.5 font-semibold">Rate</th>
                  <th className="px-5 py-2.5 text-right font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody>
                {items.map((li) => (
                  <tr key={li.id} className="border-t border-ink/[0.05]">
                    <td className="px-5 py-2.5">
                      {li.description}
                      <span className="ml-1.5 text-[11px] capitalize text-muted">
                        · {li.category}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 tabular-nums text-muted">
                      {li.quantity} {li.unit}
                    </td>
                    <td className="px-3 py-2.5 tabular-nums text-muted">
                      {inr(li.unitRate)}
                    </td>
                    <td className="px-5 py-2.5 text-right tabular-nums">
                      {inr(li.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      ))}

      <Panel className="p-6">
        <dl className="ml-auto max-w-[280px] space-y-2 text-[13px]">
          <div className="flex justify-between">
            <dt className="text-muted">Subtotal</dt>
            <dd className="tabular-nums">{inr(estimate.subtotal)}</dd>
          </div>
          {estimate.discount > 0 && (
            <div className="flex justify-between">
              <dt className="text-muted">Discount</dt>
              <dd className="tabular-nums text-olive">−{inr(estimate.discount)}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-muted">Tax (placeholder)</dt>
            <dd className="tabular-nums">{inr(estimate.tax)}</dd>
          </div>
          <div className="flex justify-between border-t border-ink/[0.09] pt-2 font-semibold">
            <dt>Total</dt>
            <dd className="font-serif text-[19px] tabular-nums">
              {inr(estimate.total)}
            </dd>
          </div>
        </dl>

        <div className="mt-6 flex flex-wrap justify-end gap-2.5">
          <a href={`/proposal/${project.id}`} className="btn-solid h-10 text-[13px]">
            View proposal &amp; export <span aria-hidden="true">→</span>
          </a>
        </div>
      </Panel>
    </div>
  );
}
