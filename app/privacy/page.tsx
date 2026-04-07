"use client";

import { motion } from "framer-motion";

export default function PrivacyPage() {
  const sections = [
    { title: "Introduction", content: "DIMISI respects your privacy and is committed to protecting your personal data." },
    { title: "Data Collection", content: "We may collect, use, store and transfer different kinds of personal data about you." },
    { title: "Usage Policy", content: "We only use your personal data when the law allows us to, such as for contract performance." },
    { title: "Security Measures", content: "We have put in place appropriate security measures to prevent your personal data from being lost." },
  ];

  return (
    <main className="pt-40 pb-24 min-h-screen">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-20">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">Privacy Policy</h1>
          <p className="text-xl text-muted leading-relaxed">
            Your trust is our most valuable asset. Learn how we handle your data with transparency and security.
          </p>
        </motion.div>

        <div className="space-y-12">
          {sections.map((section, idx) => (
             <motion.section 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="space-y-4"
             >
               <h2 className="text-3xl font-bold">{section.title}</h2>
               <p className="text-lg text-muted leading-relaxed">{section.content}</p>
             </motion.section>
          ))}
        </div>
      </div>
    </main>
  );
}
