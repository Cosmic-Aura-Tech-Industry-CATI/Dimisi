"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const testimonials = [
  { name: "Sarah Jenkins", role: "CEO at TechFlow", text: "Demisi completely transformed our sales pipeline. The analytics are incredibly detailed, and the interface is an absolute joy to use." },
  { name: "Marcus Doe", role: "Founder of CreativeCo", text: "We switched from our previous provider and haven't looked back. The speed and reliability are unmatched." },
  { name: "Elena Rivers", role: "Marketing Director", text: "The cohort analysis feature alone saved us hours of manual spreadsheet work. Highly recommended for any serious SaaS." },
  { name: "David Chen", role: "Indie Hacker", text: "I integrated Demisi in under an hour. It just works. Beautiful design, great UX." }
];

export default function Testimonials() {
  // Duplicating the testimonials to ensure seamless looping
  const scrollItems = [...testimonials, ...testimonials, ...testimonials];

  return (
    <section className="py-24 relative bg-grid overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
           <p className="text-blue-400 text-sm font-semibold mb-2">Trusted by the best</p>
           <h2 className="text-3xl md:text-4xl font-bold">Over 600+ Happy Customers</h2>
        </div>
      </div>

      <div className="relative flex overflow-x-hidden w-full group">
        <div className="flex w-max animate-marquee space-x-6 px-6 pb-8 group-hover:[animation-play-state:paused]">
          {scrollItems.map((t, i) => (
            <div
              key={i}
              className="glass p-6 rounded-2xl border border-white/5 w-[350px] flex-shrink-0 hover:border-white/20 transition-colors bg-white/[0.02]"
            >
              <div className="flex text-yellow-500 mb-4 text-lg">★★★★★</div>
              <p className="text-gray-300 text-sm leading-relaxed mb-6 whitespace-normal">&quot;{t.text}&quot;</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 shadow-md shadow-blue-500/20" />
                <div>
                  <h4 className="text-sm font-semibold text-white">{t.name}</h4>
                  <p className="text-xs text-gray-500">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Gradients to fade edges */}
        <div className="absolute top-0 bottom-0 left-0 w-32 bg-gradient-to-r from-black to-transparent pointer-events-none" />
        <div className="absolute top-0 bottom-0 right-0 w-32 bg-gradient-to-l from-black to-transparent pointer-events-none" />
      </div>
    </section>
  );
}
