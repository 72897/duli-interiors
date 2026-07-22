import type { Metadata } from "next";
import { getMyRoles, isAdminRole, isStaffRole } from "@/lib/services";
import { AccessDenied } from "@/components/access-denied";
import { PageHead } from "@/components/app-ui";
import { EmptyState } from "@/components/dashboard-ui";

export const metadata: Metadata = { title: "Clients — Duli Interiors" };

export default async function ClientsPage() {
  const roles = await getMyRoles();
  // Designers and sales manage client relationships; admins oversee. isStaffRole
  // already covers designer/sales/PM/admin, so it's the right gate here.
  if (!isAdminRole(roles) && !isStaffRole(roles)) {
    return (
      <AccessDenied
        roles={roles}
        title="Staff access only"
        message="The client list is for Duli designers and the sales team. Your account doesn't have a staff role."
      />
    );
  }

  return (
    <div>
      <PageHead
        eyebrow="Relationships"
        title="Clients"
        intro="The homeowners you're working with, and their active projects."
      />
      <EmptyState
        title="No clients assigned"
        description="Once clients are assigned to you, you'll see each one here with their projects, city and current stage."
        ctaHref="/dashboard"
        ctaLabel="Back to dashboard"
      />
    </div>
  );
}
