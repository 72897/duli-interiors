/** Upload rules — shared by the client picker and the server action. */

export type UploadBucket = "room-photos" | "floor-plans" | "reference-images";

export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const BUCKET_RULES: Record<
  UploadBucket,
  { label: string; accept: string[]; maxBytes: number; hint: string }
> = {
  "room-photos": {
    label: "Room photos",
    accept: IMAGE_TYPES,
    maxBytes: 10 * 1024 * 1024,
    hint: "JPG, PNG or WEBP · up to 10MB",
  },
  "floor-plans": {
    label: "Floor plans",
    accept: [...IMAGE_TYPES, "application/pdf"],
    maxBytes: 15 * 1024 * 1024,
    hint: "JPG, PNG, WEBP or PDF · up to 15MB",
  },
  "reference-images": {
    label: "Inspiration",
    accept: IMAGE_TYPES,
    maxBytes: 10 * 1024 * 1024,
    hint: "JPG, PNG or WEBP · up to 10MB",
  },
};

export const isBucket = (v: string): v is UploadBucket => v in BUCKET_RULES;

/** Returns an error message, or null when the file is acceptable. */
export function validateFile(bucket: UploadBucket, file: { type: string; size: number }) {
  const rule = BUCKET_RULES[bucket];
  if (!rule.accept.includes(file.type)) {
    return `That file type isn’t supported here. ${rule.hint}.`;
  }
  if (file.size > rule.maxBytes) {
    return `File is too large. ${rule.hint}.`;
  }
  if (file.size === 0) return "That file appears to be empty.";
  return null;
}

/** Storage path: <project_id>/<random>-<safe-name> (policies read segment 1). */
export function buildPath(projectId: string, fileName: string) {
  const safe = fileName
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]+/g, "-")
    .replace(/-+/g, "-")
    .slice(-80);
  const rand = Math.random().toString(36).slice(2, 10);
  return `${projectId}/${rand}-${safe}`;
}
