export type StyleId =
  | "warm_indian_contemporary"
  | "modern_indian_luxe"
  | "calm_minimal"
  | "classic_indian_elegant"
  | "bold_eclectic_indian"
  | "earthy_japandi_indian";

export type QuizOption = {
  id: string;
  label: string;
  image: string;
  scores: Partial<Record<StyleId, number>>;
};

export type QuizQuestion = {
  id: string;
  number: number;
  title: string;
  optionA: QuizOption;
  optionB: QuizOption;
};

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "q1_living_room",
    number: 1,
    title: "Which living room feels more like your style?",
    optionA: {
      id: "q1_a",
      label: "Option A",
      image: "/style-quiz/q1-a.jpeg",
      scores: { warm_indian_contemporary: 2, calm_minimal: 1, earthy_japandi_indian: 1 }
    },
    optionB: {
      id: "q1_b",
      label: "Option B",
      image: "/style-quiz/q1-b.jpeg",
      scores: { modern_indian_luxe: 2, classic_indian_elegant: 1, bold_eclectic_indian: 1 }
    }
  },
  {
    id: "q2_bedroom",
    number: 2,
    title: "Which bedroom do you prefer?",
    optionA: {
      id: "q2_a",
      label: "Option A",
      image: "/style-quiz/q2-a.jpeg",
      scores: { calm_minimal: 2, earthy_japandi_indian: 1, warm_indian_contemporary: 1 }
    },
    optionB: {
      id: "q2_b",
      label: "Option B",
      image: "/style-quiz/q2-b.jpeg",
      scores: { modern_indian_luxe: 2, classic_indian_elegant: 1, warm_indian_contemporary: 1 }
    }
  },
  {
    id: "q3_kitchen",
    number: 3,
    title: "Which kitchen style do you prefer?",
    optionA: {
      id: "q3_a",
      label: "Option A",
      image: "/style-quiz/q3-a.jpeg",
      scores: { warm_indian_contemporary: 2, calm_minimal: 1, earthy_japandi_indian: 1 }
    },
    optionB: {
      id: "q3_b",
      label: "Option B",
      image: "/style-quiz/q3-b.jpeg",
      scores: { modern_indian_luxe: 2, bold_eclectic_indian: 1, classic_indian_elegant: 1 }
    }
  },
  {
    id: "q4_colour_palette",
    number: 4,
    title: "Which colour palette feels more like your home?",
    optionA: {
      id: "q4_a",
      label: "Option A",
      image: "/style-quiz/q4-a.jpeg",
      scores: { calm_minimal: 2, earthy_japandi_indian: 2, warm_indian_contemporary: 1 }
    },
    optionB: {
      id: "q4_b",
      label: "Option B",
      image: "/style-quiz/q4-b.jpeg",
      scores: { modern_indian_luxe: 2, bold_eclectic_indian: 1, classic_indian_elegant: 1 }
    }
  },
  {
    id: "q5_furniture",
    number: 5,
    title: "Which furniture style do you prefer?",
    optionA: {
      id: "q5_a",
      label: "Option A",
      image: "/style-quiz/q5-a.jpeg",
      scores: { calm_minimal: 2, warm_indian_contemporary: 1, earthy_japandi_indian: 1 }
    },
    optionB: {
      id: "q5_b",
      label: "Option B",
      image: "/style-quiz/q5-b.jpeg",
      scores: { classic_indian_elegant: 2, bold_eclectic_indian: 1, modern_indian_luxe: 1 }
    }
  },
  {
    id: "q6_wall_finish",
    number: 6,
    title: "Which wall finish do you prefer?",
    optionA: {
      id: "q6_a",
      label: "Option A",
      image: "/style-quiz/q6-a.jpeg",
      scores: { modern_indian_luxe: 1, calm_minimal: 1, earthy_japandi_indian: 1, warm_indian_contemporary: 1 }
    },
    optionB: {
      id: "q6_b",
      label: "Option B",
      image: "/style-quiz/q6-b.jpeg",
      scores: { classic_indian_elegant: 2, bold_eclectic_indian: 1, warm_indian_contemporary: 1 }
    }
  },
  {
    id: "q7_lighting",
    number: 7,
    title: "Which lighting mood do you prefer?",
    optionA: {
      id: "q7_a",
      label: "Option A",
      image: "/style-quiz/q7-a.jpeg",
      scores: { calm_minimal: 2, warm_indian_contemporary: 1, modern_indian_luxe: 1 }
    },
    optionB: {
      id: "q7_b",
      label: "Option B",
      image: "/style-quiz/q7-b.jpeg",
      scores: { modern_indian_luxe: 2, classic_indian_elegant: 1, warm_indian_contemporary: 1 }
    }
  }
];

export type StyleResult = {
  id: StyleId;
  name: string;
  explanation: string;
  snapshot: string[];
  palette: { name: string; hex: string }[];
  bestFor: string[];
  images: string[];
};

export const STYLE_RESULTS: Record<StyleId, StyleResult> = {
  warm_indian_contemporary: {
    id: "warm_indian_contemporary",
    name: "Warm Indian Contemporary",
    explanation:
      "You prefer a home that feels warm, practical, and modern, but still rooted in Indian living. This style uses warm wood, soft neutral walls, comfortable furniture, practical storage, and subtle Indian accents.",
    snapshot: ["Warm wood tones", "Neutral base palette", "Practical furniture", "Soft lighting", "Indian accents", "Clean but not cold"],
    palette: [
      { name: "Warm white", hex: "#F7F1E8" },
      { name: "Beige", hex: "#D8C7AC" },
      { name: "Walnut", hex: "#6B4A33" },
      { name: "Muted green", hex: "#7C8567" },
      { name: "Brass", hex: "#B08D57" }
    ],
    bestFor: ["Living Room", "Bedroom", "Kitchen", "Full Home"],
    images: ["/style-quiz/q1-a.jpeg", "/style-quiz/q3-a.jpeg", "/style-quiz/q2-a.jpeg", "/style-quiz/q4-a.jpeg"]
  },
  modern_indian_luxe: {
    id: "modern_indian_luxe",
    name: "Modern Indian Luxe",
    explanation:
      "You prefer a premium, hotel-like home with bold materials, refined lighting, and rich finishes. This style uses marble, dark wood, metal accents, statement furniture, and layered lighting.",
    snapshot: ["Marble & stone surfaces", "Darker rich finishes", "Statement lighting", "Luxury furniture", "Layered ambience", "Premium materials"],
    palette: [
      { name: "Charcoal", hex: "#2B2A28" },
      { name: "Walnut", hex: "#6B4A33" },
      { name: "Ivory", hex: "#FFEADC" },
      { name: "Brass", hex: "#B08D57" },
      { name: "Deep green", hex: "#3C4A36" }
    ],
    bestFor: ["Living Room", "Master Bedroom", "Kitchen", "Villa / Premium Apartment"],
    images: ["/style-quiz/q1-b.jpeg", "/style-quiz/q3-b.jpeg", "/style-quiz/q2-b.jpeg", "/style-quiz/q7-b.jpeg"]
  },
  calm_minimal: {
    id: "calm_minimal",
    name: "Calm Minimal",
    explanation:
      "You prefer a quiet, clutter-free home with soft colors, clean lines, and peaceful lighting. This style avoids visual heaviness and focuses on comfort, openness, and simplicity.",
    snapshot: ["Cream & soft neutrals", "Simple, clean furniture", "Soft white lighting", "Uncluttered surfaces", "Low visual noise", "Quiet, restful mood"],
    palette: [
      { name: "Cream", hex: "#F2EDE4" },
      { name: "White", hex: "#FFFFFF" },
      { name: "Light beige", hex: "#E2D8C7" },
      { name: "Pale wood", hex: "#C8AD8B" },
      { name: "Soft grey", hex: "#A9A6A0" }
    ],
    bestFor: ["Bedroom", "Living Room", "Compact Apartment", "Home Office"],
    images: ["/style-quiz/q2-a.jpeg", "/style-quiz/q4-a.jpeg", "/style-quiz/q5-a.jpeg", "/style-quiz/q7-a.jpeg"]
  },
  classic_indian_elegant: {
    id: "classic_indian_elegant",
    name: "Classic Indian Elegant",
    explanation:
      "You prefer interiors with Indian character, rich furniture, decorative detail, and a sense of heritage. This style uses carved wood, patterned rugs, warm lamps, brass accents, and elegant wall treatments.",
    snapshot: ["Carved & heritage wood", "Classic, deeper furniture", "Patterned detailing", "Decorative wall finishes", "Warm lamp lighting", "Traditional luxury influence"],
    palette: [
      { name: "Cream", hex: "#F2EDE4" },
      { name: "Deep wood", hex: "#4A2F1F" },
      { name: "Antique gold", hex: "#A9842A" },
      { name: "Maroon", hex: "#6B2A2A" },
      { name: "Olive", hex: "#66705A" }
    ],
    bestFor: ["Living Room", "Bedroom", "Villa", "Formal Seating Area"],
    images: ["/style-quiz/q5-b.jpeg", "/style-quiz/q6-b.jpeg", "/style-quiz/q2-b.jpeg", "/style-quiz/q3-b.jpeg"]
  },
  bold_eclectic_indian: {
    id: "bold_eclectic_indian",
    name: "Bold Eclectic Indian",
    explanation:
      "You prefer a home with personality. This style mixes color, art, texture, furniture, and Indian-inspired details to create a space that feels expressive and memorable.",
    snapshot: ["Strong color & art", "Mixed textures", "Statement furniture", "Decorative walls", "Expressive styling", "Bold personality"],
    palette: [
      { name: "Terracotta", hex: "#8C4A3A" },
      { name: "Navy", hex: "#2A3550" },
      { name: "Mustard", hex: "#C99A2E" },
      { name: "Green", hex: "#3C4A36" },
      { name: "Brass", hex: "#B08D57" }
    ],
    bestFor: ["Living Room", "Dining Area", "Creative Bedroom", "Accent Walls"],
    images: ["/style-quiz/q1-b.jpeg", "/style-quiz/q4-b.jpeg", "/style-quiz/q5-b.jpeg", "/style-quiz/q6-b.jpeg"]
  },
  earthy_japandi_indian: {
    id: "earthy_japandi_indian",
    name: "Earthy Japandi Indian",
    explanation:
      "You prefer calm, natural interiors with a quiet luxury feel. This style combines muted colors, natural wood, textured walls, simple furniture, and soft lighting.",
    snapshot: ["Muted, natural colors", "Natural wood tones", "Clean lines", "Textured walls", "Organic materials", "Calm, grounded mood"],
    palette: [
      { name: "Sand", hex: "#D9C7A8" },
      { name: "Clay", hex: "#B07A52" },
      { name: "Oak", hex: "#8C6A45" },
      { name: "Stone", hex: "#A9A290" },
      { name: "Sage", hex: "#8A9272" }
    ],
    bestFor: ["Bedroom", "Living Room", "Compact Homes", "Calm Family Homes"],
    images: ["/style-quiz/q2-a.jpeg", "/style-quiz/q4-a.jpeg", "/style-quiz/q1-a.jpeg", "/style-quiz/q3-a.jpeg"]
  }
};

export function scoreToResult(scores: Partial<Record<StyleId, number>>): {
  main: StyleResult;
  sub: StyleResult | null;
} {
  const entries = (Object.entries(scores) as [StyleId, number][]).sort((a, b) => b[1] - a[1]);

  if (entries.length === 0) {
    const fallback = STYLE_RESULTS.warm_indian_contemporary;
    return { main: fallback, sub: null };
  }

  const [mainId, mainScore] = entries[0];
  const main = STYLE_RESULTS[mainId];

  const second = entries[1];
  if (!second || second[1] <= 0) return { main, sub: null };

  const [subId, subScore] = second;
  const closeEnough = subScore >= mainScore * 0.6 || mainScore - subScore <= 2;
  if (!closeEnough) return { main, sub: null };

  return { main, sub: STYLE_RESULTS[subId] };
}

export function emptyScores(): Partial<Record<StyleId, number>> {
  return {};
}

export function addScores(
  totals: Partial<Record<StyleId, number>>,
  add: Partial<Record<StyleId, number>>
): Partial<Record<StyleId, number>> {
  const next = { ...totals };
  for (const [id, points] of Object.entries(add) as [StyleId, number][]) {
    next[id] = (next[id] ?? 0) + points;
  }
  return next;
}
