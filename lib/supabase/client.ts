import { createBrowserClient } from "@supabase/ssr";
import { supabaseUrl, supabaseAnonKey, isSupabaseConfigured } from "@/lib/env";

/** Browser Supabase client (publishable key, RLS-scoped). Null until configured. */
export function createSupabaseBrowserClient() {
  if (!isSupabaseConfigured) return null;
  return createBrowserClient(supabaseUrl!, supabaseAnonKey!);
}
