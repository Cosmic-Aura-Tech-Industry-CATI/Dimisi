"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { BarChart3, Users, Zap } from "lucide-react";

const features = [
  {
    title: "Get proper user & sales statistics",
    description: "Convert more users into active subscribers. Understand your audience with advanced cohort analysis and tracking.",
    points: ["View analytics", "Track MRR", "Export data", "Custom APIs"],
    image: "/analytics.png",
    icon: <BarChart3 className="w-6 h-6 text-blue-400" />
  },
  {
    title: "Bring visitors from different sources",
    description: "Integrate seamlessly with social media platforms, ad networks, and organic SEO tools to maximize reach.",
    points: ["Source tracking", "UTM builder", "Social connections", "ROI calculator"],
    image: "/dashboard.png",
    icon: <Zap className="w-6 h-6 text-purple-400" />
  },
  {
    title: "Acquire and retain more customers",
    description: "Launch targeted retention campaigns, gather feedback, and create personalized experiences that users love.",
    points: ["Retention modeling", "Automated emails", "A/B testing", "Heatmaps"],
    image: "/user.png",
    icon: <Users className="w-6 h-6 text-pink-400" />
  }
];

export default function Features() {
  return (
    <section className="py-24 md:py-32 relative" id="features">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col gap-32">
          {features.map((feature, idx) => (
            <div key={idx} className={`flex flex-col lg:flex-row items-center gap-16 ${idx % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
              
              {/* Text Content */}
              <motion.div 
                initial={{ opacity: 0, x: idx % 2 === 1 ? 50 : -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
                className="flex-1 space-y-6"
              >
                <div className="w-12 h-12 rounded-xl bg-[var(--glass-bg)] border border-[var(--border)] flex items-center justify-center shadow-sm">
                  {feature.icon}
                </div>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--foreground)]">
                  {feature.title}
                </h2>
                <p className="text-lg text-muted font-medium">
                  {feature.description}
                </p>
                <div className="grid grid-cols-2 gap-4 pt-4">
                  {feature.points.map((point, i) => (
                    <div key={i} className="flex items-center gap-2 text-muted font-medium">
                      <div className="w-2 h-2 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50" />
                      {point}
                    </div>
                  ))}
                </div>
                <button className="mt-8 px-6 py-2.5 rounded-full bg-[var(--foreground)] text-[var(--background)] hover:scale-105 active:scale-95 font-bold transition-all shadow-md">
                  Learn more →
                </button>

              </motion.div>

              {/* Image Content */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="flex-1 relative w-full aspect-[4/3] rounded-[2rem] border border-[var(--glass-border)] glass p-2 overflow-hidden group hover:-translate-y-2 hover:shadow-3xl transition-all duration-500"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <Image
                  src={feature.image}
                  alt={feature.title}
                  fill
                  className="object-cover rounded-2xl transition-transform duration-1000 group-hover:scale-110"
                />
              </motion.div>


            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
