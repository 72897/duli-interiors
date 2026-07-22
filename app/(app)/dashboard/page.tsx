import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getMyRoles, isAdminRole, isStaffRole } from "@/lib/services";
import { ROLE_LABELS, type Role } from "@/lib/types";
import { IdeaGallery } from "@/components/idea-gallery";
import { ProjectCard } from "@/components/dashboard-ui";
import { ModelShowcase } from "@/components/model-showcase";
import { PremiumCard } from "@/components/premium-card";

export const metadata: Metadata = { title: "Home — Duli Interiors" };

type ProjectRow = {
  id: string;
  code: string;
  name: string;
  status: string;
  city: string | null;
};

const ENTRIES = [
  {
    href: "/projects/new",
    title: "Start from scratch",
    body: "Tell us your rooms, measurements and budget in a few steps.",
    icon: PencilIcon,
    tint: "from-olive/[0.14]",
  },
  {
    href: "/ideas",
    title: "Idea templates",
    body: "Browse rooms by space and style, then start from one.",
    icon: GridIcon,
    tint: "from-brass/[0.16]",
  },
];

export default async function WorkbenchPage() {
  const supabase = createSupabaseServerClient();

  let projects: ProjectRow[] = [];
  let displayName = "there";
  let email = "";
  let avatarUrl: string | null = null;

  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      email = user.email ?? "";
      displayName =
        (user.user_metadata?.full_name as string) ||
        email.split("@")[0] ||
        "there";
      avatarUrl =
        (user.user_metadata?.avatar_url as string) ||
        (user.user_metadata?.picture as string) ||
        null;
    }

    const { data } = await supabase
      .from("projects")
      .select("id, code, name, status, city")
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(4);
    projects = data ?? [];
  }

  const active = projects.filter((p) =>
    ["submitted", "in_review", "concepts_ready", "revision_requested"].includes(
      p.status,
    ),
  ).length;

  const initial = (displayName || "?").charAt(0).toUpperCase();

  // "Plan: Free" used to be hardcoded, so staff saw "Free" like any customer.
  // Show what the account actually is: the role for staff, the plan for
  // customers (the only people a plan is meaningful to).
  const roles = await getMyRoles();
  const isStaff = isStaffRole(roles);
  const isAdmin = isAdminRole(roles);
  const primaryRole: Role =
    (["super_admin", "admin", "project_manager", "designer", "sales", "vendor", "contractor"] as Role[]).find(
      (r) => roles.includes(r),
    ) ?? "customer";
  const roleLabel = ROLE_LABELS[primaryRole];

  return (
    <div>
      {/* Profile banner */}
      <section className="relative overflow-hidden rounded-[22px] border border-stone bg-gradient-to-br from-ink via-[#2a2a27] to-olive px-6 py-7 text-bg shadow-[0_30px_70px_-40px_rgba(31,31,31,0.9)] sm:px-9 sm:py-9">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-brass/25 blur-3xl"
        />
        <div className="relative flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt=""
                className="h-14 w-14 rounded-full border border-white/25 object-cover"
              />
            ) : (
              <span className="grid h-14 w-14 place-items-center rounded-full border border-white/25 bg-brass text-xl font-bold">
                {initial}
              </span>
            )}
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blush">
                Welcome back
              </p>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="font-serif text-[26px] leading-tight sm:text-[32px]">
                  {displayName}
                </h1>
                {/* Role badge — staff should never be shown as a plain customer */}
                <span
                  className={
                    "rounded-full px-2.5 py-[3px] text-[10px] font-semibold uppercase tracking-wide ring-1 " +
                    (isAdmin
                      ? "bg-brass/25 text-blush ring-brass/40"
                      : isStaff
                        ? "bg-bg/15 text-bg ring-bg/25"
                        : "bg-bg/10 text-bg/80 ring-bg/20")
                  }
                >
                  {roleLabel}
                </span>
              </div>
              {email && (
                <p className="mt-0.5 text-[12.5px] text-bg/60">{email}</p>
              )}
            </div>
          </div>

          <dl className="flex gap-8">
            {[
              ["Projects", projects.length],
              ["In progress", active],
              // A "plan" only means something to a paying customer. Staff get
              // their access level instead of a misleading "Free".
              isStaff ? ["Access", roleLabel] : ["Plan", "Free"],
            ].map(([label, value]) => (
              <div key={String(label)}>
                <dt className="text-[11px] uppercase tracking-wide text-bg/55">
                  {label}
                </dt>
                <dd className="mt-0.5 font-serif text-2xl">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Create */}
      <h2 className="mb-4 mt-10 font-serif text-[22px]">Create a new project</h2>
      <div className="grid gap-5 sm:grid-cols-3">
        {ENTRIES.map((e) => {
          const Icon = e.icon;
          return (
            <PremiumCard key={e.href} as="a" href={e.href} className="group p-6">
              <span
                aria-hidden
                className={`mb-4 grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br ${e.tint} to-transparent`}
              >
                <Icon />
              </span>
              <p className="text-[15.5px] font-semibold">{e.title}</p>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted">
                {e.body}
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-[12.5px] font-medium text-olive">
                Continue
                <span className="transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </span>
            </PremiumCard>
          );
        })}

        {/* Real now — the 2D floor-plan editor is built. */}
        <PremiumCard as="a" href="/floor-planner" className="group p-6">
          <span
            aria-hidden
            className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-terracotta/[0.14] to-transparent"
          >
            <FloorPlanIcon />
          </span>
          <p className="text-[15.5px] font-semibold">Draw a floor plan</p>
          <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted">
            Trace your rooms on a snap grid and get live carpet areas.
          </p>
          <span className="mt-4 inline-flex items-center gap-1 text-[12.5px] font-medium text-olive">
            Continue
            <span className="transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </span>
        </PremiumCard>
      </div>

      {/* Recent projects */}
      {projects.length > 0 && (
        <section className="mt-12">
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-serif text-[22px]">Your projects</h2>
            <a
              href="/projects"
              className="text-[13px] text-olive underline underline-offset-2"
            >
              View all
            </a>
          </div>
          <div className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4">
            {projects.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        </section>
      )}

      {/* Live 3D room — procedural, no downloaded assets */}
      <section className="mt-12 grid gap-5 lg:grid-cols-[1.25fr_1fr]">
        <ModelShowcase className="h-[340px]" />
        <div className="flex flex-col justify-center">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brass">
            3D Studio
          </p>
          <h2 className="mt-2 font-serif text-[26px] leading-tight">
            Walk your room before it’s built.
          </h2>
          <p className="mt-3 max-w-[46ch] text-[13.5px] text-muted">
            Every Duli space is modelled in 3D — orbit it, swap the materials,
            and judge the proportions instead of guessing from a photo.
          </p>
          <div className="mt-5 flex flex-wrap gap-2.5">
            <a href="/design#model" className="btn-solid h-10 text-[13px]">
              Open the studio <span aria-hidden="true">→</span>
            </a>
            <a
              href="/ideas"
              className="inline-flex h-10 cursor-pointer items-center rounded-full border border-ink px-5 text-[13px] font-medium transition-colors duration-200 hover:bg-ink hover:text-bg"
            >
              Browse ideas
            </a>
          </div>
        </div>
      </section>

      {/* Ideas */}
      <section className="mt-12">
        <div className="mb-4 flex items-end justify-between gap-4">
          <h2 className="font-serif text-[22px]">Pick a room to start</h2>
          <a
            href="/ideas"
            className="text-[13px] text-olive underline underline-offset-2"
          >
            View all
          </a>
        </div>
        <IdeaGallery limit={8} />
      </section>
    </div>
  );
}

function PencilIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="text-olive" aria-hidden="true">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
    </svg>
  );
}
function GridIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="text-brass" aria-hidden="true">
      <rect x="3" y="3" width="7.5" height="7.5" rx="1.5" />
      <rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5" />
      <rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5" />
      <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5" />
    </svg>
  );
}
function FloorPlanIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="text-terracotta" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="1.5" />
      <path d="M3 10h7M10 10V3M10 15h11M15 15v6" />
    </svg>
  );
}
