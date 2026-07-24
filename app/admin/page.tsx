import type { Metadata } from "next";
import {
  Users,
  FolderKanban,
  Sparkles,
  Package,
  Store,
  TriangleAlert,
  TrendingUp,
} from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AdminAnalytics } from "@/components/admin-analytics";
import { getMyRoles, getVendors, getCatalogItems } from "@/lib/services";

export const metadata: Metadata = { title: "Admin — Duli Interiors" };

/**
 * Premium stat tile — depth via layered shadow + hairline + a tinted glow, so
 * the NUMBER is the hero rather than a flat template panel.
 */
function Stat({
  icon: Icon,
  label,
  value,
  sub,
  tone = "olive",
}: {
  icon: typeof Users;
  label: string;
  value: string | number;
  sub?: string;
  tone?: "olive" | "brass" | "terracotta" | "ink";
}) {
  const tones = {
    olive: { text: "text-olive", glow: "bg-olive/20", ring: "ring-olive/10" },
    brass: { text: "text-brass", glow: "bg-brass/25", ring: "ring-brass/10" },
    terracotta: { text: "text-terracotta", glow: "bg-terracotta/20", ring: "ring-terracotta/10" },
    ink: { text: "text-ink", glow: "bg-ink/15", ring: "ring-ink/10" },
  }[tone];

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/70 bg-gradient-to-b from-white to-bg/60 p-5 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_16px_38px_-24px_rgba(31,31,31,0.35)] backdrop-blur-xl transition-[transform,box-shadow,border-color] duration-500 ease-premium hover:-translate-y-1 hover:border-brass/40 hover:shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_30px_60px_-28px_rgba(31,31,31,0.45)]">
      <span
        aria-hidden
        className={`pointer-events-none absolute -right-8 -top-10 h-24 w-24 rounded-full blur-2xl ${tones.glow}`}
      />
      <span
        className={`relative grid h-10 w-10 place-items-center rounded-xl bg-white ring-1 ${tones.ring} ${tones.text} shadow-sm`}
      >
        <Icon size={18} strokeWidth={1.7} />
      </span>
      <p className="relative mt-4 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted">
        {label}
      </p>
      <p className="relative mt-1 font-serif text-[34px] leading-none tracking-tight">
        {value}
      </p>
      {sub && <p className="relative mt-2 text-[12px] leading-snug text-muted">{sub}</p>}
    </div>
  );
}

export default async function AdminOverviewPage() {
  // The layout already gated this; we just render.
  const supabase = createSupabaseServerClient();
  const roles = await getMyRoles();
  const isSuper = roles.includes("super_admin");

  // Platform counts — RLS lets admins read across all rows, blocks everyone else.
  let users = 0;
  let projects = 0;
  let analyses = 0;
  let failed = 0;
  let partners = 0;

  if (supabase) {
    const count = async (table: string) => {
      const { count: c } = await supabase
        .from(table)
        .select("*", { count: "exact", head: true });
      return c ?? 0;
    };
    [users, projects, analyses, partners] = await Promise.all([
      count("profiles"),
      count("projects"),
      count("ai_analyses"),
      count("partner_applications"),
    ]);
    const { count: f } = await supabase
      .from("ai_analyses")
      .select("*", { count: "exact", head: true })
      .eq("status", "failed");
    failed = f ?? 0;
  }

  const [vendors, catalog] = await Promise.all([getVendors(), getCatalogItems()]);

  return (
    <>
      <h1 className="font-serif text-[30px] leading-tight md:text-[38px]">
        Platform overview
      </h1>
      <p className="mt-2 text-[14px] text-muted">
        How Duli is being used right now.
      </p>

      {/* Live platform counts (real, RLS-scoped) */}
      <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={Users} tone="olive" label="Homeowners" value={users} sub="Accounts created on Duli" />
        <Stat icon={FolderKanban} tone="brass" label="Projects" value={projects} sub="Live across every city" />
        <Stat icon={Sparkles} tone="ink" label="AI analyses" value={analyses} sub="Rooms & plans read by Gemini" />
        <Stat
          icon={TriangleAlert}
          tone="terracotta"
          label="Failed AI jobs"
          value={failed}
          sub={failed === 0 ? "All healthy" : "Needs a look"}
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={Store} tone="olive" label="Partner pipeline" value={partners} sub="Execution · design · affiliate · education" />
        <Stat icon={Package} tone="brass" label="Catalog items" value={catalog.length} sub="Mocked until the table exists" />
        <Stat icon={Store} tone="olive" label="Vendors" value={vendors.length} sub={`${vendors.filter((v) => !v.approved).length} awaiting approval`} />
        <Stat
          icon={TrendingUp}
          tone="ink"
          label="AI per project"
          value={projects ? (analyses / projects).toFixed(1) : "0.0"}
          sub="AI engagement"
        />
      </div>

      {/* Full platform analysis — trends, AI health, funnel */}
      <AdminAnalytics />

      {/* Honest about what isn't wired yet */}
      <div className="mt-8 rounded-2xl border border-brass/40 bg-brass/[0.07] p-5">
        <p className="text-[13px] font-semibold">What&apos;s real here</p>
        <p className="mt-1.5 max-w-[70ch] text-[13px] text-muted">
          Users, projects, AI analyses, failed jobs and partner applications —
          plus every trend, the AI health metrics and the funnel above — are{" "}
          <strong className="text-ink">live</strong> from Supabase (admins read
          across all rows; everyone else is blocked by RLS). Catalog and vendors
          are <strong className="text-ink">mocked</strong> until those tables
          exist. Aggregation runs in-process, which is right at this size; past a
          few thousand rows it should move to a SQL view.
        </p>
      </div>

      {isSuper && (
        <div className="mt-4 rounded-2xl border border-stone bg-surface p-5">
          <p className="text-[13px] font-semibold">Super Admin</p>
          <p className="mt-1.5 text-[13px] text-muted">
            Role management runs through SQL for now. To grant a role:
          </p>
          <pre className="mt-3 overflow-x-auto rounded-lg bg-ink/[0.04] p-3 text-[11.5px] text-ink">
{`insert into public.profile_roles (profile_id, role_id)
select p.id, r.id
from public.profiles p, public.roles r
where p.id = '<user-uuid>' and r.key = 'admin'
on conflict do nothing;`}
          </pre>
        </div>
      )}
    </>
  );
}
