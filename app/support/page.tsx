"use client";

import { motion } from "framer-motion";
import { HelpCircle, Search, Mail, MessageSquare } from "lucide-react";

export default function SupportPage() {
  const faqs = [
    { q: "How do I initialize my API key?", a: "Navigate to your dashboard settings and select 'API Access' to generate a new secure key." },
    { q: "What is your uptime SLA?", a: "We guarantee 99.9% uptime for all enterprise-tier customers." },
    { q: "Can I migrate from another platform?", a: "Yes, we offer direct migration tools for most major SaaS platforms." },
    { q: "How do I contact technical support?", a: "You can open a ticket directly through your portal or use the 24/7 live chat." },
  ];

  return (
    <main className="pt-40 pb-24 min-h-screen">
      <div className="max-w-7xl mx-auto px-6 text-center mb-16 flex flex-col items-center">
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-5xl md:text-7xl font-bold mb-8 tracking-tight">Need Assistance?</motion.h1>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="text-xl text-muted max-w-2xl leading-relaxed mb-12">
           Our dedicated support team is here to help you solve your most complex technical challenges.
        </motion.p>
        
        <div className="relative group w-full max-w-2xl">
           <Search size={24} className="absolute left-6 top-1/2 -translate-y-1/2 text-muted group-hover:text-blue-500 transition-colors" />
           <input type="text" placeholder="Search for answers..." className="w-full bg-background border border-border p-6 pl-16 rounded-[2rem] focus:ring-2 focus:ring-blue-500/50 outline-none transition-all shadow-xl" />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 space-y-6 mt-16">
        <h2 className="text-3xl font-bold mb-10 flex items-center gap-4"><HelpCircle size={32} className="text-blue-500" /> Frequently Asked Questions</h2>
        {faqs.map((faq, idx) => (
           <motion.div 
               key={idx}
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ delay: idx * 0.1 }}
               className="glass p-8 rounded-3xl border border-border space-y-4 cursor-pointer hover:bg-foreground/5 group transition-all"
           >
              <h3 className="text-xl font-bold group-hover:text-blue-500 transition-colors">{faq.q}</h3>
              <p className="text-muted leading-relaxed">{faq.a}</p>
           </motion.div>
        ))}
      </div>
    </main>
  );
}
