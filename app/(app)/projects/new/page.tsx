import type { Metadata } from "next";
import { ProjectWizard } from "@/components/project-wizard";
import { Eyebrow, PageTitle } from "@/components/dashboard-ui";
import { ROOM_TYPES } from "@/lib/projects/schema";

export const metadata: Metadata = { title: "New project — Duli Interiors" };

export default function NewProjectPage({
  searchParams,
}: {
  searchParams: { space?: string };
}) {
  // Coming from an idea template? Pre-add that room to the brief.
  const initialSpace = ROOM_TYPES.some((r) => r.value === searchParams.space)
    ? searchParams.space
    : undefined;

  return (
    <div>
      <Eyebrow>New project</Eyebrow>
      <PageTitle>Start a project</PageTitle>
      <p className="mt-2.5 max-w-[60ch] text-sm text-muted">
        A few quick steps. A Duli designer reviews your details before any
        concept is generated.
      </p>
      <ProjectWizard initialSpace={initialSpace} />
    </div>
  );
}
