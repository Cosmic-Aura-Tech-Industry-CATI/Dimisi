"use client";

const products = [
  "Kalesh",
  "Some",
  "Karyon",
  "Stylon",
  "Cypher",
];

export default function Brands() {
  return (
    <section className="py-10 border-y border-[var(--border)] bg-[var(--glass-bg)]">
      <div className="max-w-7xl mx-auto px-6 mb-4 text-center">
        <p className="text-sm text-muted font-medium tracking-wide uppercase">
          Our Upcoming Products
        </p>
      </div>

      <div className="relative flex overflow-x-hidden">
        <div className="animate-marquee whitespace-nowrap flex items-center gap-16 py-4">
          {[...products, ...products, ...products].map((product, i) => (
            <div
              key={i}
              className="text-xl font-bold text-[var(--muted)]/80 flex items-center gap-2 transition-all duration-300 hover:text-white hover:scale-105"
            >
              <div className="w-6 h-6 rounded-full bg-[var(--glass-border)] border border-[var(--border)]" />
              {product}
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