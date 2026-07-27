import type { Metadata } from "next";
import { MapPin, Phone, FolderKanban } from "lucide-react";
import { getMyRoles, isAdminRole, isStaffRole, getClients } from "@/lib/services";
import { AccessDenied } from "@/components/access-denied";
import { PageHead, Panel } from "@/components/app-ui";
import { EmptyState } from "@/components/dashboard-ui";

export const metadata: Metadata = { title: "Clients — Duli Interiors" };

export default async function ClientsPage() {
  const roles = await getMyRoles();
  if (!isAdminRole(roles) && !isStaffRole(roles)) {
    return (
      <AccessDenied
        roles={roles}
        title="Staff access only"
        message="The client list is for Duli designers and the sales team. Your account doesn't have a staff role."
      />
    );
  }

  const clients = await getClients();

  return (
    <div>
      <PageHead
        eyebrow="Relationships"
        title="Clients"
        intro="The homeowners you're working with, and their active projects."
      />

      {clients.length === 0 ? (
        <EmptyState
          title="No clients yet"
          description="Customers with a project appear here with their city, contact and project count as projects come in."
          ctaHref="/dashboard"
          ctaLabel="Back to dashboard"
        />
      ) : (
        <>
          <p className="mb-4 text-[13px] text-muted">
            <span className="font-semibold text-ink">{clients.length}</span> client
            {clients.length === 1 ? "" : "s"} with active projects
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {clients.map((c) => (
              <Panel key={c.id} className="flex items-center justify-between gap-4 p-5">
                <div className="flex min-w-0 items-center gap-3.5">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-olive text-[15px] font-semibold text-bg">
                    {c.name.charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[14.5px] font-semibold">{c.name}</p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-3 text-[12px] text-muted">
                      {c.city && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin size={11} strokeWidth={1.8} />
                          {c.city}
                        </span>
                      )}
                      {c.phone && (
                        <span className="inline-flex items-center gap-1">
                          <Phone size={11} strokeWidth={1.8} />
                          {c.phone}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1.5 text-[12.5px] text-muted">
                  <FolderKanban size={13} strokeWidth={1.8} />
                  {c.projectCount}
                </div>
              </Panel>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
