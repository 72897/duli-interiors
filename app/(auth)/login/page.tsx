import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Sign in — Duli Interiors" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { redirect?: string };
}) {
  const supabase = createSupabaseServerClient();
  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) redirect("/dashboard");
  }
  return <AuthForm mode="login" redirectTo={searchParams.redirect} />;
}
