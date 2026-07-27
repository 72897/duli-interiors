import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  MOCK_CATALOG,
  MOCK_MATERIALS,
  MOCK_VENDORS,
  mockActivity,
  mockApprovals,
  mockComments,
  mockConsultations,
  mockEstimate,
  mockNotifications,
  mockProjects,
  PHOTOS,
} from "@/lib/services/mock-data";
import type {
  CatalogItem,
  Comment,
  Consultation,
  DashboardData,
  DesignGeneration,
  Estimate,
  EstimateItem,
  EstimateStatus,
  Material,
  Notification,
  Project,
  Role,
  UserProfile,
  Vendor,
  ActivityLog,
  Approval,
} from "@/lib/types";

/**
 * SERVICE LAYER — the single seam between UI and data.
 *
 * REAL (Supabase, RLS-enforced): profile, roles, projects, rooms.
 * MOCKED (no backend yet): catalog, materials, vendors, estimates,
 * consultations, notifications, comments, activity, credits.
 *
 * Each mocked function is marked `@mock`. Making one real = editing it here
 * only; no page or component changes.
 */

const img = (id: string, w = 800) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=60`;

// ── User & roles (REAL) ─────────────────────────────────────
export async function getCurrentUser(): Promise<UserProfile | null> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: profile }, roles] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, phone, city, avatar_url")
      .eq("id", user.id)
      .maybeSingle(),
    getMyRoles(),
  ]);

  const name =
    profile?.full_name ||
    (user.user_metadata?.full_name as string) ||
    user.email?.split("@")[0] ||
    "there";

  return {
    id: user.id,
    name,
    email: user.email ?? "",
    phone: profile?.phone ?? null,
    avatarUrl:
      profile?.avatar_url ??
      (user.user_metadata?.avatar_url as string) ??
      null,
    roles: roles.length ? roles : ["customer"],
    city: profile?.city ?? null,
    createdAt: user.created_at ?? new Date().toISOString(),
    preferences: {
      // @mock — no user_preferences table yet.
      language: "en",
      favouriteStyles: ["modern_indian", "minimal"],
      budgetTier: "premium",
      roomPriorities: ["living_room", "kitchen", "bedroom"],
      vastuPreference: true,
      notifyEmail: true,
      notifyWhatsapp: false,
    },
    // @mock — free-plan credits, no billing attached.
    credits: { used: 3, total: 10 },
  };
}

/**
 * True when the caller's own profile is soft-deleted (deactivated). Layouts
 * call this to lock a deactivated user out. Fails OPEN (returns false) if the
 * column doesn't exist yet (0011 not applied) so the app keeps working.
 */
export async function isCurrentUserDeactivated(): Promise<boolean> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return false;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data, error } = await supabase
    .from("profiles")
    .select("deleted_at")
    .eq("id", user.id)
    .maybeSingle();
  if (error) return false; // column/table missing → don't lock anyone out
  return !!data?.deleted_at;
}

/** REAL — reads profile_roles/roles (RLS: self-select allowed). */
export async function getMyRoles(): Promise<Role[]> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return [];
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("profile_roles")
    .select("roles(key)")
    .eq("profile_id", user.id);

  const keys =
    (data ?? [])
      .map((r) => (r as { roles?: { key?: string } }).roles?.key)
      .filter(Boolean) as Role[];
  return keys;
}

export const isAdminRole = (roles: Role[]) =>
  roles.includes("admin") || roles.includes("super_admin");
export const isStaffRole = (roles: Role[]) =>
  roles.some((r) =>
    ["designer", "sales", "project_manager", "admin", "super_admin"].includes(r),
  );

// ── Projects (REAL, falls back to mock when empty) ──────────
type Row = Record<string, unknown>;

const toProject = (r: Row): Project => ({
  id: String(r.id),
  code: String(r.code ?? ""),
  name: String(r.name ?? "Untitled"),
  ownerId: String(r.customer_id ?? ""),
  assignedDesignerId: (r.assigned_designer as string) ?? null,
  city: String(r.city ?? ""),
  propertyType: "apartment",
  bhk: null,
  carpetAreaSqFt: null,
  budgetMin: null,
  budgetMax: null,
  style: null,
  vastuEnabled: false,
  status: (r.status as Project["status"]) ?? "draft",
  coverImageUrl: img(PHOTOS.livingWarm),
  progress:
    r.status === "approved" ? 90 : r.status === "concepts_ready" ? 62 : 25,
  createdAt: String(r.created_at ?? new Date().toISOString()),
  updatedAt: String(r.updated_at ?? new Date().toISOString()),
});

export async function getProjects(): Promise<Project[]> {
  const supabase = createSupabaseServerClient();
  const user = await getCurrentUser();
  if (!supabase || !user) return [];

  const { data } = await supabase
    .from("projects")
    .select("id, code, name, customer_id, assigned_designer, city, status, created_at, updated_at")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  const real = (data ?? []).map(toProject);
  // @mock — demo projects so the studio isn't empty on a fresh account.
  return real.length ? real : mockProjects(user.id);
}

export async function getProjectById(id: string): Promise<Project | null> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return null;
  const { data } = await supabase
    .from("projects")
    .select("id, code, name, customer_id, assigned_designer, city, status, created_at, updated_at")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();
  if (data) return toProject(data as Row);

  const user = await getCurrentUser();
  return user ? mockProjects(user.id).find((p) => p.id === id) ?? null : null;
}

// ── Dashboard (composed) ────────────────────────────────────
export async function getDashboardData(): Promise<DashboardData | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const projects = await getProjects();
  return {
    user,
    activeProject: projects[0] ?? null,
    recentProjects: projects.slice(0, 4),
    notifications: mockNotifications(user.id),
    approvals: mockApprovals(),
    consultations: mockConsultations(user.id),
    generations: await getDesignGenerations(),
    credits: user.credits,
  };
}

// ── AI generations (@mock — real Gemini analysis lives in lib/ai) ──
export async function getDesignGenerations(): Promise<DesignGeneration[]> {
  return [];
}

// ── Catalog / materials / vendors (@mock) ───────────────────
/** Maps a catalog_items row to the app's CatalogItem. Column names differ. */
function toCatalogItem(r: Record<string, unknown>): CatalogItem {
  return {
    id: r.id as string,
    name: r.name as string,
    category: r.category as CatalogItem["category"],
    roomTypes: (r.room_types as CatalogItem["roomTypes"]) ?? [],
    styleTags: (r.style_tags as CatalogItem["styleTags"]) ?? [],
    budgetTier: r.budget_tier as CatalogItem["budgetTier"],
    priceMin: r.price_min as number,
    priceMax: r.price_max as number,
    dimensions: (r.dimensions as string) ?? null,
    materialIds: (r.material_ids as string[]) ?? [],
    vendorId: (r.vendor_id as string) ?? null,
    vendorName: (r.vendor_name as string) ?? null,
    imageUrl: r.image_url as string,
    model3dUrl: (r.model_3d_url as string) ?? null,
    cityAvailability: (r.city_availability as string[]) ?? [],
    status: r.status as CatalogItem["status"],
  };
}

export async function getCatalogItems(filters?: {
  category?: string;
  roomType?: string;
  budgetTier?: string;
  city?: string;
  q?: string;
}): Promise<CatalogItem[]> {
  const supabase = createSupabaseServerClient();

  // Real table first; fall back to mock when it's empty or not yet applied.
  let items = MOCK_CATALOG;
  if (supabase) {
    const { data } = await supabase
      .from("catalog_items")
      .select(
        "id, name, category, room_types, style_tags, budget_tier, price_min, price_max, dimensions, material_ids, vendor_id, vendor_name, image_url, model_3d_url, city_availability, status",
      )
      .eq("status", "active");
    if (data && data.length) items = data.map(toCatalogItem);
  }

  if (filters?.category) items = items.filter((i) => i.category === filters.category);
  if (filters?.roomType)
    items = items.filter((i) => i.roomTypes.includes(filters.roomType as never));
  if (filters?.budgetTier) items = items.filter((i) => i.budgetTier === filters.budgetTier);
  if (filters?.city) items = items.filter((i) => i.cityAvailability.includes(filters.city!));
  if (filters?.q) {
    const q = filters.q.toLowerCase();
    items = items.filter((i) => i.name.toLowerCase().includes(q));
  }
  return items;
}

const CATALOG_COLS =
  "id, name, category, room_types, style_tags, budget_tier, price_min, price_max, dimensions, material_ids, vendor_id, vendor_name, image_url, model_3d_url, city_availability, status";

/** The caller's linked vendor org id (profiles.vendor_id), or null. */
export async function getMyVendorId(): Promise<string | null> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("profiles")
    .select("vendor_id")
    .eq("id", user.id)
    .maybeSingle();
  return (data?.vendor_id as string) ?? null;
}

/** The caller's own catalog items (drafts included — RLS scopes to their org). */
export async function getMyVendorItems(): Promise<CatalogItem[]> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return [];
  const vid = await getMyVendorId();
  if (!vid) return [];
  const { data } = await supabase
    .from("catalog_items")
    .select(CATALOG_COLS)
    .eq("vendor_id", vid)
    .order("created_at", { ascending: false });
  return (data ?? []).map(toCatalogItem);
}

export type ProjectSelection = {
  id: string;
  catalogItemId: string;
  name: string;
  imageUrl: string;
  category: string;
  roomName: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

/** Products a customer/designer has added to a project, with catalog detail. */
export async function getProjectItems(projectId: string): Promise<ProjectSelection[]> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("project_items")
    .select(
      "id, catalog_item_id, room_name, quantity, catalog_items(name, image_url, category, price_min)",
    )
    .eq("project_id", projectId)
    .order("created_at", { ascending: true });
  if (error) return [];

  return (data ?? []).map((r) => {
    const rec = r as {
      id: string;
      catalog_item_id: string;
      room_name: string | null;
      quantity: number;
      catalog_items?:
        | { name: string; image_url: string; category: string; price_min: number }
        | { name: string; image_url: string; category: string; price_min: number }[]
        | null;
    };
    const c = Array.isArray(rec.catalog_items) ? rec.catalog_items[0] : rec.catalog_items;
    const unit = c?.price_min ?? 0;
    return {
      id: rec.id,
      catalogItemId: rec.catalog_item_id,
      name: c?.name ?? "Item",
      imageUrl: c?.image_url ?? "",
      category: c?.category ?? "",
      roomName: rec.room_name,
      quantity: rec.quantity,
      unitPrice: unit,
      lineTotal: unit * rec.quantity,
    };
  });
}

export async function getMaterials(): Promise<Material[]> {
  return MOCK_MATERIALS;
}

export async function getVendors(): Promise<Vendor[]> {
  const supabase = createSupabaseServerClient();
  if (supabase) {
    const { data } = await supabase
      .from("vendors")
      .select("id, name, city, categories, item_count, approved")
      .order("name", { ascending: true });
    if (data && data.length) {
      return data.map((r) => ({
        id: r.id as string,
        name: r.name as string,
        city: r.city as string,
        categories: (r.categories as Vendor["categories"]) ?? [],
        itemCount: (r.item_count as number) ?? 0,
        approved: !!r.approved,
      }));
    }
  }
  // @mock — until the vendors table is applied.
  return MOCK_VENDORS;
}

export type Lead = {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  city: string | null;
  serviceType: string | null;
  estimatedBudget: number | null;
  source: string | null;
  status: string;
  nextFollowUpAt: string | null;
  notes: string | null;
  createdAt: string;
};

/** Sales lead pipeline (RLS: sales/PM/admin). */
export async function getLeads(): Promise<Lead[]> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("leads")
    .select(
      "id, full_name, email, phone, city, service_type, estimated_budget, source, status, next_follow_up_at, notes, created_at",
    )
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data.map((r) => ({
    id: r.id as string,
    fullName: r.full_name as string,
    email: (r.email as string) ?? null,
    phone: (r.phone as string) ?? null,
    city: (r.city as string) ?? null,
    serviceType: (r.service_type as string) ?? null,
    estimatedBudget: (r.estimated_budget as number) ?? null,
    source: (r.source as string) ?? null,
    status: (r.status as string) ?? "new",
    nextFollowUpAt: (r.next_follow_up_at as string) ?? null,
    notes: (r.notes as string) ?? null,
    createdAt: r.created_at as string,
  }));
}

export type Client = {
  id: string;
  name: string;
  city: string | null;
  phone: string | null;
  projectCount: number;
};

/** Customers who have projects (RLS-scoped: admins see all, staff see theirs). */
export async function getClients(): Promise<Client[]> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return [];
  const { data: projs } = await supabase
    .from("projects")
    .select("customer_id")
    .is("deleted_at", null);
  const counts = new Map<string, number>();
  for (const p of projs ?? []) {
    const id = p.customer_id as string;
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  const ids = [...counts.keys()];
  if (ids.length === 0) return [];
  const { data: profs } = await supabase
    .from("profiles")
    .select("id, full_name, city, phone")
    .in("id", ids);
  return (profs ?? [])
    .map((r) => ({
      id: r.id as string,
      name: (r.full_name as string) || "Customer",
      city: (r.city as string) ?? null,
      phone: (r.phone as string) ?? null,
      projectCount: counts.get(r.id as string) ?? 0,
    }))
    .sort((a, b) => b.projectCount - a.projectCount);
}

export type WorkOrder = {
  id: string;
  code: string;
  name: string;
  status: string;
  city: string | null;
};

/** Projects assigned to the caller (member); admins see all. */
export async function getWorkOrders(): Promise<WorkOrder[]> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return [];
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  const { data: mem } = await supabase
    .from("project_members")
    .select("project_id")
    .eq("profile_id", user.id);
  const ids = (mem ?? []).map((m) => m.project_id as string);

  let q = supabase
    .from("projects")
    .select("id, code, name, status, city")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });
  if (ids.length > 0) q = q.in("id", ids);

  const { data } = await q;
  return (data ?? []).map((r) => ({
    id: r.id as string,
    code: r.code as string,
    name: r.name as string,
    status: r.status as string,
    city: (r.city as string) ?? null,
  }));
}

export type VendorPlacement = {
  catalogItemId: string;
  itemName: string;
  placements: number;
  cities: string[];
};

/** Where the caller's products have been specified on projects (aggregates). */
export async function getVendorPlacements(): Promise<VendorPlacement[]> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return [];
  const { data, error } = await supabase.rpc("my_vendor_placements");
  if (error || !data) return [];
  return (data as Record<string, unknown>[]).map((r) => ({
    catalogItemId: r.catalog_item_id as string,
    itemName: r.item_name as string,
    placements: Number(r.placements ?? 0),
    cities: (r.cities as string[]) ?? [],
  }));
}

/** The caller's own linked vendor org (null if not linked or table missing). */
export async function getMyVendor(): Promise<Vendor | null> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return null;
  const vid = await getMyVendorId();
  if (!vid) return null;
  const { data } = await supabase
    .from("vendors")
    .select("id, name, city, categories, item_count, approved")
    .eq("id", vid)
    .maybeSingle();
  if (!data) return null;
  return {
    id: data.id as string,
    name: data.name as string,
    city: (data.city as string) ?? "",
    categories: (data.categories as Vendor["categories"]) ?? [],
    itemCount: (data.item_count as number) ?? 0,
    approved: !!data.approved,
  };
}

// ── Estimates (real, mock fallback) ─────────────────────────
type EstimateRow = {
  id: string;
  project_id: string;
  title: string;
  status: string;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  currency: string;
  created_at: string;
  updated_at: string;
  estimate_items: {
    id: string;
    room_id: string | null;
    room_name: string | null;
    category: string;
    description: string;
    quantity: number;
    unit: string;
    unit_rate: number;
    amount: number;
    sort_order: number;
  }[] | null;
};

function toEstimate(r: EstimateRow): Estimate {
  const items: EstimateItem[] = (r.estimate_items ?? [])
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((li) => ({
      id: li.id,
      estimateId: r.id,
      roomId: li.room_id,
      roomName: li.room_name,
      category: li.category,
      description: li.description,
      quantity: li.quantity,
      unit: li.unit,
      unitRate: li.unit_rate,
      amount: li.amount,
    }));
  return {
    id: r.id,
    projectId: r.project_id,
    title: r.title,
    status: r.status as EstimateStatus,
    items,
    subtotal: r.subtotal,
    tax: r.tax,
    discount: r.discount,
    total: r.total,
    currency: "INR",
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

const ESTIMATE_COLS =
  "id, project_id, title, status, subtotal, tax, discount, total, currency, created_at, updated_at, estimate_items(id, room_id, room_name, category, description, quantity, unit, unit_rate, amount, sort_order)";

export async function getEstimate(projectId: string): Promise<Estimate> {
  const supabase = createSupabaseServerClient();
  if (supabase) {
    const { data } = await supabase
      .from("estimates")
      .select(ESTIMATE_COLS)
      .eq("project_id", projectId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (data) return toEstimate(data as EstimateRow);
  }
  // @mock — no real estimate on this project yet.
  return mockEstimate(projectId);
}

export async function getEstimates(): Promise<Estimate[]> {
  const supabase = createSupabaseServerClient();
  if (supabase) {
    const { data } = await supabase
      .from("estimates")
      .select(ESTIMATE_COLS)
      .order("updated_at", { ascending: false });
    if (data && data.length) return (data as EstimateRow[]).map(toEstimate);
  }
  // @mock — demo estimates keyed to demo projects so the list isn't empty.
  const projects = await getProjects();
  return projects.slice(0, 2).map((p) => ({ ...mockEstimate(p.id), title: p.name }));
}

// ── Collaboration (real; posting is a live write-path) ──────
export async function getComments(projectId: string): Promise<Comment[]> {
  const supabase = createSupabaseServerClient();
  if (supabase) {
    // RLS hides internal notes from customers, so this is safe to select as-is.
    const { data, error } = await supabase
      .from("comments")
      .select(
        "id, project_id, author_id, author_name, author_role, visibility, body, target_type, target_id, created_at",
      )
      .eq("project_id", projectId)
      .order("created_at", { ascending: true });

    // Comments are writable, so an EMPTY thread must read as empty — not as
    // demo data that would vanish the moment a real comment is posted. Fall
    // back to mock only when the table itself is missing (0010 not applied).
    if (!error) {
      return (data ?? []).map((r) => ({
        id: r.id as string,
        projectId: r.project_id as string,
        authorId: (r.author_id as string) ?? "",
        authorName: r.author_name as string,
        authorRole: r.author_role as Comment["authorRole"],
        visibility: r.visibility as Comment["visibility"],
        body: r.body as string,
        targetType: (r.target_type as Comment["targetType"]) ?? null,
        targetId: (r.target_id as string) ?? null,
        createdAt: r.created_at as string,
      }));
    }
  }
  // @mock — comments table not applied yet.
  return mockComments(projectId);
}
export async function getActivity(projectId: string): Promise<ActivityLog[]> {
  const supabase = createSupabaseServerClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("project_activity_logs")
      .select("id, project_id, action, created_at, profiles:actor_id(full_name)")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false })
      .limit(30);

    // Real once there are entries — empty reads as empty (events write here now).
    if (!error) {
      return (data ?? []).map((r) => {
        const rec = r as {
          id: string;
          project_id: string;
          action: string;
          created_at: string;
          profiles?: { full_name: string | null } | { full_name: string | null }[] | null;
        };
        const p = Array.isArray(rec.profiles) ? rec.profiles[0] : rec.profiles;
        return {
          id: rec.id,
          projectId: rec.project_id,
          actorName: p?.full_name || "Duli",
          action: rec.action,
          createdAt: rec.created_at,
        };
      });
    }
  }
  // @mock — activity table not readable.
  return mockActivity(projectId);
}

/**
 * Real, derived approvals: the pending gates on the caller's accessible
 * projects — a submitted project waiting for a designer, or an AI analysis
 * awaiting sign-off. No separate table; the review state IS the approval.
 */
export async function getApprovals(): Promise<Approval[]> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return mockApprovals();

  const { data: projects, error } = await supabase
    .from("projects")
    .select("id, status, updated_at")
    .is("deleted_at", null);
  if (error) return mockApprovals();

  const approvals: Approval[] = [];
  for (const p of projects ?? []) {
    if (p.status === "submitted") {
      approvals.push({
        id: `sub-${p.id}`,
        projectId: p.id,
        type: "concept",
        status: "pending",
        requestedBy: "You",
        createdAt: p.updated_at as string,
      });
    }
  }

  const { data: analyses } = await supabase
    .from("ai_analyses")
    .select("id, project_id, review_status, created_at")
    .eq("review_status", "pending_review")
    .limit(20);
  for (const a of analyses ?? []) {
    approvals.push({
      id: `ana-${a.id}`,
      projectId: a.project_id as string,
      type: "concept",
      status: "pending",
      requestedBy: "AI analysis",
      createdAt: a.created_at as string,
    });
  }

  return approvals;
}

// ── Notifications / consultations (@mock) ───────────────────
export async function getNotifications(): Promise<Notification[]> {
  const user = await getCurrentUser();
  if (!user) return [];

  const supabase = createSupabaseServerClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("notifications")
      .select("id, user_id, type, title, body, action_url, read_at, created_at")
      .order("created_at", { ascending: false })
      .limit(50);

    // Real once the table exists — empty reads as empty (notifications are
    // event-generated now). Mock only when the table is missing (0013 unapplied).
    if (!error) {
      return (data ?? []).map((r) => ({
        id: r.id as string,
        userId: r.user_id as string,
        type: r.type as Notification["type"],
        title: r.title as string,
        body: r.body as string,
        actionUrl: (r.action_url as string) ?? null,
        readAt: (r.read_at as string) ?? null,
        createdAt: r.created_at as string,
      }));
    }
  }
  // @mock — notifications table not applied yet.
  return mockNotifications(user.id);
}
export async function getConsultations(): Promise<Consultation[]> {
  const user = await getCurrentUser();
  if (!user) return [];

  const supabase = createSupabaseServerClient();
  if (supabase) {
    // RLS scopes to your own rows (plus staff see all, per consultations_select).
    // Enriched: customer_name (0018) so staff know whose it is, and the linked
    // project's name where it's readable.
    const enriched =
      "id, project_id, user_id, customer_name, designer_name, city, scheduled_at, status, mode, notes, projects(name)";
    const basic =
      "id, project_id, user_id, designer_name, city, scheduled_at, status, mode, notes";

    let data: Record<string, unknown>[] | null = null;
    let error: { code?: string } | null = null;
    {
      const res = await supabase
        .from("consultations")
        .select(enriched)
        .order("scheduled_at", { ascending: false });
      data = res.data as Record<string, unknown>[] | null;
      error = res.error;
    }
    // Degrade to the basic shape if 0018 (customer_name) isn't applied yet, so
    // real rows never fall through to mock over a missing column.
    if (error && (error.code === "PGRST204" || error.code === "42703" || error.code === "PGRST200")) {
      const res = await supabase
        .from("consultations")
        .select(basic)
        .order("scheduled_at", { ascending: false });
      data = res.data as Record<string, unknown>[] | null;
      error = res.error;
    }

    // Booking is a live write-path, so an empty list must read as empty — not
    // as demo rows that vanish on first real booking. Mock only when the table
    // is missing (0010 not applied).
    if (!error) {
      return (data ?? []).map((r) => {
        const rec = r as Record<string, unknown>;
        const proj = rec.projects as { name: string } | { name: string }[] | null | undefined;
        const projectName = Array.isArray(proj) ? proj[0]?.name : proj?.name;
        return {
          id: rec.id as string,
          projectId: (rec.project_id as string) ?? null,
          projectName: projectName ?? null,
          userId: rec.user_id as string,
          customerName: (rec.customer_name as string) ?? null,
          designerName: (rec.designer_name as string) ?? null,
          city: rec.city as string,
          scheduledAt: rec.scheduled_at as string,
          status: rec.status as Consultation["status"],
          mode: rec.mode as Consultation["mode"],
          notes: (rec.notes as string) ?? null,
        };
      });
    }
  }
  // @mock — consultations table not applied yet.
  return mockConsultations(user.id);
}

export const inr = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN");
