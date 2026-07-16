"use client";

import { useRef, useState, useTransition } from "react";
import { generateDesign } from "@/lib/ai/design-chat";
import type { MatchedIdea } from "@/lib/ai/match";

type Msg = {
  id: number;
  role: "user" | "assistant";
  text?: string;
  imageUrl?: string;
  error?: boolean;
  needsBilling?: boolean;
  matches?: MatchedIdea[];
  understood?: string;
};

const SUGGESTIONS = [
  "A warm contemporary Indian living room with fluted teak and brass accents",
  "A minimal 2BHK bedroom in ivory and oak with soft morning light",
  "A handleless modular kitchen in graphite with quartz countertops",
  "A luxe walk-in wardrobe with fluted glass and warm LED profiles",
];

export function DesignChat() {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [pending, startTransition] = useTransition();
  const idRef = useRef(0);
  const endRef = useRef<HTMLDivElement>(null);

  const send = (text: string) => {
    const prompt = text.trim();
    if (!prompt || pending) return;

    const userMsg: Msg = { id: ++idRef.current, role: "user", text: prompt };
    setMsgs((m) => [...m, userMsg]);
    setInput("");

    startTransition(async () => {
      const res = await generateDesign(prompt);
      setMsgs((m) => [
        ...m,
        {
          id: ++idRef.current,
          role: "assistant",
          imageUrl: res.imageUrl,
          text: res.error ?? res.note ?? "Here’s a concept.",
          error: !!res.error && !res.matches?.length,
          needsBilling: res.needsBilling,
          matches: res.matches,
          understood: res.understood,
        },
      ]);
      requestAnimationFrame(() =>
        endRef.current?.scrollIntoView({ behavior: "smooth" }),
      );
    });
  };

  return (
    <div className="flex h-[620px] flex-col overflow-hidden rounded-2xl border border-white/60 bg-white/70 backdrop-blur-xl">
      {/* Transcript */}
      <div className="flex-1 space-y-4 overflow-y-auto p-5">
        {msgs.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-brass/15 text-brass">
              <SparkIcon />
            </span>
            <p className="mt-4 font-serif text-2xl">Describe your space.</p>
            <p className="mt-2 max-w-[42ch] text-[13.5px] text-muted">
              Tell me the room, the style and what matters to you — I’ll
              visualise it. Every concept is reviewed by a Duli designer
              before it becomes a plan.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  className="cursor-pointer rounded-full border border-stone bg-bg px-3.5 py-2 text-left text-[12px] transition-colors duration-200 hover:border-olive"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {msgs.map((m) => (
          <div
            key={m.id}
            className={m.role === "user" ? "flex justify-end" : "flex justify-start"}
          >
            <div
              className={
                "max-w-[85%] rounded-2xl px-4 py-3 text-[13.5px] " +
                (m.role === "user"
                  ? "bg-ink text-bg"
                  : m.error
                    ? "border border-terracotta/40 bg-terracotta/[0.07] text-ink"
                    : "border border-stone bg-surface text-ink")
              }
            >
              {m.imageUrl && (
                <figure className="mb-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={m.imageUrl}
                    alt="AI-generated interior design concept"
                    className="w-full rounded-xl"
                  />
                  <figcaption className="mt-1.5 text-[10.5px] uppercase tracking-wide text-muted">
                    AI-generated design concept
                  </figcaption>
                </figure>
              )}
              {m.understood && (
                <p className="mb-2 text-[12px] text-muted">
                  Understood: {m.understood}
                </p>
              )}
              {m.text && <p className="whitespace-pre-wrap">{m.text}</p>}

              {/* Curated library references — explicitly NOT generated images. */}
              {m.matches && m.matches.length > 0 && (
                <div className="mt-3">
                  <p className="text-[10.5px] font-semibold uppercase tracking-wide text-brass">
                    Curated references from our library
                  </p>
                  <div className="mt-2 grid gap-2.5 sm:grid-cols-3">
                    {m.matches.map((mi) => (
                      <a
                        key={mi.slug}
                        href={`/projects/new?space=${mi.space.toLowerCase().replace(/ /g, "_")}`}
                        className="group block overflow-hidden rounded-xl border border-stone bg-bg transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-olive"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={mi.imageUrl}
                          alt={`${mi.title} — ${mi.style} ${mi.space}`}
                          loading="lazy"
                          className="aspect-[4/3] w-full object-cover"
                        />
                        <div className="p-2">
                          <p className="text-[11.5px] font-semibold">{mi.title}</p>
                          <p className="mt-0.5 text-[10.5px] text-muted">
                            {mi.style} · {mi.city}
                          </p>
                        </div>
                      </a>
                    ))}
                  </div>
                  <p className="mt-2 text-[10.5px] text-muted">
                    Reference interiors from Duli’s idea library — not
                    generated from your room. Start a project to have a designer
                    work from one.
                  </p>
                </div>
              )}

              {m.needsBilling && (
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-[12px] text-olive underline underline-offset-2"
                >
                  Enable billing on the Gemini key →
                </a>
              )}
            </div>
          </div>
        ))}

        {pending && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 rounded-2xl border border-stone bg-surface px-4 py-3 text-[13px] text-muted">
              <span className="h-2 w-2 animate-pulse rounded-full bg-brass" />
              Visualising your space…
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Composer */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="border-t border-stone/70 bg-white/60 p-3"
      >
        <div className="flex items-end gap-2">
          <label htmlFor="design-prompt" className="sr-only">
            Describe the space you want
          </label>
          <textarea
            id="design-prompt"
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            placeholder="Describe your room, style and budget…"
            className="max-h-32 min-h-[46px] flex-1 resize-none rounded-xl border border-stone bg-bg px-3.5 py-3 text-sm text-ink focus:border-olive focus:outline-none focus:ring-2 focus:ring-olive/20"
          />
          <button
            type="submit"
            disabled={pending || !input.trim()}
            className="btn-solid h-[46px] shrink-0 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? "…" : "Generate"}
            <span aria-hidden="true">→</span>
          </button>
        </div>
        <p className="mt-2 px-1 text-[11px] text-muted">
          Concepts are AI-generated starting points — a Duli designer reviews
          every one before it reaches a proposal.
        </p>
      </form>
    </div>
  );
}

function SparkIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.5 13.9 8 19.5 9.9 13.9 11.8 12 17.4 10.1 11.8 4.5 9.9 10.1 8z" />
      <path d="M18.5 15.5l.9 2.6 2.6.9-2.6.9-.9 2.6-.9-2.6-2.6-.9 2.6-.9z" />
    </svg>
  );
}
