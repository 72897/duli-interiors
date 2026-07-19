"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  generateJsonFromFile,
  isGeminiConfigured,
  GEMINI_VISION_MODEL,
} from "@/lib/gemini/client";
import { PROMPT_VERSION, promptFor } from "@/lib/gemini/prompts";
import { extractJson, schemaFor } from "@/lib/ai/schema";

export type AnalyseState = { ok?: boolean; error?: string; analysisId?: string };

/** Inline request payloads are base64 (~+33%); keep well under Gemini's cap. */
const MAX_INLINE_BYTES = 7 * 1024 * 1024;

const kindForBucket = (bucket: string) =>
  bucket === "floor-plans" ? ("floor_plan" as const) : ("room_photo" as const);

/**
 * Analyses one uploaded room photo / floor plan with Gemini and stores a fully
 * traceable ai_analyses row (model, prompt version, raw + parsed output, usage,
 * timing, errors). Results always start at review_status='pending_review' —
 * nothing is customer-facing until a designer confirms it.
 */
export async function analyseUpload(
  uploadId: string,
  projectId: string,
): Promise<AnalyseState> {
  if (!isGeminiConfigured()) return { error: "AI isn’t connected yet." };

  const supabase = createSupabaseServerClient();
  if (!supabase) return { error: "Not connected." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in again." };

  // RLS scopes this — an upload you can't access simply isn't returned.
  const { data: upload, error: upErr } = await supabase
    .from("project_uploads")
    .select("id, project_id, bucket, storage_path, file_name, mime_type, size_bytes, room_id")
    .eq("id", uploadId)
    .maybeSingle();

  if (upErr) return { error: upErr.message };
  if (!upload || upload.project_id !== projectId) return { error: "File not found." };

  if (upload.bucket === "reference-images") {
    return { error: "Inspiration images aren’t analysed — they’re used as direction only." };
  }
  if ((upload.size_bytes ?? 0) > MAX_INLINE_BYTES) {
    return { error: "That file is too large to analyse. Please upload one under 7MB." };
  }

  const kind = kindForBucket(upload.bucket);

  // Record the attempt up-front so a crash still leaves a trace.
  const { data: created, error: insErr } = await supabase
    .from("ai_analyses")
    .insert({
      project_id: projectId,
      upload_id: upload.id,
      room_id: upload.room_id,
      kind,
      status: "processing",
      model: GEMINI_VISION_MODEL,
      prompt_version: PROMPT_VERSION,
      input: {
        file_name: upload.file_name,
        mime_type: upload.mime_type,
        size_bytes: upload.size_bytes,
        bucket: upload.bucket,
      },
      created_by: user.id,
    })
    .select("id")
    .single();

  if (insErr) return { error: insErr.message };
  const analysisId = created.id as string;

  const started = Date.now();
  const fail = async (message: string) => {
    await supabase
      .from("ai_analyses")
      .update({
        status: "failed",
        error: message,
        duration_ms: Date.now() - started,
      })
      .eq("id", analysisId);
    revalidatePath(`/projects/${projectId}`);
    return { error: message, analysisId };
  };

  try {
    // Buckets are private: download server-side rather than via a public URL.
    const { data: blob, error: dlErr } = await supabase.storage
      .from(upload.bucket)
      .download(upload.storage_path);
    if (dlErr || !blob) return await fail(dlErr?.message ?? "Could not read the file.");

    const base64 = Buffer.from(await blob.arrayBuffer()).toString("base64");

    const result = await generateJsonFromFile({
      prompt: promptFor(kind),
      base64Data: base64,
      mimeType: upload.mime_type || blob.type || "image/jpeg",
    });

    // Validate before trusting: a malformed response is a failure, not data.
    let parsed;
    try {
      parsed = schemaFor(kind).parse(extractJson(result.text));
    } catch {
      await supabase
        .from("ai_analyses")
        .update({ raw_output: result.text })
        .eq("id", analysisId);
      return await fail("The AI response couldn’t be read. Please try again.");
    }

    const { error: updErr } = await supabase
      .from("ai_analyses")
      .update({
        status: "completed",
        raw_output: result.text,
        parsed,
        usage: result.usage,
        model: result.model,
        duration_ms: Date.now() - started,
      })
      .eq("id", analysisId);
    if (updErr) return await fail(updErr.message);

    await supabase.from("project_activity_logs").insert({
      project_id: projectId,
      actor_id: user.id,
      action: "ai.analysis_completed",
      metadata: { kind, upload_id: upload.id, analysis_id: analysisId },
    });

    revalidatePath(`/projects/${projectId}`);
    return { ok: true, analysisId };
  } catch (e) {
    return await fail(e instanceof Error ? e.message : "AI analysis failed.");
  }
}
