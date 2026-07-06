import { useRef, type ReactNode } from "react";
import {
  motion,
  useMotionTemplate,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";

/**
 * Cinematic scroll wrapper. As the section enters it rises + fades in with a
 * subtle 3D rotateX; as it exits the top it dissolves — blur up to ~10px,
 * opacity to 0, and a gentle lift. All transform/opacity/filter only.
 */
export function CinematicSection({
  children,
  className = "",
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const smooth = useSpring(scrollYProgress, { stiffness: 15, damping: 32, mass: 1.8 });

  const y = useTransform(smooth, [0, 0.18, 0.82, 1], [70, 0, 0, -70]);
  const opacity = useTransform(smooth, [0, 0.15, 0.85, 1], [0, 1, 1, 0]);
  const rotateX = useTransform(smooth, [0, 0.18, 0.82, 1], [6, 0, 0, -4]);
  const blur = useTransform(smooth, [0, 0.15, 0.85, 1], [6, 0, 0, 10]);
  const filter = useMotionTemplate`blur(${blur}px)`;

  return (
    <motion.section
      ref={ref}
      id={id}
      style={{ opacity, y, rotateX, filter, transformPerspective: 1200 }}
      className={`will-change-[transform,opacity,filter] ${className}`}
    >
      {children}
    </motion.section>
  );
}
