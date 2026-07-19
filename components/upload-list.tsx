"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteUpload } from "@/lib/uploads/actions";

export type UploadItem = {
  id: string;
  file_name: string | null;
  mime_type: string | null;
  size_bytes: number | null;
  bucket: string;
  signedUrl: string | null;
};

const kb = (n: number | null) =>
  n == null ? "" : n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.round(n / 1024)} KB`;

export function UploadList({
  uploads,
  projectId,
}: {
  uploads: UploadItem[];
  projectId: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  if (uploads.length === 0) {
    return (
      <p className="mt-3 text-[12.5px] text-muted">Nothing uploaded yet.</p>
    );
  }

  const remove = (id: string) =>
    startTransition(async () => {
      await deleteUpload(id, projectId);
      router.refresh();
    });

  return (
    <ul className="mt-3 grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-3">
      {uploads.map((u) => {
        const isImage = (u.mime_type ?? "").startsWith("image/");
        return (
          <li
            key={u.id}
            className="overflow-hidden rounded-lg border border-stone bg-surface"
          >
            <div className="relative flex h-[92px] items-center justify-center bg-bg">
              {isImage && u.signedUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={u.signedUrl}
                  alt={u.file_name ?? "Upload"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                  {(u.file_name ?? "file").split(".").pop()}
                </span>
              )}
            </div>
            <div className="p-2">
              <p className="truncate text-[11.5px]" title={u.file_name ?? ""}>
                {u.file_name}
              </p>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-[10.5px] text-muted">{kb(u.size_bytes)}</span>
                <button
                  type="button"
                  onClick={() => remove(u.id)}
                  disabled={pending}
                  className="cursor-pointer text-[10.5px] text-terracotta hover:underline disabled:opacity-50"
                >
                  Remove
                </button>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
