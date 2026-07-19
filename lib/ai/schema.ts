import { z } from "zod";

/**
 * Shapes we accept back from Gemini. The model is instructed to return exactly
 * these, but it is an LLM — everything is validated before it is stored or
 * shown, and a mismatch is recorded as a failed analysis rather than trusted.
 */

const strArray = z.array(z.string()).default([]);

export const roomPhotoAnalysisSchema = z.object({
  roomType: z.string().default("other"),
  designStyle: z.string().default(""),
  colourPalette: strArray,
  visibleFurniture: strArray,
  doorsWindows: strArray,
  fixedElements: strArray,
  constraints: strArray,
  measurementWarnings: strArray,
  clarificationQuestions: strArray,
  designSummary: z.string().default(""),
});

export const floorPlanAnalysisSchema = z.object({
  rooms: z
    .array(
      z.object({
        label: z.string().default(""),
        writtenDimensions: z.string().nullable().default(null),
      }),
    )
    .default([]),
  doors: strArray,
  windows: strArray,
  relationships: strArray,
  unreadableSections: strArray,
  measurementWarnings: strArray,
  summary: z.string().default(""),
});

export type RoomPhotoAnalysis = z.infer<typeof roomPhotoAnalysisSchema>;
export type FloorPlanAnalysis = z.infer<typeof floorPlanAnalysisSchema>;

export const schemaFor = (kind: "room_photo" | "floor_plan") =>
  kind === "room_photo" ? roomPhotoAnalysisSchema : floorPlanAnalysisSchema;

/** Strips code fences if the model wraps JSON despite being told not to. */
export function extractJson(text: string): unknown {
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();
  return JSON.parse(cleaned);
}
