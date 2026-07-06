import type { ReactNode } from "react";
import { Reveal } from "./Reveal";
import { ScrambleIn } from "./ScrambleIn";

type SectionHeadingProps = {
  label?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  align?: "left" | "center";
  className?: string;
};

export function SectionHeading({
  label,
  title,
  subtitle,
  align = "left",
  className = "",
}: SectionHeadingProps) {
  const alignment =
    align === "center" ? "items-center text-center mx-auto" : "items-start text-left";
  return (
    <Reveal className={`flex max-w-2xl flex-col ${alignment} ${className}`}>
      {label ? (
        <p className="mb-3 text-xs uppercase tracking-[0.2em] text-foreground/40">{label}</p>
      ) : null}
      <h2 className="font-light leading-[1.1] tracking-tight text-foreground [font-size:clamp(28px,5vw,48px)]">
        {typeof title === "string" ? <ScrambleIn text={title} /> : title}
      </h2>
      {subtitle ? (
        <p className="mt-4 max-w-xl text-base leading-relaxed text-foreground/50">{subtitle}</p>
      ) : null}
    </Reveal>
  );
}
