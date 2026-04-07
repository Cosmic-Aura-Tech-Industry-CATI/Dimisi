"use client";

import { motion } from "framer-motion";
import { ArrowRight, Box } from "lucide-react";

export default function ServicesPage() {
  const services = [
    { title: "Web Development", href: "/services/web-development", desc: "Custom web applications built with modern technologies." },
    { title: "Mobile App Development", href: "/services/mobile-app-development", desc: "Native and cross-platform mobile solutions." },
    { title: "AI & Automation", href: "/services/ai-automation", desc: "Intelligent automation for your business processes." },
    { title: "UI/UX Design", href: "/services/ui-ux-design", desc: "User-centric design that converts." },
    { title: "Software Development", href: "/services/software-development", desc: "Robust and scalable custom software." },
    { title: "Cloud Services", href: "/services/cloud-services", desc: "Cloud infrastructure and migration services." },
    { title: "IT Consulting", href: "/services/it-consulting", desc: "Expert advice on your IT strategy." },
    { title: "IT Support", href: "/services/it-support-maintenance", desc: "24/7 support for your infrastructure." },
    { title: "Digital Marketing", href: "/services/digital-marketing", desc: "Results-driven marketing strategies." },
    { title: "Startup Mentorship", href: "/services/startup-mentorship", desc: "Guiding startups from idea to scale." },
  ];

  return (
    <main className="pt-40 pb-24 min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-6">Our Offerings</h1>
          <p className="text-xl text-muted max-w-2xl">
            We provide a comprehensive suite of technology services to push your business forward.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, idx) => (
            <motion.a
              key={idx}
              href={service.href}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="glass p-8 rounded-2xl border border-border group hover:border-blue-500/50 transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-6 text-blue-500">
                <Box size={24} />
              </div>
              <h3 className="text-2xl font-bold mb-3 group-hover:text-blue-500 transition-colors">{service.title}</h3>
              <p className="text-muted mb-6">{service.desc}</p>
              <div className="flex items-center gap-2 text-sm font-semibold group-hover:gap-4 transition-all">
                Learn More <ArrowRight size={16} />
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </main>
  );
}
