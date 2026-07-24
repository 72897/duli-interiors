import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Panel, Pill } from "@/components/app-ui";
import { StatCard } from "@/components/dashboard-ui";

export const metadata: Metadata = { title: "AI Jobs — Admin — Duli Interiors" };

type Row = {
  id: string;
  kind: string;
  status: string;
  model: string;
  duration_ms: number | null;
  error: string | null;
  created_at: string;
};

const TONE: Record<string, "neutral" | "brass" | "olive" | "terracotta"> = {
  queued: "neutral",
  running: "brass",
  succeeded: "olive",
  failed: "terracotta",
};

const when = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

export default async function AdminAIJobsPage() {
  const supabase = createSupabaseServerClient();

  const { data } = supabase
    ? await supabase
        .from("ai_analyses")
        .select("id, kind, status, model, duration_ms, error, created_at")
        .order("created_at", { ascending: false })
        .limit(100)
    : { data: [] as Row[] };

  const rows = (data ?? []) as Row[];
  const failed = rows.filter((r) => r.status === "failed").length;
  const done = rows.filter((r) => r.status === "succeeded");
  const avgMs = done.length
    ? Math.round(
        done.reduce((s, r) => s + (r.duration_ms ?? 0), 0) / done.length,
      )
    : 0;

  return (
    <div>
      <h1 className="font-serif text-[26px] leading-tight">AI Jobs</h1>
      <p className="mt-1.5 text-[13px] text-muted">
        Every analysis run — the health of the AI pipeline at a glance.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Recent jobs" value={rows.length} />
        <StatCard label="Failed" value={failed} />
        <StatCard label="Avg duration" value={avgMs ? `${(avgMs / 1000).toFixed(1)}s` : "—"} />
      </div>

      <Panel className="mt-5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-[13px]">
            <thead>
              <tr className="border-b border-ink/[0.07] text-left text-[10.5px] uppercase tracking-[0.12em] text-muted">
                <th className="px-5 py-3 font-semibold">Kind</th>
                <th className="px-3 py-3 font-semibold">Status</th>
                <th className="px-3 py-3 font-semibold">Model</th>
                <th className="px-3 py-3 font-semibold">Duration</th>
                <th className="px-5 py-3 font-semibold">When</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-muted">
                    No AI jobs have run yet.
                  </td>
                </tr>
              ) : (
                rows.map((j) => (
                  <tr key={j.id} className="border-b border-ink/[0.05] last:border-0">
                    <td className="px-5 py-3 capitalize">{j.kind.replace(/_/g, " ")}</td>
                    <td className="px-3 py-3">
                      <Pill tone={TONE[j.status] ?? "neutral"}>{j.status}</Pill>
                      {j.error && (
                        <span
                          className="ml-1.5 text-[11px] text-terracotta"
                          title={j.error}
                        >
                          error
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3 font-mono text-[11.5px] text-muted">
                      {j.model}
                    </td>
                    <td className="px-3 py-3 tabular-nums text-muted">
                      {j.duration_ms ? `${(j.duration_ms / 1000).toFixed(1)}s` : "—"}
                    </td>
                    <td className="px-5 py-3 text-muted">{when(j.created_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
