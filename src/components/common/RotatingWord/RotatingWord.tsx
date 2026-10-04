import { useEffect, useRef, useState } from "react";
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
  const exitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ============================================================================
  // CLEANER FUNCTION: WORD ROTATION TIMER & TIMEOUT TEARDOWN
  // WHY THIS IS USED:
  // 1. Cycles words on a configurable interval (intervalMs).
  // 2. Uses a 300ms transition timeout for fluid CSS fade-out/fade-in.
  // 3. The cleaner function cancels both the recurring setInterval AND any pending
  //    setTimeout or requestAnimationFrame, preventing 'state update on unmounted component'
  //    when user navigates away from the Hero section.
  // ============================================================================
  useEffect(() => {
    if (!words || words.length <= 1) return;

    let isMounted = true;

    const timer = setInterval(() => {
      if (!isMounted) return;
      // 1. Trigger exit animation
      setAnimState("exit");

      exitTimeoutRef.current = setTimeout(() => {
        if (!isMounted) return;
        // 2. Increment index and position next word below view
        setCurrentIndex((prev) => (prev + 1) % words.length);
        setAnimState("enter");

        // 3. Trigger transition into visible state
        requestAnimationFrame(() => {
          if (!isMounted) return;
          requestAnimationFrame(() => {
            if (!isMounted) return;
            setAnimState("visible");
          });
        });
      }, 300);
    }, intervalMs);

    return () => {
      isMounted = false;
      clearInterval(timer);
      if (exitTimeoutRef.current) {
        clearTimeout(exitTimeoutRef.current);
      }
    };
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
