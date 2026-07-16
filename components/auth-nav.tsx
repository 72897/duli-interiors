"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { AccountDropdown } from "@/components/account-dropdown";

type Profile = { name: string; email: string; avatarUrl: string | null };

const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  project_manager: "Project Manager",
  designer: "Designer",
  sales: "Sales",
  vendor: "Vendor",
  contractor: "Contractor",
  customer: "Customer",
};
const ROLE_PRIORITY = [
  "super_admin",
  "admin",
  "project_manager",
  "designer",
  "sales",
  "vendor",
  "contractor",
];

/**
 * Auth-aware nav entry for the marketing header.
 *
 * Subscribes to onAuthStateChange so signing in/out updates the header
 * immediately everywhere, without a reload — the header was previously
 * auth-blind and always rendered "Login".
 */
export function AuthNav({ onNavigate }: { onNavigate?: () => void }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setReady(true);
      return;
    }

    const toProfile = (user: {
      email?: string;
      user_metadata?: Record<string, unknown>;
    }): Profile => ({
      name:
        (user.user_metadata?.full_name as string) ||
        user.email?.split("@")[0] ||
        "Account",
      email: user.email ?? "",
      avatarUrl:
        (user.user_metadata?.avatar_url as string) ||
        (user.user_metadata?.picture as string) ||
        null,
    });

    // Roles power the admin/vendor shortcuts in the dropdown. RLS lets a user
    // read their own profile_roles, so this is safe from the browser client.
    const loadRoles = async () => {
      const { data } = await supabase
        .from("profile_roles")
        .select("roles(key)");
      const keys = (data ?? [])
        .map((r) => {
          const rel = (r as { roles?: { key: string } | { key: string }[] }).roles;
          return Array.isArray(rel) ? rel[0]?.key : rel?.key;
        })
        .filter(Boolean) as string[];
      setRoles(keys);
    };

    supabase.auth.getUser().then(({ data }) => {
      setProfile(data.user ? toProfile(data.user) : null);
      if (data.user) void loadRoles();
      setReady(true);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setProfile(session?.user ? toProfile(session.user) : null);
      if (session?.user) void loadRoles();
      else setRoles([]);
      setReady(true);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  // Hold the slot until we know, so the nav doesn't flash "Login" at a signed-in user.
  if (!ready) return <span className="nav-auth-slot" aria-hidden />;

  if (!profile) {
    return (
      <a href="/login" onClick={onNavigate}>
        Login
      </a>
    );
  }

  const isAdmin = roles.includes("admin") || roles.includes("super_admin");
  const primaryRole = ROLE_PRIORITY.find((r) => roles.includes(r)) ?? "customer";

  return (
    <AccountDropdown
      name={profile.name}
      email={profile.email}
      avatarUrl={profile.avatarUrl}
      roleLabel={ROLE_LABELS[primaryRole]}
      showAdmin={isAdmin}
      showVendor={isAdmin || roles.includes("vendor")}
    />
  );
}
