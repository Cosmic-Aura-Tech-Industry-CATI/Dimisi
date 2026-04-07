"use client";

import { motion } from "framer-motion";
import { ArrowRight, Cpu, Layers, Palette, Terminal } from "lucide-react";

export default function ProductsPage() {
  const industries = [
    { title: "Kalesh", href: "/products/kalesh", desc: "Advanced infrastructure solutions for high-scale apps.", icon: <Cpu /> },
    { title: "KaryON", href: "/products/karyon", desc: "Strategic operations and logistics platform.", icon: <Layers /> },
    { title: "Stylon", href: "/products/stylon", desc: "Next-gen design and style engine for digital assets.", icon: <Palette /> },
    { title: "Axis Conference Web", href: "/products/axiscon", desc: "The ultimate platform for virtual and hybrid events.", icon: <Terminal /> },
  ];

  return (
    <main className="pt-40 pb-24 min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.6 }}
           className="mb-24 text-center items-center flex flex-col"
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-8">Our Industries</h1>
          <p className="text-xl text-muted max-w-3xl"> Specialized products for every technological frontier. </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {industries.map((item, idx) => (
            <motion.a
                key={idx}
                href={item.href}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="glass p-10 rounded-[2.5rem] border border-border group hover:bg-foreground/5 hover:border-blue-500/30 transition-all"
            >
              <div className="w-16 h-16 rounded-[1.25rem] bg-blue-500/10 flex items-center justify-center mb-8 text-blue-500">
                {item.icon}
              </div>
              <h3 className="text-3xl font-bold mb-4">{item.title}</h3>
              <p className="text-muted text-lg mb-10 leading-relaxed">{item.desc}</p>
              <div className="flex items-center gap-3 text-sm font-bold opacity-70 group-hover:opacity-100 transition-opacity">
                Experience {item.title} <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </main>
  );
}
