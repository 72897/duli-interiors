import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckCircle2, Clock, MapPin, Wallet, Ruler } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getActivity, getApprovals } from "@/lib/services";
import { getFloorPlan } from "@/lib/floor-plan/data";
import { polygonAreaSqFt } from "@/lib/floor-plan/types";
import { Panel, Pill, SectionTitle, shortDate } from "@/components/app-ui";
import { SubmitForReview } from "@/components/submit-for-review";
import { ROOM_TYPES } from "@/lib/projects/schema";
import type { Approval } from "@/lib/types";

export const metadata: Metadata = { title: "Overview — Duli Interiors" };

const APPROVAL_LABEL: Record<Approval["type"], string> = {
  concept: "Design concept",
  estimate: "Estimate",
  handover: "Handover",
};

const APPROVAL_TONE: Record<Approval["status"], "neutral" | "brass" | "olive" | "terracotta"> = {
  pending: "brass",
  approved: "olive",
  rejected: "terracotta",
};

const roomLabel = (v: string) =>
  ROOM_TYPES.find((r) => r.value === v)?.label ?? v.replace(/_/g, " ");

/** The journey a project actually walks through, in order. */
const TIMELINE = [
  { key: "draft", label: "Brief" },
  { key: "submitted", label: "Submitted" },
  { key: "in_design", label: "In design" },
  { key: "concepts_ready", label: "Concepts ready" },
  { key: "approved", label: "Approved" },
  { key: "completed", label: "Handover" },
];

export default async function ProjectOverviewPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createSupabaseServerClient();
  if (!supabase) notFound();

  const { data: project } = await supabase
    .from("projects")
    .select("id, code, name, status, city, budget_level, created_at")
    .eq("id", params.id)
    .is("deleted_at", null)
    .maybeSingle();
  if (!project) notFound();

  const { data: rooms } = await supabase
    .from("rooms")
    .select("id, room_type, room_name")
    .eq("project_id", project.id)
    .order("sort_order", { ascending: true });

  const [activity, approvals, plan] = await Promise.all([
    getActivity(project.id),
    getApprovals(),
    getFloorPlan(project.id),
  ]);

  const drawnArea = plan.rooms.reduce((s, r) => s + polygonAreaSqFt(r.points), 0);
  const stageIdx = TIMELINE.findIndex((t) => t.key === project.status);

  return (
    <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
      <div className="space-y-5">
        <Panel className="p-6">
          <SectionTitle>Summary</SectionTitle>
          <dl className="mt-2 grid gap-5 sm:grid-cols-3">
            <div>
              <dt className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted">
                <MapPin size={12} strokeWidth={1.9} /> City
              </dt>
              <dd className="mt-1 text-[14.5px]">{project.city || "—"}</dd>
            </div>
            <div>
              <dt className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted">
                <Wallet size={12} strokeWidth={1.9} /> Budget
              </dt>
              <dd className="mt-1 text-[14.5px] capitalize">
                {project.budget_level || "—"}
              </dd>
            </div>
            <div>
              <dt className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted">
                <Clock size={12} strokeWidth={1.9} /> Started
              </dt>
              <dd className="mt-1 text-[14.5px]">
                {shortDate(project.created_at)}
              </dd>
            </div>
            {drawnArea > 0 && (
              <div>
                <dt className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted">
                  <Ruler size={12} strokeWidth={1.9} /> Carpet area
                </dt>
                <dd className="mt-1 text-[14.5px]">
                  {Math.round(drawnArea).toLocaleString("en-IN")} sq ft
                  <a
                    href={`/projects/${project.id}/floor-plan`}
                    className="ml-1.5 text-[12px] text-olive underline underline-offset-2"
                  >
                    plan
                  </a>
                </dd>
              </div>
            )}
          </dl>
        </Panel>

        {/* Timeline — where the project actually is, not a decorative bar */}
        <Panel className="p-6">
          <SectionTitle>Timeline</SectionTitle>
          <ol className="mt-3 space-y-0">
            {TIMELINE.map((t, i) => {
              const done = stageIdx >= 0 && i < stageIdx;
              const current = i === stageIdx;
              return (
                <li key={t.key} className="flex items-start gap-3">
                  <div className="flex flex-col items-center self-stretch">
                    <span
                      className={
                        "mt-1 grid h-4 w-4 shrink-0 place-items-center rounded-full ring-1 " +
                        (done
                          ? "bg-olive text-bg ring-olive"
                          : current
                            ? "bg-brass text-bg ring-brass"
                            : "bg-ink/[0.06] ring-ink/10")
                      }
                    >
                      {done && <CheckCircle2 size={10} strokeWidth={3} />}
                    </span>
                    {i < TIMELINE.length - 1 && (
                      <span
                        className={
                          "w-px flex-1 " + (done ? "bg-olive/40" : "bg-ink/10")
                        }
                      />
                    )}
                  </div>
                  <div className="pb-5">
                    <p
                      className={
                        "text-[13.5px] " +
                        (current
                          ? "font-semibold text-ink"
                          : done
                            ? "text-ink/70"
                            : "text-muted")
                      }
                    >
                      {t.label}
                    </p>
                    {current && (
                      <p className="mt-0.5 text-[12px] text-brass">
                        Where your project is now
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </Panel>

        <Panel className="p-6">
          <SectionTitle>Rooms</SectionTitle>
          {rooms && rooms.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {rooms.map((r) => (
                <span
                  key={r.id}
                  className="rounded-full border border-ink/10 bg-white/60 px-3.5 py-1.5 text-[13px]"
                >
                  {roomLabel(r.room_type)}
                  {r.room_name && <span className="text-muted"> · {r.room_name}</span>}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-[13px] text-muted">
              No rooms on this project yet.
            </p>
          )}
        </Panel>
      </div>

      <div className="space-y-5">
        <Panel className="p-6">
          <SectionTitle>Next actions</SectionTitle>
          <ul className="mt-2 space-y-2.5 text-[13px]">
            <li>
              <a
                href={`/projects/${project.id}/files`}
                className="cursor-pointer text-olive underline underline-offset-2"
              >
                Upload room photos and a floor plan →
              </a>
            </li>
            <li>
              <a
                href={`/projects/${project.id}/floor-plan`}
                className="cursor-pointer text-olive underline underline-offset-2"
              >
                {drawnArea > 0 ? "Edit the floor plan" : "Draw the floor plan"} →
              </a>
            </li>
            <li>
              <a
                href={`/projects/${project.id}/ai-designs`}
                className="cursor-pointer text-olive underline underline-offset-2"
              >
                Run AI analysis on your space →
              </a>
            </li>
            <li>
              <a
                href={`/projects/${project.id}/estimate`}
                className="cursor-pointer text-olive underline underline-offset-2"
              >
                Review your estimate →
              </a>
            </li>
          </ul>

          {/* Hand off to designers — only meaningful before it's submitted. */}
          {(project.status === "draft" || project.status === "revision_requested") && (
            <div className="mt-5 border-t border-ink/[0.07] pt-5">
              <SubmitForReview projectId={project.id} />
            </div>
          )}
          {project.status === "submitted" && (
            <p className="mt-5 border-t border-ink/[0.07] pt-5 text-[12.5px] text-muted">
              Submitted for review — a designer will pick this up shortly.
            </p>
          )}
        </Panel>

        <Panel className="p-6">
          <SectionTitle>Approvals</SectionTitle>
          {approvals.length === 0 ? (
            <p className="mt-2 text-[13px] text-muted">Nothing awaiting approval.</p>
          ) : (
            <ul className="space-y-2.5">
              {approvals.slice(0, 4).map((a) => (
                <li key={a.id} className="flex items-start justify-between gap-3 text-[13px]">
                  <div>
                    <p className="font-medium capitalize">{APPROVAL_LABEL[a.type]}</p>
                    <p className="text-[12px] text-muted">
                      Requested by {a.requestedBy}
                    </p>
                  </div>
                  <Pill tone={APPROVAL_TONE[a.status]}>{a.status}</Pill>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel className="p-6">
          <SectionTitle>Activity</SectionTitle>
          {activity.length === 0 ? (
            <p className="mt-2 text-[13px] text-muted">
              Nothing yet — actions on this project show up here.
            </p>
          ) : (
          <ol className="mt-1 space-y-3">
            {activity.map((a) => (
              <li key={a.id} className="flex gap-2.5 text-[12.5px]">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brass" />
                <div>
                  <p>
                    <span className="font-medium">{a.actorName}</span> {a.action}
                  </p>
                  <p className="text-[11.5px] text-muted">
                    {shortDate(a.createdAt)}
                  </p>
                </div>
              </li>
            ))}
          </ol>
          )}
        </Panel>
      </div>
    </div>
  );
}
