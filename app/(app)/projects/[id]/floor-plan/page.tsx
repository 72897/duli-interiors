import type { Metadata } from "next";
import { requireProject, loadUploads } from "@/lib/projects/workspace";
import { getFloorPlan } from "@/lib/floor-plan/data";
import { ProjectUploader } from "@/components/project-uploader";
import { UploadList } from "@/components/upload-list";
import { FloorPlannerCanvas } from "@/components/floor-planner-canvas";
import { Panel, SectionTitle } from "@/components/app-ui";

export const metadata: Metadata = { title: "Floor Plan — Duli Interiors" };

export default async function ProjectFloorPlanPage({
  params,
}: {
  params: { id: string };
}) {
  const { project } = await requireProject(params.id);
  const [uploads, plan] = await Promise.all([
    loadUploads(project.id),
    getFloorPlan(project.id),
  ]);
  const plans = uploads.filter((u) => u.bucket === "floor-plans");

  return (
    <div className="space-y-6">
      {/* The real 2D editor: trace walls on the grid, name rooms, drop doors
          and windows. Carpet area is computed live from what's drawn. */}
      <FloorPlannerCanvas projectId={project.id} initialData={plan} />

      <div>
        <SectionTitle>Reference plan</SectionTitle>
        <Panel className="p-6">
          <p className="mb-3 max-w-[62ch] text-[12.5px] text-muted">
            Have a builder&apos;s plan or a sketch? Upload it here to trace from —
            it stays attached to the project for your designer.
          </p>
          <ProjectUploader projectId={project.id} bucket="floor-plans" />
          <UploadList uploads={plans} projectId={project.id} />
        </Panel>
      </div>
    </div>
  );
}
