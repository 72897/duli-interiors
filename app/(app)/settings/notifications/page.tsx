import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Panel } from "@/components/app-ui";
import { NotificationPrefs } from "@/components/notification-prefs";

export const metadata: Metadata = {
  title: "Notification settings — Duli Interiors",
};

export default async function NotificationSettingsPage() {
  const supabase = createSupabaseServerClient();

  let email = true;
  let whatsapp = false;

  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data } = await supabase
      .from("profiles")
      .select("notify_email, notify_whatsapp")
      .eq("id", user?.id ?? "")
      .maybeSingle();
    if (data) {
      email = data.notify_email ?? true;
      whatsapp = data.notify_whatsapp ?? false;
    }
  }

  return (
    <div>
      <p className="mb-5 max-w-[62ch] text-[13px] text-muted">
        Choose how we reach you. In-app notifications always show; these control
        email and WhatsApp. (Email/WhatsApp delivery switches on once the sender
        is connected — your preference is saved now.)
      </p>

      <Panel className="max-w-[620px]">
        <NotificationPrefs defaults={{ email, whatsapp }} />
      </Panel>
    </div>
  );
}
