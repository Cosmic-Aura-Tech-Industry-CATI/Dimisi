"use client";

import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function ServiceSubPage() {
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
          <Link href="/services" className="flex items-center gap-2 text-muted hover:text-blue-500 transition-colors mb-12">
            <ArrowLeft size={18} /> Back to Services
          </Link>
        </motion.div>

        <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.7, delay: 0.1 }}
        >
          <div className="inline-flex px-4 py-1.5 rounded-full bg-blue-500/10 text-blue-500 text-sm font-bold uppercase tracking-widest mb-8">
            Specialized Offering
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-10">{title}</h1>
          
          <div className="glass p-10 rounded-[3rem] border border-border space-y-10">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold">Strategy & Implementation</h2>
              <p className="text-xl text-muted leading-relaxed">
                Expert solutions in {title} to redefine your digital presence and optimize your operational efficiency with the latest technology.
              </p>
            </div>

            <hr className="border-border" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {["Custom Architecture", "Performance Optimization", "Secure Implementation", "Continuous Monitoring"].map((item, i) => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-3xl bg-foreground/5 border border-transparent hover:border-blue-500/20 transition-all">
                   <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 mt-1">
                      <CheckCircle size={18} />
                   </div>
                   <div className="space-y-1">
                      <h3 className="text-lg font-bold">{item}</h3>
                      <p className="text-sm text-muted">Advanced engineering that scales seamlessly with your user growth.</p>
                   </div>
                </div>
              ))}
            </div>

            <button className="btn-primary w-full p-6 rounded-3xl font-bold flex items-center justify-center gap-4 text-xl group overflow-hidden relative">
               <span className="relative z-10 flex items-center gap-4">Initialize Project <ArrowLeft size={24} className="rotate-180 group-hover:translate-x-2 transition-transform" /></span>
            </button>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
