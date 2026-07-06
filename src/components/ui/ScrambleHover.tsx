import { useRef, useState } from "react";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*<>/=+-";

function randomGlyph() {
  return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
}

/**
 * Scrambles its text on hover, then resolves left-to-right.
 * Renders inline; layout is preserved by the real (visible) text.
 */
export function ScrambleHover({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  const [output, setOutput] = useState(text);
  const timer = useRef<number | null>(null);

  function start() {
    if (timer.current) window.clearInterval(timer.current);
    let revealed = 0;
    timer.current = window.setInterval(() => {
      revealed += 1;
      setOutput(
        text
          .split("")
          .map((ch, i) => (ch === " " ? ch : i < revealed ? ch : randomGlyph()))
          .join(""),
      );
      if (revealed >= text.length) {
        if (timer.current) window.clearInterval(timer.current);
        setOutput(text);
      }
    }, 28);
  }

  function stop() {
    if (timer.current) window.clearInterval(timer.current);
    setOutput(text);
  }

  return (
    <span onMouseEnter={start} onMouseLeave={stop} className={className}>
      {output}
    </span>
  );
}
