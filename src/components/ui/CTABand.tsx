import type { ReactNode } from "react";
import { Reveal } from "./Reveal";

type CTABandProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export function CTABand({ title, subtitle, children }: CTABandProps) {
  return (
    <section className="px-4 py-24 md:px-8">
      <Reveal className="mx-auto max-w-4xl rounded-3xl border border-foreground/10 bg-foreground/[0.02] px-8 py-16 text-center md:px-16">
        <h2
          style={{ fontFamily: '"Angsana New", "Angsana New Web", serif' }}
          className="mx-auto max-w-2xl font-light leading-[1.1] tracking-tight text-foreground [font-size:clamp(28px,4vw,44px)]"
        >
          {title}
        </h2>
        {subtitle ? (
          <p className="mx-auto mt-4 max-w-xl text-base text-foreground/50">{subtitle}</p>
        ) : null}
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          {children}
        </div>
      </Reveal>
    </section>
  );
}