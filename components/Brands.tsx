"use client";

const logos = [
  "Acme Corp", "Quantum", "Echo", "Celestia", "Polymath", "Lumina", "Nexus",
];

export default function Brands() {
  return (
    <section className="py-10 border-y border-white/5 bg-white/[0.02]">
      <div className="max-w-7xl mx-auto px-6 mb-4 text-center">
        <p className="text-sm text-gray-400 font-medium tracking-wide uppercase">Trusted by 10,000+ modern companies</p>
      </div>

      <div className="relative flex overflow-x-hidden">
        <div className="animate-marquee whitespace-nowrap flex items-center gap-16 py-4">
          {[...logos, ...logos, ...logos].map((logo, i) => (
            <div key={i} className="text-xl font-bold text-white/40 flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-white/20" />
              {logo}
            </div>
          ))}
        </div>

        {/* Gradients to fade edges */}
        <div className="absolute top-0 bottom-0 left-0 w-32 bg-gradient-to-r from-black to-transparent pointer-events-none" />
        <div className="absolute top-0 bottom-0 right-0 w-32 bg-gradient-to-l from-black to-transparent pointer-events-none" />
      </div>
    </section>
  );
}
