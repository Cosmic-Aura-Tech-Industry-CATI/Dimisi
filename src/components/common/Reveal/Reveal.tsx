import { useEffect, useRef, useState, type ReactNode } from "react";
import styles from "./Reveal.module.css";

type RevealVariant =
  | "up"
  | "fade"
  | "scale"
  | "blur"
  | "left"
  | "right"
  | "tiltUp"
  | "tiltDown"
  | "zoom"
  | "swing"
  | "warp"
  | "warpLeft"
  | "warpRight";

interface RevealProps {
  children: ReactNode;
  delay?: number;
  variant?: RevealVariant;
  className?: string;
}

/** Smooth, instant entrance reveal for elements when they enter viewport */
export function Reveal({ children, delay = 0, className }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }

    let timer = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          if (delay > 0) {
            timer = window.setTimeout(() => setVisible(true), delay);
          } else {
            setVisible(true);
          }
          io.disconnect();
        }
      },
      { threshold: 0.02, rootMargin: "0px 0px 50px 0px" },
    );
    io.observe(el);

    return () => {
      io.disconnect();
      if (timer) clearTimeout(timer);
    };
  }, [delay]);

  return (
    <div
      ref={ref}
      className={[styles.reveal, visible && styles.visible, className].filter(Boolean).join(" ")}
    >
      {children}
    </div>
  );
}
