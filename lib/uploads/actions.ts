"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isBucket, validateFile, type UploadBucket } from "@/lib/uploads/config";

export type UploadRecordState = { ok?: boolean; error?: string };

/**
 * Records an uploaded file in `project_uploads` after the client has streamed
 * it to Storage. The bytes go browser → Storage directly (RLS-scoped); this
 * records the metadata and re-validates type/size server-side so a crafted
 * client can't register something we'd reject.
 */
export async function recordUpload(input: {
  projectId: string;
  roomId?: string | null;
  bucket: string;
  storagePath: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
}): Promise<UploadRecordState> {
  if (!isBucket(input.bucket)) return { error: "Unknown upload type." };

  const invalid = validateFile(input.bucket as UploadBucket, {
    type: input.mimeType,
    size: input.sizeBytes,
  });
  if (invalid) return { error: invalid };

  // The path must live under the project it claims to belong to.
  if (!input.storagePath.startsWith(`${input.projectId}/`)) {
    return { error: "Invalid file path." };
  }

  const supabase = createSupabaseServerClient();
  if (!supabase) return { error: "Storage isn’t connected yet." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in again." };

  const { error } = await supabase.from("project_uploads").insert({
    project_id: input.projectId,
    room_id: input.roomId || null,
    bucket: input.bucket,
    storage_path: input.storagePath,
    file_name: input.fileName,
    mime_type: input.mimeType,
    size_bytes: input.sizeBytes,
    uploaded_by: user.id,
  });
  if (error) return { error: error.message };

  await supabase.from("project_activity_logs").insert({
    project_id: input.projectId,
    actor_id: user.id,
    action: "upload.added",
    metadata: { bucket: input.bucket, file_name: input.fileName },
  });

  revalidatePath(`/projects/${input.projectId}`);
  return { ok: true };
}

/** Removes the object from Storage and its metadata row. */
export async function deleteUpload(uploadId: string, projectId: string) {
  const supabase = createSupabaseServerClient();
  if (!supabase) return { error: "Storage isn’t connected yet." };

  const { data: row, error: readErr } = await supabase
    .from("project_uploads")
    .select("id, bucket, storage_path, project_id")
    .eq("id", uploadId)
    .maybeSingle();
  if (readErr) return { error: readErr.message };
  if (!row) return { error: "File not found." };

  // RLS already scopes this, but fail loudly on a mismatched project.
  if (row.project_id !== projectId) return { error: "File not found." };

  const { error: storageErr } = await supabase.storage
    .from(row.bucket)
    .remove([row.storage_path]);
  if (storageErr) return { error: storageErr.message };

  const { error: delErr } = await supabase
    .from("project_uploads")
    .delete()
    .eq("id", uploadId);
  if (delErr) return { error: delErr.message };

  revalidatePath(`/projects/${projectId}`);
  return { ok: true };
}

/**
 * Short-lived signed URLs for private objects. Buckets are private, so this is
 * the only way to display them — generated server-side after RLS has confirmed
 * the caller can see the row.
 */
export async function getSignedUrl(bucket: string, path: string) {
  const supabase = createSupabaseServerClient();
  if (!supabase) return null;
  const { data } = await supabase.storage.from(bucket).createSignedUrl(path, 60 * 30);
  return data?.signedUrl ?? null;
}
