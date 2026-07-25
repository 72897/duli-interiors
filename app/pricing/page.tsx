import type { Metadata } from "next";
import { CustomCursor, SiteInteractions } from "@/components/site-interactions";
import { ScrollEngine } from "@/components/scroll-engine";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PricingTable } from "@/components/pricing-table";
import { PageBackdrop, BACKDROPS, GLASS } from "@/components/page-backdrop";

export const metadata: Metadata = {
  title: "Pricing | Duli Interiors",
  description:
    "Start free with 10 AI interior concepts. Then ₹999/month for unlimited projects — every concept reviewed by a Duli designer.",
};

const FAQS = [
  {
    q: "What counts as a generation?",
    a: "One AI-generated interior concept for one room. Regenerating a concept or creating a variation uses another generation.",
  },
  {
    q: "What happens after my 10 free generations?",
    a: "Your projects and concepts stay yours. To generate more, move to the Home plan at ₹999/month — or talk to us about a one-off design engagement.",
  },
  {
    q: "Is every concept really reviewed by a designer?",
    a: "Yes. No AI concept reaches you unchecked — a Duli designer reviews, refines and approves it first. AI concepts are always labelled as such.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. Monthly plans can be cancelled at any time and stay active until the end of the billing period.",
  },
];

export default function PricingPage() {
  return (
    <>
      <CustomCursor />
      <SiteInteractions />
      <ScrollEngine />
      <SiteHeader />

      <main data-app-ui className="font-sans text-ink">
        <PageBackdrop image={BACKDROPS.minimal} scrim="light" />
        <section className="mx-auto max-w-[1180px] px-6 pb-16 pt-32 md:pt-40">
          <div className={`mx-auto max-w-[46rem] px-6 py-10 text-center md:px-10 ${GLASS}`}>
            <p
              data-reveal="up"
              className="text-[13px] font-semibold uppercase tracking-[0.16em] text-brass"
            >
              Pricing
            </p>
            <h1
              data-reveal="up"
              data-delay="80"
              className="mx-auto mt-3 max-w-[16ch] font-serif text-[38px] leading-[1.05] tracking-tight md:text-[56px]"
            >
              Start free. Design your whole home.
            </h1>
            <p
              data-reveal="up"
              data-delay="160"
              className="mx-auto mt-5 max-w-[54ch] text-[17px] text-muted"
            >
              Your first <strong className="text-ink">10 AI concepts are free</strong>
              . After that, ₹999/month — with every concept reviewed by a Duli
              designer before it reaches you.
            </p>
          </div>

          <div className="mt-12" data-reveal="up" data-delay="240">
            <PricingTable />
          </div>
        </section>

        <section className="bg-surface/85 backdrop-blur-md">
          <div className="mx-auto max-w-[820px] px-6 py-16 md:py-20">
            <h2
              data-reveal="up"
              className="text-center font-serif text-[30px] md:text-[38px]"
            >
              Questions, answered.
            </h2>
            <dl className="mt-10 divide-y divide-stone border-y border-stone">
              {FAQS.map((f, i) => (
                <div
                  key={f.q}
                  className="py-5"
                  data-reveal="up"
                  data-delay={String(60 * i)}
                >
                  <dt className="text-[16px] font-semibold text-ink">{f.q}</dt>
                  <dd className="mt-2 text-[14.5px] leading-relaxed text-muted">
                    {f.a}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-10 text-center text-sm text-muted">
              Still deciding?{" "}
              <a
                href="/#contact"
                className="text-olive underline underline-offset-2"
              >
                Book a free consultation
              </a>
              .
            </p>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
