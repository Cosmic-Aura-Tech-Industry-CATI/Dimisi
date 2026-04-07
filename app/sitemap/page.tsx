"use client";

import { motion } from "framer-motion";
import { List, MapPin, Search } from "lucide-react";
import Link from "next/link";

export default function SitemapPage() {
  const sections = [
    { title: "Core", links: ["Home", "About", "Contact", "Careers"] },
    { title: "Services", links: ["Web Development", "AI Automation", "Cloud Services", "IT Consulting"] },
    { title: "Products", links: ["Kalesh", "KaryON", "Stylon", "Axiscon"] },
    { title: "Resources", links: ["Insights", "Newsletter", "Events", "Sitemap"] },
    { title: "Legal", links: ["Privacy Policy", "Security"] },
  ];

  return (
    <main className="pt-40 pb-24 min-h-screen">
      <div className="max-w-5xl mx-auto px-6">
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-5xl md:text-7xl font-bold mb-16 tracking-tight flex items-center gap-6"><List size={48} className="text-blue-500" /> Sitemap</motion.h1>
         
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
          {sections.map((section, idx) => (
             <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="space-y-6"
             >
                <h2 className="text-2xl font-bold border-b border-border pb-4">{section.title}</h2>
                <div className="flex flex-col gap-4">
                  {section.links.map((link, j) => (
                    <Link key={j} href={`/${link.toLowerCase().replace(/ /g, '-')}`} className="text-lg text-muted hover:text-blue-500 transition-colors flex items-center gap-2 group">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500/20 group-hover:bg-blue-500 transition-colors" />
                      {link}
                    </Link>
                  ))}
                </div>
             </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}
