import type { Metadata } from "next";
import { CustomCursor, SiteInteractions } from "@/components/site-interactions";
import { ScrollEngine } from "@/components/scroll-engine";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ProjectGallery } from "@/components/project-gallery";
import { PageBackdrop, BACKDROPS, GLASS } from "@/components/page-backdrop";
import { Breadcrumbs } from "@/components/breadcrumbs";

export const metadata: Metadata = {
  title: "Our Work | Duli Interiors",
  description:
    "Homes we've designed, built and delivered across India — Delhi, Mumbai, Pune, Bengaluru and beyond.",
};

export default function OurWorkPage({
  searchParams,
}: {
  searchParams: { city?: string };
}) {
  const city = searchParams.city;

  return (
    <>
      <CustomCursor />
      <SiteInteractions />
      <ScrollEngine />
      <SiteHeader />

      <main data-app-ui className="font-sans text-ink">
        <PageBackdrop image={BACKDROPS.living} scrim="light" />

        <section className="mx-auto max-w-[1180px] px-6 pb-16 pt-32 md:pt-40">
          <div className={`mx-auto max-w-[46rem] px-6 py-10 text-center md:px-10 ${GLASS}`}>
            <Breadcrumbs
              items={[{ label: "Home", href: "/" }, { label: "Our work" }]}
              className="justify-center"
            />
            <p
              data-reveal="up"
              className="mt-3 text-[13px] font-semibold uppercase tracking-[0.16em] text-brass"
            >
              Recent projects
            </p>
            <h1
              data-reveal="up"
              data-delay="80"
              className="mt-3 font-serif text-[38px] leading-[1.05] tracking-tight md:text-[52px]"
            >
              {city ? `Homes in ${city}.` : "Designed, built, delivered."}
            </h1>
            <p
              data-reveal="up"
              data-delay="160"
              className="mx-auto mt-5 max-w-[52ch] text-[16px] text-muted"
            >
              A closer look at homes we’ve designed, built and delivered across
              India — real projects, real handovers.
            </p>
          </div>
        </section>

        <section className="bg-surface/85 pb-20 backdrop-blur-md">
          <div className="mx-auto max-w-[1680px] px-5 pt-14 md:px-10">
            <ProjectGallery />
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
