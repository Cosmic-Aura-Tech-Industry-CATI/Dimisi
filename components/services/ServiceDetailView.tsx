import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Layers,
  ServerCog,
  Sparkles,
} from "lucide-react";
import { ServiceProfile } from "@/app/services/_service-data";

const ACCENT_STYLES = {
  blue: {
    badge: "bg-blue-500/10 text-blue-500",
    iconBg: "bg-blue-500/10 text-blue-500",
    chip: "border-blue-500/35 text-blue-500",
  },
  emerald: {
    badge: "bg-emerald-500/10 text-emerald-500",
    iconBg: "bg-emerald-500/10 text-emerald-500",
    chip: "border-emerald-500/35 text-emerald-500",
  },
  amber: {
    badge: "bg-amber-500/10 text-amber-500",
    iconBg: "bg-amber-500/10 text-amber-500",
    chip: "border-amber-500/35 text-amber-500",
  },
} as const;

function FocusCards({ profile }: { profile: ServiceProfile }) {
  const accent = ACCENT_STYLES[profile.accent];
  const icons = [Layers, ServerCog, BarChart3];

  return (
    <section className="mt-12 md:mt-14 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
      {profile.focusAreas.map((item, index) => {
        const Icon = icons[index % icons.length];

        return (
          <article key={item} className="glass border border-border rounded-2xl p-5 sm:p-6">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${accent.iconBg}`}>
              <Icon size={20} />
            </div>
            <h2 className="text-xl font-semibold mb-2">{item}</h2>
            <p className="text-sm sm:text-base text-muted leading-relaxed">
              Structured delivery approach tailored for {item.toLowerCase()} with measurable outcomes.
            </p>
          </article>
        );
      })}
    </section>
  );
}

function ProcessPanel({ profile }: { profile: ServiceProfile }) {
  return (
    <article className="glass border border-border rounded-2xl sm:rounded-3xl p-6 sm:p-8">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6">Delivery workflow</h2>
      <div className="space-y-5">
        {profile.process.map((item) => (
          <div key={item.step} className="grid grid-cols-[52px_1fr] gap-3 sm:gap-4">
            <div className="text-blue-500 font-bold text-lg sm:text-xl">{item.step}</div>
            <div>
              <h3 className="text-lg sm:text-xl font-semibold mb-1">{item.title}</h3>
              <p className="text-sm sm:text-base text-muted leading-relaxed">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}

function DeliverablesPanel({ profile }: { profile: ServiceProfile }) {
  return (
    <article className="glass border border-border rounded-2xl sm:rounded-3xl p-6 sm:p-8">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6">Scope highlights</h2>
      <ul className="space-y-4">
        {profile.deliverables.map((item) => (
          <li key={item} className="flex items-start gap-3">
            <CheckCircle2 size={18} className="text-blue-500 mt-1" />
            <span className="text-sm sm:text-base text-muted leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

function StackPanel({ profile }: { profile: ServiceProfile }) {
  return (
    <article className="glass border border-border rounded-2xl sm:rounded-3xl p-6 sm:p-8">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6">Technology and tools</h2>
      <div className="flex flex-wrap gap-2.5 mb-6">
        {profile.stack.map((item) => (
          <span key={item} className="px-3 py-1.5 rounded-full text-sm border border-border bg-foreground/5">
            {item}
          </span>
        ))}
      </div>
      <p className="text-sm sm:text-base text-muted leading-relaxed">
        Stack selection is adjusted to your business context, team capability, compliance needs, and operational constraints.
      </p>
    </article>
  );
}

function OutcomePanel({ profile }: { profile: ServiceProfile }) {
  const accent = ACCENT_STYLES[profile.accent];

  return (
    <article className="glass border border-border rounded-2xl sm:rounded-3xl p-6 sm:p-8">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6">Expected outcomes</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {profile.outcomes.map((item) => (
          <div key={item} className={`rounded-xl border px-4 py-3 text-sm sm:text-base font-medium ${accent.chip}`}>
            {item}
          </div>
        ))}
      </div>
      <h3 className="text-xl font-semibold mt-8 mb-3">Engagement options</h3>
      <ul className="space-y-2">
        {profile.engagement.map((item) => (
          <li key={item} className="text-sm sm:text-base text-muted leading-relaxed">• {item}</li>
        ))}
      </ul>
    </article>
  );
}

function HeroSplit({ profile }: { profile: ServiceProfile }) {
  const accent = ACCENT_STYLES[profile.accent];

  return (
    <section className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-8 lg:gap-12 items-center">
      <div>
        <p className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs sm:text-sm font-semibold tracking-wide mb-5 ${accent.badge}`}>
          <Sparkles size={16} /> {profile.badge}
        </p>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-5">{profile.title}</h1>
        <p className="text-base sm:text-lg text-muted leading-relaxed max-w-2xl mb-8">{profile.summary}</p>
        <div className="flex flex-wrap gap-3 sm:gap-4">
          <Link href="/contact" className="btn-primary rounded-xl sm:rounded-2xl px-5 sm:px-7 py-3 font-semibold inline-flex items-center gap-2">
            Book a Consultation <ArrowRight size={18} />
          </Link>
          <Link href="/services" className="glass rounded-xl sm:rounded-2xl px-5 sm:px-7 py-3 font-semibold border border-border inline-flex items-center gap-2">
            Back to Services
          </Link>
        </div>
      </div>

      <article className="glass border border-border rounded-2xl sm:rounded-3xl overflow-hidden">
        <Image src={profile.heroImage} alt={`${profile.title} service presentation`} width={1200} height={900} className="w-full h-[260px] sm:h-[320px] lg:h-[380px] object-cover" priority />
      </article>
    </section>
  );
}

function HeroBanner({ profile }: { profile: ServiceProfile }) {
  const accent = ACCENT_STYLES[profile.accent];

  return (
    <section className="glass border border-border rounded-2xl sm:rounded-3xl overflow-hidden">
      <div className="relative h-[250px] sm:h-[320px] lg:h-[390px]">
        <Image src={profile.heroImage} alt={`${profile.title} banner`} fill className="object-cover" priority />
        <div className="absolute inset-0 bg-black/45" />
        <div className="absolute inset-0 p-6 sm:p-10 lg:p-12 flex flex-col justify-end">
          <p className={`inline-flex w-fit items-center gap-2 rounded-full px-4 py-1.5 text-xs sm:text-sm font-semibold tracking-wide mb-4 ${accent.badge}`}>
            <Sparkles size={16} /> {profile.badge}
          </p>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white mb-3">{profile.title}</h1>
          <p className="text-sm sm:text-lg text-white/85 max-w-3xl">{profile.summary}</p>
        </div>
      </div>
      <div className="p-5 sm:p-8 flex flex-wrap gap-3 sm:gap-4">
        <Link href="/contact" className="btn-primary rounded-xl sm:rounded-2xl px-5 sm:px-7 py-3 font-semibold inline-flex items-center gap-2">
          Start Discussion <ArrowRight size={18} />
        </Link>
        <Link href="/services" className="glass rounded-xl sm:rounded-2xl px-5 sm:px-7 py-3 font-semibold border border-border inline-flex items-center gap-2">
          <ArrowLeft size={16} /> Services Overview
        </Link>
      </div>
    </section>
  );
}

function HeroMatrix({ profile }: { profile: ServiceProfile }) {
  const accent = ACCENT_STYLES[profile.accent];

  return (
    <section>
      <div className="text-center max-w-4xl mx-auto">
        <p className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs sm:text-sm font-semibold tracking-wide mb-5 ${accent.badge}`}>
          <Sparkles size={16} /> {profile.badge}
        </p>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-5">{profile.title}</h1>
        <p className="text-base sm:text-lg text-muted leading-relaxed">{profile.summary}</p>
      </div>
      <div className="mt-8 sm:mt-10 grid grid-cols-1 lg:grid-cols-[1.3fr_0.7fr] gap-5 sm:gap-6">
        <article className="glass border border-border rounded-2xl sm:rounded-3xl overflow-hidden">
          <Image src={profile.heroImage} alt={`${profile.title} feature visual`} width={1200} height={900} className="w-full h-[260px] sm:h-[320px] object-cover" priority />
        </article>
        <article className="glass border border-border rounded-2xl sm:rounded-3xl p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-bold mb-4">Strategic fit</h2>
          <p className="text-sm sm:text-base text-muted leading-relaxed mb-6">
            This service is structured for teams that need measurable progress, risk control, and sustainable execution.
          </p>
          <div className="flex flex-col gap-2.5">
            {profile.outcomes.map((item) => (
              <div key={item} className={`rounded-xl border px-3 py-2 text-sm ${accent.chip}`}>
                {item}
              </div>
            ))}
          </div>
        </article>
      </div>
      <div className="mt-6 sm:mt-8 flex flex-wrap justify-center gap-3 sm:gap-4">
        <Link href="/contact" className="btn-primary rounded-xl sm:rounded-2xl px-5 sm:px-7 py-3 font-semibold inline-flex items-center gap-2">
          Talk to Our Team <ArrowRight size={18} />
        </Link>
        <Link href="/services" className="glass rounded-xl sm:rounded-2xl px-5 sm:px-7 py-3 font-semibold border border-border inline-flex items-center gap-2">
          Browse Services
        </Link>
      </div>
    </section>
  );
}

export default function ServiceDetailView({ profile }: { profile: ServiceProfile }) {
  return (
    <main className="pt-32 md:pt-36 pb-20 md:pb-24 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {profile.variant === "split" && <HeroSplit profile={profile} />}
        {profile.variant === "banner" && <HeroBanner profile={profile} />}
        {profile.variant === "matrix" && <HeroMatrix profile={profile} />}

        <FocusCards profile={profile} />

        {profile.variant === "split" && (
          <section className="mt-16 md:mt-20 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <DeliverablesPanel profile={profile} />
            <ProcessPanel profile={profile} />
          </section>
        )}

        {profile.variant === "banner" && (
          <section className="mt-16 md:mt-20 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <StackPanel profile={profile} />
            <OutcomePanel profile={profile} />
          </section>
        )}

        {profile.variant === "matrix" && (
          <section className="mt-16 md:mt-20 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ProcessPanel profile={profile} />
            <DeliverablesPanel profile={profile} />
          </section>
        )}

        <section className="mt-16 md:mt-20 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {profile.variant !== "banner" && <StackPanel profile={profile} />}
          {profile.variant !== "banner" && <OutcomePanel profile={profile} />}
          {profile.variant === "banner" && <ProcessPanel profile={profile} />}
          {profile.variant === "banner" && <DeliverablesPanel profile={profile} />}
        </section>

        <section className="mt-16 md:mt-20">
          <article className="glass border border-border rounded-2xl sm:rounded-3xl p-6 sm:p-10 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">{profile.ctaTitle}</h2>
            <p className="text-base sm:text-lg text-muted leading-relaxed max-w-3xl mx-auto mb-7">{profile.ctaText}</p>
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
              <Link href="/contact" className="btn-primary rounded-xl sm:rounded-2xl px-5 sm:px-8 py-3 font-semibold inline-flex items-center gap-2">
                Book Consultation <ArrowRight size={18} />
              </Link>
              <Link href="/support" className="glass rounded-xl sm:rounded-2xl px-5 sm:px-8 py-3 font-semibold border border-border inline-flex items-center gap-2">
                Support & Maintenance
              </Link>
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}
