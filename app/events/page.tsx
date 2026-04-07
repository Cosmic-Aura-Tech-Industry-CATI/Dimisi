"use client";

import { motion } from "framer-motion";
import { BadgeCheck, Calendar, MapPin, Search } from "lucide-react";

export default function EventsPage() {
  const events = [
    { title: "Building Scalable AI Infrastructure", type: "Conference", date: "Apr 15, 2026", loc: "Virtual / SF", status: "Open" },
    { title: "Design for High-Conversion SaaS", type: "Webinar", date: "Apr 22, 2026", loc: "Virtual", status: "Few Spots Left" },
    { title: "Global Cloud Engineering Series", type: "Meetup", date: "May 4, 2026", loc: "Noida, IN", status: "Waitlist Only" },
    { title: "Digital Product Strategy Masterclass", type: "Webinar", date: "May 10, 2026", loc: "Virtual", status: "Open" },
  ];

  return (
    <main className="pt-40 pb-24 min-h-screen relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute -top-1/4 -right-1/4 w-[60vw] h-[60vw] bg-purple-500/5 rounded-full blur-[200px] pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-24 flex flex-col items-center text-center">
                <h1 className="text-5xl md:text-8xl font-black mb-8 tracking-tighter">Events & Webinars</h1>
                <p className="text-xl md:text-2xl text-muted max-w-3xl leading-relaxed"> Join our engineering, design, and strategy specialists in explore the frontiers of technology through deep-dives and conferences. </p>
            </motion.div>

            <div className="space-y-4">
                {events.map((event, idx) => (
                    <motion.div 
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.1 }}
                        className="glass p-10 rounded-[3rem] border border-border flex flex-col lg:flex-row lg:items-center justify-between group hover:border-blue-500/50 transition-all cursor-pointer"
                    >
                        <div className="space-y-4 lg:mb-0 mb-8 max-w-xl">
                           <div className="inline-flex px-4 py-1.5 rounded-full bg-foreground/5 text-xs font-bold uppercase tracking-widest text-muted group-hover:bg-blue-500 group-hover:text-white transition-all">
                              {event.type}
                           </div>
                           <h3 className="text-3xl font-black group-hover:text-blue-500 transition-colors leading-tight">{event.title}</h3>
                           <div className="flex flex-wrap items-center gap-6 text-sm font-bold text-muted uppercase tracking-widest">
                               <span className="flex items-center gap-2"><Calendar size={14} className="text-blue-500" /> {event.date}</span>
                               <span className="flex items-center gap-2"><MapPin size={14} className="text-blue-500" /> {event.loc}</span>
                           </div>
                        </div>
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                           <div className="px-6 py-3 rounded-full border border-border text-sm font-bold flex items-center gap-2">
                              <BadgeCheck size={16} className="text-green-500" /> {event.status}
                           </div>
                           <button className="btn-primary p-4 px-10 rounded-full font-bold flex items-center gap-3 hover:scale-105 active:scale-95 transition-all text-sm uppercase tracking-widest">
                             Secure Spot
                           </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    </main>
  );
}
