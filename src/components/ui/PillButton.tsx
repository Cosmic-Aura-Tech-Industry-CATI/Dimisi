import { Link, type LinkProps } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

type Variant = "primary" | "secondary";

const base =
  "group relative inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium tracking-tight transition-colors duration-300";

const variants: Record<Variant, string> = {
  primary: "bg-primary text-primary-foreground hover:bg-foreground/90",
  secondary: "border border-foreground/30 text-foreground hover:bg-primary hover:text-primary-foreground",
};

const glow: Record<Variant, string> = {
  primary: "0 0 30px 0 rgba(255,255,255,0.35)",
  secondary: "0 0 26px 0 rgba(255,255,255,0.18)",
};

type PillButtonProps = {
  children: ReactNode;
  variant?: Variant;
  withArrow?: boolean;
  className?: string;
} & LinkProps;

export function PillButton({
  children,
  variant = "primary",
  withArrow = true,
  className = "",
  ...linkProps
}: PillButtonProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -1, boxShadow: glow[variant] }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 24 }}
      className="inline-flex rounded-full"
    >
      <Link className={`${base} ${variants[variant]} overflow-hidden ${className}`} {...linkProps}>
        {/* light sweep */}
        <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />
        <span className="relative z-10 inline-flex items-center gap-2">
          {children}
          {withArrow ? (
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          ) : null}
        </span>
      </Link>
    </motion.div>
  );
}
