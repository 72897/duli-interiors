"use server";

import { serverEnv } from "@/lib/env";
import {
  IDEA_TEMPLATES,
  SPACES,
  STYLES,
  thumbUrl,
  spaceLabel,
  styleLabel,
  type IdeaTemplate,
} from "@/lib/ideas/templates";

export type MatchedIdea = {
  slug: string;
  title: string;
  space: string;
  style: string;
  city: string;
  budget: string;
  about: string;
  imageUrl: string;
};

export type MatchResult = {
  understood?: string;
  matches: MatchedIdea[];
  error?: string;
};

const ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models";
const TEXT_MODEL = process.env.GEMINI_TEXT_MODEL || "gemini-2.5-flash";

const PARSE_PROMPT = `
You read an interior design request from an Indian homeowner and extract a
structured brief. Respond with JSON only, no prose:

{
  "space": "one of: living_room, bedroom, kitchen, bathroom, dining, home_office, wardrobe, or null",
  "style": "one of: contemporary_indian, modern, minimal, scandinavian, classic, luxe, industrial, mid_century, or null",
  "budget": "one of: essential, premium, luxury, or null",
  "keywords": ["salient materials, colours or features they mentioned"],
  "summary": "one short sentence restating what they want"
}

Use null when the user didn't indicate it — do not guess.
`.trim();

type Brief = {
  space: string | null;
  style: string | null;
  budget: string | null;
  keywords: string[];
  summary: string;
};

const VALID_SPACES = SPACES.map((s) => s.key) as string[];
const VALID_STYLES = STYLES.map((s) => s.key) as string[];
const VALID_BUDGETS = ["essential", "premium", "luxury"];

/** An LLM can return anything — only accept real enum members. */
const enumOr = (value: unknown, allowed: string[]): string | null => {
  if (typeof value !== "string") return null;
  const v = value.trim().toLowerCase().replace(/[\s-]+/g, "_");
  return allowed.includes(v) ? v : null;
};

/**
 * Infer the room from the words themselves. Used to guard BOTH paths: the
 * model's answer is cross-checked against this, and the no-AI fallback relies
 * on it — so a kitchen request can never return a bedroom.
 */
const SPACE_WORDS: [string, RegExp][] = [
  ["kitchen", /\bkitchen|modular|galley|cook/i],
  ["bathroom", /\bbath|washroom|shower|toilet|vanity|spa\b/i],
  ["bedroom", /\bbed\s?room|bedroom|master|guest room|kids'? room|nursery/i],
  ["wardrobe", /\bwardrobe|closet|almirah|walk-?in/i],
  ["dining", /\bdining|dinner|breakfast table/i],
  ["home_office", /\b(home\s?office|study|workspace|desk|wfh)/i],
  ["living_room", /\bliving|lounge|drawing room|tv unit|sofa/i],
];

export const inferSpace = (text: string): string | null => {
  for (const [space, re] of SPACE_WORDS) if (re.test(text)) return space;
  return null;
};

async function parseBrief(prompt: string): Promise<Brief | null> {
  const key = serverEnv.GEMINI_API_KEY;
  if (!key) return null;

  const res = await fetch(`${ENDPOINT}/${TEXT_MODEL}:generateContent?key=${key}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: `${PARSE_PROMPT}\n\nRequest: ${prompt}` }] }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.1,
        maxOutputTokens: 2048,
      },
    }),
  });

  if (!res.ok) return null;
  const json = await res.json().catch(() => null);
  const text = json?.candidates?.[0]?.content?.parts
    ?.map((p: { text?: string }) => p.text ?? "")
    .join("");
  if (!text) return null;

  try {
    const b = JSON.parse(text.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim());
    return {
      // Never trust raw model output — coerce to real enum members or null.
      space: enumOr(b.space, VALID_SPACES),
      style: enumOr(b.style, VALID_STYLES),
      budget: enumOr(b.budget, VALID_BUDGETS),
      keywords: Array.isArray(b.keywords) ? b.keywords.map(String) : [],
      summary: typeof b.summary === "string" ? b.summary : "",
    };
  } catch {
    return null;
  }
}

/** Ranks the curated library against a parsed brief. */
function rank(brief: Brief, limit: number): IdeaTemplate[] {
  const kw = brief.keywords.map((k) => k.toLowerCase());

  const scored = IDEA_TEMPLATES.map((item) => {
    let score = 0;
    if (brief.space && item.space === brief.space) score += 10;
    if (brief.style && item.style === brief.style) score += 6;
    if (brief.budget && item.budget === brief.budget) score += 3;

    const hay = `${item.title} ${item.about} ${item.city}`.toLowerCase();
    for (const k of kw) if (k.length > 2 && hay.includes(k)) score += 2;

    return { item, score };
  });

  // If they named a space, never show a different room — a bedroom is not an
  // answer to a kitchen question.
  const pool = brief.space
    ? scored.filter((s) => s.item.space === brief.space)
    : scored;

  return pool
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.item);
}

const toMatch = (i: IdeaTemplate): MatchedIdea => ({
  slug: i.slug,
  title: i.title,
  space: spaceLabel(i.space),
  style: styleLabel(i.style),
  city: i.city,
  budget: i.budget,
  about: i.about,
  imageUrl: thumbUrl(i.photoId, 700),
});

/**
 * Understands a free-text requirement and returns matching interiors from the
 * CURATED library. These are references, not generated images — the UI must
 * label them as such.
 */
export async function matchIdeas(
  prompt: string,
  limit = 3,
): Promise<MatchResult> {
  const clean = prompt.trim();
  if (clean.length < 3) return { matches: [], error: "Tell me a bit more about the space." };

  // Read the room from the words first. This is the guard: it applies whether
  // or not Gemini answers, so the wrong room can never come back.
  const inferred = inferSpace(clean);
  const parsed = await parseBrief(clean);

  const brief: Brief = parsed
    ? { ...parsed, space: parsed.space ?? inferred }
    : {
        space: inferred,
        style: null,
        budget: null,
        keywords: clean.toLowerCase().split(/\W+/).filter((w) => w.length > 3),
        summary: "",
      };

  return {
    understood: brief.summary || undefined,
    matches: rank(brief, limit).map(toMatch),
  };
}
