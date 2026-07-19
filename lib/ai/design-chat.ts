"use server";

import { generateInteriorImage, GEMINI_IMAGE_MODEL } from "@/lib/gemini/image";
import { isGeminiConfigured } from "@/lib/gemini/client";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { matchIdeas, type MatchedIdea } from "@/lib/ai/match";

export type DesignChatResult = {
  /** A genuinely generated image (requires Gemini billing). */
  imageUrl?: string;
  note?: string;
  model?: string;
  error?: string;
  /** true when generation failed for billing/quota reasons */
  needsBilling?: boolean;
  /** Curated library references — NOT generated. Must be labelled as such. */
  matches?: MatchedIdea[];
  understood?: string;
};

const SYSTEM = `
You are Duli Interiors' design visualiser. Generate a photorealistic interior
design image for an Indian home based on the user's request.

Rules:
- Realistic Indian residential proportions and materials.
- Natural, believable lighting. No text, watermarks or logos in the image.
- No distorted furniture or impossible geometry.
- If a reference photo is supplied, preserve its room geometry, camera angle,
  doors and windows — redesign the finishes and furniture, not the architecture.
`.trim();

/**
 * Turns a chat prompt into an interior concept image.
 *
 * Requires a signed-in user (generation costs money) and a Gemini key with
 * billing enabled — image models are not on the free tier.
 */
export async function generateDesign(
  prompt: string,
): Promise<DesignChatResult> {
  const clean = prompt.trim();
  if (clean.length < 3) return { error: "Tell me a bit more about the space." };
  if (clean.length > 1200) return { error: "That prompt is a little long — try trimming it." };

  if (!isGeminiConfigured()) return { error: "AI isn’t connected yet." };

  // Gate on auth: generation is metered and shouldn't be open to the internet.
  const supabase = createSupabaseServerClient();
  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { error: "Please sign in to generate designs." };
    }
  }

  // Always understand the brief and pull curated references — this works on the
  // free tier and is useful whether or not generation is available.
  const matched = await matchIdeas(clean, 3);

  try {
    const result = await generateInteriorImage({
      prompt: `${SYSTEM}\n\nUser request: ${clean}`,
    });
    return {
      imageUrl: result.dataUrl,
      note: result.note,
      model: result.model,
      understood: matched.understood,
      matches: matched.matches,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Generation failed.";
    const quota = /quota|billing|RESOURCE_EXHAUSTED|429/i.test(msg);

    // Generation is unavailable — return the curated matches instead, clearly
    // as references. We never pass a stock photo off as a generated design.
    return {
      needsBilling: quota,
      understood: matched.understood,
      matches: matched.matches,
      error: quota
        ? `Live generation needs billing enabled on the Gemini key (free tier has no image quota, model: ${GEMINI_IMAGE_MODEL}). Here are the closest interiors from our library instead.`
        : msg,
    };
  }
}
