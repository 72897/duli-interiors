import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  Eyebrow,
  PageTitle,
  EmptyState,
  ProjectCard,
} from "@/components/dashboard-ui";

export const metadata: Metadata = { title: "Projects — Duli Interiors" };

type ProjectRow = {
  id: string;
  code: string;
  name: string;
  status: string;
  city: string | null;
  created_at: string;
};

export default async function ProjectsListPage({
  searchParams,
}: {
  searchParams: { created?: string };
}) {
  const supabase = createSupabaseServerClient();
  let projects: ProjectRow[] = [];
  if (supabase) {
    const { data } = await supabase
      .from("projects")
      .select("id, code, name, status, city, created_at")
      .is("deleted_at", null)
      .order("created_at", { ascending: false });
    projects = data ?? [];
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Eyebrow>Your projects</Eyebrow>
          <PageTitle>Projects</PageTitle>
        </div>
        <a href="/projects/new" className="btn-solid">
          New project <span aria-hidden="true">→</span>
        </a>
      </div>

      {searchParams.created && (
        <div
          className="mt-5 rounded-lg border border-success/40 bg-success/10 px-3.5 py-2.5 text-[13.5px] text-[#4c6146]"
          role="status"
        >
          Project created
          {searchParams.created !== "1" ? ` — ${searchParams.created}` : ""}. A
          designer will begin the review shortly.
        </div>
      )}

      {projects.length === 0 ? (
        <EmptyState
          title="No projects yet"
          description="Create your first project to share your rooms and receive reviewed concepts."
          ctaHref="/projects/new"
          ctaLabel="Start a project"
        />
      ) : (
        <div className="mt-7 grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-[18px]">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}
    </div>
  );
}
