"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { recordUpload } from "@/lib/uploads/actions";
import {
  BUCKET_RULES,
  buildPath,
  validateFile,
  type UploadBucket,
} from "@/lib/uploads/config";

export function ProjectUploader({
  projectId,
  bucket,
}: {
  projectId: string;
  bucket: UploadBucket;
}) {
  const rule = BUCKET_RULES[bucket];
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setError(null);

    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setError("Storage isn’t connected yet.");
      return;
    }

    setBusy(true);
    try {
      for (const file of Array.from(files)) {
        const invalid = validateFile(bucket, file);
        if (invalid) {
          setError(`${file.name}: ${invalid}`);
          continue;
        }

        const path = buildPath(projectId, file.name);
        const { error: upErr } = await supabase.storage
          .from(bucket)
          .upload(path, file, { cacheControl: "3600", upsert: false });

        if (upErr) {
          setError(`${file.name}: ${upErr.message}`);
          continue;
        }

        const res = await recordUpload({
          projectId,
          bucket,
          storagePath: path,
          fileName: file.name,
          mimeType: file.type,
          sizeBytes: file.size,
        });

        if (res.error) {
          // Metadata failed — don't leave an orphan object behind.
          await supabase.storage.from(bucket).remove([path]);
          setError(`${file.name}: ${res.error}`);
        }
      }
      router.refresh();
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          void handleFiles(e.dataTransfer.files);
        }}
        className={
          "rounded-xl border border-dashed p-6 text-center transition-colors duration-200 " +
          (dragOver ? "border-olive bg-olive/[0.06]" : "border-stone bg-bg")
        }
      >
        <UploadIcon />
        <p className="mt-2 text-[13.5px] font-medium">{rule.label}</p>
        <p className="mt-0.5 text-[12px] text-muted">{rule.hint}</p>

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="mt-3 inline-flex h-9 cursor-pointer items-center rounded-full border border-ink px-4 text-[13px] font-medium transition-colors duration-200 hover:bg-ink hover:text-bg disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? "Uploading…" : "Choose file"}
        </button>

        <input
          ref={inputRef}
          type="file"
          multiple
          accept={rule.accept.join(",")}
          className="hidden"
          onChange={(e) => void handleFiles(e.target.files)}
        />
      </div>

      {error && (
        <p className="mt-2 text-xs text-terracotta" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function UploadIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mx-auto text-olive"
      aria-hidden="true"
    >
      <path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
      <path d="M12 16V4M7.5 8.5 12 4l4.5 4.5" />
    </svg>
  );
}
