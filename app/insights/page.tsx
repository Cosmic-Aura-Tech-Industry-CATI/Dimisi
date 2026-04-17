"use client";

import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Calendar, Clock } from "lucide-react";

export default function InsightsPage() {
  const posts = [
    { title: "The Future of AI Automation in 2026", date: "Apr 2, 2026", category: "Technology", read: "5 min", image: "/Features-Image2.png" },
    { title: "Scaling Cloud Infrastructure for SaaS", date: "Mar 28, 2026", category: "Engineering", read: "12 min", image: "/image 1.png" },
    { title: "Designing for High-Conversion Checkouts", date: "Mar 20, 2026", category: "Design", read: "8 min", image: "/Features-Image3.png" },
    { title: "Building a Culture of Digital Innovation", date: "Mar 15, 2026", category: "Ecosystem", read: "10 min", image: "/Features-Image2.png" },
  ];

  return (
    <main className="pt-40 pb-24 min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-20">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">Trends & Insights</h1>
          <p className="text-xl text-muted max-w-2xl leading-relaxed">
            Leading engineering, design, and product thinking from the frontier of technology.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {posts.map((post, idx) => (
             <motion.article 
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group cursor-pointer"
             >
               <div className="aspect-[16/9] rounded-[2rem] border border-border overflow-hidden relative glass p-2 mb-6">
                 <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity z-10" />
                 <div className="w-full h-full bg-foreground/5 rounded-2xl relative z-0 flex items-center justify-center text-muted font-bold tracking-widest uppercase">
                    Insight Preview
                 </div>
               </div>
               <div className="space-y-4 px-4">
                 <div className="flex items-center gap-6 text-sm font-bold uppercase tracking-widest text-blue-500 opacity-80">
                   <span className="flex items-center gap-2"><Calendar size={14} /> {post.date}</span>
                   <span className="flex items-center gap-2"><Clock size={14} /> {post.read}</span>
                 </div>
                 <h2 className="text-3xl font-bold group-hover:text-blue-500 transition-all leading-tight">{post.title}</h2>
                 <p className="text-muted leading-relaxed line-clamp-2">
                   Explore the latest trends shaping the future of global enterprise technology and user engagement.
                 </p>
                 <div className="flex items-center gap-2 text-sm font-bold group-hover:gap-4 transition-all pt-2">
                   Read Full Story <ArrowRight size={16} />
                 </div>
               </div>
             </motion.article>
          ))}
        </div>
      </div>
    </main>
  );
}
