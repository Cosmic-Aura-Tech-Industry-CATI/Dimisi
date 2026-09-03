import { useMemo } from "react";
import { useReveal } from "@/hooks/useReveal";
import styles from "./SplitText.module.css";

interface SplitTextProps {
  text: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  mode?: "word" | "char";
  className?: string;
  delay?: number;
}

/** Word/character reveal animation used for every cinematic headline. */
export function SplitText({ text, as = "h2", mode = "word", className, delay = 0 }: SplitTextProps) {
  const Tag = as;
  const ref = useReveal<HTMLElement>(styles.visible, 0.25);

  const tokens = useMemo(
    () => (mode === "word" ? text.split(" ") : Array.from(text)),
    [text, mode],
  );

  return (
    <Tag
      ref={ref as never}
      className={[styles.split, className].filter(Boolean).join(" ")}
      aria-label={text}
    >
      {tokens.map((token, i) => (
        <span className={styles.mask} key={`${token}-${i}`} aria-hidden="true">
          <span
            className={styles.token}
            style={{ transitionDelay: `${delay + i * (mode === "word" ? 60 : 24)}ms` }}
          >
            {token === " " ? "\u00a0" : token}
          </span>
          {mode === "word" ? "\u00a0" : null}
        </span>
      ))}
    </Tag>
  );
}