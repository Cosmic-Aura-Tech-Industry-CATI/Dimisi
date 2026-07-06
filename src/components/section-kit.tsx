import { useRef, type ReactNode } from "react";
import {
  motion,
  
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { ArrowRight } from "lucide-react";

/**
 * Scroll-driven parallax + blur exit, matching the Hero.
 * Applied to a section content wrapper.
 */
export function useSectionParallax(ref: React.RefObject<HTMLElement | null>) {
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  return { y, opacity };
}

type ParallaxStyle = {
  y: MotionValue<number>;
  opacity: MotionValue<number>;
};

/**
 * A full section shell with the shared parallax/blur exit wrapper.
 */
export function ParallaxSection({
  id,
  children,
  className,
}: {
  id?: string;
  children: (style: ParallaxStyle) => ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const style = useSectionParallax(ref);
  return (
    <section
      ref={ref}
      id={id}
      className={`relative w-full overflow-hidden ${className ?? ""}`}
    >
      {children(style)}
    </section>
  );
}

/**
 * Section heading whose title scrambles in when it enters the viewport.
 */
export function SectionHeading({
  label,
  title,
  subtitle,
}: {
  label?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8 }}
      className="mx-auto max-w-2xl text-center"
    >
      {label && (
        <span className="mb-4 inline-block rounded-full border border-foreground/20 px-4 py-1.5 text-xs uppercase tracking-widest text-foreground/70">
          {label}
        </span>
      )}
      <h2 className="font-display text-foreground font-light text-[clamp(28px,4.5vw,48px)] leading-[1.1] tracking-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="mx-auto mt-4 max-w-xl text-base text-foreground/50 sm:text-lg">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}

/**
 * Interactive tilt card: rotateX/rotateY from cursor position (max 8deg),
 * springed, with a subtle whileHover scale.
 */
export function TiltCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springX = useSpring(rotateX, { stiffness: 200, damping: 20 });
  const springY = useSpring(rotateY, { stiffness: 200, damping: 20 });

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    rotateY.set(px * 16); // px in [-0.5, 0.5] -> ±8deg
    rotateX.set(-py * 16);
  };

  const handleLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      whileHover={{ scale: 1.02 }}
      style={{
        rotateX: springX,
        rotateY: springY,
        transformPerspective: 900,
        transformStyle: "preserve-3d",
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Solid white pill button with sliding arrow.
 */
export function PrimaryButton({
  children,
  onClick,
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
}) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="group flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground"
    >
      {children}
      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
    </motion.button>
  );
}

/**
 * Outlined pill button that inverts on hover, with sliding arrow.
 */
export function OutlineButton({
  children,
  onClick,
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
}) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="group flex items-center gap-2 rounded-full border border-foreground/30 px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
    >
      {children}
      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
    </motion.button>
  );
}
