"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Box, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function ProductSubPage() {
  const { slug } = useParams();
  
  // Format slug for display
  const title = (typeof slug === 'string' ? slug : '')
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return (
    <main className="pt-40 pb-24 min-h-screen">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <Link href="/products" className="flex items-center gap-2 text-muted hover:text-blue-500 transition-colors mb-12">
            <ArrowLeft size={18} /> Our Industries
          </Link>
        </motion.div>

        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ duration: 0.8, delay: 0.1 }}
        >
          <div className="inline-flex px-4 py-1.5 rounded-full bg-purple-500/10 text-purple-500 text-sm font-bold uppercase tracking-widest mb-8">
            Industrial Solution
          </div>
          <h1 className="text-5xl md:text-8xl font-black mb-12 tracking-tight group">{title} <span className="text-blue-500">.</span></h1>
          
          <div className="glass p-10 rounded-[3rem] border border-border border-white/10 space-y-16">
            <div className="space-y-8">
              <h2 className="text-4xl font-bold">Reshaping Global Standards</h2>
              <p className="text-2xl text-muted leading-relaxed opacity-80">
                A purpose-built ecosystem designed to solve the largest bottlenecks in {title} with precision and engineering.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {["Industrial Architecture", "Operational Speed", "Secure Deployment", "Real-time Monitoring"].map((item, j) => (
                <div key={j} className="flex items-center gap-5 p-6 rounded-3xl bg-foreground/5 border border-transparent hover:border-purple-500/30 transition-all cursor-default">
                   <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center text-purple-500 shrink-0 shadow-lg shadow-purple-500/10">
                      <Box size={20} />
                   </div>
                   <div className="space-y-1">
                      <h3 className="text-xl font-bold">{item}</h3>
                      <p className="text-sm text-muted">A world-class framework tailored for modern enterprises.</p>
                   </div>
                </div>
              ))}
            </div>

            <button className="btn-primary w-full p-6 py-8 rounded-full font-black flex items-center justify-center gap-4 text-2xl group overflow-hidden relative shadow-2xl">
               <span className="relative z-10 flex items-center gap-4">Connect to {title} API <ArrowLeft size={28} className="rotate-180 group-hover:translate-x-3 transition-transform" /></span>
               <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
