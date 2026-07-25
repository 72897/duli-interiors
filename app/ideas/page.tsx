import type { Metadata } from "next";
import { CustomCursor, SiteInteractions } from "@/components/site-interactions";
import { ScrollEngine } from "@/components/scroll-engine";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { IdeaGallery } from "@/components/idea-gallery";
import { PageBackdrop, BACKDROPS, GLASS } from "@/components/page-backdrop";
import { Breadcrumbs } from "@/components/breadcrumbs";

export const metadata: Metadata = {
  title: "Design Ideas | Duli Interiors",
  description:
    "Browse interior design ideas by room and style — then start a project from any of them.",
};

export default function IdeasPage() {
  return (
    <>
      <CustomCursor />
      <SiteInteractions />
      <ScrollEngine />
      <SiteHeader />

      <main data-app-ui className="font-sans text-ink">
        <PageBackdrop image={BACKDROPS.minimal} scrim="light" />

        <section className="mx-auto max-w-[1180px] px-6 pb-14 pt-32 md:pt-40">
          <div className={`mx-auto max-w-[46rem] px-6 py-10 text-center md:px-10 ${GLASS}`}>
            <Breadcrumbs
              items={[{ label: "Home", href: "/" }, { label: "Design Ideas" }]}
              className="justify-center"
            />
            <p
              data-reveal="up"
              className="mt-3 text-[13px] font-semibold uppercase tracking-[0.16em] text-brass"
            >
              Design ideas
            </p>
            <h1
              data-reveal="up"
              data-delay="80"
              className="mt-3 font-serif text-[38px] leading-[1.05] tracking-tight md:text-[52px]"
            >
              Find a room you love.
            </h1>
            <p
              data-reveal="up"
              data-delay="160"
              className="mx-auto mt-5 max-w-[52ch] text-[16px] text-muted"
            >
              Browse by space and style. Pick one and we’ll carry the direction
              straight into your project brief.
            </p>
          </div>
        </section>

        <section className="bg-surface/85 pb-20 backdrop-blur-md">
          <div className="mx-auto max-w-[1180px] px-6 pt-14">
            <IdeaGallery />
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
