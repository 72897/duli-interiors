import type { Metadata } from "next";
import { Sparkles, MessageCircle, Boxes, Calendar } from "lucide-react";
import { Panel, Pill, MockNotice } from "@/components/app-ui";

export const metadata: Metadata = { title: "Integrations — Duli Interiors" };

const INTEGRATIONS = [
  {
    icon: Sparkles,
    name: "Google Gemini",
    desc: "Reads your room photos and floor plans for AI analysis.",
    status: "connected" as const,
  },
  {
    icon: MessageCircle,
    name: "WhatsApp",
    desc: "Project updates over WhatsApp — the default channel in India.",
    status: "planned" as const,
  },
  {
    icon: Boxes,
    name: "Vendor catalogs",
    desc: "Live SKUs and pricing from partner brands and suppliers.",
    status: "planned" as const,
  },
  {
    icon: Calendar,
    name: "Calendar",
    desc: "Sync consultations and site visits to your calendar.",
    status: "planned" as const,
  },
];

export default function IntegrationsPage() {
  return (
    <div>
      <MockNotice>
        Gemini is live and powering AI analysis. The rest are on the roadmap —
        shown so you know what&apos;s coming, not faked as connectable.
      </MockNotice>

      <div className="grid gap-4 sm:grid-cols-2">
        {INTEGRATIONS.map((it) => {
          const Icon = it.icon;
          const connected = it.status === "connected";
          return (
            <Panel key={it.name} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <span
                  className={
                    "grid h-11 w-11 place-items-center rounded-xl ring-1 " +
                    (connected
                      ? "bg-olive/12 text-olive ring-olive/20"
                      : "bg-ink/[0.05] text-muted ring-ink/[0.06]")
                  }
                >
                  <Icon size={18} strokeWidth={1.8} />
                </span>
                {connected ? (
                  <Pill tone="olive">Connected</Pill>
                ) : (
                  <Pill>Planned</Pill>
                )}
              </div>
              <p className="mt-3 text-[14.5px] font-semibold">{it.name}</p>
              <p className="mt-1 text-[12.5px] leading-relaxed text-muted">
                {it.desc}
              </p>
            </Panel>
          );
        })}
      </div>
    </div>
  );
}
