import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PillButton } from "@/components/ui/PillButton";
import { TiltCard } from "@/components/ui/TiltCard";
import { CinematicSection } from "@/components/ui/CinematicSection";
import { services } from "@/lib/site-data";
import { Link } from "@tanstack/react-router";

export function ServicesSection() {
  return (
    <CinematicSection className="bg-[#050505] px-4 py-16 md:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          label="What We Do"
          title="End-to-End Technology Services"
          subtitle="From concept to deployment, we build scalable solutions across every layer of your business."
        />

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, i) => (
            <Reveal key={service.slug} delay={(i % 3) * 0.06} className="h-full">
              <TiltCard className="h-full">
                <Link
                  to="/services"
                  className="flex h-full flex-col rounded-xl border border-foreground/10 bg-foreground/[0.01] p-6 transition-colors duration-300 hover:border-foreground/30 hover:bg-foreground/[0.03]"
                >
                  <service.icon className="mb-4 h-6 w-6 text-foreground/60 transition-colors group-hover/tilt:text-foreground/80" />
                  <h3 className="mb-2 text-lg font-medium text-foreground">{service.title}</h3>
                  <p className="text-sm leading-relaxed text-foreground/50">{service.description}</p>
                </Link>
              </TiltCard>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2} className="mt-16 flex justify-center">
          <PillButton to="/services" variant="secondary">
            View All Services
          </PillButton>
        </Reveal>
      </div>
    </CinematicSection>
  );
}
