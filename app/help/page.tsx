import type { Metadata } from "next";
import { Mail, MessageCircle, BookOpen } from "lucide-react";
import { CustomCursor, SiteInteractions } from "@/components/site-interactions";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PageBackdrop, BACKDROPS, GLASS } from "@/components/page-backdrop";

export const metadata: Metadata = {
  title: "Help & support — Duli Interiors",
  description:
    "Get help with your Duli project — reach our team, or read answers to common questions.",
};

const FAQS = [
  {
    q: "Is Duli really free?",
    a: "Yes — everything is free while we're in preview. There's no card on file and no paid gateway. When paid plans arrive, nothing switches on without you choosing it.",
  },
  {
    q: "How does the AI analysis work?",
    a: "We read your uploaded room photos and floor plans to understand the space. It never guesses measurements from a photo — anything that can't be confirmed is flagged and reviewed by a Duli designer.",
  },
  {
    q: "Which cities do you cover?",
    a: "We work across major Indian metros — Delhi NCR, Mumbai, Pune, Bengaluru and more. Availability and pricing vary by city.",
  },
  {
    q: "Are my uploads private?",
    a: "Yes. Files are stored privately and shared only with the Duli team working on your project.",
  },
];

const CHANNELS = [
  {
    icon: Mail,
    title: "Email us",
    body: "info@duliinteriors.com — we usually reply within a working day.",
    href: "mailto:info@duliinteriors.com",
    cta: "Send an email",
  },
  {
    icon: MessageCircle,
    title: "Talk to a designer",
    body: "Book a call or site visit to talk through your space.",
    href: "/contact",
    cta: "Request a consultation",
  },
  {
    icon: BookOpen,
    title: "Browse ideas",
    body: "See rooms by space and style to shape your brief.",
    href: "/ideas",
    cta: "Explore ideas",
  },
];

export default function HelpPage() {
  return (
    <>
      <CustomCursor />
      <SiteInteractions />
      <SiteHeader />

      <main data-app-ui className="font-sans text-ink">
        <PageBackdrop image={BACKDROPS.warm} scrim="light" />

        <section className="mx-auto max-w-[1080px] px-6 pb-20 pt-32 md:pt-40">
          <div className={`mx-auto max-w-[44rem] px-8 py-10 text-center ${GLASS}`}>
            <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-brass">
              Help &amp; support
            </p>
            <h1 className="mt-3 font-serif text-[36px] leading-[1.05] md:text-[46px]">
              How can we help?
            </h1>
            <p className="mx-auto mt-4 max-w-[48ch] text-[15px] text-muted">
              Reach our team directly, or read through the questions we hear most.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {CHANNELS.map((c) => {
              const Icon = c.icon;
              return (
                <div key={c.title} className={`p-6 ${GLASS}`}>
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-brass/12 text-brass ring-1 ring-brass/20">
                    <Icon size={18} strokeWidth={1.8} />
                  </span>
                  <p className="mt-3 text-[15px] font-semibold">{c.title}</p>
                  <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted">
                    {c.body}
                  </p>
                  <a
                    href={c.href}
                    className="mt-4 inline-flex text-[12.5px] font-medium text-olive underline underline-offset-2"
                  >
                    {c.cta} →
                  </a>
                </div>
              );
            })}
          </div>

          <div className="mx-auto mt-10 max-w-[46rem]">
            <h2 className="mb-4 font-serif text-[24px]">Common questions</h2>
            <div className="space-y-3">
              {FAQS.map((f) => (
                <details
                  key={f.q}
                  className={`group px-5 py-4 [&_summary]:cursor-pointer ${GLASS}`}
                >
                  <summary className="flex items-center justify-between gap-4 text-[14.5px] font-medium marker:content-['']">
                    {f.q}
                    <span className="text-muted transition-transform duration-200 group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-2.5 text-[13.5px] leading-relaxed text-muted">
                    {f.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
