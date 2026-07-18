"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  QUIZ_QUESTIONS,
  addScores,
  emptyScores,
  scoreToResult,
  type StyleId
} from "@/lib/style-quiz-data";
import { ConsultForm } from "@/components/consult-form";

function track(event: string, detail?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  (window as any).dataLayer = (window as any).dataLayer || [];
  (window as any).dataLayer.push({ event, ...detail });
}

type Phase = "intro" | "quiz" | "result";

export function StyleQuiz() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState(emptyScores());
  const startedRef = useRef(false);

  const question = QUIZ_QUESTIONS[step];
  const total = QUIZ_QUESTIONS.length;

  useEffect(() => {
    if (phase === "quiz") track("style_quiz_question_viewed", { question: question.id, number: question.number });
  }, [phase, question]);

  const startQuiz = () => {
    if (!startedRef.current) {
      track("style_quiz_started");
      startedRef.current = true;
    }
    setPhase("quiz");
  };

  const recordAnswer = (optionId: string | "neither", optionScores?: Partial<Record<StyleId, number>>) => {
    const nextScores = optionScores ? addScores(scores, optionScores) : scores;
    setScores(nextScores);

    if (optionId === "neither") {
      track("style_quiz_neither_selected", { question: question.id });
    } else {
      track("style_quiz_option_selected", { question: question.id, option: optionId });
    }

    if (step + 1 < total) {
      setStep(step + 1);
    } else {
      const result = scoreToResult(nextScores);
      track("style_quiz_completed", { main: result.main.id, sub: result.sub?.id ?? null });
      track("style_result_viewed", { main: result.main.id, sub: result.sub?.id ?? null });
      setPhase("result");
    }
  };

  const result = useMemo(() => scoreToResult(scores), [scores]);

  if (phase === "intro") return <IntroScreen onStart={startQuiz} />;

  if (phase === "result") return <ResultScreen main={result.main} sub={result.sub} />;

  return (
    <QuestionScreen
      key={question.id}
      number={question.number}
      total={total}
      title={question.title}
      optionA={question.optionA}
      optionB={question.optionB}
      onSelect={recordAnswer}
    />
  );
}

function IntroScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="sq-intro">
      <p className="sq-eyebrow">Duli Style Quiz</p>
      <h1 className="sq-intro-title">Find Your Duli Interior Style</h1>
      <p className="sq-intro-sub">
        Seven quick visual choices. No prices, no specs &mdash; just your taste, distilled into a style you can hand
        straight to your designer.
      </p>
      <button type="button" className="sq-btn-primary" onClick={onStart}>
        Start Style Quiz
      </button>
    </div>
  );
}

function QuestionScreen({
  number,
  total,
  title,
  optionA,
  optionB,
  onSelect
}: {
  number: number;
  total: number;
  title: string;
  optionA: { id: string; image: string; scores: Partial<Record<StyleId, number>> };
  optionB: { id: string; image: string; scores: Partial<Record<StyleId, number>> };
  onSelect: (optionId: string | "neither", scores?: Partial<Record<StyleId, number>>) => void;
}) {
  return (
    <div className="sq-question">
      <p className="sq-step-label">
        Question {number} of {total}
      </p>
      <h2 className="sq-question-title">{title}</h2>
      <p className="sq-question-sub">Click the style you prefer</p>

      <div className="sq-options">
        <button type="button" className="sq-option" onClick={() => onSelect(optionA.id, optionA.scores)}>
          <img src={optionA.image} alt="" />
        </button>
        <span className="sq-or">OR</span>
        <button type="button" className="sq-option" onClick={() => onSelect(optionB.id, optionB.scores)}>
          <img src={optionB.image} alt="" />
        </button>
      </div>

      <button type="button" className="sq-neither" onClick={() => onSelect("neither")}>
        Neither of these
      </button>

      <div className="sq-dots">
        {Array.from({ length: total }, (_, i) => (
          <span key={i} className={"sq-dot" + (i < number ? " filled" : "") + (i === number - 1 ? " active" : "")} />
        ))}
      </div>
    </div>
  );
}

function ResultScreen({
  main,
  sub
}: {
  main: ReturnType<typeof scoreToResult>["main"];
  sub: ReturnType<typeof scoreToResult>["sub"];
}) {
  const topRef = useRef<HTMLDivElement>(null);

  // The floating header pin sits in the same band as this eyebrow + style
  // name — and the style name's length varies, so there's no fixed amount
  // of top padding that reliably clears it. A fixed timer popped the header
  // back in mid-read regardless of how far the user had actually gotten, so
  // tie it to scroll instead: hidden for as long as this opening block is
  // in view, and it only reappears once the user has actually scrolled past
  // it into the gallery/breakdown below.
  useEffect(() => {
    const el = topRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => document.body.classList.toggle("sq-result-top-active", entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      document.body.classList.remove("sq-result-top-active");
    };
  }, []);

  const [contactOpen, setContactOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    document.documentElement.classList.toggle("lenis-stopped", contactOpen);
    return () => document.documentElement.classList.remove("lenis-stopped");
  }, [contactOpen]);

  useEffect(() => {
    if (!contactOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setContactOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [contactOpen]);

  const handleDesignerClick = () => {
    track("style_designer_cta_clicked", { main: main.id, sub: sub?.id ?? null });
    setContactOpen(true);
  };

  return (
    <div className="sq-result">
      <div ref={topRef}>
        <p className="sq-eyebrow">Your Duli Style Is</p>
        <h1 className="sq-result-title">{main.name}</h1>
        {sub && <p className="sq-result-sub">Your sub-style is: {sub.name}</p>}
        <p className="sq-result-lede">{main.explanation}</p>
      </div>

      <div className="sq-gallery">
        {main.images.map((src) => (
          <div className="sq-gallery-cell" key={src}>
            <img src={src} alt="" />
          </div>
        ))}
      </div>

      <div className="sq-result-grid">
        <div className="sq-result-block">
          <h3>Style Snapshot</h3>
          <ul className="sq-snapshot">
            {main.snapshot.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </div>

        <div className="sq-result-block">
          <h3>Colour Palette</h3>
          <div className="sq-palette">
            {main.palette.map((swatch) => (
              <div className="sq-swatch" key={swatch.name}>
                <span className="sq-swatch-dot" style={{ background: swatch.hex }} />
                <span>{swatch.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="sq-result-block">
          <h3>Best Suited Spaces</h3>
          <div className="sq-spaces">
            {main.bestFor.map((space) => (
              <span className="sq-space-tag" key={space}>
                {space}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="sq-cta">
        <button type="button" className="sq-btn-primary" onClick={handleDesignerClick}>
          Talk to a Duli Designer
        </button>
      </div>

      {mounted &&
        contactOpen &&
        createPortal(
          <div className="sq-contact-overlay" onClick={() => setContactOpen(false)}>
            <div className="sq-contact-card" onClick={(e) => e.stopPropagation()}>
              <button type="button" className="sq-contact-close" aria-label="Close" onClick={() => setContactOpen(false)}>
                ×
              </button>
              <ConsultForm />
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
