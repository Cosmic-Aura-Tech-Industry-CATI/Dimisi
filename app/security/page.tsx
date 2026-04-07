"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Lock, Eye, CheckCircle } from "lucide-react";

export default function SecurityPage() {
  const points = [
    { title: "Encryption", desc: "Advanced end-to-end encryption for all data transit." },
    { title: "Auditing", desc: "Regular third-party security audits." },
    { title: "Compliance", desc: "Full compliance with global data protection laws." },
    { title: "Uptime", desc: "99.9% uptime SLA with real-time failover." },
  ];

  return (
     <main className="pt-40 pb-24 min-h-screen">
      <div className="max-w-7xl mx-auto px-6 text-center mb-24 flex flex-col items-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.7 }} className="w-20 h-20 rounded-3xl bg-blue-500/20 text-blue-500 flex items-center justify-center mb-10 shadow-2xl shadow-blue-500/20">
           <ShieldCheck size={40} />
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-5xl md:text-7xl font-bold mb-8 tracking-tight">Security & Trust</motion.h1>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="text-xl text-muted max-w-2xl leading-relaxed">
           Your security is our absolute priority. We employ military-grade encryption and rigorous testing to ensure your data stays protected.
        </motion.p>
      </div>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {points.map((point, idx) => (
           <motion.div 
               key={idx}
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ delay: idx * 0.1 }}
               className="glass p-10 rounded-[2.5rem] border border-border flex flex-col items-center text-center group hover:border-blue-500/50 transition-all cursor-default hover:bg-blue-500/5"
           >
              <div className="w-14 h-14 rounded-2xl bg-foreground/5 flex items-center justify-center text-blue-500 mb-8 font-bold text-xl opacity-60 group-hover:opacity-100 group-hover:bg-blue-500/10 transition-all">
                {idx + 1}
              </div>
              <h3 className="text-2xl font-bold mb-4">{point.title}</h3>
              <p className="text-muted leading-relaxed font-semibold">{point.desc}</p>
           </motion.div>
        ))}
      </div>
    </main>
  );
}
