import type { Metadata } from "next";
import { CustomCursor, SiteInteractions } from "@/components/site-interactions";
import { ScrollEngine } from "@/components/scroll-engine";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PartnerForm } from "@/components/partner-form";
import { PROGRAMS } from "@/lib/partners/programs";
import { PageBackdrop, BACKDROPS, GLASS } from "@/components/page-backdrop";

export const metadata: Metadata = {
  title: "Partner With Duli | Partner Programmes",
  description:
    "Grow with Duli Interiors — execution partners, design studios, affiliates and education partners across India.",
};

export default function PartnersPage() {
  return (
    <>
      <CustomCursor />
      <SiteInteractions />
      <ScrollEngine />
      <SiteHeader />

      <main data-app-ui className="font-sans text-ink">
        <PageBackdrop image={BACKDROPS.warm} scrim="light" />
        {/* Hero */}
        <section className="mx-auto max-w-[1180px] px-6 pb-14 pt-32 md:pt-40">
          <div className={`mx-auto max-w-[46rem] px-6 py-10 text-center md:px-10 ${GLASS}`}>
            <p
              data-reveal="up"
              className="text-[13px] font-semibold uppercase tracking-[0.16em] text-brass"
            >
              Partner programmes
            </p>
            <h1
              data-reveal="up"
              data-delay="80"
              className="mt-3 font-serif text-[38px] leading-[1.05] tracking-tight md:text-[54px]"
            >
              Grow your business with Duli.
            </h1>
            <p data-reveal="up" data-delay="160" className="mt-5 text-[17px] text-muted">
              Duli runs city by city, with vetted local partners delivering
              interiors under one professional brand. Whether you build, design,
              refer or teach — there’s a way to work with us.
            </p>
            <a
              href="#apply"
              className="btn-solid mt-8 inline-flex"
              data-reveal="up"
              data-delay="240"
            >
              Explore partnership options <span aria-hidden="true">→</span>
            </a>
          </div>
        </section>

        {/* Programmes */}
        <section className="bg-surface/85 backdrop-blur-md">
          <div className="mx-auto max-w-[1180px] px-6 py-16 md:py-20">
            <h2
              data-reveal="up"
              className="text-center font-serif text-[30px] md:text-[38px]"
            >
              Four ways to partner.
            </h2>
            <div className="mt-12 grid gap-5 md:grid-cols-2">
              {PROGRAMS.map((p, i) => (
                <article
                  key={p.id}
                  id={p.id}
                  data-reveal="up"
                  data-delay={String(80 * i)}
                  className="scroll-mt-28 rounded-2xl border border-stone bg-bg p-7 transition-[transform,box-shadow] duration-500 ease-premium hover:-translate-y-1 hover:shadow-card"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brass">
                    {p.tagline}
                  </p>
                  <h3 className="mt-2 font-serif text-2xl">{p.name}</h3>
                  <p className="mt-2 text-[13.5px] text-muted">{p.who}</p>

                  <ul className="mt-5 space-y-2.5">
                    {p.benefits.map((b) => (
                      <li key={b} className="flex gap-2.5 text-[13.5px]">
                        <Check />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>

                  <a
                    href="#apply"
                    className="mt-6 inline-flex h-10 cursor-pointer items-center justify-center rounded-full border border-ink px-5 text-[13px] font-medium transition-colors duration-200 hover:bg-ink hover:text-bg"
                  >
                    Apply as {p.name}
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Apply */}
        <section id="apply" className="scroll-mt-24">
          <div className="mx-auto grid max-w-[1180px] gap-12 px-6 py-16 md:py-20 lg:grid-cols-[1fr_1.15fr]">
            <div className={`h-fit px-6 py-8 md:px-8 ${GLASS}`}>
              <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-brass">
                Apply
              </p>
              <h2 className="mt-3 font-serif text-[30px] leading-tight md:text-[38px]">
                Tell us about your work.
              </h2>
              <p className="mt-4 max-w-[46ch] text-[15px] text-muted">
                Share a few details and our partnerships team will review your
                application and get in touch.
              </p>
              <dl className="mt-8 space-y-4 text-sm">
                <div>
                  <dt className="text-muted">Email</dt>
                  <dd>info@duliinteriors.com</dd>
                </div>
                <div>
                  <dt className="text-muted">Cities</dt>
                  <dd>Delhi · Mumbai · Pune · Bengaluru — and expanding</dd>
                </div>
              </dl>
            </div>

            <div className="rounded-2xl border border-stone bg-surface p-6 md:p-8">
              <PartnerForm />
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}

function Check() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mt-[3px] shrink-0 text-olive"
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
