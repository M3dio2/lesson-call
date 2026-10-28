import type { CSSProperties } from "react";

// Hand-drawn yellow marker strokes (docs/DESIGN.md, "Marker"). One gesture per screen; it
// draws once when it appears, then rests. Only the loading line loops.
// The SVG stretches to its box, so place and size it with className. The stroke stretches with
// it, which keeps it in proportion to the word it marks.
// (No vector-effect="non-scaling-stroke": it measures dashes in screen pixels, which breaks the
// pathLength-based drawing.)

const SHAPES = {
  // viewBox 0 0 100 10, stretched under a word
  underline: { viewBox: "0 0 100 10", d: "M2 6 C 25 3, 55 8, 98 4" },
  // viewBox 0 0 100 40, stretched around a badge or tab; the end overlaps the start
  circle: {
    viewBox: "0 0 100 40",
    d: "M60 4 C 25 0, 3 10, 4 22 C 6 36, 60 40, 90 32 C 102 27, 99 9, 70 5 L 58 7",
  },
  tick: { viewBox: "0 0 64 52", d: "M8 28 L 24 44 L 58 8" },
  wave: { viewBox: "0 0 150 22", d: "M6 13 C 22 5, 34 19, 50 11 S 78 5, 94 13 S 124 19, 144 9" },
} as const;

export type MarkerShape = keyof typeof SHAPES;

export default function Marker({
  shape,
  width = 6,
  play = "draw",
  delay = 0,
  className = "",
}: {
  shape: MarkerShape;
  width?: number; // in viewBox units: 6 on an underline 0.3em high is about 0.18em
  play?: "draw" | "loop" | "none"; // "none": already drawn
  delay?: number; // seconds before drawing starts
  className?: string;
}) {
  const { viewBox, d } = SHAPES[shape];
  return (
    <svg
      viewBox={viewBox}
      preserveAspectRatio="none"
      aria-hidden
      className={`pointer-events-none overflow-visible ${play === "none" ? "" : `marker-${play}`} ${className}`}
      style={{ "--marker-delay": `${delay}s` } as CSSProperties}
    >
      <path
        d={d}
        pathLength={1}
        className="marker-stroke"
        fill="none"
        stroke="var(--color-marker)"
        strokeWidth={width}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
