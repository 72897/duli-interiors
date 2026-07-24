import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getVendors } from "@/lib/services";
import { Panel, Pill, shortDate } from "@/components/app-ui";
import { UserActiveToggle } from "@/components/user-active-toggle";
import { UserVendorLink } from "@/components/user-vendor-link";

export const metadata: Metadata = { title: "Users — Admin — Duli Interiors" };

type Row = {
  id: string;
  full_name: string | null;
  city: string | null;
  created_at: string;
  deleted_at: string | null;
  vendor_id: string | null;
  profile_roles: { roles: { key: string; label: string } | null }[] | null;
};

export default async function AdminUsersPage() {
  const supabase = createSupabaseServerClient();

  // Admins read across all profiles (RLS); everyone else is blocked.
  const [{ data }, vendors] = await Promise.all([
    supabase
      ? supabase
          .from("profiles")
          .select("id, full_name, city, created_at, deleted_at, vendor_id, profile_roles(roles(key,label))")
          .order("created_at", { ascending: false })
          .limit(200)
      : Promise.resolve({ data: [] as Row[] }),
    getVendors(),
  ]);

  const rows = (data ?? []) as Row[];
  const vendorOpts = vendors.map((v) => ({ id: v.id, name: v.name }));

  return (
    <div>
      <h1 className="font-serif text-[26px] leading-tight">Users</h1>
      <p className="mt-1.5 text-[13px] text-muted">
        Everyone with a Duli account. Roles are managed through SQL for now —
        see the overview.
      </p>

      <Panel className="mt-6 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-[13px]">
            <thead>
              <tr className="border-b border-ink/[0.07] text-left text-[10.5px] uppercase tracking-[0.12em] text-muted">
                <th className="px-5 py-3 font-semibold">Name</th>
                <th className="px-3 py-3 font-semibold">City</th>
                <th className="px-3 py-3 font-semibold">Roles</th>
                <th className="px-3 py-3 font-semibold">Vendor org</th>
                <th className="px-3 py-3 font-semibold">Joined</th>
                <th className="px-5 py-3 text-right font-semibold">Access</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-muted">
                    No users yet.
                  </td>
                </tr>
              ) : (
                rows.map((u) => {
                  const roles = (u.profile_roles ?? [])
                    .map((pr) => pr.roles?.label)
                    .filter(Boolean) as string[];
                  const roleKeys = (u.profile_roles ?? [])
                    .map((pr) => pr.roles?.key)
                    .filter(Boolean) as string[];
                  const isVendor = roleKeys.includes("vendor");
                  const active = !u.deleted_at;
                  return (
                    <tr
                      key={u.id}
                      className={
                        "border-b border-ink/[0.05] last:border-0 " +
                        (active ? "" : "opacity-60")
                      }
                    >
                      <td className="px-5 py-3">
                        <span className="flex items-center gap-2">
                          {u.full_name || "—"}
                          {!active && <Pill tone="terracotta">Deactivated</Pill>}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-muted">{u.city || "—"}</td>
                      <td className="px-3 py-3">
                        <div className="flex flex-wrap gap-1">
                          {roles.length ? (
                            roles.map((r) => (
                              <Pill key={r} tone={r === "Customer" ? "neutral" : "brass"}>
                                {r}
                              </Pill>
                            ))
                          ) : (
                            <Pill>Customer</Pill>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        {isVendor ? (
                          <UserVendorLink
                            userId={u.id}
                            current={u.vendor_id}
                            vendors={vendorOpts}
                          />
                        ) : (
                          <span className="text-[12px] text-muted">—</span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-muted">
                        {shortDate(u.created_at)}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex justify-end">
                          <UserActiveToggle userId={u.id} active={active} />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      <p className="mt-4 text-[12px] text-muted">
        Showing up to 200 most recent accounts.
      </p>
    </div>
  );
}
