import type { Metadata } from "next";
import { FolderKanban, Sparkles } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Panel, Pill } from "@/components/app-ui";
import { StatCard } from "@/components/dashboard-ui";
import {
  AnalysisReviewButtons,
  ProjectAdvanceButton,
} from "@/components/review-actions";

export const metadata: Metadata = { title: "Review queue — Admin — Duli Interiors" };

type SubmittedProject = {
  id: string;
  code: string;
  name: string;
  city: string | null;
  created_at: string;
};

type PendingAnalysis = {
  id: string;
  project_id: string;
  kind: string;
  created_at: string;
  // Supabase types a to-one embed as an array; runtime gives an object. Allow both.
  projects: { name: string } | { name: string }[] | null;
};

const projName = (p: PendingAnalysis["projects"]) =>
  Array.isArray(p) ? p[0]?.name : p?.name;

const when = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

export default async function AdminReviewPage() {
  const supabase = createSupabaseServerClient();

  // Projects awaiting a designer to pick them up, and AI analyses awaiting
  // sign-off before the customer relies on them. RLS lets admins read across all.
  const [{ data: projData }, { data: anaData }] = supabase
    ? await Promise.all([
        supabase
          .from("projects")
          .select("id, code, name, city, created_at")
          .eq("status", "submitted")
          .is("deleted_at", null)
          .order("created_at", { ascending: true }),
        supabase
          .from("ai_analyses")
          .select("id, project_id, kind, created_at, projects(name)")
          .eq("review_status", "pending_review")
          .order("created_at", { ascending: true }),
      ])
    : [{ data: [] }, { data: [] }];

  const projects = (projData ?? []) as SubmittedProject[];
  const analyses = (anaData ?? []) as unknown as PendingAnalysis[];

  return (
    <div>
      <h1 className="font-serif text-[26px] leading-tight">Review queue</h1>
      <p className="mt-1.5 max-w-[64ch] text-[13px] text-muted">
        Everything waiting on a designer or admin. Customers only see AI output
        and concepts once they&apos;re confirmed here.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <StatCard label="Projects to accept" value={projects.length} />
        <StatCard label="Analyses to confirm" value={analyses.length} />
      </div>

      {/* Submitted projects */}
      <h2 className="mb-3 mt-8 font-serif text-[19px]">Submitted projects</h2>
      {projects.length === 0 ? (
        <Panel className="p-6 text-[13px] text-muted">
          No projects waiting to be accepted.
        </Panel>
      ) : (
        <div className="space-y-3">
          {projects.map((p) => (
            <Panel key={p.id} className="flex flex-wrap items-center justify-between gap-4 p-5">
              <div className="flex min-w-0 items-center gap-3.5">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brass/12 text-brass ring-1 ring-brass/20">
                  <FolderKanban size={17} strokeWidth={1.8} />
                </span>
                <div className="min-w-0">
                  <a
                    href={`/projects/${p.id}`}
                    className="text-[14.5px] font-semibold hover:underline"
                  >
                    {p.name}
                  </a>
                  <p className="text-[12px] text-muted">
                    {p.code} · {p.city || "City TBC"} · submitted {when(p.created_at)}
                  </p>
                </div>
              </div>
              <ProjectAdvanceButton projectId={p.id} />
            </Panel>
          ))}
        </div>
      )}

      {/* Pending AI analyses */}
      <h2 className="mb-3 mt-8 font-serif text-[19px]">AI analyses to confirm</h2>
      {analyses.length === 0 ? (
        <Panel className="p-6 text-[13px] text-muted">
          No analyses waiting for sign-off.
        </Panel>
      ) : (
        <div className="space-y-3">
          {analyses.map((a) => (
            <Panel key={a.id} className="flex flex-wrap items-center justify-between gap-4 p-5">
              <div className="flex min-w-0 items-center gap-3.5">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-olive/12 text-olive ring-1 ring-olive/20">
                  <Sparkles size={17} strokeWidth={1.8} />
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <a
                      href={`/projects/${a.project_id}/ai-designs`}
                      className="text-[14px] font-semibold hover:underline"
                    >
                      {projName(a.projects) ?? "Project"}
                    </a>
                    <Pill tone="brass">{a.kind.replace(/_/g, " ")}</Pill>
                  </div>
                  <p className="text-[12px] text-muted">Read {when(a.created_at)}</p>
                </div>
              </div>
              <AnalysisReviewButtons analysisId={a.id} />
            </Panel>
          ))}
        </div>
      )}
    </div>
  );
}
