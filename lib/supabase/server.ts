import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { supabaseUrl, supabaseAnonKey, isSupabaseConfigured } from "@/lib/env";

/**
 * Server Supabase client bound to request cookies (user session, RLS-scoped).
 * Use for all user-context reads/writes. Returns null until configured.
 */
export function createSupabaseServerClient() {
  if (!isSupabaseConfigured) return null;

  const cookieStore = cookies();
  return createServerClient(supabaseUrl!, supabaseAnonKey!, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(
          cookiesToSet: {
            name: string;
            value: string;
            options: CookieOptions;
          }[],
        ) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component — middleware refreshes the session.
          }
        },
      },
    },
  );
}
