// All percentages, relative to the photo stage. `left` is the horizontal
// center point of the image (it's always centered on itself via
// translateX(-50%), so 50 = dead center of the stage). `rotateX/Y/Z`
// (degrees, default 0) tilt/turn/roll a flat cutout in 3D to match a wall
// or floor receding in perspective — e.g. a wardrobe against a side wall,
// not just floor pieces shot straight-on.
export type ItemOverlay = { bottom: number; width: number; left: number; rotateX?: number; rotateY?: number; rotateZ?: number; scale?: number; brightness?: number; contrast?: number; shadow?: number };

export type EstimatorItem = {
  id: string;
  name: string;
  desc: string;
  image?: string;
  range: [number, number]; // INR, in lakhs
  default?: true;
  // Lets this exact item be composited live onto the space's empty baseImage
  // (see space-estimator.tsx) instead of just shown as a list thumbnail — only
  // set where we actually have a cut-out asset positioned for overlay.
  overlay?: ItemOverlay;
  // Separate calibration for the mobile stage (its photo crop is a different
  // shape than desktop's, so the same % position doesn't land in the same
  // spot — see space-estimator.tsx's resolveOverlay). Falls back to `overlay`
  // when not set.
  overlayMobile?: ItemOverlay;
};

export type EstimatorCategory = {
  key: string;
  label: string;
  boqGroup: string;
  items: EstimatorItem[];
};

export type EstimatorSpace = {
  id: string;
  name: string;
  image: string;
  // Empty/unstaged room shot used as the live-composite backdrop on the
  // Estimate step when the selected item has overlay positioning.
  baseImage?: string;
  // Optional separate base photo for the mobile stage, when its different
  // crop/shape needs its own shot instead of reusing the desktop one. Falls
  // back to baseImage when not set.
  baseImageMobile?: string;
  categories: EstimatorCategory[];
};

// All bed cutouts are tightly cropped to their visible content (no leftover
// transparent padding), so one shared size/position reads consistently
// across every option instead of each photo's original canvas dictating it.
const BED_OVERLAY: ItemOverlay = { bottom: 11, width: 25, left: 50 };

export const ESTIMATOR_SPACES: EstimatorSpace[] = [
  {
    id: "bedroom",
    name: "Bedroom",
    image: "/assets/home%20page/Bedroom.webp",
    baseImage: "/view/bedroom/base.webp",
    categories: [
      {
        key: "bed",
        label: "Bed",
        boqGroup: "Furniture & Decor",
        items: [
          {
            id: "bed-tufted-cream",
            name: "Tufted Cream",
            desc: "Soft upholstered headboard, neutral tone",
            image: "/view/bedroom/bed-1.webp",
            range: [0.65, 0.95],
            overlay: { bottom: 12.4, width: 32.6, left: 51.7 }
          },
          {
            id: "bed-arched-tufted",
            name: "Arched Tufted",
            desc: "Statement arch headboard, deeper tufting",
            image: "/view/bedroom/bed-2.webp",
            range: [0.8, 1.15],
            overlay: { bottom: 11.7, width: 37.3, left: 50.9 }
          },
          {
            id: "bed-curved-velvet",
            name: "Curved Olive Velvet",
            desc: "Channel-tufted velvet, curved silhouette",
            image: "/view/bedroom/bed3.webp",
            range: [0.85, 1.25],
            overlay: { bottom: 11.5, width: 32.8, left: 50.9 }
          },
          {
            id: "bed-channel-tufted",
            name: "Channel Tufted Cream",
            desc: "Fluted headboard with walnut trim",
            image: "/view/bedroom/bed4.webp",
            range: [0.9, 1.35],
            overlay: { bottom: 12.7, width: 32, left: 50.7 }
          },
          {
            id: "bed-platform-lit",
            name: "Wood Platform with Lighting",
            desc: "Warm wood frame, ambient under-bed glow",
            image: "/view/bedroom/bed5.webp",
            range: [1.1, 1.6],
            overlay: { bottom: 16.3, width: 37, left: 50.1 }
          },
          {
            id: "bed-two-tone",
            name: "Two-Tone Wood & Leather",
            desc: "Walnut frame, leatherette headboard panels",
            image: "/view/bedroom/bed6.webp",
            range: [0.95, 1.4],
            overlay: { bottom: 14.5, width: 37.3, left: 51.5 }
          }
        ]
      },
      {
        key: "side-table",
        label: "Side Table",
        boqGroup: "Furniture & Decor",
        items: [
          {
            id: "side-table-wood",
            name: "Wooden Side Table",
            desc: "Warm grain, compact footprint",
            image: "/view/bedroom/s1.webp",
            range: [0.08, 0.14],
            overlay: { bottom: 25.4, width: 10.8, left: 30.1, rotateY: -8.8 }
          },
          {
            id: "side-table-marble",
            name: "Marble-Top Side Table",
            desc: "Polished stone top, brass legs",
            image: "/view/bedroom/s2.webp",
            range: [0.14, 0.22],
            overlay: { bottom: 25.2, width: 11.3, left: 30.9, rotateY: -4 }
          },
          {
            id: "side-table-3",
            name: "Side Table 3",
            desc: "Additional design option",
            image: "/view/bedroom/s3.webp",
            range: [0.1, 0.18],
            overlay: { bottom: 26.8, width: 11.8, left: 31 }
          },
          {
            id: "side-table-4",
            name: "Side Table 4",
            desc: "Additional design option",
            image: "/view/bedroom/s4.webp",
            range: [0.1, 0.18],
            overlay: { bottom: 23.5, width: 10, left: 30.6 }
          },
          {
            id: "side-table-5",
            name: "Side Table 5",
            desc: "Additional design option",
            image: "/view/bedroom/s5.webp",
            range: [0.1, 0.18],
            overlay: { bottom: 21.8, width: 11.6, left: 30.5 }
          }
        ]
      },
      {
        key: "wardrobe",
        label: "Wardrobe",
        boqGroup: "Modular Storage",
        items: [
          {
            id: "wardrobe-5door-walnut",
            name: "5-Door Walnut Wardrobe",
            desc: "Mixed open shelving, hanging rail & drawers",
            image: "/view/bedroom/w1.webp",
            range: [1.3, 1.9],
            overlay: { bottom: 18.1, width: 34, left: 14.2, rotateX: 1.3, rotateY: 44.2 },
            overlayMobile: { bottom: 14.9, width: 31.8, left: 13.7, rotateX: 1.3, rotateY: 49.5, rotateZ: -0.5 }
          },
          {
            id: "wardrobe-3door",
            name: "3-Door Wardrobe",
            desc: "Built-in storage, soft-close fittings",
            image: "/view/bedroom/w2.webp",
            range: [1.1, 1.6],
            overlay: { bottom: 17.5, width: 59.4, left: 13.5, rotateY: 52.3, rotateZ: 0.8 },
            overlayMobile: { bottom: 17.7, width: 55.6, left: 15.4, rotateY: 63.8, rotateZ: 0.8 }
          },
          {
            id: "wardrobe-walkin",
            name: "Walk-in Wardrobe",
            desc: "Open layout with dedicated dressing space",
            image: "/view/bedroom/w3.webp",
            range: [1.6, 2.7],
            overlay: { bottom: 19.7, width: 60.6, left: 15.5, rotateY: 55.9, rotateZ: 0.8 },
            overlayMobile: { bottom: 16.6, width: 56.7, left: 14.1, rotateY: 62 }
          },
          {
            id: "wardrobe-4",
            name: "Wardrobe Design 4",
            desc: "Additional design option",
            image: "/view/bedroom/w4.webp",
            range: [1.2, 1.8],
            overlay: { bottom: 17.3, width: 64.6, left: 15.2, rotateY: 54.9 },
            overlayMobile: { bottom: 14.5, width: 60.4, left: 13.9, rotateY: 62.6 }
          },
          {
            id: "wardrobe-5",
            name: "Wardrobe Design 5",
            desc: "Additional design option",
            image: "/view/bedroom/w5.webp",
            range: [1.2, 1.8],
            overlay: { bottom: 16.3, width: 55.6, left: 13.6, rotateY: 49, rotateZ: 0.2 },
            overlayMobile: { bottom: 16.1, width: 52, left: 14.2, rotateY: 62.6 }
          }
        ]
      }
    ]
  },
  {
    id: "living-room",
    name: "Living Room",
    image: "/assets/home%20page/Living%20Room.webp",
    baseImage: "/view/living%20room/base%20living%20room.webp",
    baseImageMobile: "/view/living%20room/mobile%20bse%20image.webp",
    categories: [
      {
        key: "sofa",
        label: "Sofa",
        boqGroup: "Furniture & Decor",
        items: [
          {
            id: "sofa-curved",
            name: "Curved Sofa",
            desc: "Sculptural form with plush comfort",
            image: "/view/living%20room/so1.webp",
            range: [1.1, 1.6],
            overlay: { bottom: -1.2, width: 40.4, left: 49.2, rotateX: 17.6, rotateY: 0.5, rotateZ: -1.4 },
            overlayMobile: { bottom: -6, width: 45, left: 69, rotateX: 17.6, rotateY: 0.5, rotateZ: -1.4 }
          },
          {
            id: "sofa-minimal",
            name: "Minimal Sofa",
            desc: "Low-profile contemporary design",
            image: "/view/living%20room/so2.webp",
            range: [0.85, 1.3],
            default: true,
            overlay: { bottom: -1.3, width: 45, left: 50.9 },
            overlayMobile: { bottom: -6.5, width: 47.1, left: 70.1, rotateX: 17.6, rotateY: 0.5, rotateZ: 1.8 }
          },
          {
            id: "sofa-luxe-sectional",
            name: "Luxe Sectional",
            desc: "Spacious seating, refined luxury",
            image: "/view/living%20room/so3.webp",
            range: [1.6, 2.4],
            overlay: { bottom: -3.1, width: 45, left: 51, rotateX: -0.8 },
            overlayMobile: { bottom: -5.7, width: 49.2, left: 70.6, rotateX: -0.8 }
          },
          {
            id: "sofa-soft-edge",
            name: "Soft Edge Sofa",
            desc: "Cozy curves, inviting comfort",
            image: "/view/living%20room/so4.webp",
            range: [0.95, 1.45],
            overlay: { bottom: -6.9, width: 45, left: 50.5 },
            overlayMobile: { bottom: -10, width: 52.1, left: 69.4 }
          }
        ]
      },
      {
        key: "wall",
        label: "Wall",
        boqGroup: "Wall Finish & Painting",
        items: [
          { id: "lr-wall-textured-paint", name: "Textured Paint", desc: "Subtle texture, low-sheen finish", range: [0.3, 0.5] },
          { id: "lr-wall-wood-panel", name: "Wood Paneling", desc: "Fluted panel feature wall", range: [0.6, 1.2] }
        ]
      },
      {
        key: "coffee-table",
        label: "Coffee Table",
        boqGroup: "Furniture & Decor",
        items: [
          { id: "coffee-table-marble", name: "Marble Coffee Table", desc: "Polished stone, statement centerpiece", range: [0.35, 0.55] },
          { id: "coffee-table-wood", name: "Wooden Coffee Table", desc: "Warm grain, everyday durability", range: [0.2, 0.35] }
        ]
      },
      {
        key: "chair",
        label: "Chair",
        boqGroup: "Furniture & Decor",
        items: [
          { id: "chair-accent", name: "Accent Chair", desc: "Statement seating, compact footprint", range: [0.15, 0.3] },
          { id: "chair-lounge", name: "Lounge Chair", desc: "Relaxed profile, plush cushioning", range: [0.25, 0.45] }
        ]
      }
    ]
  },
  {
    id: "kitchen",
    name: "Kitchen",
    image: "/assets/home%20page/Kitchen.webp",
    categories: [
      {
        key: "kitchen-type",
        label: "Kitchen Type",
        boqGroup: "Modular Storage",
        items: [
          { id: "kitchen-type-l-shape", name: "L-Shape Kitchen", desc: "Compact corner layout, efficient workflow", range: [1.8, 2.6] },
          { id: "kitchen-type-u-shape", name: "U-Shape Kitchen", desc: "Maximized counter & storage on three walls", range: [2.6, 3.8] },
          { id: "kitchen-type-parallel", name: "Parallel Kitchen", desc: "Two facing counters, ideal for narrow spaces", range: [2.0, 2.9] }
        ]
      },
      {
        key: "dining-table",
        label: "Dining Table",
        boqGroup: "Furniture & Decor",
        items: [
          { id: "dining-table-4seater", name: "4-Seater Dining Table", desc: "Compact, ideal for everyday dining", range: [0.35, 0.55] },
          { id: "dining-table-6seater", name: "6-Seater Dining Table", desc: "Spacious, suited for entertaining", range: [0.55, 0.85] }
        ]
      }
    ]
  }
];

export const SWATCH_PRESETS: [string, string][] = [
  ["#F2EDE4", "#B08D57"],
  ["#E7DFD2", "#6B4A33"],
  ["#ECEADE", "#66705A"],
  ["#F4ECE0", "#8C4A3A"],
  ["#E3D6C2", "#4A2F1F"]
];

export function swatchFor(globalIndex: number): [string, string] {
  return SWATCH_PRESETS[globalIndex % SWATCH_PRESETS.length];
}

export function formatLakh(value: number): string {
  if (value < 1) return `₹${Math.round(value * 100)}K`;
  return `₹${value.toFixed(2)}L`;
}

export function formatRange([min, max]: [number, number]): string {
  return `${formatLakh(min)} – ${formatLakh(max)}`;
}

export function addRange(a: [number, number], b: [number, number]): [number, number] {
  return [a[0] + b[0], a[1] + b[1]];
}

export function scaleRange([min, max]: [number, number], qty: number): [number, number] {
  return [min * qty, max * qty];
}

export function defaultItemId(category: EstimatorCategory): string {
  return category.items.find((i) => i.default)?.id ?? category.items[0].id;
}
