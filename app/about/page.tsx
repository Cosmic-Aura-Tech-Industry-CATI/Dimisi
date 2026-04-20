"use client";

import { motion } from "framer-motion";

export default function AboutPage() {
  return (
    <main className="pt-40 pb-24 min-h-screen relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">

        {/* HERO */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-20"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            We Turn Businesses Into <span className="text-blue-500">Digital Engines</span>
          </h1>

          <p className="text-xl text-muted max-w-3xl leading-relaxed">
            DIMISI Technologies Pvt. Ltd. helps businesses move beyond traditional operations
            and step into scalable, technology-driven growth. We build systems that don’t just run—
            they generate results.
          </p>

          {/* Micro Interaction CTA */}
        </motion.div>

        {/* BUSINESS IMPACT SECTION */}
        <div className="grid md:grid-cols-3 gap-8 mb-24">
          {[
            { title: "Increase Revenue", desc: "Digital systems designed to convert and scale your business." },
            { title: "Automate Operations", desc: "Reduce manual work with AI-driven workflows and tools." },
            { title: "Build Brand Authority", desc: "Create a strong digital presence that builds trust and reach." }
          ].map((item, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -8 }}
              className="glass p-8 rounded-2xl border border-border transition"
            >
              <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
              <p className="text-muted">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* HOW WE THINK */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-24">
          <motion.div
            whileInView={{ opacity: 1, x: 0 }}
            initial={{ opacity: 0, x: -40 }}
            className="glass p-10 rounded-3xl border border-border"
          >
            <h2 className="text-3xl font-bold mb-4">Our Approach</h2>
            <p className="text-muted leading-relaxed">
              We think like business owners, not just developers. Every solution is aligned
              with a clear objective—growth, efficiency, or scalability.
            </p>

            <ul className="mt-6 space-y-3 text-muted">
              <li>→ Strategy-first development</li>
              <li>→ Scalable architecture</li>
              <li>→ Real-world product mindset</li>
            </ul>
          </motion.div>

          <motion.div
            whileInView={{ opacity: 1, x: 0 }}
            initial={{ opacity: 0, x: 40 }}
            className="glass p-10 rounded-3xl border border-border"
          >
            <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
            <p className="text-muted leading-relaxed">
              To empower local and growing businesses with technology that creates measurable
              impact—not just digital presence.
            </p>

            <ul className="mt-6 space-y-3 text-muted">
              <li>→ Bridge offline to online gap</li>
              <li>→ Enable smarter operations</li>
              <li>→ Unlock scalable growth</li>
            </ul>
          </motion.div>
        </div>

        {/* PROCESS (INTERACTIVE FLOW) */}
        <div className="mb-24">
          <h2 className="text-3xl font-bold mb-12">How We Work</h2>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              "Understand Your Business",
              "Design Strategy & System",
              "Build & Launch",
              "Scale & Optimize"
            ].map((step, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05 }}
                className="p-6 rounded-2xl border border-border glass text-center"
              >
                <div className="text-2xl font-bold mb-2">0{i + 1}</div>
                <p className="text-muted">{step}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* WHY DIMISI */}
        <div className="max-w-4xl mb-24">
          <h2 className="text-3xl font-bold mb-6">Why Businesses Choose DIMISI</h2>

          <p className="text-muted leading-relaxed mb-4">
            Most IT companies deliver features. We deliver outcomes. Our focus is not just
            on building software, but on creating systems that directly impact your business growth.
          </p>

          <p className="text-muted leading-relaxed">
            With a deep understanding of both local markets and modern technologies, we position
            your business to compete not just locally—but globally.
          </p>
        </div>

        {/* FINAL CTA */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Transform Your Business?
          </h2>
          <p className="text-muted mb-6">
            Let’s build something that actually drives results.
          </p>
        </div>
      </div>

      {/* Background Effect */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[150px] -z-10" />
    </main>
  );
}