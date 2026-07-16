"use client";

import { useState } from "react";

type BASet = { room: string; project: string; before: string; after: string };

const SETS: BASet[] = [
  { room: "Living Room", project: "City-View Apartment", before: "/before%20and%20after/s1,1.png", after: "/before%20and%20after/s1,2.png" },
  { room: "Family Room", project: "Suburban Residence", before: "/before%20and%20after/s2,1.png", after: "/before%20and%20after/s2,2.png" },
  { room: "Kitchen", project: "Modern Villa", before: "/before%20and%20after/s3,1.png", after: "/before%20and%20after/s3,2.png" },
  { room: "Bathroom", project: "Spa-Inspired Retreat", before: "/before%20and%20after/s4,1.png", after: "/before%20and%20after/s4,2.png" }
];

function BeforeAfterCard({ set }: { set: BASet }) {
  const [pos, setPos] = useState(50);
  const [dragged, setDragged] = useState(false);

  return (
    <div className="ba-frame">
      {/* "after" sits underneath, fully visible; "before" sits on top but is
          clipped to its left pos% — so the divider's left side (matching the
          "Before" tag's left position) always shows the before image, and the
          right side (matching "After") shows after. */}
      <img className="ba-after" src={set.after} alt={`${set.room} after the Duli renovation`} loading="lazy" />
      <img
        className="ba-before"
        src={set.before}
        alt={`${set.room} before the Duli renovation`}
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
        loading="lazy"
      />
      <span className="ba-tag ba-tag-before">Before</span>
      <span className="ba-tag ba-tag-after">After</span>

      <div className="ba-caption-card">
        <p className="ba-caption-room">{set.room}</p>
        <p className="ba-caption-project">{set.project}</p>
      </div>

      <div className={"ba-handle" + (dragged ? "" : " ba-handle-hint")} style={{ left: `${pos}%` }}>
        <span className="ba-handle-grip">↔</span>
      </div>
      <input
        type="range"
        className="ba-range"
        min={0}
        max={100}
        value={pos}
        onChange={(e) => {
          setPos(Number(e.target.value));
          setDragged(true);
        }}
        onPointerDown={() => setDragged(true)}
        aria-label={`Drag to compare ${set.room} before and after`}
      />
    </div>
  );
}

export function BeforeAfterSlider() {
  return (
    <div className="ba-showcase">
      <div className="ba-grid">
        {SETS.map((set) => (
          <BeforeAfterCard set={set} key={set.room} />
        ))}
      </div>
    </div>
  );
}
