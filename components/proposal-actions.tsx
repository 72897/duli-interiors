"use client";

import { Printer, MessageCircle, Mail } from "lucide-react";

/**
 * Print / share bar for a proposal. "Save as PDF" uses the browser's print
 * engine (window.print) — reliable and branded, no server-side PDF library.
 * WhatsApp/email share is the Phase-1 CRM handoff. Hidden when printing.
 */
export function ProposalActions({
  shareUrl,
  projectName,
}: {
  shareUrl: string;
  projectName: string;
}) {
  const text = `Here's the Duli proposal for ${projectName}: ${shareUrl}`;
  const whatsapp = `https://wa.me/?text=${encodeURIComponent(text)}`;
  const email = `mailto:?subject=${encodeURIComponent(
    `Duli proposal — ${projectName}`,
  )}&body=${encodeURIComponent(text)}`;

  return (
    <div className="flex flex-wrap gap-2.5 print:hidden">
      <button type="button" onClick={() => window.print()} className="btn-solid h-10 text-[13px]">
        <Printer size={15} strokeWidth={2} /> Save as PDF
      </button>
      <a
        href={whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-full border border-olive/40 bg-olive/10 px-4 text-[13px] font-medium text-olive transition-colors hover:bg-olive/20"
      >
        <MessageCircle size={15} strokeWidth={2} /> WhatsApp
      </a>
      <a
        href={email}
        className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-full border border-ink/15 px-4 text-[13px] font-medium transition-colors hover:bg-ink/[0.05]"
      >
        <Mail size={15} strokeWidth={2} /> Email
      </a>
    </div>
  );
}
