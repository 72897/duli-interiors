import "server-only";
import { serverEnv } from "@/lib/env";

/**
 * Minimal Gemini REST client. Server-only — the API key must never reach the
 * browser (`server-only` makes that a build error rather than a leak).
 */

export const GEMINI_VISION_MODEL =
  process.env.GEMINI_VISION_MODEL || "gemini-2.5-flash";

const ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models";

export type GeminiUsage = {
  promptTokenCount?: number;
  candidatesTokenCount?: number;
  totalTokenCount?: number;
};

export type GeminiResult = {
  text: string;
  usage: GeminiUsage | null;
  model: string;
};

export const isGeminiConfigured = () => Boolean(serverEnv.GEMINI_API_KEY);

/**
 * Sends a prompt plus an inline file (image/PDF) and asks for JSON back.
 * Throws on transport/API errors; callers record the failure.
 */
export async function generateJsonFromFile(opts: {
  prompt: string;
  base64Data: string;
  mimeType: string;
  model?: string;
  signal?: AbortSignal;
}): Promise<GeminiResult> {
  const key = serverEnv.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is not configured.");

  const model = opts.model || GEMINI_VISION_MODEL;

  const res = await fetch(`${ENDPOINT}/${model}:generateContent?key=${key}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal: opts.signal,
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: opts.prompt },
            { inlineData: { mimeType: opts.mimeType, data: opts.base64Data } },
          ],
        },
      ],
      generationConfig: {
        // Ask for machine-readable output rather than prose we'd have to scrape.
        responseMimeType: "application/json",
        temperature: 0.2,
        maxOutputTokens: 4096,
      },
    }),
  });

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    const msg =
      json?.error?.message || `Gemini request failed (${res.status}).`;
    throw new Error(msg);
  }

  const candidate = json?.candidates?.[0];
  const text: string =
    candidate?.content?.parts
      ?.map((p: { text?: string }) => p.text ?? "")
      .join("") ?? "";

  if (!text) {
    const reason = candidate?.finishReason || "no content returned";
    throw new Error(`Gemini returned no usable output (${reason}).`);
  }

  return { text, usage: json?.usageMetadata ?? null, model };
}
