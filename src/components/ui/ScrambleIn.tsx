import { useEffect, useRef, useState } from "react";
import { useInView } from "motion/react";
import { cn } from "@/lib/utils";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*<>/=+-";

function randomGlyph() {
  return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
}

function seededGlyph(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return GLYPHS[Math.floor((x - Math.floor(x)) * GLYPHS.length)];
}

/**
 * Scroll-triggered scramble reveal. Characters randomize, then resolve
 * left-to-right the first time the element enters the viewport (~25ms/char).
 * SSR-safe: renders a deterministic scramble that matches on hydration.
 */
export function ScrambleIn({
  text,
  className,
  interval = 25,
  as: Tag = "span",
}: {
  text: string;
  className?: string;
  interval?: number;
  as?: "span" | "h1" | "h2" | "h3";
}) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const [output, setOutput] = useState(() =>
    text.replace(/\S/g, (match, i) => seededGlyph(i + match.charCodeAt(0))),
  );
  const started = useRef(false);

  useEffect(() => {
    if (!inView || started.current) return;
    started.current = true;

    let revealed = 0;
    const id = window.setInterval(() => {
      revealed += 1;
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
  }, [inView, text, interval]);

  return (
    <Tag ref={ref as never} className={cn("relative inline-block", className)}>
      <span aria-hidden className="invisible">
        {text}
      </span>
      <span aria-hidden className="absolute inset-0">
        {output}
      </span>
      <span className="sr-only">{text}</span>
    </Tag>
  );
}
