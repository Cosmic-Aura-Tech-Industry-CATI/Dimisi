"use client";

import { motion } from "framer-motion";
import Link from "next/link";

import {
  ArrowRight,
  Globe,
  Smartphone,
  Bot,
  Palette,
  Code2,
  Cloud,
  ShieldCheck,
  LineChart,
  Rocket,
  BriefcaseBusiness,
} from "lucide-react";

export default function ServicesPage() {
  const services = [
    {
      title: "Web Development",
      href: "/services/web-development",
      desc: "Modern, scalable and SEO-optimized web applications tailored for your business.",
      icon: Globe,
      tags: ["Next.js", "React", "SEO"],
    },
    {
      title: "Mobile App Development",
      href: "/services/mobile-app-development",
      desc: "Cross-platform mobile applications with seamless user experiences.",
      icon: Smartphone,
      tags: ["Flutter", "Android", "iOS"],
    },
    {
      title: "AI & Automation",
      href: "/services/ai-automation",
      desc: "Intelligent AI systems and automation workflows to boost productivity.",
      icon: Bot,
      tags: ["AI", "Automation", "Chatbots"],
    },
    {
      title: "UI/UX Design",
      href: "/services/ui-ux-design",
      desc: "Elegant and conversion-focused user interfaces designed for engagement.",
      icon: Palette,
      tags: ["Figma", "Design", "UX"],
    },
    {
      title: "Software Development",
      href: "/services/software-development",
      desc: "Custom software solutions built with performance and scalability in mind.",
      icon: Code2,
      tags: ["SaaS", "Enterprise", "API"],
    },
    {
      title: "Cloud Services",
      href: "/services/cloud-services",
      desc: "Cloud deployment, infrastructure management and scalable architectures.",
      icon: Cloud,
      tags: ["AWS", "Cloud", "DevOps"],
    },
    {
      title: "IT Consulting",
      href: "/services/it-consulting",
      desc: "Strategic technology consulting to accelerate business growth.",
      icon: BriefcaseBusiness,
      tags: ["Strategy", "Growth", "Tech"],
    },
    {
      title: "IT Support",
      href: "/services/it-support-maintenance",
      desc: "Reliable support and maintenance services for your digital ecosystem.",
      icon: ShieldCheck,
      tags: ["Security", "Support", "24/7"],
    },
    {
      title: "Digital Marketing",
      href: "/services/digital-marketing",
      desc: "Data-driven marketing strategies that generate traffic and conversions.",
      icon: LineChart,
      tags: ["Marketing", "Branding", "Ads"],
    },
    {
      title: "Startup Mentorship",
      href: "/services/startup-mentorship",
      desc: "Helping startups transform innovative ideas into scalable businesses.",
      icon: Rocket,
      tags: ["Startup", "Mentorship", "Scaling"],
    },
  ];

  return (
    <main className="relative overflow-hidden pt-36 pb-28 min-h-screen">
      {/* Background Glow */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.18),transparent_45%)]" />

      <div className="max-w-7xl mx-auto px-6">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mb-14"
        >
          <span className="inline-flex items-center px-4 py-2 rounded-full border border-blue-500/20 bg-blue-500/10 text-blue-300 text-sm font-medium mb-6">
            Our Expertise
          </span>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight mb-6">
            Our
            <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              {" "}
              Offerings
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted max-w-3xl leading-relaxed">
            We craft modern digital products, AI solutions and scalable
            software experiences that help businesses innovate, grow and lead
            the future.
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="relative">
          {/* Glow */}
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.10),transparent_70%)]" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {services.map((service, idx) => {
              const Icon = service.icon;

              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -8 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.5,
                    delay: idx * 0.08,
                  }}
                >
                  <Link
                    href={service.href}
                    className="
                    group relative overflow-hidden
                    rounded-3xl
                    border border-white/10
                    bg-white/[0.03]
                    backdrop-blur-xl
                    p-8
                    h-full
                    flex flex-col
                    transition-all duration-500
                    hover:border-blue-500/40
                    hover:bg-white/[0.05]
                    hover:shadow-[0_0_40px_rgba(59,130,246,0.15)]
                  "
                  >
                    {/* Hover Gradient */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 bg-gradient-to-br from-blue-500/10 via-cyan-500/5 to-transparent" />

                    {/* Top Blur Orb */}
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition duration-700" />

                    {/* Icon */}
                    <div className="relative z-10 w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6 text-blue-400 group-hover:scale-110 transition-transform duration-300">
                      <Icon size={26} />
                    </div>

                    {/* Title */}
                    <h3
                      className="
                      relative z-10
                      text-2xl font-semibold
                      tracking-tight
                      mb-4
                      transition-colors duration-300
                      group-hover:text-blue-400
                    "
                    >
                      {service.title}
                    </h3>

                    {/* Description */}
                    <p className="relative z-10 text-muted leading-relaxed mb-6">
                      {service.desc}
                    </p>

                    {/* Tags */}
                    <div className="relative z-10 flex flex-wrap gap-2 mb-8">
                      {service.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="
                          text-xs
                          px-3 py-1.5
                          rounded-full
                          border border-white/10
                          bg-white/[0.03]
                          text-blue-200
                        "
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* CTA */}
                    <div
                      className="
                      relative z-10
                      mt-auto
                      flex items-center gap-2
                      text-sm font-semibold
                      text-white
                      transition-all duration-300
                      group-hover:gap-4
                    "
                    >
                      Learn More
                      <ArrowRight size={16} />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* CTA Section */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="
          relative overflow-hidden
          mt-32
          rounded-[40px]
          border border-white/10
          bg-gradient-to-br from-blue-500/10 via-cyan-500/5 to-transparent
          backdrop-blur-xl
          p-10 md:p-16
          text-center
        "
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.15),transparent_70%)]" />

          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              Let’s Build Something Amazing
            </h2>

            <p className="text-lg text-muted max-w-2xl mx-auto mb-10 leading-relaxed">
              Partner with DIMISI to create intelligent, scalable and
              future-ready digital experiences for your business.
            </p>

            <Link
              href="/contact"
              className="
              inline-flex items-center gap-3
              px-8 py-4
              rounded-2xl
              bg-blue-600
              hover:bg-blue-500
              text-white
              font-semibold
              transition-all duration-300
              hover:scale-105
              hover:shadow-[0_0_30px_rgba(59,130,246,0.4)]
            "
            >
              Start Your Project
              <ArrowRight size={18} />
            </Link>
          </div>
        </motion.section>
      </div>
    </main>
  );
}