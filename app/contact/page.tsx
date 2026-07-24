import type { Metadata } from "next";
import { CustomCursor, SiteInteractions } from "@/components/site-interactions";
import { ScrollEngine } from "@/components/scroll-engine";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ConsultForm } from "@/components/consult-form";
import { PageBackdrop, BACKDROPS, GLASS } from "@/components/page-backdrop";

export const metadata: Metadata = {
  title: "Contact | Duli Interiors",
  description:
    "Tell us about your space. A Duli designer will reach out to schedule your free consultation.",
};

const POINTS = [
  {
    t: "A designer calls within 24 hours",
    d: "No call centre. You speak to someone who designs homes.",
  },
  {
    t: "Free consultation",
    d: "We understand your space, routines and budget before anything is designed.",
  },
  {
    t: "Transparent from day one",
    d: "Every material and cost is shared upfront — no surprise invoices.",
  },
];

export default function ContactPage() {
  return (
    <>
      <CustomCursor />
      <SiteInteractions />
      <ScrollEngine />
      <SiteHeader />

      <main data-app-ui className="font-sans text-ink">
        <PageBackdrop image={BACKDROPS.warm} scrim="light" />

        <section className="mx-auto max-w-[1180px] px-6 pb-20 pt-32 md:pt-40">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr]">
            <div className={`h-fit px-6 py-9 md:px-9 ${GLASS}`}>
              <p
                data-reveal="up"
                className="text-[13px] font-semibold uppercase tracking-[0.16em] text-brass"
              >
                Book a free visit
              </p>
              <h1
                data-reveal="up"
                data-delay="80"
                className="mt-3 font-serif text-[36px] leading-[1.05] tracking-tight md:text-[48px]"
              >
                Let’s design your home.
              </h1>
              <p
                data-reveal="up"
                data-delay="150"
                className="mt-4 max-w-[46ch] text-[15.5px] text-muted"
              >
                Tell us a little about your space. A designer will reach out to
                schedule your free consultation.
              </p>

              <ul className="mt-8 space-y-5">
                {POINTS.map((p, i) => (
                  <li key={p.t} data-reveal="up" data-delay={String(200 + i * 70)}>
                    <p className="text-[14.5px] font-semibold">{p.t}</p>
                    <p className="mt-0.5 text-[13px] text-muted">{p.d}</p>
                  </li>
                ))}
              </ul>

              <dl className="mt-8 border-t border-stone/70 pt-6 text-sm">
                <dt className="text-muted">Email</dt>
                <dd>info@duliinteriors.com</dd>
                <dt className="mt-3 text-muted">Cities</dt>
                <dd>Delhi · Mumbai · Pune · Bengaluru</dd>
              </dl>
            </div>

            <div data-reveal="up" data-delay="120">
              <ConsultForm />
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
