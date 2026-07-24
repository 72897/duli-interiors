import type { Metadata } from "next";
import { UserX } from "lucide-react";
import { CustomCursor, SiteInteractions } from "@/components/site-interactions";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PageBackdrop, BACKDROPS, GLASS } from "@/components/page-backdrop";

export const metadata: Metadata = {
  title: "Account deactivated — Duli Interiors",
};

/**
 * Where a soft-deleted account lands after being locked out. Public — the user
 * no longer has app access. Reactivation is a support action (an admin clears
 * the flag), so this points to contact rather than a self-serve button.
 */
export default function AccountDeactivatedPage() {
  return (
    <>
      <CustomCursor />
      <SiteInteractions />
      <SiteHeader />

      <main data-app-ui className="font-sans text-ink">
        <PageBackdrop image={BACKDROPS.minimal} scrim="light" />
        <section className="mx-auto flex min-h-screen max-w-[1180px] items-center justify-center px-6 py-32">
          <div className={`mx-auto max-w-[34rem] px-8 py-12 text-center ${GLASS}`}>
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-ink/[0.06] text-muted">
              <UserX size={26} strokeWidth={1.6} />
            </span>
            <h1 className="mt-5 font-serif text-[28px] leading-tight sm:text-[32px]">
              Your account is deactivated
            </h1>
            <p className="mx-auto mt-3 max-w-[44ch] text-[14.5px] text-muted">
              This account has been deactivated, so it can&apos;t be used to sign
              in. Your projects and history are kept safe — reactivating is quick
              if you&apos;d like to come back.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <a href="/contact" className="btn-solid h-11">
                Contact us to reactivate <span aria-hidden="true">→</span>
              </a>
              <a
                href="/"
                className="inline-flex h-11 cursor-pointer items-center rounded-full border border-ink px-5 text-sm font-medium transition-colors duration-200 hover:bg-ink hover:text-bg"
              >
                Back home
              </a>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
