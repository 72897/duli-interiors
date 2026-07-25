import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getEstimate } from "@/lib/services";
import { loadUploads } from "@/lib/projects/workspace";
import { getFloorPlan } from "@/lib/floor-plan/data";
import { polygonAreaSqFt } from "@/lib/floor-plan/types";
import { ProposalActions } from "@/components/proposal-actions";
import { FloorPlanStatic } from "@/components/floor-plan-static";
import { ROOM_TYPES } from "@/lib/projects/schema";

export const metadata: Metadata = { title: "Proposal — Duli Interiors" };

const inr = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

const roomLabel = (v: string) =>
  ROOM_TYPES.find((r) => r.value === v)?.label ?? v.replace(/_/g, " ");

/**
 * Standalone, print-optimised proposal (Phase 1: branded proposal + CRM
 * handoff). Deliberately outside the app chrome so "Save as PDF" produces a
 * clean document. RLS scopes access — an unreadable project 404s.
 */
export default async function ProposalPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createSupabaseServerClient();
  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect(`/login?redirect=/proposal/${params.id}`);
  }
  if (!supabase) notFound();

  const { data: project } = await supabase
    .from("projects")
    .select("id, code, name, city, budget_level, status")
    .eq("id", params.id)
    .is("deleted_at", null)
    .maybeSingle();
  if (!project) notFound();

  const { data: rooms } = await supabase
    .from("rooms")
    .select("id, room_type, room_name")
    .eq("project_id", project.id)
    .order("sort_order", { ascending: true });

  const [estimate, plan, uploads] = await Promise.all([
    getEstimate(project.id),
    getFloorPlan(project.id),
    loadUploads(project.id),
  ]);
  const photos = uploads.filter((u) => u.bucket === "room-photos" && u.signedUrl);
  const drawnRooms = plan.rooms
    .map((r) => ({ id: r.id, name: r.name, area: polygonAreaSqFt(r.points) }))
    .filter((r) => r.area > 0);
  const totalCarpet = drawnRooms.reduce((s, r) => s + r.area, 0);
  const shareUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/proposal/${project.id}`;

  return (
    <div className="min-h-screen bg-[#F8F7F4] py-10 text-ink print:bg-white print:py-0">
      <div className="mx-auto max-w-[820px] px-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <a href={`/projects/${project.id}`} className="text-[13px] text-muted underline underline-offset-2 print:hidden">
            ← Back to project
          </a>
          <ProposalActions shareUrl={shareUrl} projectName={project.name} />
        </div>

        {/* The document */}
        <article className="rounded-[18px] border border-stone bg-white p-10 shadow-[0_24px_60px_-30px_rgba(31,31,31,0.3)] print:rounded-none print:border-0 print:p-0 print:shadow-none">
          <header className="flex items-center justify-between border-b border-stone pb-6">
            <div>
              <p className="text-lg font-bold tracking-tight">
                Duli<span className="text-brass"> Interiors</span>
              </p>
              <p className="mt-0.5 text-[12px] text-muted">Design proposal</p>
            </div>
            <div className="text-right text-[12px] text-muted">
              <p className="font-mono">{project.code}</p>
              <p>{new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
            </div>
          </header>

          <section className="mt-7">
            <h1 className="font-serif text-[30px] leading-tight">{project.name}</h1>
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-[13px] text-muted">
              {project.city && <span>City · {project.city}</span>}
              {project.budget_level && <span className="capitalize">Budget · {project.budget_level}</span>}
              <span className="capitalize">Status · {project.status.replace(/_/g, " ")}</span>
            </div>
          </section>

          {rooms && rooms.length > 0 && (
            <section className="mt-8">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brass">Scope — rooms</h2>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {rooms.map((r) => (
                  <span key={r.id} className="rounded-full border border-stone px-3 py-1 text-[12.5px]">
                    {roomLabel(r.room_type)}{r.room_name ? ` · ${r.room_name}` : ""}
                  </span>
                ))}
              </div>
            </section>
          )}

          {photos.length > 0 && (
            <section className="mt-8 break-inside-avoid">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brass">
                Your space
              </h2>
              <div className="mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {photos.slice(0, 6).map((p) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={p.id}
                    src={p.signedUrl!}
                    alt={p.file_name ?? "Room photo"}
                    className="h-32 w-full rounded-lg border border-stone object-cover"
                  />
                ))}
              </div>
              {photos.length > 6 && (
                <p className="mt-1.5 text-[11px] text-muted">
                  +{photos.length - 6} more photo{photos.length - 6 === 1 ? "" : "s"} in the project
                </p>
              )}
            </section>
          )}

          {drawnRooms.length > 0 && (
            <section className="mt-8 break-inside-avoid">
              <div className="flex items-baseline justify-between">
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brass">
                  Floor plan
                </h2>
                <p className="text-[12px] text-muted">
                  Carpet area ·{" "}
                  <span className="font-semibold text-ink">
                    {Math.round(totalCarpet).toLocaleString("en-IN")} sq ft
                  </span>
                </p>
              </div>
              <div className="mt-2.5 grid gap-4 sm:grid-cols-[1.6fr_1fr]">
                <div className="overflow-hidden rounded-xl border border-stone">
                  <FloorPlanStatic plan={plan} />
                </div>
                <table className="h-max w-full text-[12.5px]">
                  <thead>
                    <tr className="border-b border-stone text-left text-[10.5px] uppercase tracking-[0.1em] text-muted">
                      <th className="py-2">Room</th>
                      <th className="py-2 text-right">Carpet area</th>
                    </tr>
                  </thead>
                  <tbody>
                    {drawnRooms.map((r) => (
                      <tr key={r.id} className="border-b border-stone/60">
                        <td className="py-2">{r.name}</td>
                        <td className="py-2 text-right tabular-nums">
                          {Math.round(r.area).toLocaleString("en-IN")} sq ft
                        </td>
                      </tr>
                    ))}
                    <tr className="font-semibold">
                      <td className="py-2">Total</td>
                      <td className="py-2 text-right tabular-nums">
                        {Math.round(totalCarpet).toLocaleString("en-IN")} sq ft
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-2 text-[11px] text-muted">
                Drawn from your measurements — areas are computed, not estimated.
              </p>
            </section>
          )}

          <section className="mt-8">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brass">Estimate</h2>
            <table className="mt-2.5 w-full text-[12.5px]">
              <thead>
                <tr className="border-b border-stone text-left text-[10.5px] uppercase tracking-[0.1em] text-muted">
                  <th className="py-2">Description</th>
                  <th className="py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {estimate.items.map((li) => (
                  <tr key={li.id} className="border-b border-stone/60">
                    <td className="py-2">
                      {li.roomName ? `${li.roomName} · ` : ""}{li.description}
                    </td>
                    <td className="py-2 text-right tabular-nums">{inr(li.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <dl className="ml-auto mt-3 max-w-[240px] space-y-1 text-[12.5px]">
              <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd className="tabular-nums">{inr(estimate.subtotal)}</dd></div>
              {estimate.discount > 0 && <div className="flex justify-between"><dt className="text-muted">Discount</dt><dd className="tabular-nums text-olive">−{inr(estimate.discount)}</dd></div>}
              <div className="flex justify-between"><dt className="text-muted">Tax (18% GST est.)</dt><dd className="tabular-nums">{inr(estimate.tax)}</dd></div>
              <div className="flex justify-between border-t border-stone pt-1 font-semibold"><dt>Total</dt><dd className="font-serif text-[16px] tabular-nums">{inr(estimate.total)}</dd></div>
            </dl>
            <p className="mt-2 text-[11px] text-muted">
              Indicative estimate — not a binding quote. Final pricing confirmed after a site visit.
            </p>
          </section>

          <section className="mt-9 rounded-xl bg-ink px-6 py-5 text-bg print:bg-ink">
            <p className="font-serif text-[17px]">Ready to move forward?</p>
            <p className="mt-1 text-[12.5px] text-bg/70">
              Reply to this proposal or reach us at info@duliinteriors.com to confirm your project.
            </p>
          </section>

          <footer className="mt-8 border-t border-stone pt-4 text-[11px] text-muted">
            Duli Interiors · Designing homes people love living in · duliinteriors.com
          </footer>
        </article>
      </div>
    </div>
  );
}
