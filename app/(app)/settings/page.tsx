import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Panel } from "@/components/app-ui";
import { ProfileForm } from "@/components/profile-form";
import { DeactivateAccount } from "@/components/deactivate-account";

export const metadata: Metadata = { title: "Settings — Duli Interiors" };

export default async function SettingsPage() {
  const supabase = createSupabaseServerClient();

  let email = "";
  let fullName = "";
  let phone = "";
  let city = "";
  let preferredContact = "email";

  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    email = user?.email ?? "";
    fullName = (user?.user_metadata?.full_name as string) ?? "";

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, phone, city, preferred_contact_method")
      .eq("id", user?.id ?? "")
      .maybeSingle();

    if (profile) {
      fullName = profile.full_name ?? fullName;
      phone = profile.phone ?? "";
      city = profile.city ?? "";
      preferredContact = profile.preferred_contact_method ?? "email";
    }
  }

  return (
    <div className="space-y-5">
      {/* Email is your login — changing it is a separate, verified flow. */}
      <Panel className="max-w-[560px] p-5">
        <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted">
          Signed in as
        </p>
        <p className="mt-1 text-[14px]">{email || "—"}</p>
      </Panel>

      <Panel className="p-6">
        <h2 className="mb-4 text-[15px] font-semibold">Your details</h2>
        <ProfileForm
          defaults={{ fullName, phone, city, preferredContact }}
        />
      </Panel>

      <DeactivateAccount />
    </div>
  );
}
