import type { Metadata } from "next";
import { MapPin } from "lucide-react";
import { getMyRoles, isAdminRole, getWorkOrders } from "@/lib/services";
import { AccessDenied } from "@/components/access-denied";
import { PageHead, Panel, Pill } from "@/components/app-ui";
import { EmptyState } from "@/components/dashboard-ui";

export const metadata: Metadata = { title: "Work orders — Duli Interiors" };

const STATUS_TONE: Record<string, "neutral" | "brass" | "olive" | "terracotta"> = {
  draft: "neutral",
  submitted: "brass",
  in_review: "brass",
  in_design: "brass",
  concepts_ready: "olive",
  revision_requested: "terracotta",
  approved: "olive",
  proposal_sent: "brass",
  accepted: "olive",
  completed: "olive",
  closed: "neutral",
  lost: "terracotta",
};

export default async function WorkOrdersPage() {
  const roles = await getMyRoles();
  if (!isAdminRole(roles) && !roles.includes("contractor")) {
    return (
      <AccessDenied
        roles={roles}
        title="Contractor access only"
        message="Work orders are for contractors executing Duli projects on site. Your account doesn't have a contractor role."
      />
    );
  }

  const orders = await getWorkOrders();

  return (
    <div>
      <PageHead
        eyebrow="Execution"
        title="Work orders"
        intro="Projects assigned to you across live Duli work — scope, site and status."
      />

      {orders.length === 0 ? (
        <EmptyState
          title="No work orders yet"
          description="When a project is assigned to you for execution, it shows up here with its status and city. Open one to see the full workspace."
          ctaHref="/dashboard"
          ctaLabel="Back to dashboard"
        />
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <Panel key={o.id} className="flex flex-wrap items-center justify-between gap-4 p-5">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2.5">
                  <p className="text-[15px] font-semibold">{o.name}</p>
                  <Pill tone={STATUS_TONE[o.status] ?? "neutral"}>
                    {o.status.replace(/_/g, " ")}
                  </Pill>
                </div>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-3 text-[12.5px] text-muted">
                  <span className="font-mono">{o.code}</span>
                  {o.city && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={11} strokeWidth={1.8} />
                      {o.city}
                    </span>
                  )}
                </p>
              </div>
              <a
                href={`/projects/${o.id}`}
                className="text-[12.5px] font-medium text-olive underline underline-offset-2"
              >
                Open workspace →
              </a>
            </Panel>
          ))}
        </div>
      )}
    </div>
  );
}
