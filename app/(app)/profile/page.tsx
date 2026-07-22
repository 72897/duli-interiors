import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Sparkles } from "lucide-react";
import { getCurrentUser, getMyRoles } from "@/lib/services";
import { PageHead, Panel, Pill } from "@/components/app-ui";
import { ROLE_LABELS, type Role } from "@/lib/types";

export const metadata: Metadata = { title: "Profile — Duli Interiors" };

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted">
        {label}
      </dt>
      <dd className="mt-1 text-[14.5px]">{value || "—"}</dd>
    </div>
  );
}

export default async function ProfilePage() {
  const user = await getCurrentUser();
  // The layout already gates this, but a page that renders a profile must never
  // fall back to a blank shell if the session vanished mid-request.
  if (!user) redirect("/login?redirect=/profile");

  const roles = await getMyRoles();
  const { used, total } = user.credits;
  const pct = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;
  const prefs = user.preferences;

  return (
    <div>
      <PageHead
        eyebrow="Account"
        title="Profile"
        intro="Your details and design preferences — we use these to steer AI concepts and designer briefs."
        actions={
          <a
            href="/settings"
            className="inline-flex h-10 cursor-pointer items-center rounded-full border border-ink px-5 text-[13px] font-medium transition-colors duration-200 hover:bg-ink hover:text-bg"
          >
            Edit in settings
          </a>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <Panel className="p-6">
          <div className="flex items-center gap-4">
            {user.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatarUrl}
                alt=""
                className="h-16 w-16 rounded-full object-cover ring-1 ring-ink/10"
              />
            ) : (
              <span className="grid h-16 w-16 place-items-center rounded-full bg-brass text-2xl font-bold text-bg">
                {(user.name || user.email || "?").charAt(0).toUpperCase()}
              </span>
            )}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-serif text-[24px]">{user.name || "Unnamed"}</h2>
                {roles.map((r) => (
                  <Pill key={r} tone="brass">
                    {ROLE_LABELS[r as Role] ?? r}
                  </Pill>
                ))}
              </div>
              <p className="mt-0.5 text-[13px] text-muted">{user.email}</p>
            </div>
          </div>

          <dl className="mt-7 grid gap-5 border-t border-ink/[0.07] pt-6 sm:grid-cols-2">
            <Field label="Phone" value={user.phone ?? ""} />
            <Field label="City" value={user.city ?? ""} />
          </dl>
        </Panel>

        <div className="space-y-5">
          {/* AI credits — a mock meter; the product is free, so this only shapes UX */}
          <Panel className="p-6">
            <div className="flex items-center gap-2">
              <Sparkles size={15} strokeWidth={1.9} className="text-brass" />
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted">
                AI credits
              </p>
            </div>
            <p className="mt-2 font-serif text-[32px] leading-none tracking-tight">
              {Math.max(0, total - used)}
              <span className="text-[16px] text-muted"> / {total}</span>
            </p>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-ink/[0.07]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-olive to-brass"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="mt-2.5 text-[12px] leading-relaxed text-muted">
              Everything is free while we&apos;re in preview. Credits track usage
              only — there&apos;s no billing attached.
            </p>
          </Panel>

          <Panel className="p-6">
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted">
              Design preferences
            </p>
            <dl className="mt-4 space-y-4">
              <Field
                label="Favourite styles"
                value={prefs.favouriteStyles.join(", ")}
              />
              <Field label="Budget tier" value={prefs.budgetTier} />
              <Field label="Room priorities" value={prefs.roomPriorities.join(", ")} />
              <Field
                label="Vastu"
                value={prefs.vastuPreference ? "Follow vastu guidance" : "Not required"}
              />
              <Field label="Language" value={prefs.language === "hi" ? "Hindi" : "English"} />
            </dl>
          </Panel>
        </div>
      </div>
    </div>
  );
}
