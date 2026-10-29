import Marker from "./Marker";

// The TeachingTime name: a dark "T" tile with a yellow letter (same as app/icon.svg), and
// "Teaching" underlined by the marker. `underline`: "draw" animates it, "still" shows it drawn,
// "none" leaves it out where the screen has its own marker gesture (one per screen).
export default function Wordmark({
  size = "md",
  underline = "still",
}: {
  size?: "sm" | "md" | "lg";
  underline?: "draw" | "still" | "none";
}) {
  const sizes = {
    sm: { text: "text-base", tile: "h-5 w-5 text-xs rounded-[5px]" },
    md: { text: "text-xl", tile: "h-6 w-6 text-sm rounded-md" },
    lg: { text: "text-3xl", tile: "h-9 w-9 text-xl rounded-lg" },
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-2 font-display font-extrabold tracking-tight text-ink ${sizes.text}`}
    >
      <span aria-hidden className={`grid place-items-center bg-ink text-marker ${sizes.tile}`}>
        T
      </span>
      <span>
        {/* isolate + -z-10: the stroke sits behind the letters (the "g" descender) but stays
            above the panel background. */}
        <span className="relative isolate inline-block">
          Teaching
          {underline !== "none" && (
            <Marker
              shape="underline"
              play={underline === "draw" ? "draw" : "none"}
              delay={0.2}
              className="absolute -bottom-[0.2em] -left-[3%] -z-10 h-[0.3em] w-[106%]"
            />
          )}
        </span>
        Time
      </span>
    </span>
  );
}
