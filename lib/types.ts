/**
 * Duli domain types.
 *
 * Source of truth for the authenticated product. Where a real table exists in
 * Supabase (profiles, projects, rooms, project_uploads, ai_analyses,
 * partner_applications) these mirror it; where the backend doesn't exist yet
 * the service layer serves mock data behind the same types, so swapping in a
 * real implementation is a service change only — never a UI change.
 */

// ── Roles & permissions ─────────────────────────────────────
export type Role =
  | "customer"
  | "designer"
  | "sales"
  | "project_manager"
  | "vendor"
  | "contractor"
  | "admin"
  | "super_admin";

export const ROLE_LABELS: Record<Role, string> = {
  customer: "Customer",
  designer: "Designer",
  sales: "Sales",
  project_manager: "Project Manager",
  vendor: "Vendor",
  contractor: "Contractor",
  admin: "Admin",
  super_admin: "Super Admin",
};

// ── Indian context ──────────────────────────────────────────
export const CITIES = [
  "Delhi NCR",
  "Mumbai",
  "Bengaluru",
  "Pune",
  "Hyderabad",
  "Chennai",
  "Ahmedabad",
] as const;
export type City = (typeof CITIES)[number];

export type PropertyType = "apartment" | "villa" | "builder_floor" | "office" | "retail";
export const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: "apartment", label: "Apartment" },
  { value: "villa", label: "Villa" },
  { value: "builder_floor", label: "Builder Floor" },
  { value: "office", label: "Office" },
  { value: "retail", label: "Retail" },
];

export type RoomType =
  | "living_room"
  | "bedroom"
  | "kitchen"
  | "wardrobe"
  | "bathroom"
  | "puja_room"
  | "balcony"
  | "dining"
  | "home_office";

export const ROOM_TYPES: { value: RoomType; label: string }[] = [
  { value: "living_room", label: "Living Room" },
  { value: "bedroom", label: "Bedroom" },
  { value: "kitchen", label: "Kitchen" },
  { value: "wardrobe", label: "Wardrobe" },
  { value: "bathroom", label: "Bathroom" },
  { value: "puja_room", label: "Puja Room" },
  { value: "balcony", label: "Balcony" },
  { value: "dining", label: "Dining" },
  { value: "home_office", label: "Home Office" },
];

export type DesignStyle =
  | "modern_indian"
  | "luxury"
  | "minimal"
  | "japandi"
  | "contemporary"
  | "rental_friendly";

export const DESIGN_STYLES: { value: DesignStyle; label: string }[] = [
  { value: "modern_indian", label: "Modern Indian" },
  { value: "luxury", label: "Luxury" },
  { value: "minimal", label: "Minimal" },
  { value: "japandi", label: "Japandi" },
  { value: "contemporary", label: "Contemporary" },
  { value: "rental_friendly", label: "Rental-friendly" },
];

export type BudgetTier = "budget" | "standard" | "premium" | "luxury";
export const BUDGET_TIERS: { value: BudgetTier; label: string; hint: string }[] = [
  { value: "budget", label: "Budget", hint: "Smart, cost-effective finishes" },
  { value: "standard", label: "Standard", hint: "Balanced materials and detailing" },
  { value: "premium", label: "Premium", hint: "Elevated materials, bespoke touches" },
  { value: "luxury", label: "Luxury", hint: "Top-tier materials and custom work" },
];

// ── Core entities ───────────────────────────────────────────
export type User = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  avatarUrl?: string | null;
  roles: Role[];
  city?: City | string | null;
  createdAt: string;
};

export type ProjectStatus =
  | "draft"
  | "submitted"
  | "in_design"
  | "concepts_ready"
  | "revision_requested"
  | "approved"
  | "in_execution"
  | "completed"
  | "closed";

export type Project = {
  id: string;
  code: string;
  name: string;
  ownerId: string;
  assignedDesignerId?: string | null;
  city: string;
  propertyType: PropertyType;
  bhk?: string | null;
  carpetAreaSqFt?: number | null;
  budgetMin?: number | null;
  budgetMax?: number | null;
  style?: DesignStyle | null;
  vastuEnabled: boolean;
  status: ProjectStatus;
  coverImageUrl?: string | null;
  /** 0–100 */
  progress: number;
  roomCount?: number;
  createdAt: string;
  updatedAt: string;
};

export type Room = {
  id: string;
  projectId: string;
  name: string;
  type: RoomType;
  areaSqFt?: number | null;
  dimensions?: { length?: number; width?: number; height?: number; unit?: "ft" | "m" } | null;
  status: "pending" | "in_design" | "designed";
};

export type FloorPlan = {
  id: string;
  projectId: string;
  sourceAssetId?: string | null;
  canvasJson: CanvasDoc;
  units: "ft" | "m";
  width: number;
  height: number;
  version: number;
  previewImageUrl?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CanvasObjectType =
  | "wall"
  | "room"
  | "door"
  | "window"
  | "furniture"
  | "measure"
  | "label";

export type CanvasObject = {
  id: string;
  type: CanvasObjectType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  style?: Record<string, string | number> | null;
  metadata?: Record<string, unknown> | null;
  locked: boolean;
  visible: boolean;
};

export type CanvasDoc = {
  objects: CanvasObject[];
  gridSize: number;
  scale: number;
};

export type GenerationStatus =
  | "queued"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled";

export type DesignGeneration = {
  id: string;
  projectId?: string | null;
  roomId?: string | null;
  prompt: string;
  roomType?: RoomType | null;
  style?: DesignStyle | null;
  budgetTier?: BudgetTier | null;
  city?: string | null;
  vastuEnabled: boolean;
  status: GenerationStatus;
  /** 0–100 */
  progress: number;
  errorMessage?: string | null;
  outputs: GenerationOutput[];
  createdAt: string;
  completedAt?: string | null;
};

export type GenerationOutput = {
  id: string;
  generationId: string;
  imageUrl: string;
  title: string;
  description?: string | null;
  isFavorite: boolean;
  seed?: string | null;
  /** true when this is a curated reference rather than a generated image */
  isReference?: boolean;
  metadata?: Record<string, unknown> | null;
};

export type CatalogCategory =
  | "sofas"
  | "beds"
  | "wardrobes"
  | "modular_kitchen"
  | "tv_units"
  | "puja_units"
  | "dining"
  | "lights"
  | "tiles"
  | "laminates"
  | "wall_panels"
  | "decor";

export const CATALOG_CATEGORIES: { value: CatalogCategory; label: string }[] = [
  { value: "sofas", label: "Sofas" },
  { value: "beds", label: "Beds" },
  { value: "wardrobes", label: "Wardrobes" },
  { value: "modular_kitchen", label: "Modular Kitchen" },
  { value: "tv_units", label: "TV Units" },
  { value: "puja_units", label: "Puja Units" },
  { value: "dining", label: "Dining" },
  { value: "lights", label: "Lights" },
  { value: "tiles", label: "Tiles" },
  { value: "laminates", label: "Laminates" },
  { value: "wall_panels", label: "Wall Panels" },
  { value: "decor", label: "Decor" },
];

export type CatalogItem = {
  id: string;
  name: string;
  category: CatalogCategory;
  roomTypes: RoomType[];
  styleTags: DesignStyle[];
  budgetTier: BudgetTier;
  priceMin: number;
  priceMax: number;
  dimensions?: string | null;
  materialIds: string[];
  vendorId?: string | null;
  vendorName?: string | null;
  imageUrl: string;
  model3dUrl?: string | null;
  cityAvailability: string[];
  status: "active" | "draft" | "archived";
};

export type Material = {
  id: string;
  name: string;
  category: string;
  /** hex — also used by the 3D material swatches */
  color: string;
  finish?: string | null;
  pricePerUnit?: number | null;
  unit?: string | null;
};

export type Vendor = {
  id: string;
  name: string;
  city: string;
  categories: CatalogCategory[];
  itemCount: number;
  approved: boolean;
};

export type EstimateStatus = "draft" | "sent" | "approved" | "revision_requested" | "expired";

export type EstimateItem = {
  id: string;
  estimateId: string;
  roomId?: string | null;
  roomName?: string | null;
  category: string;
  description: string;
  quantity: number;
  unit: string;
  unitRate: number;
  amount: number;
};

export type Estimate = {
  id: string;
  projectId: string;
  title: string;
  status: EstimateStatus;
  items: EstimateItem[];
  subtotal: number;
  /** GST placeholder — not a tax calculation engine */
  tax: number;
  discount: number;
  total: number;
  currency: "INR";
  createdAt: string;
  updatedAt: string;
};

export type Comment = {
  id: string;
  projectId: string;
  authorId: string;
  authorName: string;
  authorRole: Role;
  visibility: "public" | "internal";
  body: string;
  targetType?: "project" | "generation" | "estimate" | "room" | null;
  targetId?: string | null;
  createdAt: string;
};

export type Approval = {
  id: string;
  projectId: string;
  type: "concept" | "estimate" | "handover";
  status: "pending" | "approved" | "rejected";
  requestedBy: string;
  createdAt: string;
};

export type Notification = {
  id: string;
  userId: string;
  type:
    | "project_update"
    | "design_ready"
    | "comment"
    | "estimate_approved"
    | "consultation_reminder"
    | "render_complete";
  title: string;
  body: string;
  actionUrl?: string | null;
  readAt?: string | null;
  createdAt: string;
};

export type Consultation = {
  id: string;
  projectId?: string | null;
  projectName?: string | null;
  userId: string;
  customerName?: string | null;
  designerName?: string | null;
  city: string;
  scheduledAt: string;
  status: "requested" | "scheduled" | "completed" | "cancelled";
  mode: "call" | "video" | "site_visit";
  notes?: string | null;
};

export type ActivityLog = {
  id: string;
  projectId?: string | null;
  actorName: string;
  action: string;
  createdAt: string;
};

export type UserPreference = {
  language: "en" | "hi";
  favouriteStyles: DesignStyle[];
  budgetTier: BudgetTier;
  roomPriorities: RoomType[];
  vastuPreference: boolean;
  notifyEmail: boolean;
  notifyWhatsapp: boolean;
};

export type UserProfile = User & {
  preferences: UserPreference;
  /** free-plan credit mock — no billing attached */
  credits: { used: number; total: number };
};

export type DashboardData = {
  user: UserProfile;
  activeProject?: Project | null;
  recentProjects: Project[];
  notifications: Notification[];
  approvals: Approval[];
  consultations: Consultation[];
  generations: DesignGeneration[];
  credits: { used: number; total: number };
};
