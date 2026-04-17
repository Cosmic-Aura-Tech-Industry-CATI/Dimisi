"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";

import { useRef } from "react";

export default function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const yDashboard = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const opacityDashboard = useTransform(scrollYProgress, [0, 0.8], [1, 0.5]);

  return (
    <section ref={ref} className="relative min-h-screen pt-40 pb-20 overflow-hidden flex flex-col items-center perspective-1000">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-[var(--hero-glow-1)] rounded-full blur-[120px] -z-10 animate-pulse-slow" />
      <div className="absolute top-40 left-1/4 w-[700px] h-[500px] bg-[var(--hero-glow-2)] rounded-full blur-[100px] -z-10" />
      <div className="absolute top-0 left-0 w-full h-full bg-grid -z-20 opacity-[0.15] dark:opacity-40" />

      <div className="max-w-5xl mx-auto px-6 text-center z-10 flex flex-col items-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--border)] glass mb-8 cursor-pointer hover:border-blue-500/30 transition-all group"
        >
          <span className="text-xs font-bold bg-blue-600 text-white px-2 py-0.5 rounded-full group-hover:scale-105 transition-transform">New</span>
          <span className="text-sm font-medium text-muted">Introducing Demisi Analytics 2.0</span>
          <ArrowRight className="w-3 h-3 text-muted group-hover:translate-x-1 transition-transform" />
        </motion.div>

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-4xl relative"
        >
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-8">
            Building scalable digital systems for the <br />
            <span className="text-gradient relative inline-block">
              modern enterprise
              <motion.div
                className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1, delay: 0.8 }}
              />
            </span>
          </h1>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="text-lg md:text-xl text-muted mb-10 max-w-2xl font-medium"
        >
          DIMISI Technologies Pvt. Ltd. delivers world-class web, mobile, and AI solutions helping businesses transition into efficient, technology-enabled operations.
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row items-center gap-4 mb-20"
        >
          <Link href="#contact" className="btn-primary group px-10 py-4 rounded-full font-bold flex items-center gap-2">
            Start for free
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <button className="px-10 py-4 rounded-full border border-[var(--border)] bg-[var(--glass-bg)] hover:bg-white/10 dark:hover:bg-white/5 backdrop-blur-md text-[var(--foreground)] font-bold flex items-center gap-2 transition-all hover:scale-105 active:scale-95">
            <Play className="w-4 h-4 fill-current" />
            Watch video
          </button>
        </motion.div>

        {/* Dashboard Image Parallax */}
        <motion.div
          initial={{ opacity: 0, y: 100, rotateX: 10, scale: 0.9 }}
          whileInView={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-5xl rounded-2xl md:rounded-[2.5rem] border border-[var(--glass-border)] glass p-1.5 md:p-3 shadow-2xl overflow-hidden"
        >
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[var(--background)] to-transparent z-10 pointer-events-none opacity-40" />
          <Image
            src="/image 1.png"
            alt="Demisi Dashboard"
            width={1200}
            height={800}
            priority
            className="rounded-[1rem] md:rounded-[2.1rem] w-full h-auto object-cover relative z-0"
          />
        </motion.div>
      </div>
    </section>
  );
}

