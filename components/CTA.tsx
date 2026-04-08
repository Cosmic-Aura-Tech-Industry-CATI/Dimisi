"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export default function CTA() {
  return (
    <section className="py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-blue-500/5 -z-10" />
      
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="glass rounded-[3rem] p-12 md:p-24 border border-[var(--glass-border)] flex flex-col md:flex-row items-center gap-16 relative overflow-hidden"
        >
          {/* Internal Glows - Animated */}
          <div className="absolute -top-24 -right-24 w-[600px] h-[600px] bg-purple-500/20 rounded-full blur-[120px] -z-10 animate-pulse-slow" />
          <div className="absolute -bottom-24 -left-24 w-[500px] h-[500px] bg-blue-500/15 rounded-full blur-[100px] -z-10 animate-pulse" />
          
          <div className="flex-[1.2] z-10 text-center md:text-left">
            <h2 className="text-4xl md:text-6xl font-black mb-8 leading-tight tracking-tight text-[var(--foreground)]">Grow your revenue <span className="text-blue-600">now</span></h2>
            <p className="text-muted text-xl mb-10 max-w-lg font-medium">Join over 10,000 satisfied users building and growing their companies with Demisi today.</p>
            <button className="btn-primary font-black px-12 py-5 rounded-full flex items-center justify-center gap-3 group shadow-2xl hover:bg-blue-600 hover:text-white transition-all mx-auto md:mx-0">
              Start your free trial
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="flex-1 relative w-full h-[350px] md:h-[450px] hidden md:block perspective-2000 z-10">
            <motion.div 
              initial={{ rotateY: 20, rotateX: 10, y: 20 }}
              whileHover={{ rotateY: 0, rotateX: 0, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 rounded-[2.5rem] border border-[var(--glass-border)] overflow-hidden shadow-3xl shadow-blue-500/10"
            >
              <Image
                src="/dashboard.png"
                alt="Dashboard Preview"
                fill
                className="object-cover scale-110"
              />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>

  );
}
