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
            DIMISI Technologies Pvt. Ltd. is a Kanpur-based, registered IT company focused on building scalable digital solutions for businesses, startups, and institutions. 
            We specialize in web and mobile application development, AI-driven automation, custom software systems, cloud infrastructure, and digital marketing.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-20">
          <div className="glass p-10 rounded-3xl border border-border">
            <h2 className="text-3xl font-bold mb-4">Our Approach</h2>
            <p className="text-muted leading-relaxed">
              With a product-driven approach, we not only deliver client solutions but also develop our own platforms, 
              demonstrating strong capabilities in building real-world, scalable systems.
            </p>
          </div>
          <div className="glass p-10 rounded-3xl border border-border">
            <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
            <p className="text-muted leading-relaxed">
              We help businesses transition into efficient, technology-enabled operations through structured development, 
              modern architecture, and continuous support.
            </p>
          </div>
        </div>
      </div>

      {/* Decorative Blur */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[150px] -z-10" />
    </main>
  );
}
