"use client";

import { motion } from "framer-motion";
import { Mail, Send, CheckCircle } from "lucide-react";
import { useState } from "react";
import type { FormEvent } from "react";

export default function NewsletterPage() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log("Newsletter Subscribed:", email);
    setEmail(""); // optional UX improvement
  };

  return (
    <main className="pt-40 pb-24 min-h-screen">
      <div className="max-w-7xl mx-auto px-6 text-center mb-16 flex flex-col items-center">

        {/* Icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7 }}
          className="w-20 h-20 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center mb-12 shadow-2xl shadow-blue-500/20"
        >
          <Mail size={40} />
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-5xl md:text-8xl font-bold mb-8 tracking-tight"
        >
          Stay Ahead of the Curve.
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-xl md:text-2xl text-muted max-w-2xl leading-relaxed mb-16"
        >
          The newsletter for thinkers and builders. Join over 20,000 readers and get bi-weekly insights on technology, design, and product strategy.
        </motion.p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full max-w-2xl relative group">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            className="w-full bg-background border border-border p-8 pr-48 rounded-[3rem] focus:ring-2 focus:ring-blue-500/50 outline-none transition-all shadow-2xl text-xl"
          />

          <button
            type="submit"
            className="absolute right-4 top-1/2 -translate-y-1/2 btn-primary p-4 px-10 rounded-full font-bold flex items-center gap-3 transition-all hover:scale-105 active:scale-95 shadow-xl"
          >
            Subscribe <Send size={20} />
          </button>
        </form>

        {/* Features */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl text-left">
          {["No spam, ever.", "Bi-weekly updates.", "Industry benchmarks."].map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-3 text-muted text-sm font-bold uppercase tracking-widest bg-foreground/5 p-4 rounded-2xl border border-transparent hover:border-blue-500/20 transition-all"
            >
              <CheckCircle size={18} className="text-blue-500" /> {item}
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}