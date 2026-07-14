import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PasswordResetForm } from "@/components/password-reset-form";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Reset password — Duli Interiors" };

export default async function ForgotPasswordPage() {
  // No reason to reset while signed in — send them to settings instead.
  const supabase = createSupabaseServerClient();
  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) redirect("/settings");
  }
  return <PasswordResetForm mode="forgot" />;
}
