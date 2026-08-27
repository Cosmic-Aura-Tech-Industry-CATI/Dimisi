import { useEffect, useState } from "react";
import styles from "./RotatingWord.module.css";

interface RotatingWordProps {
  words: string[];
  intervalMs?: number;
  className?: string;
}

/** Smooth cycling rotating word component with fade-out / fade-in animation */
export function RotatingWord({
  words,
  intervalMs = 2800,
  className,
}: RotatingWordProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animState, setAnimState] = useState<"visible" | "exit" | "enter">("visible");

  useEffect(() => {
    if (!words || words.length <= 1) return;

    const timer = setInterval(() => {
      // 1. Trigger exit animation
      setAnimState("exit");

      const exitTimeout = setTimeout(() => {
        // 2. Increment index and position next word below view
        setCurrentIndex((prev) => (prev + 1) % words.length);
        setAnimState("enter");

        // 3. Trigger transition into visible state
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setAnimState("visible");
          });
        });
      }, 300);

      return () => clearTimeout(exitTimeout);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [words, intervalMs]);

  if (!words || words.length === 0) return null;

  return (
    <span
      className={[
        styles.rotatingWord,
        styles[animState],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-live="polite"
    >
      {words[currentIndex]}
    </span>
  );
}
