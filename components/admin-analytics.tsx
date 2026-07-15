import {
  Activity,
  CheckCircle2,
  Clock,
  Coins,
  TrendingUp,
  Users,
} from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Platform analysis for admins.
 *
 * Reads real rows and aggregates in-process. That's deliberate: it needs no new
 * migration and is correct at this data size. If row counts grow past a few
 * thousand this should become a SQL aggregate / materialised view — flagged
 * rather than pretended otherwise.
 *
 * Safety: every query below is RLS-scoped. Admins can read across all rows
 * (is_admin() in the policies); a non-admin calling this sees nothing.
 */

type Row = { created_at?: string | null; status?: string | null };

const DAYS = 30;

function bucketByDay(rows: Row[], days = DAYS) {
  const out = new Array(days).fill(0);
  const now = Date.now();
  for (const r of rows) {
    if (!r.created_at) continue;
    const age = Math.floor((now - new Date(r.created_at).getTime()) / 86400000);
    if (age >= 0 && age < days) out[days - 1 - age] += 1;
  }
  return out;
}

/** Inline sparkline — no chart library, no extra bundle. */
function Spark({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(1, ...data);
  const w = 240;
  const h = 44;
  const step = w / Math.max(1, data.length - 1);
  const pts = data.map((v, i) => `${i * step},${h - (v / max) * (h - 4) - 2}`);
  const area = `0,${h} ${pts.join(" ")} ${w},${h}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="mt-2 h-11 w-full" preserveAspectRatio="none" aria-hidden>
      <polygon points={area} fill={color} opacity="0.12" />
      <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

function Trend({
  label,
  total,
  data,
  color,
}: {
  label: string;
  total: number;
  data: number[];
  color: string;
}) {
  const last7 = data.slice(-7).reduce((a, b) => a + b, 0);
  const prev7 = data.slice(-14, -7).reduce((a, b) => a + b, 0);
  const delta = prev7 === 0 ? (last7 > 0 ? 100 : 0) : Math.round(((last7 - prev7) / prev7) * 100);
  return (
    <div className="rounded-2xl border border-stone bg-surface p-5">
      <div className="flex items-baseline justify-between">
        <p className="text-[12px] uppercase tracking-wide text-muted">{label}</p>
        <span
          className={
            "text-[11.5px] font-semibold " +
            (delta > 0 ? "text-success" : delta < 0 ? "text-terracotta" : "text-muted")
          }
        >
          {delta > 0 ? "▲" : delta < 0 ? "▼" : "–"} {Math.abs(delta)}% / 7d
        </span>
      </div>
      <p className="mt-0.5 font-serif text-3xl">{total}</p>
      <Spark data={data} color={color} />
      <p className="mt-1 text-[11px] text-muted">Last {DAYS} days · {last7} this week</p>
    </div>
  );
}

function Bar({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = total ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-baseline justify-between text-[12.5px]">
        <span className="capitalize">{label.replace(/_/g, " ")}</span>
        <span className="text-muted">{value} · {pct}%</span>
      </div>
      <div className="mt-1 h-2 overflow-hidden rounded-full bg-ink/[0.07]">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

export async function AdminAnalytics() {
  const supabase = createSupabaseServerClient();
  if (!supabase) return null;

  const [profilesRes, projectsRes, analysesRes, partnersRes, leadsRes, uploadsRes] =
    await Promise.all([
      supabase.from("profiles").select("created_at"),
      supabase.from("projects").select("created_at, status"),
      supabase.from("ai_analyses").select("created_at, status, duration_ms, usage, kind"),
      supabase.from("partner_applications").select("created_at, program, status"),
      supabase.from("leads").select("created_at, status"),
      supabase.from("project_uploads").select("created_at, bucket, size_bytes"),
    ]);

  const profiles = profilesRes.data ?? [];
  const projects = projectsRes.data ?? [];
  const analyses = (analysesRes.data ?? []) as (Row & {
    duration_ms?: number | null;
    usage?: { totalTokenCount?: number } | null;
    kind?: string;
  })[];
  const partners = (partnersRes.data ?? []) as (Row & { program?: string })[];
  const leads = leadsRes.data ?? [];
  const uploads = (uploadsRes.data ?? []) as (Row & { bucket?: string; size_bytes?: number })[];

  // ── AI health ─────────────────────────────────────────────
  const completed = analyses.filter((a) => a.status === "completed").length;
  const failed = analyses.filter((a) => a.status === "failed").length;
  const successRate = analyses.length ? Math.round((completed / analyses.length) * 100) : 0;
  const durations = analyses.map((a) => a.duration_ms ?? 0).filter(Boolean);
  const avgMs = durations.length ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0;
  const tokens = analyses.reduce((s, a) => s + (a.usage?.totalTokenCount ?? 0), 0);

  // ── Funnel ────────────────────────────────────────────────
  const leadToProject = leads.length ? Math.round((projects.length / leads.length) * 100) : 0;
  const storageMb = uploads.reduce((s, u) => s + (u.size_bytes ?? 0), 0) / 1048576;

  const group = (rows: { status?: string | null }[]) => {
    const m: Record<string, number> = {};
    for (const r of rows) if (r.status) m[r.status] = (m[r.status] ?? 0) + 1;
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  };
  const projectStatus = group(projects);
  const partnerProgram = (() => {
    const m: Record<string, number> = {};
    for (const p of partners) if (p.program) m[p.program] = (m[p.program] ?? 0) + 1;
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  })();

  const empty = profiles.length + projects.length + analyses.length === 0;

  return (
    <div className="mt-10">
      <h2 className="font-serif text-[24px]">Platform analysis</h2>
      <p className="mt-1 text-[13px] text-muted">
        Live, RLS-scoped. Last {DAYS} days unless stated.
      </p>

      {empty && (
        <p className="mt-4 rounded-xl border border-dashed border-stone p-6 text-center text-[13px] text-muted">
          No activity yet — trends appear as users sign up and create projects.
        </p>
      )}

      {/* Trends */}
      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <Trend label="Signups" total={profiles.length} data={bucketByDay(profiles)} color="#66705A" />
        <Trend label="Projects created" total={projects.length} data={bucketByDay(projects)} color="#B08D57" />
        <Trend label="AI analyses" total={analyses.length} data={bucketByDay(analyses)} color="#8C4A3A" />
      </div>

      {/* AI health */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: CheckCircle2, label: "AI success rate", value: `${successRate}%`, sub: `${completed} ok · ${failed} failed` },
          { icon: Clock, label: "Avg analysis time", value: avgMs ? `${(avgMs / 1000).toFixed(1)}s` : "—", sub: "Gemini round-trip" },
          { icon: Coins, label: "Tokens used", value: tokens.toLocaleString("en-IN"), sub: "All analyses" },
          { icon: Activity, label: "Storage used", value: `${storageMb.toFixed(1)} MB`, sub: `${uploads.length} files` },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-stone bg-surface p-5">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-brass/10 text-brass">
              <s.icon size={16} strokeWidth={1.8} />
            </span>
            <p className="mt-2.5 text-[12px] uppercase tracking-wide text-muted">{s.label}</p>
            <p className="mt-0.5 font-serif text-2xl">{s.value}</p>
            <p className="mt-0.5 text-[11.5px] text-muted">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Breakdowns */}
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-stone bg-surface p-5">
          <p className="text-[13px] font-semibold">Projects by status</p>
          <div className="mt-3 space-y-2.5">
            {projectStatus.length ? (
              projectStatus.map(([k, v]) => (
                <Bar key={k} label={k} value={v} total={projects.length} color="#B08D57" />
              ))
            ) : (
              <p className="text-[12.5px] text-muted">No projects yet.</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-stone bg-surface p-5">
          <p className="text-[13px] font-semibold">Partner applications</p>
          <div className="mt-3 space-y-2.5">
            {partnerProgram.length ? (
              partnerProgram.map(([k, v]) => (
                <Bar key={k} label={k} value={v} total={partners.length} color="#66705A" />
              ))
            ) : (
              <p className="text-[12.5px] text-muted">No applications yet.</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-stone bg-surface p-5">
          <p className="text-[13px] font-semibold">Funnel</p>
          <dl className="mt-3 space-y-3 text-[13px]">
            <div className="flex items-center justify-between">
              <dt className="text-muted">Leads captured</dt>
              <dd>{leads.length}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted">Projects created</dt>
              <dd>{projects.length}</dd>
            </div>
            <div className="flex items-center justify-between border-t border-stone pt-3">
              <dt className="flex items-center gap-1.5 text-muted">
                <TrendingUp size={14} strokeWidth={1.8} /> Lead → project
              </dt>
              <dd className="font-semibold">{leadToProject}%</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="flex items-center gap-1.5 text-muted">
                <Users size={14} strokeWidth={1.8} /> Projects / user
              </dt>
              <dd className="font-semibold">
                {profiles.length ? (projects.length / profiles.length).toFixed(1) : "0.0"}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
