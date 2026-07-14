import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { supabaseUrl, supabaseAnonKey, isSupabaseConfigured } from "@/lib/env";

/**
 * Every authenticated route lives at the top level, so this list — not a path
 * prefix — is what makes them non-public. A new app route is PUBLIC until its
 * prefix is added here. Keep it in sync with app/(app)/.
 *
 * The marketing gallery moved to /our-work precisely so /projects could mean
 * "my projects" and be protected.
 */
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/projects",
  "/ai-studio",
  "/floor-planner",
  "/3d-studio",
  "/catalog",
  "/estimates",
  "/consultations",
  "/notifications",
  "/profile",
  "/settings",
  "/admin",
  "/vendor",
  "/work-orders",
  "/leads",
  "/clients",
  "/proposal",
];

/**
 * Refreshes the Supabase session on each request and guards protected routes.
 * When Supabase is not yet configured, it no-ops (site still works), but any
 * protected route redirects to /login so the gate is real from day one.
 *
 * This is the outer gate only. Pages re-check the session and RLS scopes every
 * query, so a miss here is not a data breach on its own.
 */
export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );

  if (!isSupabaseConfigured) {
    if (isProtected) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirect", request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl!, supabaseAnonKey!, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: {
            name: string;
            value: string;
            options: CookieOptions;
          }[],
        ) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return response;
}
