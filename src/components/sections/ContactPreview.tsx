import { Reveal } from "@/components/ui/Reveal";
import { PillButton } from "@/components/ui/PillButton";
import { TiltCard } from "@/components/ui/TiltCard";
import { CinematicSection } from "@/components/ui/CinematicSection";
import { ScrambleIn } from "@/components/ui/ScrambleIn";
import { CalendarClock, LifeBuoy, Rocket } from "lucide-react";

const options = [
  {
    title: "Start a Project",
    description: "Have an idea or a brief? Let's scope it and get building.",
    icon: Rocket,
  },
  {
    title: "Schedule a Consultation",
    description: "Book a call to explore how technology can move your business forward.",
    icon: CalendarClock,
  },
  {
    title: "Contact Support",
    description: "Existing partner? Reach our team for support and maintenance.",
    icon: LifeBuoy,
  },
];

export function ContactPreview() {
  return (
    <CinematicSection className="relative overflow-hidden bg-[#050505] px-4 py-16 md:px-8">
      <div className="glow-radial pointer-events-none absolute inset-x-0 bottom-0 top-auto h-[420px] rotate-180" aria-hidden />
      <div className="relative z-10 mx-auto max-w-5xl text-center">
        <Reveal>
          <h2 className="mx-auto max-w-3xl font-light leading-[1.1] tracking-tight text-foreground [font-size:clamp(30px,5vw,52px)]">
            <ScrambleIn text="Let's Build Something Meaningful Together." />
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base text-foreground/50">
            Whether you're starting fresh or scaling up, we're ready to help you ship.
          </p>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-5 text-left sm:grid-cols-3">
          {options.map((opt, i) => (
            <Reveal key={opt.title} delay={i * 0.08} className="h-full">
              <TiltCard className="h-full" max={6}>
                <div className="h-full rounded-2xl border border-foreground/10 bg-foreground/[0.01] p-6 transition-colors duration-300 hover:border-foreground/30 hover:bg-foreground/[0.03]">
                  <opt.icon className="mb-4 h-6 w-6 text-foreground/60" />
                  <h3 className="text-lg font-medium text-foreground">{opt.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-foreground/50">{opt.description}</p>
                </div>
              </TiltCard>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.25} className="mt-12 flex justify-center">
          <PillButton to="/contact" variant="primary">
            Get in Touch
          </PillButton>
        </Reveal>
      </div>
    </CinematicSection>
  );
}
