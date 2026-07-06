import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*<>/=+-";

function randomGlyph() {
  return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
}

function seededGlyph(seed: number) {
  // Simple deterministic pseudo-random so the initial SSR and client render match.
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return GLYPHS[Math.floor((x - Math.floor(x)) * GLYPHS.length)];
}

/**
 * Characters randomize, then resolve left-to-right on mount.
 * A hidden copy of the final text preserves layout so there's no reflow jitter.
 */
export function ScrambleText({
  text,
  className,
  interval = 25,
}: {
  text: string;
  className?: string;
  interval?: number;
}) {
  const [output, setOutput] = useState(() =>
    text.replace(/\S/g, (match, i) => seededGlyph(i + match.charCodeAt(0))),
  );
  const frameRef = useRef(0);

  useEffect(() => {
    frameRef.current = 0;
    const id = window.setInterval(() => {
      frameRef.current += 1;
      const revealed = frameRef.current;

      const next = text
        .split("")
        .map((ch, i) => {
          if (ch === " " || ch === "\n") return ch;
          if (i < revealed) return ch;
          return randomGlyph();
        })
        .join("");

      setOutput(next);

      if (revealed >= text.length) {
        window.clearInterval(id);
        setOutput(text);
      }
    }, interval);

    return () => window.clearInterval(id);
  }, [text, interval]);

  return (
    <span className={cn("relative inline-block", className)}>
      <span aria-hidden className="invisible">
        {text}
      </span>
      <span aria-hidden className="absolute inset-0">
        {output}
      </span>
      <span className="sr-only">{text}</span>
    </span>
  );
}
