"use client";

import { motion } from "framer-motion";

export default function AboutPage() {
  return (
    <main className="pt-40 pb-24 min-h-screen relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 z-10 relative">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.6 }}
           className="mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-6">Who We Are</h1>
          <p className="text-xl text-muted max-w-3xl leading-relaxed">
            DIMIISI is a forward-thinking technology partner dedicated to helping businesses navigate the complexities of digital evolution.
            From startups to global enterprises, we provide the insights, products, and services that drive forward momentum.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-20">
          <div className="glass p-10 rounded-3xl border border-border">
            <h2 className="text-3xl font-bold mb-4">Our Vision</h2>
            <p className="text-muted leading-relaxed">
              To empower every business with advanced AI and software engineering that feels intuitive and yields measurable results.
            </p>
          </div>
          <div className="glass p-10 rounded-3xl border border-border">
            <h2 className="text-3xl font-bold mb-4">Our Commitment</h2>
            <p className="text-muted leading-relaxed">
              Excellence in code, transparency in strategy, and a relentless focus on creating high-conversion user experiences.
            </p>
          </div>
        </div>
      </div>

      {/* Decorative Blur */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[150px] -z-10" />
    </main>
  );
}
