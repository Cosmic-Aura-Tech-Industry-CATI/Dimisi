"use client";

const logos = [
  "Acme Corp", "Quantum", "Echo", "Celestia", "Polymath", "Lumina", "Nexus",
];

export default function Brands() {
  return (
    <section className="py-10 border-y border-[var(--border)] bg-[var(--glass-bg)]">
      <div className="max-w-7xl mx-auto px-6 mb-4 text-center">
        <p className="text-sm text-muted font-medium tracking-wide uppercase">Trusted by 10,000+ modern companies</p>
      </div>

      <div className="relative flex overflow-x-hidden">
        <div className="animate-marquee whitespace-nowrap flex items-center gap-16 py-4">
          {[...logos, ...logos, ...logos].map((logo, i) => (
            <div key={i} className="text-xl font-bold text-[var(--muted)]/80 flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[var(--glass-border)] border border-[var(--border)]" />
              {logo}
            </div>
          ))}
        </div>

        {/* Gradients to fade edges */}
        <div className="absolute top-0 bottom-0 left-0 w-32 bg-gradient-to-r from-[var(--background)] to-transparent pointer-events-none" />
        <div className="absolute top-0 bottom-0 right-0 w-32 bg-gradient-to-l from-[var(--background)] to-transparent pointer-events-none" />
      </div>
    </section>
  );
}
