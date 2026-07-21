import "server-only";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSignedUrl } from "@/lib/uploads/actions";
import type { UploadItem } from "@/components/upload-list";

/**
 * Shared loaders for the project workspace tabs.
 *
 * Every tab re-queries independently (App Router layouts can't pass data down),
 * so this keeps one definition of "load this project" rather than eight
 * near-identical copies drifting apart.
 */

/** Throws notFound() when RLS withholds the project — an unreadable row is a 404. */
export async function requireProject(id: string) {
  const supabase = createSupabaseServerClient();
  if (!supabase) notFound();

  const { data } = await supabase
    .from("projects")
    .select("id, code, name, status, city, budget_level, created_at")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();

  if (!data) notFound();
  return { supabase, project: data };
}

/**
 * Uploads with short-lived signed URLs. The storage buckets are private, so a
 * raw path renders nothing — only images get a URL minted, since that's all we
 * display inline.
 */
export async function loadUploads(projectId: string) {
  const supabase = createSupabaseServerClient();
  if (!supabase) return [];

  const { data: uploads } = await supabase
    .from("project_uploads")
    .select("id, bucket, storage_path, file_name, mime_type, size_bytes")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  const withUrls: UploadItem[] = await Promise.all(
    (uploads ?? []).map(async (u) => ({
      id: u.id,
      bucket: u.bucket,
      file_name: u.file_name,
      mime_type: u.mime_type,
      size_bytes: u.size_bytes,
      signedUrl: (u.mime_type ?? "").startsWith("image/")
        ? await getSignedUrl(u.bucket, u.storage_path)
        : null,
    })),
  );

  return withUrls;
}
