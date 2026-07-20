"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  partnerApplicationSchema,
  type PartnerFormState,
} from "@/lib/partners/schema";

const NOT_CONFIGURED =
  "Applications aren’t connected yet. Please email info@duliinteriors.com.";

/**
 * Stores a partner application. Anonymous visitors may insert (see RLS policy
 * partner_apps_insert_any); only internal roles can read them back.
 */
export async function submitPartnerApplication(
  _prev: PartnerFormState,
  formData: FormData,
): Promise<PartnerFormState> {
  // FormData.get() returns null for absent fields, and Zod's .optional()
  // accepts undefined (not null) — normalise to strings at the boundary.
  const str = (key: string) => {
    const v = formData.get(key);
    return typeof v === "string" ? v.trim() : "";
  };

  const parsed = partnerApplicationSchema.safeParse({
    program: str("program"),
    full_name: str("full_name"),
    email: str("email"),
    phone: str("phone"),
    city: str("city"),
    company: str("company"),
    website: str("website"),
    experience_years: str("experience_years"),
    message: str("message"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const supabase = createSupabaseServerClient();
  if (!supabase) return { error: NOT_CONFIGURED };

  const v = parsed.data;
  const { error } = await supabase.from("partner_applications").insert({
    program: v.program,
    full_name: v.full_name,
    email: v.email,
    phone: v.phone,
    city: v.city,
    company: v.company || null,
    website: v.website || null,
    experience_years: v.experience_years ? Number(v.experience_years) : null,
    message: v.message || null,
  });

  if (error) return { error: error.message };
  return { ok: true };
}
