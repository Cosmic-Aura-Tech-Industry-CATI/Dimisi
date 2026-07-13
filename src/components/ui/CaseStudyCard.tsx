import type { CaseStudy } from "@/lib/site-data";
import { TiltCard } from "./TiltCard";
import { ArrowRight } from "lucide-react";

const rows: { key: keyof CaseStudy; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "challenge", label: "Challenge" },
  { key: "solution", label: "Solution" },
  { key: "outcome", label: "Outcome" },
];

export function CaseStudyCard({ study }: { study: CaseStudy }) {
  return (
    <TiltCard className="h-full">
      <div className="flex h-full flex-col rounded-2xl border border-foreground/10 bg-foreground/[0.01] p-6 transition-colors duration-300 hover:border-foreground/30 hover:bg-foreground/[0.03]">
        <p className="text-xs uppercase tracking-[0.2em] text-foreground/40">{study.category}</p>
        <h3 className="mt-3 text-xl font-light text-foreground">{study.title}</h3>
        <div className="mt-5 space-y-4 border-t border-foreground/10 pt-5">
          {rows.map((row) => (
            <div key={row.key}>
              <p className="text-[11px] uppercase tracking-wider text-foreground/40">{row.label}</p>
              <p className="mt-1 text-sm leading-relaxed text-foreground/60">{study[row.key]}</p>
            </div>
          ))}
        </div>
        <a
          href={study.websiteUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-flex items-center gap-2 self-start rounded-full border border-foreground/20 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
        >
          Visit Website
          <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </TiltCard>
  );
}
