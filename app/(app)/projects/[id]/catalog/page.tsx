import type { Metadata } from "next";
import { MapPin } from "lucide-react";
import { requireProject } from "@/lib/projects/workspace";
import { getCatalogItems, getProjectItems } from "@/lib/services";
import { Panel, Pill, SectionTitle, inr } from "@/components/app-ui";
import { AddToProjectButton } from "@/components/add-to-project";
import { ProjectSelections } from "@/components/project-selections";
import type { BudgetTier } from "@/lib/types";

export const metadata: Metadata = { title: "Catalog — Duli Interiors" };

const TIER_TONE: Record<BudgetTier, "neutral" | "brass" | "olive"> = {
  budget: "neutral",
  standard: "neutral",
  premium: "brass",
  luxury: "olive",
};

export default async function ProjectCatalogPage({
  params,
}: {
  params: { id: string };
}) {
  const { project } = await requireProject(params.id);
  const [items, selections] = await Promise.all([
    getCatalogItems(),
    getProjectItems(project.id),
  ]);

  return (
    <div className="space-y-5">
      {/* Your selections — the "design" you're building for this project */}
      <Panel className="p-6">
        <SectionTitle>Your selections</SectionTitle>
        <div className="mt-2">
          <ProjectSelections projectId={project.id} items={selections} />
        </div>
      </Panel>

      <h2 className="font-serif text-[20px]">Browse the catalog</h2>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-4">
        {items.map((item) => (
          <Panel key={item.id} className="group flex flex-col">
            <div className="relative h-[150px] overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.imageUrl}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-[900ms] ease-premium group-hover:scale-[1.05]"
              />
              <span
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-ink/45 to-transparent"
              />
              <span className="absolute left-3 top-3">
                <Pill tone={TIER_TONE[item.budgetTier]}>{item.budgetTier}</Pill>
              </span>
            </div>

            <div className="flex flex-1 flex-col p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-brass">
                {item.category.replace(/_/g, " ")}
              </p>
              <h3 className="mt-1 font-serif text-[15.5px] leading-snug">
                {item.name}
              </h3>
              {item.dimensions && (
                <p className="mt-1 text-[11.5px] text-muted">{item.dimensions}</p>
              )}
              {item.vendorName && (
                <p className="mt-0.5 text-[11.5px] text-muted">{item.vendorName}</p>
              )}

              <p className="mt-2.5 font-serif text-[17px] tracking-tight">
                {item.priceMin === item.priceMax
                  ? inr(item.priceMin)
                  : `${inr(item.priceMin)} – ${inr(item.priceMax)}`}
              </p>

              {item.cityAvailability.length > 0 && (
                <p className="mt-auto flex items-center gap-1 pt-2.5 text-[11px] text-muted">
                  <MapPin size={11} strokeWidth={1.8} />
                  {item.cityAvailability.slice(0, 2).join(", ")}
                </p>
              )}

              {/* Real — adds this piece to the project's selections. */}
              <div className="mt-3">
                <AddToProjectButton projectId={project.id} catalogItemId={item.id} />
              </div>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
