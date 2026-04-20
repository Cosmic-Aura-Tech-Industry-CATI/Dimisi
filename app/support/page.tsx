"use client";

import { motion } from "framer-motion";
import { HelpCircle, Search, Mail, MessageSquare } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function SupportPage() {
  const [active, setActive] = useState<number | null>(null);

  const faqs = [
    {
      q: "How do I initialize my API key?",
      a: "Go to your dashboard → API Access → Generate Key. Always store it securely and never expose it on the client side.",
    },
    {
      q: "What is your uptime SLA?",
      a: "We maintain a 99.9% uptime SLA with infrastructure redundancy and real-time monitoring systems.",
    },
    {
      q: "Can I migrate from another platform?",
      a: "Yes. We assist with structured migrations including data transfer, validation, and system setup.",
    },
    {
      q: "How do I contact technical support?",
      a: "You can use live chat for instant help or raise a support ticket for detailed assistance.",
    },
  ];

  const supportOptions = [
    {
      icon: <MessageSquare size={26} />,
      title: "Live Chat",
      desc: "Get instant responses from our support team.",
      action: () => alert("Live chat integration coming soon"),
    },
    {
      icon: <Mail size={26} />,
      title: "Raise a Ticket",
      desc: "Submit detailed issues and track progress.",
      action: () => alert("Ticket system coming soon"),
    },
    {
      icon: <HelpCircle size={26} />,
      title: "Help Center",
      desc: "Browse guides, documentation, and FAQs.",
      action: () => window.scrollTo({ top: 600, behavior: "smooth" }),
    },
  ];

  return (
    <main className="pt-40 pb-24 min-h-screen relative overflow-hidden">
      {/* HERO */}
      <div className="max-w-7xl mx-auto px-6 text-center mb-20 flex flex-col items-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-7xl font-bold mb-6"
        >
          How Can We Help You?
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xl text-muted max-w-2xl mb-10"
        >
          Find answers, resolve issues, or connect with our team—quickly and efficiently.
        </motion.p>

        {/* SEARCH */}
        <div className="relative w-full max-w-2xl group">
          <Search
            size={22}
            className="absolute left-5 top-1/2 -translate-y-1/2 text-muted group-hover:text-blue-500"
          />
          <input
            type="text"
            placeholder="Search for solutions, guides, or FAQs..."
            className="w-full p-5 pl-14 rounded-2xl border border-border bg-background focus:ring-2 focus:ring-blue-500/40 outline-none transition"
          />
        </div>

        {/* subtle trust signal */}
        <p className="text-sm text-muted mt-4">
          ⚡ Priority support available for enterprise clients
        </p>
      </div>

      {/* SUPPORT OPTIONS */}
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-8 mb-24">
        {supportOptions.map((item, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -8 }}
            onClick={item.action}
            className="glass p-8 rounded-3xl border border-border hover:border-blue-500/40 transition cursor-pointer"
          >
            <div className="mb-5 text-blue-500">{item.icon}</div>
            <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
            <p className="text-muted">{item.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* FAQ */}
      <div className="max-w-3xl mx-auto px-6">
        <h2 className="text-3xl font-bold mb-10 flex items-center gap-3">
          <HelpCircle className="text-blue-500" />
          Frequently Asked Questions
        </h2>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <motion.div
              key={idx}
              layout
              onClick={() => setActive(active === idx ? null : idx)}
              className="border border-border rounded-2xl p-6 cursor-pointer glass"
            >
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">{faq.q}</h3>
                <span
                  className={`text-blue-500 transition-transform ${active === idx ? "rotate-45" : ""
                    }`}
                >
                  +
                </span>
              </div>

              {active === idx && (
                <p className="mt-4 text-muted leading-relaxed">
                  {faq.a}
                </p>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center mt-24">
        <h2 className="text-3xl font-bold mb-4">Still Need Help?</h2>
        <p className="text-muted mb-6">
          Our team is ready to assist you with any technical or business queries.
        </p>

        <Link
          href="/contact"
          className="inline-block px-8 py-4 bg-blue-500 text-white rounded-xl hover:scale-105 transition"
        >
          Contact Support
        </Link>
      </div>

      {/* Background */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[150px] -z-10" />
    </main>
  );
}