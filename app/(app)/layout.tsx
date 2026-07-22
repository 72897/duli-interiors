import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  getMyRoles,
  isAdminRole,
  getProjects,
  getNotifications,
  getCurrentUser,
  isCurrentUserDeactivated,
} from "@/lib/services";
import { ROLE_LABELS, type Role } from "@/lib/types";
import { CustomCursor, SiteInteractions } from "@/components/site-interactions";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { AppSidebar } from "@/components/app-sidebar";
import { AppToolbar } from "@/components/app-toolbar";
import { PageBackdrop, BACKDROPS } from "@/components/page-backdrop";

/** Priority order — the first role a user holds is the one we label them with. */
const ROLE_PRIORITY: Role[] = [
  "super_admin",
  "admin",
  "project_manager",
  "designer",
  "sales",
  "vendor",
  "contractor",
];

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createSupabaseServerClient();

  // Middleware gates these routes; re-check here so the layout has a trusted
  // user rather than trusting the edge alone.
  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/login?redirect=/dashboard");

    // A deactivated (soft-deleted) account keeps a valid session until it
    // expires — lock it out here and clear the session.
    if (await isCurrentUserDeactivated()) {
      await supabase.auth.signOut();
      redirect("/account-deactivated");
    }
  }

  const [roles, projects, notifications, user] = await Promise.all([
    getMyRoles(),
    getProjects(),
    getNotifications(),
    getCurrentUser(),
  ]);

  const primaryRole: Role =
    ROLE_PRIORITY.find((r) => roles.includes(r)) ?? "customer";
  const showAdmin = isAdminRole(roles);
  // Admins support vendors, so they get the vendor portal too.
  const showVendor = showAdmin || roles.includes("vendor");

  // Send the toolbar only what it renders, not whole rows.
  const toolbarProjects = projects.map((p) => ({
    id: p.id,
    name: p.name,
    code: p.code,
    status: p.status,
  }));
  const toolbarNotifications = notifications.slice(0, 12).map((n) => ({
    id: n.id,
    type: n.type,
    title: n.title,
    body: n.body,
    actionUrl: n.actionUrl ?? null,
    readAt: n.readAt ?? null,
    createdAt: n.createdAt,
  }));

  return (
    <>
      <CustomCursor />
      <SiteInteractions />
      <SiteHeader />

      <div
        data-app-ui
        className="relative flex min-h-screen flex-col font-sans text-ink"
      >
        <PageBackdrop image={BACKDROPS.living} scrim="none" />

        <main className="flex-1 px-5 pb-16 pt-28 sm:px-8 md:pt-32">
          <div className="mx-auto flex max-w-[1320px] gap-7">
            <AppSidebar
              showAdmin={showAdmin}
              showVendor={showVendor}
              roleLabel={ROLE_LABELS[primaryRole]}
            />
            <div className="min-w-0 flex-1">
              <AppToolbar
                projects={toolbarProjects}
                notifications={toolbarNotifications}
                credits={user?.credits ?? { used: 0, total: 0 }}
              />
              {children}
            </div>
          </div>
        </main>
      </div>

      <SiteFooter />
    </>
  );
}
