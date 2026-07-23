import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Eyebrow } from "@/components/dashboard-ui";
import { Pill } from "@/components/app-ui";
import { ProjectTabs } from "@/components/project-tabs";
import { GLASS } from "@/components/page-backdrop";

/**
 * Shared chrome for the project workspace: back link, title, tabs.
 *
 * Layouts can't hand data to their children in the App Router, so each tab
 * re-queries what it needs. That keeps every tab independently correct — and
 * RLS is what scopes the data either way, not this fetch.
 */
export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  const supabase = createSupabaseServerClient();
  if (!supabase) notFound();

  const { data: project } = await supabase
    .from("projects")
    .select("id, code, name, status, city, budget_level")
    .eq("id", params.id)
    .is("deleted_at", null)
    .maybeSingle();

  // RLS means a project you can't access simply isn't returned.
  if (!project) notFound();

  return (
    <div>
      <div className={`px-5 py-4 sm:px-6 ${GLASS}`}>
        <a
          href="/projects"
          className="cursor-pointer text-[12.5px] text-muted underline underline-offset-2 hover:text-ink"
        >
          ← All projects
        </a>

        <div className="mt-2.5">
          <Eyebrow>{project.code}</Eyebrow>
          <h1 className="font-serif text-[26px] leading-tight sm:text-[34px]">
            {project.name}
          </h1>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            <Pill tone="brass">{project.status.replace(/_/g, " ")}</Pill>
            {project.city && <Pill>{project.city}</Pill>}
            {project.budget_level && <Pill>{project.budget_level}</Pill>}
          </div>
        </div>

        <ProjectTabs projectId={project.id} />
      </div>

      <div className="mt-6">{children}</div>
    </div>
  );
}
