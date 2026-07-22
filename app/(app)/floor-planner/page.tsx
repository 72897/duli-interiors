import type { Metadata } from "next";
import Link from "next/link";
import { PenTool } from "lucide-react";
import { getProjects } from "@/lib/services";
import { getFloorPlanAreas } from "@/lib/floor-plan/data";
import { PageHead, Panel, Pill } from "@/components/app-ui";
import { EmptyState } from "@/components/dashboard-ui";

export const metadata: Metadata = { title: "Floor Planner — Duli Interiors" };

export default async function FloorPlannerPage() {
  const projects = await getProjects();
  const areas = await getFloorPlanAreas(projects.map((p) => p.id));

  return (
    <div>
      <PageHead
        eyebrow="Design"
        title="Floor Planner"
        intro="Trace each project's walls on a scaled grid — rooms, doors and live carpet areas."
        actions={
          projects.length > 0 ? (
            <a href="/projects/new" className="btn-solid h-10 text-[13px]">
              New project <span aria-hidden="true">→</span>
            </a>
          ) : undefined
        }
      />

      {projects.length === 0 ? (
        <EmptyState
          title="No projects to plan"
          description="Start a project, then open its floor plan to draw rooms and get live carpet areas."
          ctaHref="/projects/new"
          ctaLabel="Start a project"
        />
      ) : (
        <div className="space-y-3">
          {projects.map((p) => {
            const drawn = areas[p.id];
            const hasDrawn = drawn && drawn.areaSqFt > 0;
            return (
              <Panel key={p.id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h3 className="font-serif text-[18px]">{p.name}</h3>
                      <Pill>{p.propertyType.replace(/_/g, " ")}</Pill>
                      {p.bhk && <Pill tone="brass">{p.bhk}</Pill>}
                    </div>
                    <p className="mt-1 text-[12.5px] text-muted">
                      {p.city}
                      {hasDrawn
                        ? ` · ${drawn.roomCount} room${drawn.roomCount === 1 ? "" : "s"} drawn`
                        : p.roomCount
                          ? ` · ${p.roomCount} rooms`
                          : ""}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted">
                      {hasDrawn ? "Drawn carpet area" : "Carpet area"}
                    </p>
                    <p className="font-serif text-[22px] leading-none tracking-tight">
                      {hasDrawn ? (
                        <>
                          {Math.round(drawn.areaSqFt).toLocaleString("en-IN")}
                          <span className="text-[13px] text-muted"> sq ft</span>
                        </>
                      ) : p.carpetAreaSqFt ? (
                        <>
                          {p.carpetAreaSqFt.toLocaleString("en-IN")}
                          <span className="text-[13px] text-muted"> sq ft</span>
                        </>
                      ) : (
                        <span className="text-[13px] text-muted">Not drawn yet</span>
                      )}
                    </p>
                  </div>
                </div>

                <Link
                  href={`/projects/${p.id}/floor-plan`}
                  scroll={false}
                  className="mt-4 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-olive underline underline-offset-2"
                >
                  <PenTool size={13} strokeWidth={2} />
                  {hasDrawn ? "Open floor plan editor" : "Draw the floor plan"} →
                </Link>
              </Panel>
            );
          })}
        </div>
      )}
    </div>
  );
}
