"use client";

import { motion } from "framer-motion";
import { Layout, LineChart, Globe, Zap, Settings, ShieldCheck } from "lucide-react";

const features = [
  { icon: <Layout />, title: "Custom Dashboard", desc: "Personalize your workspace with widgets and data blocks that matter to you." },
  { icon: <LineChart />, title: "Real-time Metrics", desc: "Monitor sales, visits, and active users as they happen, millisecond by millisecond." },
  { icon: <Globe />, title: "Global CDN", desc: "Serve your assets quickly anywhere in the world with our edge network." },
  { icon: <Zap />, title: "Lightning Fast", desc: "Optimized architecture ensures your app loads instantly, improving conversion rates." },
  { icon: <Settings />, title: "API Access", desc: "Build custom integrations using our fully documented REST and GraphQL APIs." },
  { icon: <ShieldCheck />, title: "Bank-grade Security", desc: "Your data is encrypted at rest and in transit. SOC2 Type II compliance standard." },
];

export default function FeatureGrid() {
  return (
    <section className="py-24 bg-black/50 border-y border-white/5 relative" id="usecases">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[300px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">...and more features</h2>
          <p className="text-gray-400">Everything you need to build, scale, and manage your online business.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="glass p-8 rounded-2xl hover:bg-white/[0.05] transition-colors group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-gray-300 group-hover:text-white group-hover:scale-110 transition-all mb-6 relative overflow-hidden">
                {/* Micro animation for icon */}
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative z-10">{item.icon}</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">{item.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
