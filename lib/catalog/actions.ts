"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getMyRoles, isAdminRole } from "@/lib/services";
import {
  CATALOG_CATEGORIES,
  BUDGET_TIERS,
  type CatalogCategory,
  type BudgetTier,
} from "@/lib/types";

export type CatalogItemState = {
  ok?: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

const CATEGORY_VALUES = CATALOG_CATEGORIES.map((c) => c.value) as [
  CatalogCategory,
  ...CatalogCategory[],
];
const TIER_VALUES = BUDGET_TIERS.map((t) => t.value) as [
  BudgetTier,
  ...BudgetTier[],
];

const schema = z
  .object({
    name: z.string().trim().min(2, "Give the item a name.").max(160),
    category: z.enum(CATEGORY_VALUES),
    budgetTier: z.enum(TIER_VALUES),
    priceMin: z.coerce.number().int().min(0, "Enter a starting price."),
    priceMax: z.coerce.number().int().min(0, "Enter a top price."),
    imageUrl: z.string().trim().url("Enter a valid image URL."),
    dimensions: z
      .string()
      .trim()
      .max(120)
      .optional()
      .transform((v) => (v ? v : null)),
  })
  .refine((d) => d.priceMax >= d.priceMin, {
    message: "Top price can't be below the starting price.",
    path: ["priceMax"],
  });

// Slug + short random suffix keeps text ids readable and collision-free.
function itemId(name: string) {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return `${slug || "item"}-${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * A vendor submits a product for their own org. It lands as DRAFT (not public)
 * until an admin approves it. RLS (`catalog_vendor_insert`) enforces vendor_id
 * = the caller's org and status = 'draft'; this stamps both and gives clean
 * errors (e.g. account not linked to a vendor org yet).
 */
export async function addVendorProduct(
  _prev: CatalogItemState,
  formData: FormData,
): Promise<CatalogItemState> {
  const parsed = schema.safeParse({
    name: formData.get("name"),
    category: formData.get("category"),
    budgetTier: formData.get("budgetTier"),
    priceMin: formData.get("priceMin"),
    priceMax: formData.get("priceMax"),
    imageUrl: formData.get("imageUrl"),
    dimensions: formData.get("dimensions") ?? "",
  });
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

  const supabase = createSupabaseServerClient();
  if (!supabase) return { error: "Catalog isn't available right now." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("vendor_id")
    .eq("id", user.id)
    .maybeSingle();
  const vendorId = profile?.vendor_id as string | null | undefined;
  if (!vendorId) {
    return {
      error:
        "Your account isn't linked to a vendor organisation yet. Ask a Duli admin to connect it.",
    };
  }

  const { error } = await supabase.from("catalog_items").insert({
    id: itemId(parsed.data.name),
    name: parsed.data.name,
    category: parsed.data.category,
    budget_tier: parsed.data.budgetTier,
    price_min: parsed.data.priceMin,
    price_max: parsed.data.priceMax,
    dimensions: parsed.data.dimensions,
    image_url: parsed.data.imageUrl,
    vendor_id: vendorId,
    status: "draft", // pending admin approval before it's public
  });
  if (error) return { error: error.message };

  revalidatePath("/vendor/catalog");
  return { ok: true };
}

/**
 * Adds a catalog item ("upload a new design"). Admin-only: the DB policy
 * `catalog_write_admin` (has_role admin/super_admin) is the real gate; this
 * re-checks the role first so a non-admin gets a clean message instead of a
 * raw RLS rejection.
 */
export async function addCatalogItem(
  _prev: CatalogItemState,
  formData: FormData,
): Promise<CatalogItemState> {
  const roles = await getMyRoles();
  if (!isAdminRole(roles)) {
    return { error: "Only admins can add catalog items." };
  }

  const parsed = schema.safeParse({
    name: formData.get("name"),
    category: formData.get("category"),
    budgetTier: formData.get("budgetTier"),
    priceMin: formData.get("priceMin"),
    priceMax: formData.get("priceMax"),
    imageUrl: formData.get("imageUrl"),
    dimensions: formData.get("dimensions") ?? "",
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const supabase = createSupabaseServerClient();
  if (!supabase) return { error: "Catalog isn't available right now." };

  const { error } = await supabase.from("catalog_items").insert({
    id: itemId(parsed.data.name),
    name: parsed.data.name,
    category: parsed.data.category,
    budget_tier: parsed.data.budgetTier,
    price_min: parsed.data.priceMin,
    price_max: parsed.data.priceMax,
    dimensions: parsed.data.dimensions,
    image_url: parsed.data.imageUrl,
    status: "active",
  });

  if (error) return { error: error.message };

  revalidatePath("/admin/catalog");
  revalidatePath("/catalog");
  return { ok: true };
}

const vendorProfileSchema = z.object({
  name: z.string().trim().min(2, "Give your brand a name.").max(120),
  city: z.string().trim().max(60),
  categories: z.array(z.string().trim().max(40)).max(12),
});

/**
 * A vendor edits their own brand profile (name, city, categories). Goes through
 * the SECURITY DEFINER `update_my_vendor` RPC (migration 0019) which only ever
 * writes those display fields — a vendor can never self-approve. Degrades
 * cleanly if 0019 isn't applied yet.
 */
export async function updateMyVendor(input: {
  name: string;
  city: string;
  categories: string[];
}): Promise<{ ok?: boolean; error?: string }> {
  const parsed = vendorProfileSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid details." };
  }

  const supabase = createSupabaseServerClient();
  if (!supabase) return { error: "Not available right now." };

  const { error } = await supabase.rpc("update_my_vendor", {
    p_name: parsed.data.name,
    p_city: parsed.data.city,
    p_categories: parsed.data.categories,
  });
  if (error) {
    // Function missing (0019 not applied): PostgREST PGRST202 / Postgres 42883.
    if (error.code === "PGRST202" || error.code === "42883") {
      return { error: "Editing isn't enabled yet — ask the team to apply migration 0019." };
    }
    return { error: error.message };
  }

  revalidatePath("/vendor/profile");
  revalidatePath("/vendor");
  return { ok: true };
}

/**
 * Approve or un-approve a vendor. Admin-only (DB `vendors_write_admin`); the
 * role re-check yields a clean message instead of a raw RLS rejection. Only
 * approved vendors are publicly visible.
 */
export async function setVendorApproved(
  vendorId: string,
  approved: boolean,
): Promise<{ ok?: boolean; error?: string }> {
  const roles = await getMyRoles();
  if (!isAdminRole(roles)) return { error: "Admins only." };

  const supabase = createSupabaseServerClient();
  if (!supabase) return { error: "Not available right now." };

  const { error } = await supabase
    .from("vendors")
    .update({ approved })
    .eq("id", vendorId);
  if (error) return { error: error.message };

  revalidatePath("/admin/vendors");
  return { ok: true };
}
