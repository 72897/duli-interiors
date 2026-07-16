"use client";

import { useEffect, useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { postComment, type CommentState } from "@/lib/collaboration/actions";

const initial: CommentState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="h-10 shrink-0 cursor-pointer rounded-full bg-ink px-5 text-[13px] font-medium text-bg transition-opacity duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Posting…" : "Post"}
    </button>
  );
}

export function CommentForm({
  projectId,
  canPostInternal = false,
}: {
  projectId: string;
  /** Staff only — lets them post a note customers can't see. */
  canPostInternal?: boolean;
}) {
  const [state, formAction] = useFormState(postComment, initial);
  const formRef = useRef<HTMLFormElement>(null);
  const bodyErr = state.fieldErrors?.body?.[0];

  // Clear the box once the server confirms the post landed.
  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state.ok]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="mt-6 border-t border-ink/[0.07] pt-5"
    >
      <input type="hidden" name="projectId" value={projectId} />

      <textarea
        name="body"
        rows={3}
        required
        maxLength={2000}
        placeholder="Add a comment for your designer…"
        aria-invalid={!!bodyErr}
        className="w-full resize-none rounded-xl border border-ink/10 bg-white/60 px-3.5 py-2.5 text-[13px] text-ink placeholder:text-muted focus:border-olive focus:outline-none focus:ring-2 focus:ring-olive/20 aria-[invalid=true]:border-terracotta"
      />

      {bodyErr && <p className="mt-1.5 text-[12px] text-terracotta">{bodyErr}</p>}
      {state.error && (
        <p className="mt-1.5 text-[12px] text-terracotta" role="alert">
          {state.error}
        </p>
      )}

      <div className="mt-2.5 flex items-center justify-between gap-4">
        {canPostInternal ? (
          <label className="flex cursor-pointer items-center gap-2 text-[12px] text-muted">
            <input
              type="checkbox"
              name="internal"
              className="h-3.5 w-3.5 cursor-pointer accent-brass"
            />
            Internal note (hidden from the client)
          </label>
        ) : (
          <span />
        )}
        <SubmitButton />
      </div>
    </form>
  );
}
