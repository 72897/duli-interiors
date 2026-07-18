"use client";

import type { CSSProperties } from "react";

// Splits text into per-character spans so CSS can stagger each one in on
// mount (animation-delay driven by the --char-i custom property) — words stay
// glued together (no internal wrap) while a real space between word-spans
// keeps normal line-wrapping at word boundaries.
export function SplitText({ text, className }: { text: string; className?: string }) {
  const words = text.split(" ");
  let charIndex = 0;

  return (
    <span className={"split-text" + (className ? " " + className : "")}>
      {words.flatMap((word, wi) => {
        const wordSpan = (
          <span className="split-word" key={`w-${wi}`}>
            {word.split("").map((ch) => {
              const idx = charIndex++;
              return (
                <span className="split-char" style={{ "--char-i": idx } as CSSProperties} key={idx}>
                  {ch}
                </span>
              );
            })}
          </span>
        );
        return wi === 0 ? [wordSpan] : [" ", wordSpan];
      })}
    </span>
  );
}
