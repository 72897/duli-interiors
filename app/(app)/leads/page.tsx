import type { Metadata } from "next";
import { getMyRoles, isAdminRole } from "@/lib/services";
import { AccessDenied } from "@/components/access-denied";
import { PageHead } from "@/components/app-ui";
import { EmptyState } from "@/components/dashboard-ui";

export const metadata: Metadata = { title: "Leads — Duli Interiors" };

export default async function LeadsPage() {
  const roles = await getMyRoles();
  // Sales owns the pipeline; admins oversee it.
  if (!isAdminRole(roles) && !roles.includes("sales")) {
    return (
      <AccessDenied
        roles={roles}
        title="Sales access only"
        message="The lead pipeline is for the Duli sales team. Your account doesn't have a sales role."
      />
    );
  }

  return (
    <div>
      <PageHead
        eyebrow="Sales"
        title="Lead pipeline"
        intro="Prospective clients and where each one sits in the funnel."
      />
      <EmptyState
        title="No leads to show"
        description="Incoming enquiries and their pipeline stage will appear here once lead capture is wired to the contact and consultation forms."
        ctaHref="/dashboard"
        ctaLabel="Back to dashboard"
      />
    </div>
  );
}
