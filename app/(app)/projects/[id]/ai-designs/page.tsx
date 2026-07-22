import type { Metadata } from "next";
import { requireProject, loadUploads } from "@/lib/projects/workspace";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  AnalysisSection,
  type AnalysisRow,
  type AnalysableUpload,
} from "@/components/analysis-section";
import { ProjectUploader } from "@/components/project-uploader";
import { UploadList } from "@/components/upload-list";
import { Panel } from "@/components/app-ui";

export const metadata: Metadata = { title: "AI Designs — Duli Interiors" };

export default async function ProjectAIDesignsPage({
  params,
}: {
  params: { id: string };
}) {
  const { project } = await requireProject(params.id);
  const supabase = createSupabaseServerClient();

  const uploads = await loadUploads(project.id);
  const photos = uploads.filter((u) => u.bucket === "room-photos");

  // Latest-first so the panel can pick the most recent analysis per upload.
  const { data: analyses } = supabase
    ? await supabase
        .from("ai_analyses")
        .select(
          "id, upload_id, kind, status, review_status, parsed, error, model, prompt_version, created_at",
        )
        .eq("project_id", project.id)
        .order("created_at", { ascending: false })
    : { data: [] };

  // Only photos and plans are analysable — inspiration images aren't of your space.
  const analysable: AnalysableUpload[] = uploads
    .filter((u) => u.bucket === "room-photos" || u.bucket === "floor-plans")
    .map((u) => ({ id: u.id, file_name: u.file_name, bucket: u.bucket }));

  // Customer-facing review state (spec: customer sees only confirmed output).
  const rows = (analyses ?? []) as AnalysisRow[];
  const done = rows.filter((a) => a.status === "completed");
  const anyPending = done.some((a) => a.review_status === "pending_review");
  const anyConfirmed = done.some((a) => a.review_status === "confirmed");
  const anyFlagged = done.some((a) => a.review_status === "needs_correction");

  return (
    <div className="space-y-5">
      {done.length > 0 && (
        <div
          className={
            "rounded-xl border px-4 py-3 text-[13px] " +
            (anyFlagged
              ? "border-terracotta/30 bg-terracotta/[0.06]"
              : anyPending
                ? "border-brass/30 bg-brass/[0.06]"
                : "border-olive/30 bg-olive/[0.07]")
          }
        >
          {anyFlagged
            ? "A designer flagged part of the analysis for correction — we'll follow up before you rely on it."
            : anyPending
              ? "Your AI analysis is with a Duli designer for review. We confirm every result before it's final."
              : anyConfirmed
                ? "✓ A Duli designer has confirmed your analysis."
                : ""}
        </div>
      )}
      {/* Uploader first: the analysis panel's own empty state tells you to
          upload "above", so it has to actually be above. */}
      <Panel className="p-6">
        <h2 className="text-[15px] font-semibold">Room photos</h2>
        <p className="mb-3 mt-0.5 max-w-[62ch] text-[12.5px] text-muted">
          The more of your real space we can see, the closer the analysis gets.
        </p>
        <ProjectUploader projectId={project.id} bucket="room-photos" />
        <UploadList uploads={photos} projectId={project.id} />
      </Panel>

      <Panel className="p-6">
        <h2 className="text-[15px] font-semibold">AI analysis</h2>
        <p className="mt-1 max-w-[62ch] text-[13px] leading-relaxed text-muted">
          We read your room photos and floor plans to understand the space. This
          never guesses measurements from a photograph — anything that can&apos;t
          be confirmed is flagged for you and reviewed by a Duli designer.
        </p>
        <AnalysisSection
          projectId={project.id}
          uploads={analysable}
          analyses={(analyses ?? []) as AnalysisRow[]}
        />
      </Panel>
    </div>
  );
}
