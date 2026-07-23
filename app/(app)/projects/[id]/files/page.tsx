import type { Metadata } from "next";
import { requireProject, loadUploads } from "@/lib/projects/workspace";
import { ProjectUploader } from "@/components/project-uploader";
import { UploadList } from "@/components/upload-list";
import { Panel } from "@/components/app-ui";
import type { UploadBucket } from "@/lib/uploads/config";

export const metadata: Metadata = { title: "Files — Duli Interiors" };

const SECTIONS: { bucket: UploadBucket; title: string; blurb: string }[] = [
  {
    bucket: "room-photos",
    title: "Room photos",
    blurb:
      "Photos of the rooms as they are today. These anchor your concepts to your real space.",
  },
  {
    bucket: "floor-plans",
    title: "Floor plan",
    blurb:
      "A builder floor plan or sketch. Helps us understand layout, doors and windows.",
  },
  {
    bucket: "reference-images",
    title: "Inspiration",
    blurb: "Any looks you love — we use them as direction, never copied.",
  },
];

export default async function ProjectFilesPage({
  params,
}: {
  params: { id: string };
}) {
  const { project } = await requireProject(params.id);
  const uploads = await loadUploads(project.id);
  const byBucket = (b: string) => uploads.filter((u) => u.bucket === b);

  return (
    <div className="space-y-5">
      <Panel className="p-6">
        <p className="max-w-[62ch] text-[13px] text-muted">
          Your files are stored privately and shared only with the Duli team
          working on your project.
        </p>
      </Panel>

      {SECTIONS.map((s) => (
        <Panel key={s.bucket} className="p-6">
          <h2 className="text-[15px] font-semibold">{s.title}</h2>
          <p className="mb-3 mt-0.5 max-w-[62ch] text-[12.5px] text-muted">
            {s.blurb}
          </p>
          <ProjectUploader projectId={project.id} bucket={s.bucket} />
          <UploadList uploads={byBucket(s.bucket)} projectId={project.id} />
        </Panel>
      ))}
    </div>
  );
}
