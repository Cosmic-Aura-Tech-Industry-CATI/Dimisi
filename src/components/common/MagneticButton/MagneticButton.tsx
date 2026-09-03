import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { useMagnetic } from "@/hooks/useMagnetic";
import styles from "./MagneticButton.module.css";

interface MagneticButtonProps {
  children: ReactNode;
  to?: string;
  href?: string;
  onClick?: () => void;
  variant?: "solid" | "ghost";
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
}

export function MagneticButton({
  children,
  to,
  href,
  onClick,
  variant = "solid",
  type = "button",
  disabled = false,
  className,
}: MagneticButtonProps) {
  const ref = useMagnetic<HTMLSpanElement>(0.25);
  const cls = [styles.btn, styles[variant], className].filter(Boolean).join(" ");

  const inner = (
    <span className={styles.inner} ref={ref}>
      <span className={styles.label}>{children}</span>
      <span className={styles.ripple} aria-hidden="true" />
    </span>
  );

  if (to) {
    return (
      <Link to={to} className={cls}>
        {inner}
      </Link>
    );
  }
  if (href) {
    return (
      <a href={href} className={cls} target="_blank" rel="noreferrer">
        {inner}
      </a>
    );
  }
  return (
    <button type={type} className={cls} onClick={onClick} disabled={disabled}>
      {inner}
    </button>
  );
}