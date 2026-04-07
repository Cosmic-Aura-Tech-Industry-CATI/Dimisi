"use client";

import { motion } from "framer-motion";
import { ArrowRight, Briefcase, MapPin, Search } from "lucide-react";

export default function CareersPage() {
  const jobs = [
    { title: "Senior Software Engineer", dept: "Engineering", loc: "Remote / Noida, IN" },
    { title: "UI/UX Designer", dept: "Design", loc: "Noida, IN" },
    { title: "AI Automation Specialist", dept: "Engineering", loc: "Remote" },
    { title: "Digital Marketing Manager", dept: "Marketing", loc: "Hybrid" },
    { title: "Customer Success Lead", dept: "Operations", loc: "Noida, IN" },
  ];

  return (
    <main className="pt-40 pb-24 min-h-screen relative">
      {/* Background Ornament */}
      <div className="absolute top-0 right-0 w-[60vw] h-[60vw] bg-blue-600/5 rounded-full blur-[200px] pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-24 flex flex-col items-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-8">Build the Future</h1>
          <p className="text-xl text-muted max-w-2xl">
            Join a collective of builders, designers, and thinkers who are obsessed with building technology that pushes the human frontier.
          </p>
        </motion.div>

        <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
           <h2 className="text-3xl font-bold flex items-center gap-3"><Briefcase size={28} className="text-blue-500" /> Open Positions</h2>
           <div className="relative group min-w-[320px]">
             <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-hover:text-blue-500 transition-colors" />
             <input type="text" placeholder="Search roles..." className="w-full bg-background border border-border p-4 pl-12 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none transition-all" />
           </div>
        </div>

        <div className="space-y-4">
          {jobs.map((job, idx) => (
            <motion.div 
               key={idx}
               initial={{ opacity: 0, x: -20 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true }}
               transition={{ delay: idx * 0.1 }}
               className="glass p-8 rounded-2xl border border-border flex flex-col md:flex-row md:items-center justify-between group hover:border-blue-500/50 transition-all cursor-pointer"
            >
              <div className="space-y-1 mb-4 md:mb-0">
                <h3 className="text-2xl font-bold group-hover:text-blue-500 transition-colors">{job.title}</h3>
                <div className="flex items-center gap-4 text-sm font-medium text-muted">
                  <span className="flex items-center gap-1"><Briefcase size={14} /> {job.dept}</span>
                  <span className="flex items-center gap-1"><MapPin size={14} /> {job.loc}</span>
                </div>
              </div>
              <button className="flex items-center justify-center gap-2 text-sm font-bold opacity-50 group-hover:opacity-100 transition-all bg-foreground/5 hover:bg-blue-500 hover:text-white px-6 py-3 rounded-xl border border-transparent">
                Apply Now <ArrowRight size={16} />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}
