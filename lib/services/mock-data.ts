/**
 * MOCK DATA — replace with real queries as backends land.
 *
 * Everything here is clearly fake and lives behind the service layer in
 * lib/services/index.ts, so swapping to real data is a service change only.
 * Projects/rooms/uploads/analyses ALREADY have real Supabase tables — the
 * service layer prefers those and falls back to this for the parts that don't
 * exist yet (catalog, estimates, consultations, notifications, vendors).
 */
import type {
  CatalogItem,
  Consultation,
  Estimate,
  Material,
  Notification,
  Project,
  Vendor,
  Comment,
  Approval,
  ActivityLog,
} from "@/lib/types";

const img = (id: string, w = 800) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=60`;

/** Verified interior photo ids (each checked to return a real image). */
export const PHOTOS = {
  living: "photo-1567767292278-a4f21aa2d36e",
  livingWarm: "photo-1615529182904-14819c35db37",
  livingLuxe: "photo-1616627561839-074385245ff6",
  bedroom: "photo-1616594039964-ae9021a400a0",
  bedroomMin: "photo-1505693416388-ac5ce068fe85",
  kitchen: "photo-1556909212-d5b604d0c90d",
  kitchenIndian: "photo-1600489000022-c2086d79f9d4",
  wardrobe: "photo-1558997519-83ea9252edf8",
  bathroom: "photo-1552321554-5fefe8c9ef14",
  dining: "photo-1617806118233-18e1de247200",
  office: "photo-1524758631624-e2822e304c36",
} as const;

export const MOCK_MATERIALS: Material[] = [
  { id: "m-teak", name: "Fluted Teak", category: "veneer", color: "#9B6E4B", finish: "Matte", pricePerUnit: 1850, unit: "sqft" },
  { id: "m-oak", name: "Light Oak", category: "veneer", color: "#C9A227", finish: "Natural", pricePerUnit: 1450, unit: "sqft" },
  { id: "m-ivory", name: "Warm Ivory", category: "paint", color: "#F1EEE7", finish: "Matte", pricePerUnit: 42, unit: "sqft" },
  { id: "m-olive", name: "Olive", category: "paint", color: "#66705A", finish: "Matte", pricePerUnit: 48, unit: "sqft" },
  { id: "m-brass", name: "Antique Brass", category: "metal", color: "#B08D57", finish: "Brushed", pricePerUnit: 2400, unit: "sqft" },
  { id: "m-marble", name: "Statuario Marble", category: "stone", color: "#E8E4DC", finish: "Polished", pricePerUnit: 3200, unit: "sqft" },
  { id: "m-graphite", name: "Graphite Laminate", category: "laminate", color: "#3A3A38", finish: "Matte", pricePerUnit: 320, unit: "sqft" },
  { id: "m-terracotta", name: "Terracotta", category: "tile", color: "#8C4A3A", finish: "Textured", pricePerUnit: 180, unit: "sqft" },
];

export const MOCK_VENDORS: Vendor[] = [
  { id: "v-1", name: "Vardhman Modular", city: "Delhi NCR", categories: ["modular_kitchen", "wardrobes"], itemCount: 42, approved: true },
  { id: "v-2", name: "Coastal Teak Co.", city: "Bengaluru", categories: ["sofas", "beds", "dining"], itemCount: 28, approved: true },
  { id: "v-3", name: "Surface Studio", city: "Mumbai", categories: ["tiles", "laminates", "wall_panels"], itemCount: 65, approved: true },
  { id: "v-4", name: "Lumen Lighting", city: "Pune", categories: ["lights"], itemCount: 33, approved: false },
];

export const MOCK_CATALOG: CatalogItem[] = [
  { id: "c-1", name: "Kaveri Linen Sectional", category: "sofas", roomTypes: ["living_room"], styleTags: ["contemporary", "modern_indian"], budgetTier: "premium", priceMin: 78000, priceMax: 124000, dimensions: "2400 × 950 × 780 mm", materialIds: ["m-teak", "m-ivory"], vendorId: "v-2", vendorName: "Coastal Teak Co.", imageUrl: img(PHOTOS.living), model3dUrl: "/3d/sofa-opt.glb", cityAvailability: ["Delhi NCR", "Mumbai", "Bengaluru"], status: "active" },
  { id: "c-2", name: "Fluted Teak TV Unit", category: "tv_units", roomTypes: ["living_room"], styleTags: ["modern_indian", "luxury"], budgetTier: "premium", priceMin: 54000, priceMax: 86000, dimensions: "1800 × 400 × 550 mm", materialIds: ["m-teak", "m-brass"], vendorId: "v-2", vendorName: "Coastal Teak Co.", imageUrl: img(PHOTOS.livingWarm), cityAvailability: ["Delhi NCR", "Bengaluru", "Pune"], status: "active" },
  { id: "c-3", name: "Handleless Modular Kitchen", category: "modular_kitchen", roomTypes: ["kitchen"], styleTags: ["contemporary", "minimal"], budgetTier: "premium", priceMin: 210000, priceMax: 420000, dimensions: "Per running foot", materialIds: ["m-graphite", "m-marble"], vendorId: "v-1", vendorName: "Vardhman Modular", imageUrl: img(PHOTOS.kitchen), cityAvailability: ["Delhi NCR", "Mumbai"], status: "active" },
  { id: "c-4", name: "Walk-in Wardrobe System", category: "wardrobes", roomTypes: ["wardrobe", "bedroom"], styleTags: ["luxury"], budgetTier: "luxury", priceMin: 165000, priceMax: 340000, dimensions: "Per running foot", materialIds: ["m-oak", "m-brass"], vendorId: "v-1", vendorName: "Vardhman Modular", imageUrl: img(PHOTOS.wardrobe), cityAvailability: ["Delhi NCR", "Bengaluru"], status: "active" },
  { id: "c-5", name: "Carved Puja Unit", category: "puja_units", roomTypes: ["puja_room"], styleTags: ["modern_indian"], budgetTier: "standard", priceMin: 32000, priceMax: 68000, dimensions: "900 × 450 × 1800 mm", materialIds: ["m-teak", "m-brass"], vendorId: "v-2", vendorName: "Coastal Teak Co.", imageUrl: img(PHOTOS.livingWarm), cityAvailability: ["Delhi NCR", "Mumbai", "Pune", "Ahmedabad"], status: "active" },
  { id: "c-6", name: "Solid Oak Dining Six", category: "dining", roomTypes: ["dining"], styleTags: ["japandi", "minimal"], budgetTier: "standard", priceMin: 48000, priceMax: 82000, dimensions: "1800 × 900 × 750 mm", materialIds: ["m-oak"], vendorId: "v-2", vendorName: "Coastal Teak Co.", imageUrl: img(PHOTOS.dining), cityAvailability: ["Bengaluru", "Chennai", "Hyderabad"], status: "active" },
  { id: "c-7", name: "Brass Pendant Cluster", category: "lights", roomTypes: ["dining", "living_room"], styleTags: ["luxury", "contemporary"], budgetTier: "premium", priceMin: 18000, priceMax: 42000, dimensions: "Ø 450 mm", materialIds: ["m-brass"], vendorId: "v-4", vendorName: "Lumen Lighting", imageUrl: img(PHOTOS.dining), cityAvailability: ["Delhi NCR", "Mumbai", "Pune"], status: "active" },
  { id: "c-8", name: "Statuario Floor Tile", category: "tiles", roomTypes: ["bathroom", "living_room"], styleTags: ["luxury"], budgetTier: "luxury", priceMin: 240, priceMax: 460, dimensions: "800 × 1600 mm", materialIds: ["m-marble"], vendorId: "v-3", vendorName: "Surface Studio", imageUrl: img(PHOTOS.bathroom), cityAvailability: ["Delhi NCR", "Mumbai", "Bengaluru", "Pune"], status: "active" },
  { id: "c-9", name: "Graphite Laminate", category: "laminates", roomTypes: ["kitchen", "wardrobe"], styleTags: ["contemporary"], budgetTier: "budget", priceMin: 95, priceMax: 210, dimensions: "8 × 4 ft sheet", materialIds: ["m-graphite"], vendorId: "v-3", vendorName: "Surface Studio", imageUrl: img(PHOTOS.kitchenIndian), cityAvailability: ["Delhi NCR", "Mumbai", "Ahmedabad"], status: "active" },
  { id: "c-10", name: "Fluted Wall Panel", category: "wall_panels", roomTypes: ["living_room", "bedroom"], styleTags: ["modern_indian", "luxury"], budgetTier: "premium", priceMin: 420, priceMax: 780, dimensions: "Per sqft", materialIds: ["m-teak"], vendorId: "v-3", vendorName: "Surface Studio", imageUrl: img(PHOTOS.bedroom), cityAvailability: ["Delhi NCR", "Bengaluru"], status: "active" },
  { id: "c-11", name: "Upholstered Platform Bed", category: "beds", roomTypes: ["bedroom"], styleTags: ["minimal", "japandi"], budgetTier: "standard", priceMin: 52000, priceMax: 98000, dimensions: "1980 × 1830 mm (King)", materialIds: ["m-ivory", "m-oak"], vendorId: "v-2", vendorName: "Coastal Teak Co.", imageUrl: img(PHOTOS.bedroomMin), cityAvailability: ["Delhi NCR", "Mumbai", "Bengaluru", "Chennai"], status: "active" },
  { id: "c-12", name: "Ceramic Vase Set", category: "decor", roomTypes: ["living_room"], styleTags: ["minimal", "rental_friendly"], budgetTier: "budget", priceMin: 2400, priceMax: 6800, dimensions: "Set of 3", materialIds: ["m-terracotta"], vendorId: "v-3", vendorName: "Surface Studio", imageUrl: img(PHOTOS.livingLuxe), cityAvailability: ["Delhi NCR", "Mumbai", "Bengaluru", "Pune", "Chennai"], status: "active" },
];

export const mockProjects = (ownerId: string): Project[] => [
  { id: "p-1", code: "CAL-2026-0001", name: "Prestige Lakeside — 3BHK", ownerId, assignedDesignerId: "d-1", city: "Bengaluru", propertyType: "apartment", bhk: "3 BHK", carpetAreaSqFt: 1450, budgetMin: 1800000, budgetMax: 2400000, style: "modern_indian", vastuEnabled: true, status: "concepts_ready", coverImageUrl: img(PHOTOS.livingWarm), progress: 62, roomCount: 5, createdAt: "2026-06-02T10:00:00Z", updatedAt: "2026-07-11T10:00:00Z" },
  { id: "p-2", code: "CAL-2026-0002", name: "Powai Builder Floor", ownerId, assignedDesignerId: "d-2", city: "Mumbai", propertyType: "builder_floor", bhk: "2 BHK", carpetAreaSqFt: 980, budgetMin: 900000, budgetMax: 1400000, style: "contemporary", vastuEnabled: false, status: "in_design", coverImageUrl: img(PHOTOS.kitchen), progress: 34, roomCount: 4, createdAt: "2026-06-20T10:00:00Z", updatedAt: "2026-07-13T10:00:00Z" },
  { id: "p-3", code: "CAL-2026-0003", name: "DLF Villa — Master Suite", ownerId, assignedDesignerId: null, city: "Delhi NCR", propertyType: "villa", bhk: "4+ BHK", carpetAreaSqFt: 3200, budgetMin: 4200000, budgetMax: 6500000, style: "luxury", vastuEnabled: true, status: "submitted", coverImageUrl: img(PHOTOS.bedroom), progress: 12, roomCount: 7, createdAt: "2026-07-08T10:00:00Z", updatedAt: "2026-07-14T10:00:00Z" },
];

export const mockNotifications = (userId: string): Notification[] => [
  { id: "n-1", userId, type: "design_ready", title: "Concepts ready", body: "3 concepts for your living room are ready to review.", actionUrl: "/projects/p-1", readAt: null, createdAt: "2026-07-14T09:12:00Z" },
  { id: "n-2", userId, type: "comment", title: "Aarti replied", body: "\"Can we try a warmer palette on the TV wall?\"", actionUrl: "/projects/p-1", readAt: null, createdAt: "2026-07-13T16:40:00Z" },
  { id: "n-3", userId, type: "consultation_reminder", title: "Site visit tomorrow", body: "Measurement visit at Prestige Lakeside, 11:00 AM.", actionUrl: "/consultations", readAt: "2026-07-13T10:00:00Z", createdAt: "2026-07-12T11:00:00Z" },
  { id: "n-4", userId, type: "estimate_approved", title: "Estimate approved", body: "Powai Builder Floor estimate was approved.", actionUrl: "/estimates", readAt: "2026-07-11T10:00:00Z", createdAt: "2026-07-11T09:00:00Z" },
];

export const mockConsultations = (userId: string): Consultation[] => [
  { id: "cs-1", projectId: "p-1", projectName: "Prestige Lakeside — 3BHK", userId, designerName: "Aarti Menon", city: "Bengaluru", scheduledAt: "2026-07-16T05:30:00Z", status: "scheduled", mode: "site_visit", notes: "Carry laser measure + material samples." },
  { id: "cs-2", projectId: "p-2", projectName: "Powai Builder Floor", userId, designerName: "Rohan Shetty", city: "Mumbai", scheduledAt: "2026-07-18T09:00:00Z", status: "scheduled", mode: "video", notes: "Walk through kitchen layout options." },
];

export const mockApprovals = (): Approval[] => [
  { id: "a-1", projectId: "p-1", type: "concept", status: "pending", requestedBy: "Aarti Menon", createdAt: "2026-07-14T09:12:00Z" },
  { id: "a-2", projectId: "p-2", type: "estimate", status: "pending", requestedBy: "Rohan Shetty", createdAt: "2026-07-13T12:00:00Z" },
];

export const mockEstimate = (projectId: string): Estimate => {
  const items = [
    { id: "ei-1", estimateId: "e-1", roomName: "Living Room", category: "Carpentry", description: "Fluted teak TV unit with brass inlay", quantity: 12, unit: "rft", unitRate: 4800, amount: 57600 },
    { id: "ei-2", estimateId: "e-1", roomName: "Living Room", category: "Loose Furniture", description: "Kaveri linen sectional", quantity: 1, unit: "no", unitRate: 98000, amount: 98000 },
    { id: "ei-3", estimateId: "e-1", roomName: "Kitchen", category: "Modular", description: "Handleless modular kitchen, quartz top", quantity: 18, unit: "rft", unitRate: 14500, amount: 261000 },
    { id: "ei-4", estimateId: "e-1", roomName: "Master Bedroom", category: "Modular", description: "Wardrobe with fluted glass shutters", quantity: 10, unit: "rft", unitRate: 12800, amount: 128000 },
    { id: "ei-5", estimateId: "e-1", roomName: "Whole home", category: "Painting", description: "Premium emulsion, 2 coats", quantity: 1450, unit: "sqft", unitRate: 42, amount: 60900 },
    { id: "ei-6", estimateId: "e-1", roomName: "Whole home", category: "False Ceiling", description: "Gypsum ceiling with cove lighting", quantity: 620, unit: "sqft", unitRate: 165, amount: 102300 },
    { id: "ei-7", estimateId: "e-1", roomName: "Whole home", category: "Labour & Installation", description: "Site labour, installation, transport", quantity: 1, unit: "lot", unitRate: 148000, amount: 148000 },
    { id: "ei-8", estimateId: "e-1", roomName: "Whole home", category: "Design Fee", description: "Design, drawings and project management", quantity: 1, unit: "lot", unitRate: 96000, amount: 96000 },
  ].map((i) => ({ ...i, roomId: null }));

  const subtotal = items.reduce((s, i) => s + i.amount, 0);
  const discount = 25000;
  // GST placeholder only — not a tax engine.
  const tax = Math.round((subtotal - discount) * 0.18);
  return {
    id: "e-1",
    projectId,
    title: "Full home interiors — Phase 1",
    status: "sent",
    items,
    subtotal,
    tax,
    discount,
    total: subtotal - discount + tax,
    currency: "INR",
    createdAt: "2026-07-10T10:00:00Z",
    updatedAt: "2026-07-13T10:00:00Z",
  };
};

export const mockComments = (projectId: string): Comment[] => [
  { id: "cm-1", projectId, authorId: "d-1", authorName: "Aarti Menon", authorRole: "designer", visibility: "public", body: "Sharing three directions for the living room. The fluted teak wall is my recommendation — it hides the beam neatly.", targetType: "project", targetId: projectId, createdAt: "2026-07-14T09:12:00Z" },
  { id: "cm-2", projectId, authorId: "u-1", authorName: "You", authorRole: "customer", visibility: "public", body: "Love direction 2. Can we try a warmer palette on the TV wall?", targetType: "project", targetId: projectId, createdAt: "2026-07-14T11:02:00Z" },
  { id: "cm-3", projectId, authorId: "d-1", authorName: "Aarti Menon", authorRole: "designer", visibility: "internal", body: "Internal: confirm beam depth on site before finalising the unit.", targetType: "project", targetId: projectId, createdAt: "2026-07-14T11:30:00Z" },
];

export const mockActivity = (projectId: string): ActivityLog[] => [
  { id: "al-1", projectId, actorName: "Aarti Menon", action: "Uploaded 3 concepts", createdAt: "2026-07-14T09:12:00Z" },
  { id: "al-2", projectId, actorName: "You", action: "Requested a revision", createdAt: "2026-07-14T11:02:00Z" },
  { id: "al-3", projectId, actorName: "System", action: "Floor plan analysed", createdAt: "2026-07-12T08:20:00Z" },
  { id: "al-4", projectId, actorName: "You", action: "Created the project", createdAt: "2026-06-02T10:00:00Z" },
];
