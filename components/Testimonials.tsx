"use client";

const highlights = [
  {
    title: "Modern UI/UX",
    text: "Clean, modern and high-converting digital experiences."
  },
  {
    title: "Fast Development",
    text: "Quick delivery with scalable and optimized architecture."
  },
  {
    title: "Startup Friendly",
    text: "Affordable and flexible solutions for growing businesses."
  },
  {
    title: "End-to-End Support",
    text: "From idea to deployment and maintenance."
  }
];

export default function WhyChooseUs() {
  return (
    <section className="py-24 relative overflow-hidden bg-grid">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Heading */}
        <div className="text-center mb-16">
          <p className="text-blue-400 text-sm font-semibold mb-3 tracking-wider uppercase">
            Why Choose Us
          </p>

          <h2 className="text-3xl md:text-5xl font-bold leading-tight">
            Why Businesses Choose DIMISI
          </h2>

          <p className="text-muted mt-5 max-w-2xl mx-auto text-base md:text-lg">
            We create modern digital solutions focused on performance,
            scalability, and business growth.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {highlights.map((item, i) => (
            <div
              key={i}
              className="glass rounded-3xl p-8 border border-[var(--glass-border)]
              bg-[var(--glass-bg)] transition-all duration-500
              hover:scale-[1.03] hover:border-blue-500/40
              hover:shadow-2xl hover:shadow-blue-500/10 group"
            >
              {/* Number */}
              <div
                className="w-12 h-12 rounded-2xl mb-6
                bg-gradient-to-tr from-blue-600 to-purple-600
                flex items-center justify-center
                text-lg font-bold text-white
                shadow-lg shadow-blue-500/20"
              >
                0{i + 1}
              </div>

              {/* Title */}
              <h3
                className="text-xl font-bold mb-4
                group-hover:text-blue-400 transition-colors duration-300"
              >
                {item.title}
              </h3>

              {/* Text */}
              <p className="text-muted leading-relaxed text-sm md:text-base">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}