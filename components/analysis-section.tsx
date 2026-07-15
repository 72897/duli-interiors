"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { analyseUpload } from "@/lib/ai/actions";

export type AnalysableUpload = {
  id: string;
  file_name: string | null;
  bucket: string;
};

export type AnalysisRow = {
  id: string;
  upload_id: string | null;
  kind: string;
  status: string;
  review_status: string;
  parsed: Record<string, unknown> | null;
  error: string | null;
  model: string;
  prompt_version: string;
  created_at: string;
};

const chip =
  "rounded-full border border-stone px-2.5 py-[3px] text-[11px] capitalize text-muted";

export function AnalysisSection({
  projectId,
  uploads,
  analyses,
}: {
  projectId: string;
  uploads: AnalysableUpload[];
  analyses: AnalysisRow[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (uploads.length === 0) {
    return (
      <p className="mt-2 text-[13px] text-muted">
        Upload a room photo or floor plan above, then analyse it here.
      </p>
    );
  }

  const latestFor = (uploadId: string) =>
    analyses.find((a) => a.upload_id === uploadId) ?? null;

  const run = (uploadId: string) => {
    setError(null);
    setBusyId(uploadId);
    startTransition(async () => {
      const res = await analyseUpload(uploadId, projectId);
      if (res.error) setError(res.error);
      setBusyId(null);
      router.refresh();
    });
  };

  return (
    <div className="mt-3 space-y-4">
      {error && (
        <p className="rounded-lg border border-terracotta/40 bg-terracotta/[0.08] px-3 py-2 text-[13px] text-terracotta" role="alert">
          {error}
        </p>
      )}

      {uploads.map((u) => {
        const a = latestFor(u.id);
        const running = pending && busyId === u.id;
        return (
          <div key={u.id} className="rounded-xl border border-stone bg-surface p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-[13.5px] font-medium">{u.file_name}</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  <span className={chip}>
                    {u.bucket === "floor-plans" ? "Floor plan" : "Room photo"}
                  </span>
                  {a && <span className={chip}>{a.status}</span>}
                  {a?.status === "completed" && (
                    <span className={chip}>{a.review_status.replace(/_/g, " ")}</span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => run(u.id)}
                disabled={pending}
                className="h-9 shrink-0 cursor-pointer rounded-full border border-ink px-4 text-[13px] font-medium transition-colors duration-200 hover:bg-ink hover:text-bg disabled:cursor-not-allowed disabled:opacity-50"
              >
                {running ? "Analysing…" : a ? "Re-analyse" : "Analyse"}
              </button>
            </div>

            {a?.status === "failed" && (
              <p className="mt-3 text-[12.5px] text-terracotta">{a.error}</p>
            )}

            {a?.status === "completed" && a.parsed && (
              <AnalysisResult kind={a.kind} parsed={a.parsed} model={a.model} version={a.prompt_version} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function List({ label, items }: { label: string; items: unknown }) {
  const arr = Array.isArray(items) ? (items as string[]) : [];
  if (arr.length === 0) return null;
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-wide text-brass">{label}</dt>
      <dd className="mt-1 text-[13px]">{arr.join(" · ")}</dd>
    </div>
  );
}

function AnalysisResult({
  kind,
  parsed,
  model,
  version,
}: {
  kind: string;
  parsed: Record<string, unknown>;
  model: string;
  version: string;
}) {
  const warnings = (parsed.measurementWarnings as string[]) ?? [];
  const questions = (parsed.clarificationQuestions as string[]) ?? [];

  return (
    <div className="mt-4 border-t border-stone pt-4">
      <p className="text-[13.5px] leading-relaxed">
        {(parsed.designSummary as string) || (parsed.summary as string) || ""}
      </p>

      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        {kind === "room_photo" ? (
          <>
            <List label="Room type" items={[String(parsed.roomType ?? "")]} />
            <List label="Style" items={[String(parsed.designStyle ?? "")]} />
            <List label="Palette" items={parsed.colourPalette} />
            <List label="Furniture" items={parsed.visibleFurniture} />
            <List label="Doors & windows" items={parsed.doorsWindows} />
            <List label="Fixed elements" items={parsed.fixedElements} />
            <List label="Constraints" items={parsed.constraints} />
          </>
        ) : (
          <>
            <div className="sm:col-span-2">
              <dt className="text-[11px] uppercase tracking-wide text-brass">Rooms</dt>
              <dd className="mt-1 text-[13px]">
                {((parsed.rooms as { label: string; writtenDimensions: string | null }[]) ?? [])
                  .map((r) => r.label + (r.writtenDimensions ? ` (${r.writtenDimensions})` : ""))
                  .join(" · ") || "—"}
              </dd>
            </div>
            <List label="Doors" items={parsed.doors} />
            <List label="Windows" items={parsed.windows} />
            <List label="Relationships" items={parsed.relationships} />
            <List label="Unreadable" items={parsed.unreadableSections} />
          </>
        )}
      </dl>

      {warnings.length > 0 && (
        <div className="mt-4 rounded-lg border border-warning/40 bg-[#C9922E]/[0.08] p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#8a6416]">
            Cannot be confirmed from this file
          </p>
          <ul className="mt-1.5 list-inside list-disc text-[12.5px] text-ink">
            {warnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {questions.length > 0 && (
        <div className="mt-3">
          <p className="text-[11px] uppercase tracking-wide text-brass">
            Questions for you
          </p>
          <ul className="mt-1.5 list-inside list-disc text-[12.5px]">
            {questions.map((q) => (
              <li key={q}>{q}</li>
            ))}
          </ul>
        </div>
      )}

      <p className="mt-4 text-[11px] text-muted">
        AI-generated analysis · {model} · {version} — reviewed by a Duli
        designer before it informs your design.
      </p>
    </div>
  );
}
