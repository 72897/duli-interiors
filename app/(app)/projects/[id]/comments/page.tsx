import type { Metadata } from "next";
import { requireProject } from "@/lib/projects/workspace";
import { getComments, getMyRoles, isStaffRole } from "@/lib/services";
import { Panel, Pill } from "@/components/app-ui";
import { CommentForm } from "@/components/comment-form";

export const metadata: Metadata = { title: "Comments — Duli Interiors" };

const when = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

export default async function ProjectCommentsPage({
  params,
}: {
  params: { id: string };
}) {
  const { project } = await requireProject(params.id);
  const [comments, roles] = await Promise.all([
    getComments(project.id),
    getMyRoles(),
  ]);
  const staff = isStaffRole(roles);

  return (
    <div className="space-y-5">
      <Panel className="p-6">
        {comments.length === 0 ? (
          <p className="text-[13px] text-muted">
            No comments yet — start the conversation below.
          </p>
        ) : (
          <ol className="space-y-5">
            {comments.map((c) => (
              <li key={c.id} className="flex gap-3.5">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brass/15 text-[12px] font-bold text-brass">
                  {(c.authorName || "?").charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[13.5px] font-semibold">{c.authorName}</p>
                    {c.visibility === "internal" && (
                      <Pill tone="brass">Internal</Pill>
                    )}
                    <span className="text-[11.5px] text-muted">
                      {when(c.createdAt)}
                    </span>
                  </div>
                  <p className="mt-1 text-[13px] leading-relaxed text-ink/80">
                    {c.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        )}

        {/* Real, working — RLS enforces who can post and on which project. */}
        <CommentForm projectId={project.id} canPostInternal={staff} />
      </Panel>
    </div>
  );
}
