import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Run on app routes but skip static assets and the API dev overlay.
  //
  // The directory exclusions MUST keep their trailing slash. Bare "3d" also
  // matches the route /3d-studio, which silently dropped it out of the auth
  // guard and out of session refresh. "3d/" only matches the asset folder.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|assets/|3d/|view/|api/|.*\\.(?:png|jpg|jpeg|webp|glb|svg|ico)$).*)",
  ],
};
