import type { Metadata } from "next";
import { Compass } from "lucide-react";
import { CustomCursor, SiteInteractions } from "@/components/site-interactions";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PageBackdrop, BACKDROPS, GLASS } from "@/components/page-backdrop";

export const metadata: Metadata = { title: "Not found | Duli Interiors" };

/**
 * Root 404 (spec §13). Also what a caller of notFound() lands on — including a
 * project id that RLS withheld, so the copy can't promise the page "doesn't
 * exist": it may simply not be yours.
 */
export default function NotFound() {
  return (
    <>
      <CustomCursor />
      <SiteInteractions />
      <SiteHeader />

      <main data-app-ui className="font-sans text-ink">
        <PageBackdrop image={BACKDROPS.living} scrim="light" />

        <section className="mx-auto flex min-h-screen max-w-[1180px] items-center justify-center px-6 py-32">
          <div className={`mx-auto max-w-[36rem] px-8 py-12 text-center ${GLASS}`}>
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-brass/12 text-brass ring-1 ring-brass/20">
              <Compass size={26} strokeWidth={1.6} />
            </span>

            <p className="mt-5 text-[12px] font-semibold uppercase tracking-[0.16em] text-brass">
              404
            </p>
            <h1 className="mt-2 font-serif text-[34px] leading-tight md:text-[42px]">
              This room doesn&apos;t exist.
            </h1>
            <p className="mx-auto mt-4 max-w-[46ch] text-[15px] leading-relaxed text-muted">
              The page you&apos;re after has moved, or was never here. If you were
              opening a project, it may belong to a different account.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <a href="/" className="btn-solid h-11">
                Back home <span aria-hidden="true">→</span>
              </a>
              <a
                href="/dashboard"
                className="inline-flex h-11 cursor-pointer items-center rounded-full border border-ink px-5 text-sm font-medium transition-colors duration-200 hover:bg-ink hover:text-bg"
              >
                Your studio
              </a>
            </div>

            <p className="mt-7 text-[12.5px] text-muted">
              Looking for our work?{" "}
              <a
                href="/our-work"
                className="cursor-pointer text-olive underline underline-offset-2"
              >
                Browse recent projects
              </a>
            </p>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
