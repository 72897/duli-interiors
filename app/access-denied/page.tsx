import type { Metadata } from "next";
import { CustomCursor, SiteInteractions } from "@/components/site-interactions";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PageBackdrop, BACKDROPS } from "@/components/page-backdrop";
import { AccessDenied } from "@/components/access-denied";
import { getMyRoles } from "@/lib/services";

export const metadata: Metadata = { title: "Access denied — Duli Interiors" };

/**
 * Standalone denied page (spec utility route). Areas do their own inline gating
 * with the same component; this is the linkable, generic version.
 */
export default async function AccessDeniedPage() {
  const roles = await getMyRoles();

  return (
    <>
      <CustomCursor />
      <SiteInteractions />
      <SiteHeader />

      <main data-app-ui className="font-sans text-ink">
        <PageBackdrop image={BACKDROPS.minimal} scrim="light" />
        <section className="mx-auto flex min-h-screen max-w-[1180px] items-center justify-center px-6 py-32">
          <AccessDenied roles={roles} />
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
