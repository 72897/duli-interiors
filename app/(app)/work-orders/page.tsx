import type { Metadata } from "next";
import { getMyRoles, isAdminRole } from "@/lib/services";
import { AccessDenied } from "@/components/access-denied";
import { PageHead } from "@/components/app-ui";
import { EmptyState } from "@/components/dashboard-ui";

export const metadata: Metadata = { title: "Work orders — Duli Interiors" };

export default async function WorkOrdersPage() {
  const roles = await getMyRoles();
  // Contractors do the on-site work; admins oversee it.
  if (!isAdminRole(roles) && !roles.includes("contractor")) {
    return (
      <AccessDenied
        roles={roles}
        title="Contractor access only"
        message="Work orders are for contractors executing Duli projects on site. Your account doesn't have a contractor role."
      />
    );
  }

  return (
    <div>
      <PageHead
        eyebrow="Execution"
        title="Work orders"
        intro="Jobs assigned to you across live Duli projects — scope, site and schedule."
      />
      <EmptyState
        title="No work orders yet"
        description="When a project reaches execution and work is assigned to you, each order shows up here with its scope, site address and timeline."
        ctaHref="/dashboard"
        ctaLabel="Back to dashboard"
      />
    </div>
  );
}
