"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export default function CTA() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-blue-900/20 -z-10" />
      
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="glass rounded-3xl p-10 md:p-16 border border-white/10 flex flex-col md:flex-row items-center gap-12 relative overflow-hidden"
        >
          {/* Internal Glows */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/30 rounded-full blur-[100px] -z-10" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/20 rounded-full blur-[80px] -z-10" />
          
          <div className="flex-1 z-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Grow your revenue now</h2>
            <p className="text-gray-400 text-lg mb-8 max-w-md">Join over 10,000 satisfied users building and growing their companies with Demisi today.</p>
            <button className="glow-btn bg-white text-black font-semibold px-8 py-4 rounded-full flex items-center gap-2 group hover:scale-105 transition-transform">
              Start your free trial
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="flex-1 relative w-full h-[300px] md:h-[400px] hidden md:block perspective-1000 z-10">
            <motion.div 
              initial={{ rotateY: 15, rotateX: 5 }}
              whileHover={{ rotateY: 0, rotateX: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 rounded-2xl border border-white/20 overflow-hidden shadow-2xl shadow-purple-500/20"
            >
              <Image
                src="/dashboard.png"
                alt="Dashboard Preview"
                fill
                className="object-cover"
              />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
