/**
 * Curated idea library — ~10 reference interiors per room category.
 *
 * These are CURATED REFERENCES, not AI output and not photos of Duli's own
 * completed projects. Anything rendered from this library must be labelled as a
 * curated reference so a customer is never led to believe it was generated for
 * their room. Real Duli project photography replaces these as it lands.
 *
 * Images: licensed stock (Unsplash — allowlisted in next.config.mjs). Every id
 * below was verified to return a real image before being added.
 */

export type Space =
  | "living_room"
  | "bedroom"
  | "kitchen"
  | "bathroom"
  | "dining"
  | "home_office"
  | "wardrobe";

export type Style =
  | "contemporary_indian"
  | "modern"
  | "minimal"
  | "scandinavian"
  | "classic"
  | "luxe"
  | "industrial"
  | "mid_century";

export type Budget = "essential" | "premium" | "luxury";

export type IdeaTemplate = {
  slug: string;
  title: string;
  space: Space;
  style: Style;
  city: string;
  budget: Budget;
  /** short description — also used for keyword matching */
  about: string;
  photoId: string;
};

export const SPACES: { key: Space; label: string }[] = [
  { key: "living_room", label: "Living Room" },
  { key: "bedroom", label: "Bedroom" },
  { key: "kitchen", label: "Kitchen" },
  { key: "bathroom", label: "Bathroom" },
  { key: "dining", label: "Dining" },
  { key: "home_office", label: "Home Office" },
  { key: "wardrobe", label: "Wardrobe" },
];

export const STYLES: { key: Style; label: string }[] = [
  { key: "contemporary_indian", label: "Contemporary Indian" },
  { key: "modern", label: "Modern" },
  { key: "minimal", label: "Minimal" },
  { key: "scandinavian", label: "Scandinavian" },
  { key: "classic", label: "Classic" },
  { key: "luxe", label: "Luxe" },
  { key: "industrial", label: "Industrial" },
  { key: "mid_century", label: "Mid-Century" },
];

export const spaceLabel = (k: Space) => SPACES.find((s) => s.key === k)?.label ?? k;
export const styleLabel = (k: Style) => STYLES.find((s) => s.key === k)?.label ?? k;

export const thumbUrl = (photoId: string, w = 600) =>
  `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=${w}&q=60`;

const t = (
  slug: string,
  title: string,
  space: Space,
  style: Style,
  city: string,
  budget: Budget,
  about: string,
  photoId: string,
): IdeaTemplate => ({ slug, title, space, style, city, budget, about, photoId });

export const IDEA_TEMPLATES: IdeaTemplate[] = [
  // ── Living rooms (10) ───────────────────────────────────────
  t("lr-modern-mumbai", "Modern Living", "living_room", "modern", "Mumbai", "premium", "Clean lines, low sectional, graphic palette with a warm wood note.", "photo-1567767292278-a4f21aa2d36e"),
  t("lr-minimal-pune", "Minimal Living", "living_room", "minimal", "Pune", "essential", "Uncluttered greys, concealed storage, one sculptural chair.", "photo-1560448204-e02f11c3d0e2"),
  t("lr-scandi-bengaluru", "Scandi Oak Living", "living_room", "scandinavian", "Bengaluru", "essential", "Light oak, white walls, plenty of daylight, rattan accents.", "photo-1618221195710-dd6b41faaea6"),
  t("lr-warm-hyderabad", "Warm Contemporary Living", "living_room", "contemporary_indian", "Hyderabad", "premium", "Fluted teak media wall, brass inlays, linen seating.", "photo-1615529182904-14819c35db37"),
  t("lr-luxe-gurugram", "Luxe Stone Living", "living_room", "luxe", "Gurugram", "luxury", "Bookmatched marble feature wall, velvet seating, cove lighting.", "photo-1616627561839-074385245ff6"),
  t("lr-industrial-hyderabad", "Industrial Loft Living", "living_room", "industrial", "Hyderabad", "premium", "Micro-concrete, black metal shelving, tan leather.", "photo-1598928506311-c55ded91a20c"),
  t("lr-classic-delhi", "Classic Panelled Living", "living_room", "classic", "Delhi", "luxury", "Wall panelling, symmetry, restrained chandelier, formal seating.", "photo-1550226891-ef816aed4a98"),
  t("lr-midcentury-jaipur", "Mid-Century Living", "living_room", "mid_century", "Jaipur", "premium", "Walnut, mustard two-seater, tapered legs, globe lighting.", "photo-1493809842364-78817add7ffb"),
  t("lr-compact-kolkata", "Compact City Living", "living_room", "modern", "Kolkata", "essential", "Small-footprint layout, wall storage, light palette.", "photo-1502672260266-1c1ef2d93688"),
  t("lr-open-chennai", "Open Plan Living", "living_room", "contemporary_indian", "Chennai", "premium", "Living opening to dining, warm woods, jaali screen divider.", "photo-1524230572899-a752b3835840"),

  // ── Bedrooms (10) ───────────────────────────────────────────
  t("bd-minimal-chennai", "Calm Minimal Bedroom", "bedroom", "minimal", "Chennai", "essential", "All-white calm, flush concealed wardrobe, wood bench.", "photo-1505693416388-ac5ce068fe85"),
  t("bd-scandi-delhi", "Scandi Guest Bedroom", "bedroom", "scandinavian", "Delhi", "essential", "Ivory and birch, uncluttered, restful and low maintenance.", "photo-1522708323590-d24dbb6b0267"),
  t("bd-fluted-bengaluru", "Fluted Oak Master", "bedroom", "modern", "Bengaluru", "premium", "Full-height fluted oak headboard wall, cove lighting, blackout drapes.", "photo-1616594039964-ae9021a400a0"),
  t("bd-luxe-mumbai", "Luxe Velvet Master", "bedroom", "luxe", "Mumbai", "luxury", "Channel-tufted velvet bed, brass reading lights, marble side tables.", "photo-1600566753190-17f0baa2a6c3"),
  t("bd-indian-hyderabad", "Contemporary Indian Master", "bedroom", "contemporary_indian", "Hyderabad", "premium", "Teak headboard, carved jaali screen, handwoven textiles.", "photo-1616137466211-f939a420be84"),
  t("bd-kids-pune", "Playful Kids' Room", "bedroom", "modern", "Pune", "essential", "Sturdy bunk, chalk wall, durable finishes, rounded edges.", "photo-1631679706909-1844bbd07221"),
  t("bd-midcentury-kolkata", "Mid-Century Teak Bedroom", "bedroom", "mid_century", "Kolkata", "premium", "Teak furniture, mustard accents, globe bedside lamps.", "photo-1600607688969-a5bfcd646154"),
  t("bd-classic-lucknow", "Classic Panelled Bedroom", "bedroom", "classic", "Lucknow", "luxury", "Panelled headboard wall, soft gold trims, symmetrical styling.", "photo-1600566752355-35792bedcfea"),
  t("bd-industrial-mumbai", "Industrial Bedroom", "bedroom", "industrial", "Mumbai", "premium", "Concrete-look wall, black metal frame bed, warm layers.", "photo-1571508601891-ca5e7a713859"),
  t("bd-compact-surat", "Compact Bedroom", "bedroom", "minimal", "Surat", "essential", "Small room, full-height storage, light palette, no clutter.", "photo-1604709177225-055f99402ea3"),

  // ── Kitchens (10) ───────────────────────────────────────────
  t("kt-modern-hyderabad", "Handleless Modern Kitchen", "kitchen", "modern", "Hyderabad", "premium", "Handleless graphite modular, quartz tops, tall unit bank.", "photo-1556909212-d5b604d0c90d"),
  t("kt-indian-ahmedabad", "Contemporary Indian Kitchen", "kitchen", "contemporary_indian", "Ahmedabad", "premium", "Wood-finish shutters, deep drawers, granite worktop for daily Indian cooking.", "photo-1600489000022-c2086d79f9d4"),
  t("kt-minimal-pune", "Minimal White Kitchen", "kitchen", "minimal", "Pune", "essential", "Matte white, seamless handleless shutters, one wood shelf.", "photo-1588854337221-4cf9fa96059c"),
  t("kt-luxe-gurugram", "Luxe Island Kitchen", "kitchen", "luxe", "Gurugram", "luxury", "Marble-topped island, breakfast seating, integrated appliances.", "photo-1584622781564-1d987f7333c1"),
  t("kt-industrial-mumbai", "Industrial Black Kitchen", "kitchen", "industrial", "Mumbai", "premium", "Matte black, concrete-look tops, open metal shelving.", "photo-1556909190-eccf4a8bf97a"),
  t("kt-scandi-chennai", "Scandi Two-Tone Kitchen", "kitchen", "scandinavian", "Chennai", "essential", "Sage and light oak, open shelving, warm and practical.", "photo-1565538810643-b5bdb714032a"),
  t("kt-classic-delhi", "Classic Shaker Kitchen", "kitchen", "classic", "Delhi", "premium", "Shaker shutters in muted green, brass hardware, timeless layout.", "photo-1565183997392-2f6f122e5912"),
  t("kt-compact-kolkata", "Compact Cheerful Kitchen", "kitchen", "modern", "Kolkata", "essential", "Small footprint, corner carousels, tall unit, warm accent.", "photo-1601760562234-9814eea6663a"),
  t("kt-galley-bengaluru", "Galley Kitchen", "kitchen", "modern", "Bengaluru", "premium", "Parallel galley layout, good ventilation, easy to clean.", "photo-1484154218962-a197022b5858"),
  t("kt-open-jaipur", "Open Kitchen & Bar", "kitchen", "contemporary_indian", "Jaipur", "luxury", "Open kitchen with breakfast bar, warm veneer, brass pendants.", "photo-1616627547584-bf28cee262db"),

  // ── Bathrooms (9) ───────────────────────────────────────────
  t("ba-luxe-gurugram", "Luxe Marble Bathroom", "bathroom", "luxe", "Gurugram", "luxury", "Marble surfaces, freestanding tub, gold trims, layered lighting.", "photo-1552321554-5fefe8c9ef14"),
  t("ba-modern-mumbai", "Modern Bathroom", "bathroom", "modern", "Mumbai", "premium", "Large-format tile, frameless glass, floating vanity.", "photo-1620626011761-996317b8d101"),
  t("ba-minimal-chennai", "Minimal Spa Bathroom", "bathroom", "minimal", "Chennai", "essential", "White tile, seamless, anti-skid floor, calm and easy to maintain.", "photo-1584622650111-993a426fbf0a"),
  t("ba-terrazzo-chennai", "Terrazzo Spa Bathroom", "bathroom", "contemporary_indian", "Chennai", "premium", "Soft terrazzo, brass fittings, niche shelf, warm light.", "photo-1595526114035-0d45ed16cfbf"),
  t("ba-industrial-pune", "Industrial Concrete Bathroom", "bathroom", "industrial", "Pune", "premium", "Micro-concrete, matte black fittings, wood shelf.", "photo-1598300042247-d088f8ab3a91"),
  t("ba-classic-delhi", "Classic Subway Bathroom", "bathroom", "classic", "Delhi", "premium", "Subway tile, brass fittings, framed mirror, timeless.", "photo-1507089947368-19c1da9775ae"),
  t("ba-scandi-bengaluru", "Scandi Wood Bathroom", "bathroom", "scandinavian", "Bengaluru", "essential", "White tile warmed by wood accents and daylight.", "photo-1594026112284-02bb6f3352fe"),
  t("ba-compact-kolkata", "Compact Smart Bathroom", "bathroom", "modern", "Kolkata", "essential", "Every inch used — corner vanity, recessed niches, glass partition.", "photo-1533090161767-e6ffed986c88"),
  t("ba-fluted-hyderabad", "Fluted Vanity Bathroom", "bathroom", "contemporary_indian", "Hyderabad", "premium", "Fluted-front vanity, stone counter, backlit mirror.", "photo-1567016432779-094069958ea5"),

  // ── Dining (9) ──────────────────────────────────────────────
  t("dn-modern-kolkata", "Modern Dining", "dining", "modern", "Kolkata", "premium", "Clean modern dining, statement pendant, seats six.", "photo-1617806118233-18e1de247200"),
  t("dn-classic-lucknow", "Classic Formal Dining", "dining", "classic", "Lucknow", "luxury", "Carved table, chandelier, crockery unit, made for hosting.", "photo-1600585154340-be6161a56a0c"),
  t("dn-indian-hyderabad", "Contemporary Indian Dining", "dining", "contemporary_indian", "Hyderabad", "premium", "Teak table, brass-accent sideboard, handloom seat pads.", "photo-1583847268964-b28dc8f51f92"),
  t("dn-minimal-pune", "Minimal Oak Dining", "dining", "minimal", "Pune", "essential", "Light oak table, simple chairs, one pendant, open plan friendly.", "photo-1560185007-cde436f6a4d0"),
  t("dn-luxe-gurugram", "Marble Dining", "dining", "luxe", "Gurugram", "luxury", "Marble-top table, upholstered chairs, statement pendant, seats eight.", "photo-1600585152220-90363fe7e115"),
  t("dn-industrial-mumbai", "Industrial Dining", "dining", "industrial", "Mumbai", "premium", "Metal-and-wood table, cage pendants, robust.", "photo-1618219908412-a29a1bb7b86e"),
  t("dn-scandi-bengaluru", "Scandi Round Dining", "dining", "scandinavian", "Bengaluru", "essential", "Round light-wood table, spindle chairs, airy.", "photo-1615873968403-89e068629265"),
  t("dn-midcentury-jaipur", "Mid-Century Dining", "dining", "mid_century", "Jaipur", "premium", "Walnut table, tapered-leg chairs, globe pendant.", "photo-1616486029423-aaa4789e8c9a"),
  t("dn-booth-surat", "Compact Booth Dining", "dining", "modern", "Surat", "essential", "Built-in booth seating turns a corner into four seats.", "photo-1617103996702-96ff29b1c467"),

  // ── Home offices (9) ────────────────────────────────────────
  t("ho-midcentury-jaipur", "Warm Study", "home_office", "mid_century", "Jaipur", "premium", "Walnut desk, brass task light, full book wall.", "photo-1524758631624-e2822e304c36"),
  t("ho-minimal-bengaluru", "Minimal Home Office", "home_office", "minimal", "Bengaluru", "essential", "Floating desk, concealed cabling, distraction-free.", "photo-1593476550610-87baa860004a"),
  t("ho-scandi-pune", "Scandi Home Office", "home_office", "scandinavian", "Pune", "essential", "Light-wood desk, pegboard organiser, plants.", "photo-1556228720-195a672e8a03"),
  t("ho-luxe-gurugram", "Luxe Executive Office", "home_office", "luxe", "Gurugram", "luxury", "Veneer wall panelling, leather chair, cove lighting, good on camera.", "photo-1556909114-f6e7ad7d3136"),
  t("ho-industrial-mumbai", "Industrial Home Office", "home_office", "industrial", "Mumbai", "premium", "Metal-frame desk, open shelving, concrete-look wall.", "photo-1522771739844-6a9f6d5f14af"),
  t("ho-indian-hyderabad", "Contemporary Indian Study", "home_office", "contemporary_indian", "Hyderabad", "premium", "Teak desk against a carved jaali screen.", "photo-1540518614846-7eded433c457"),
  t("ho-nook-kolkata", "Compact Office Nook", "home_office", "modern", "Kolkata", "essential", "Fold-down desk, wall storage, pinboard — fits a corner.", "photo-1519710164239-da123dc03ef4"),
  t("ho-classic-lucknow", "Classic Library Office", "home_office", "classic", "Lucknow", "luxury", "Panelled walls, glass-front book cabinets, reading chair.", "photo-1497366754035-f200968a6e72"),
  t("ho-modern-chennai", "Modern Workspace", "home_office", "modern", "Chennai", "premium", "Clean desk, ergonomic seating, layered task lighting.", "photo-1497366811353-6870744d04b2"),

  // ── Wardrobes (9) ───────────────────────────────────────────
  t("wr-luxe-gurugram", "Walk-in Veneer Wardrobe", "wardrobe", "luxe", "Gurugram", "luxury", "Open walk-in, glass-front modules, LED profiles, island.", "photo-1558997519-83ea9252edf8"),
  t("wr-sliding-mumbai", "Sliding Two-Tone Wardrobe", "wardrobe", "modern", "Mumbai", "premium", "Space-saving sliders, lacquered glass front.", "photo-1595428774223-ef52624120d2"),
  t("wr-minimal-pune", "Minimal Flush Wardrobe", "wardrobe", "minimal", "Pune", "essential", "Wall-to-wall handleless flush shutters that disappear.", "photo-1531973576160-7125cd663d86"),
  t("wr-indian-hyderabad", "Jaali-Front Wardrobe", "wardrobe", "contemporary_indian", "Hyderabad", "premium", "Carved jaali shutters with warm backlight.", "photo-1616046229478-9901c5536a45"),
  t("wr-scandi-bengaluru", "Scandi Open Wardrobe", "wardrobe", "scandinavian", "Bengaluru", "essential", "Open light-oak modules, fabric bins, bench.", "photo-1618220179428-22790b461013"),
  t("wr-classic-lucknow", "Classic Panelled Wardrobe", "wardrobe", "classic", "Lucknow", "premium", "Panelled shutters, brass knobs, soft gold trim.", "photo-1583845112203-29329902332e"),
  t("wr-industrial-chennai", "Industrial Metal Wardrobe", "wardrobe", "industrial", "Chennai", "essential", "Black metal frame, warm wood shelves, reconfigurable.", "photo-1586105251261-72a756497a11"),
  t("wr-dresser-delhi", "Dresser Wardrobe", "wardrobe", "luxe", "Delhi", "luxury", "Integrated dresser, fluted glass fronts, profile lighting.", "photo-1554995207-c18c203602cb"),
  t("wr-corner-surat", "Compact Corner Wardrobe", "wardrobe", "modern", "Surat", "essential", "L-shaped corner unit turns an awkward corner into storage.", "photo-1611892440504-42a792e24d32"),
];

/** Group by room category. */
export function interiorsByCategory() {
  return SPACES.map((c) => ({
    ...c,
    items: IDEA_TEMPLATES.filter((i) => i.space === c.key),
  }));
}

/** Look up a single template by slug (for the design detail page). */
export const templateBySlug = (slug: string): IdeaTemplate | undefined =>
  IDEA_TEMPLATES.find((t) => t.slug === slug);

/** A few related designs — same room first, then same style. */
export const relatedTemplates = (t: IdeaTemplate, n = 4): IdeaTemplate[] =>
  IDEA_TEMPLATES.filter(
    (o) => o.slug !== t.slug && (o.space === t.space || o.style === t.style),
  ).slice(0, n);
