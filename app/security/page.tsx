"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Lock, Eye, CheckCircle } from "lucide-react";

export default function SecurityPage() {
  const points = [
    {
      icon: <Lock size={24} />,
      title: "Data Encryption",
      desc: "All data is secured using industry-standard encryption protocols during transmission and storage."
    },
    {
      icon: <Eye size={24} />,
      title: "Monitoring & Auditing",
      desc: "Continuous monitoring with periodic security reviews to identify and mitigate risks early."
    },
    {
      icon: <ShieldCheck size={24} />,
      title: "Compliance Ready",
      desc: "Architected to align with global data protection standards and best practices."
    },
    {
      icon: <CheckCircle size={24} />,
      title: "High Availability",
      desc: "Reliable infrastructure with redundancy and failover mechanisms for maximum uptime."
    },
  ];

  return (
    <main className="pt-40 pb-24 min-h-screen relative overflow-hidden">

      {/* HERO */}
      <div className="max-w-7xl mx-auto px-6 text-center mb-24 flex flex-col items-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7 }}
          className="w-20 h-20 rounded-3xl bg-blue-500/20 text-blue-500 flex items-center justify-center mb-10 shadow-xl"
        >
          <ShieldCheck size={40} />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-5xl md:text-7xl font-bold mb-8 tracking-tight"
        >
          Security You Can Rely On
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-xl text-muted max-w-2xl leading-relaxed"
        >
          We design and build systems with security at the core—ensuring your data,
          users, and operations remain protected at every level.
        </motion.p>
      </div>

      {/* CORE SECURITY GRID */}
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
        {points.map((point, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ y: -8 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            className="glass p-8 rounded-3xl border border-border flex flex-col items-start group hover:border-blue-500/50 hover:bg-blue-500/5 transition"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 mb-6">
              {point.icon}
            </div>

            <h3 className="text-xl font-semibold mb-3">{point.title}</h3>
            <p className="text-muted leading-relaxed">{point.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* SECURITY PROCESS (TRUST BUILDER) */}
      <div className="max-w-5xl mx-auto px-6 mb-24 text-center">
        <h2 className="text-3xl font-bold mb-10">How We Ensure Security</h2>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            "Secure Architecture Design",
            "Development with Best Practices",
            "Continuous Monitoring & Updates"
          ].map((step, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              className="p-6 border border-border rounded-2xl glass"
            >
              <div className="text-2xl font-bold mb-2">0{i + 1}</div>
              <p className="text-muted">{step}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* TRUST STATEMENT */}
      <div className="max-w-3xl mx-auto px-6 text-center mb-24">
        <h2 className="text-3xl font-bold mb-6">Built for Reliability</h2>
        <p className="text-muted leading-relaxed">
          Security is not an add-on—it is integrated into every layer of our systems.
          From infrastructure to application logic, we follow a structured approach
          that minimizes risk and ensures long-term stability.
        </p>
      </div>

      {/* CTA */}
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">
          Need a Secure Digital System?
        </h2>
        <p className="text-muted mb-6">
          Let’s build a solution that is robust, scalable, and secure from day one.
        </p>

        <button className="px-8 py-4 bg-blue-500 text-white rounded-xl hover:scale-105 transition">
          Talk to Our Team
        </button>
      </div>

      {/* Background Glow */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[150px] -z-10" />
    </main>
  );
}