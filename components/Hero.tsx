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
  
  const yDashboard = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacityDashboard = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={ref} className="relative min-h-screen pt-32 pb-20 overflow-hidden flex flex-col items-center perspective-1000">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] -z-10" />
      <div className="absolute top-20 left-1/4 w-[600px] h-[400px] bg-purple-600/20 rounded-full blur-[100px] -z-10" />
      <div className="absolute top-0 left-0 w-full h-full bg-grid -z-20 opacity-40" />

      <div className="max-w-5xl mx-auto px-6 text-center z-10 flex flex-col items-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 glass mb-8 cursor-pointer hover:bg-white/5 transition-colors"
        >
          <span className="text-xs font-medium bg-white text-black px-2 py-0.5 rounded-full">New</span>
          <span className="text-sm text-gray-300">Introducing Demisi Analytics 2.0</span>
          <ArrowRight className="w-3 h-3 text-gray-400" />
        </motion.div>

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-4xl"
        >
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight mb-6">
            Earn revenue by selling anything from the <span className="text-gradient">internet on your app.</span>
          </h1>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl"
        >
          All-in-one suite to build, manage, and scale your digital storefront. High-conversion checkout, advanced analytics, and zero configuration.
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row items-center gap-4 mb-20"
        >
          <Link href="/signup" className="glow-btn group px-8 py-3.5 rounded-full bg-white text-black font-semibold flex items-center gap-2 hover:scale-105 transition-transform shadow-xl shadow-white/10">
            Start for free
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <button className="px-8 py-3.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-white font-medium flex items-center gap-2 transition-all">
            <Play className="w-4 h-4" />
            Watch video
          </button>
        </motion.div>

        {/* Dashboard Image Parallax */}
        <motion.div
          initial={{ opacity: 0, y: 100, rotateX: 10 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          style={{ y: yDashboard, opacity: opacityDashboard }}
          className="relative w-full max-w-5xl rounded-xl md:rounded-[2rem] border border-white/10 glass p-2 md:p-4 shadow-2xl overflow-hidden shadow-blue-500/20"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent z-10 pointer-events-none" />
          <Image
            src="/dashboard.png"
            alt="Demisi Dashboard"
            width={1200}
            height={800}
            priority
            className="rounded-lg md:rounded-2xl w-full h-auto object-cover relative z-0"
          />
        </motion.div>
      </div>
    </section>
  );
}
