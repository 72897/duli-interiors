import type { Metadata } from "next";
import { getProjects } from "@/lib/services";
import { PageHead, Panel, MockNotice } from "@/components/app-ui";
import { DesignChat } from "@/components/design-chat";

export const metadata: Metadata = { title: "AI Studio — Duli Interiors" };

export default async function AIStudioPage() {
  const projects = await getProjects();

  return (
    <div>
      <PageHead
        eyebrow="Design"
        title="AI Studio"
        intro="Describe the room you want. We'll read the brief, match a direction and pull pieces from the catalog."
      />

      <MockNotice>
        Concepts are matched from our catalog and reference rooms — the studio
        doesn&apos;t generate new images yet, so nothing here is invented.
      </MockNotice>

      <div className="grid gap-5 lg:grid-cols-[1.55fr_1fr]">
        <Panel className="p-5 sm:p-6">
          <DesignChat />
        </Panel>

        <div className="space-y-5">
          <Panel className="p-6">
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted">
              Your projects
            </p>
            {projects.length === 0 ? (
              <>
                <p className="mt-2.5 text-[12.5px] leading-relaxed text-muted">
                  You don&apos;t have a project yet. Start one and the studio can
                  carry the brief — rooms, budget and city — straight into it.
                </p>
                <a href="/projects/new" className="btn-solid mt-4 inline-flex h-10 text-[13px]">
                  Start a project <span aria-hidden="true">→</span>
                </a>
              </>
            ) : (
              <ul className="mt-3 space-y-1.5">
                {projects.slice(0, 5).map((p) => (
                  <li key={p.id}>
                    <a
                      href={`/projects/${p.id}`}
                      className="flex cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-2 text-[13px] transition-colors duration-200 hover:bg-ink/[0.05]"
                    >
                      <span className="min-w-0 truncate">{p.name}</span>
                      <span className="shrink-0 text-[11px] text-muted">
                        {p.status.replace(/_/g, " ")}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel className="p-6">
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted">
              Getting a better result
            </p>
            <ul className="mt-3 space-y-2.5 text-[12.5px] leading-relaxed text-muted">
              <li>Name the room and the city — availability and cost both shift by metro.</li>
              <li>Give real measurements if you have them. We never guess dimensions.</li>
              <li>Say what you don&apos;t want. Ruling things out narrows a direction fast.</li>
            </ul>
          </Panel>
        </div>
      </div>
    </div>
  );
}
