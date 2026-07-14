import { z } from "zod";

/**
 * Environment validation. Server-only secrets are kept separate from public
 * (NEXT_PUBLIC_) values. Supabase is optional so the site still builds/runs
 * before a project is provisioned; `isSupabaseConfigured` lets auth/data code
 * degrade gracefully until credentials are added.
 */

const serverSchema = z.object({
  // Supports the new `sb_secret_...` key or the legacy service_role JWT.
  SUPABASE_SECRET_KEY: z.string().min(1).optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  GEMINI_API_KEY: z.string().optional(),
});

const publicSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  // Accept both the new publishable key (`sb_publishable_...`) and the legacy
  // anon JWT — they occupy the same client slot.
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
});

const server = serverSchema.safeParse(process.env);
if (!server.success) {
  throw new Error(
    "Invalid server env:\n" +
      server.error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`).join("\n"),
  );
}

const publicParsed = publicSchema.safeParse({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
});
if (!publicParsed.success) {
  throw new Error(
    "Invalid public env:\n" +
      publicParsed.error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`).join("\n"),
  );
}

export const serverEnv = server.data;
export const publicEnv = publicParsed.data;

/** Resolved browser-safe key: prefer the new publishable key, fall back to anon. */
export const supabaseUrl = publicEnv.NEXT_PUBLIC_SUPABASE_URL;
export const supabaseAnonKey =
  publicEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
