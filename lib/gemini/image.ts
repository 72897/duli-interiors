import "server-only";
import { serverEnv } from "@/lib/env";

/**
 * Gemini image generation (Phase 1.11). Server-only — the key never reaches
 * the browser.
 */
export const GEMINI_IMAGE_MODEL =
  process.env.GEMINI_IMAGE_MODEL || "gemini-2.5-flash-image";

const ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models";

export type GeneratedImage = {
  /** data: URI of the generated image */
  dataUrl: string;
  mimeType: string;
  model: string;
  /** any text the model returned alongside the image */
  note: string;
};

/**
 * Generates an interior concept image from a prompt, optionally conditioned on
 * a reference photo of the customer's real room.
 */
export async function generateInteriorImage(opts: {
  prompt: string;
  referenceBase64?: string;
  referenceMimeType?: string;
  model?: string;
  signal?: AbortSignal;
}): Promise<GeneratedImage> {
  const key = serverEnv.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is not configured.");

  const model = opts.model || GEMINI_IMAGE_MODEL;

  const parts: unknown[] = [{ text: opts.prompt }];
  if (opts.referenceBase64) {
    parts.push({
      inlineData: {
        mimeType: opts.referenceMimeType || "image/jpeg",
        data: opts.referenceBase64,
      },
    });
  }

  const res = await fetch(`${ENDPOINT}/${model}:generateContent?key=${key}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal: opts.signal,
    body: JSON.stringify({
      contents: [{ parts }],
      generationConfig: { temperature: 0.7 },
    }),
  });

  const json = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(json?.error?.message || `Gemini image request failed (${res.status}).`);
  }

  const responseParts = json?.candidates?.[0]?.content?.parts ?? [];
  const imagePart = responseParts.find(
    (p: { inlineData?: { data?: string } }) => p?.inlineData?.data,
  );

  if (!imagePart) {
    const reason =
      responseParts.find((p: { text?: string }) => p?.text)?.text ||
      json?.candidates?.[0]?.finishReason ||
      "no image returned";
    throw new Error(`The model didn’t return an image (${reason}).`);
  }

  const mimeType = imagePart.inlineData.mimeType || "image/png";
  const note =
    responseParts
      .filter((p: { text?: string }) => p?.text)
      .map((p: { text: string }) => p.text)
      .join(" ")
      .trim() || "";

  return {
    dataUrl: `data:${mimeType};base64,${imagePart.inlineData.data}`,
    mimeType,
    model,
    note,
  };
}
