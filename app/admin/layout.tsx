import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getMyRoles, isAdminRole, isCurrentUserDeactivated } from "@/lib/services";
import { ROLE_LABELS } from "@/lib/types";
import { CustomCursor, SiteInteractions } from "@/components/site-interactions";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PageBackdrop, BACKDROPS } from "@/components/page-backdrop";
import { AccessDenied } from "@/components/access-denied";
import { AdminNav } from "@/components/admin-nav";

/**
 * The single gate for every /admin route. Sub-pages assume they're already
 * behind it and just render content — no page re-checks the role. RLS still
 * scopes the data underneath, so this is defence-in-depth, not the only guard.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createSupabaseServerClient();
  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/login?redirect=/admin");

    if (await isCurrentUserDeactivated()) {
      await supabase.auth.signOut();
      redirect("/account-deactivated");
    }
  }

  const roles = await getMyRoles();
  const allowed = isAdminRole(roles);

  return (
    <>
      <CustomCursor />
      <SiteInteractions />
      <SiteHeader />

      <main data-app-ui className="font-sans text-ink">
        <PageBackdrop image={BACKDROPS.minimal} scrim="light" />

        <section className="mx-auto max-w-[1180px] px-6 pb-20 pt-32 md:pt-36">
          {!allowed ? (
            <AccessDenied
              roles={roles}
              title="Admin access only"
              message="This area manages platform-wide data. Your account doesn't have an admin role, so there's nothing here for you — that's by design, not an error."
            />
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-brass">
                  {roles.includes("super_admin") ? "Super Admin" : "Admin"}
                </p>
                <span className="rounded-full border border-stone bg-surface px-3 py-1.5 text-[12px] text-muted">
                  {roles.map((r) => ROLE_LABELS[r] ?? r).join(" · ")}
                </span>
              </div>

              <AdminNav />

              <div className="mt-7">{children}</div>
            </>
          )}
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
