import type { Metadata } from "next";
import { Mail, Phone, MapPin } from "lucide-react";
import { getMyRoles, isAdminRole, getLeads } from "@/lib/services";
import { AccessDenied } from "@/components/access-denied";
import { PageHead, Panel, Pill, shortDate } from "@/components/app-ui";
import { EmptyState } from "@/components/dashboard-ui";
import { LeadStatusControl } from "@/components/lead-status";

export const metadata: Metadata = { title: "Leads — Duli Interiors" };

const STATUS_TONE: Record<string, "neutral" | "brass" | "olive" | "terracotta"> = {
  new: "brass",
  contacted: "brass",
  qualified: "olive",
  consultation_booked: "olive",
  converted_to_project: "olive",
  not_qualified: "neutral",
  lost: "terracotta",
};

const inr = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN");

export default async function LeadsPage() {
  const roles = await getMyRoles();
  if (!isAdminRole(roles) && !roles.includes("sales")) {
    return (
      <AccessDenied
        roles={roles}
        title="Sales access only"
        message="The lead pipeline is for the Duli sales team. Your account doesn't have a sales role."
      />
    );
  }

  const leads = await getLeads();
  const open = leads.filter(
    (l) => !["converted_to_project", "lost", "not_qualified"].includes(l.status),
  ).length;

  return (
    <div>
      <PageHead
        eyebrow="Sales"
        title="Lead pipeline"
        intro="Prospective clients and where each one sits in the funnel."
      />

      {leads.length === 0 ? (
        <EmptyState
          title="No leads yet"
          description="Incoming enquiries appear here as they arrive. Update each lead's stage to move it along the pipeline."
          ctaHref="/dashboard"
          ctaLabel="Back to dashboard"
        />
      ) : (
        <>
          <p className="mb-4 text-[13px] text-muted">
            <span className="font-semibold text-ink">{leads.length}</span> lead
            {leads.length === 1 ? "" : "s"} · {open} open
          </p>
          <div className="space-y-3">
            {leads.map((l) => (
              <Panel key={l.id} className="flex flex-wrap items-start justify-between gap-4 p-5">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <p className="text-[15px] font-semibold">{l.fullName}</p>
                    <Pill tone={STATUS_TONE[l.status] ?? "neutral"}>
                      {l.status.replace(/_/g, " ")}
                    </Pill>
                    {l.source && <Pill>{l.source}</Pill>}
                  </div>
                  <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-muted">
                    {l.city && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin size={11} strokeWidth={1.8} />
                        {l.city}
                      </span>
                    )}
                    {l.phone && (
                      <span className="inline-flex items-center gap-1">
                        <Phone size={11} strokeWidth={1.8} />
                        {l.phone}
                      </span>
                    )}
                    {l.email && (
                      <span className="inline-flex items-center gap-1">
                        <Mail size={11} strokeWidth={1.8} />
                        {l.email}
                      </span>
                    )}
                  </p>
                  <p className="mt-1 text-[12px] text-muted">
                    {l.serviceType ? `${l.serviceType} · ` : ""}
                    {l.estimatedBudget ? `${inr(l.estimatedBudget)} · ` : ""}
                    added {shortDate(l.createdAt)}
                  </p>
                  {l.notes && (
                    <p className="mt-1.5 max-w-[60ch] text-[12.5px] text-ink/70">{l.notes}</p>
                  )}
                </div>
                <LeadStatusControl id={l.id} status={l.status} />
              </Panel>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
