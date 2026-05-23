"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Globe, Cpu, TrendingUp } from "lucide-react";
import InteractiveCard from "@/components/InteractiveCard";

const features = [
  {
    title: "Build a strong digital presence",
    description:
      "We design and develop modern websites and applications that help your business stand out and attract more customers online.",
    points: [
      "Responsive websites",
      "Custom web apps",
      "SEO-ready structure",
      "High performance",
    ],
    image: "/image 1.png", // Replace with REAL dashboard mockup
    icon: <Globe className="w-6 h-6 text-blue-400" />,
    badge: "🌐 Digital Growth",
  },
  {
    title: "Automate and scale your operations",
    description:
      "Leverage AI and custom software solutions to streamline workflows, reduce manual effort, and improve efficiency.",
    points: [
      "AI automation",
      "Custom software",
      "Process optimization",
      "Cloud integration",
    ],
    image: "/Features-Image2.png", // Replace with REAL AI workflow UI
    icon: <Cpu className="w-6 h-6 text-purple-400" />,
    badge: "⚡ AI Powered",
  },
  {
    title: "Scale Your Business with Data-Driven Growth",
    description:
      "We help you attract the right audience, optimize conversions, and build scalable systems that drive consistent revenue growth.",
    points: [
      "SEO & Online Visibility",
      "Performance Tracking",
      "Lead Generation Systems",
      "Growth-Focused Marketing",
    ],
    image: "/Features-Image3.png", // Replace with REAL analytics UI
    icon: <TrendingUp className="w-6 h-6 text-pink-400" />,
    badge: "📈 Growth Ready",
  },
];

const textAnimations = [
  {
    initial: { opacity: 0, x: -80 },
    whileInView: { opacity: 1, x: 0 },
  },
  {
    initial: { opacity: 0, y: 80 },
    whileInView: { opacity: 1, y: 0 },
  },
  {
    initial: { opacity: 0, scale: 0.8 },
    whileInView: { opacity: 1, scale: 1 },
  },
];

const imageAnimations = [
  {
    initial: { opacity: 0, scale: 0.9, rotate: -2 },
    whileInView: { opacity: 1, scale: 1, rotate: 0 },
  },
  {
    initial: { opacity: 0, y: 100 },
    whileInView: { opacity: 1, y: 0 },
  },
  {
    initial: { opacity: 0, x: 100 },
    whileInView: { opacity: 1, x: 0 },
  },
];

export default function Features() {
  return (
    <section
      className="py-24 md:py-32 relative overflow-hidden"
      id="features"
    >
      {/* Floating Gradient Orbs */}
      <div className="absolute -top-20 -left-20 w-72 h-72 bg-blue-500/20 blur-[120px] rounded-full animate-pulse" />

      <div className="absolute top-1/2 right-0 w-80 h-80 bg-purple-500/20 blur-[140px] rounded-full animate-pulse" />

      <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-cyan-500/10 blur-[120px] rounded-full animate-pulse" />

      {/* Grid Overlay */}
      <div className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:80px_80px]" />

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <span
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-40 animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDuration: `${2 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* Timeline Line */}
      <div className="hidden lg:block absolute left-1/2 top-0 h-full w-[2px] bg-white/10">
        <div className="sticky top-0 h-40 w-full bg-gradient-to-b from-blue-500 via-purple-500 to-transparent blur-sm" />
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col gap-24">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className={`relative flex flex-col lg:flex-row items-center gap-16 ${
                idx % 2 === 1 ? "lg:flex-row-reverse" : ""
              }`}
            >
              {/* Timeline Dot */}
              <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-blue-500 shadow-[0_0_25px_rgba(59,130,246,0.9)] z-20" />

              {/* Text Content */}
              <motion.div
                initial={textAnimations[idx].initial}
                whileInView={textAnimations[idx].whileInView}
                viewport={{ once: true, margin: "-100px" }}
                transition={{
                  duration: 0.8,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="flex-1 space-y-6"
              >
                {/* Icon */}
                <motion.div
                  whileHover={{
                    rotate: 12,
                    scale: 1.12,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                  }}
                  className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-xl shadow-lg hover:border-blue-500/40 hover:shadow-[0_0_30px_rgba(59,130,246,0.25)] transition-all duration-300"
                >
                  {feature.icon}
                </motion.div>

                {/* Title */}
                <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white leading-tight">
                  {feature.title}
                </h2>

                {/* Description */}
                <p className="text-lg text-gray-400 font-medium leading-relaxed max-w-xl">
                  {feature.description}
                </p>

                {/* Interactive Bullet Points */}
                <div className="grid grid-cols-2 gap-4 pt-4">
                  {feature.points.map((point, i) => (
                    <motion.div
                      key={i}
                      whileHover={{
                        x: 8,
                      }}
                      className="group flex items-center gap-3 text-gray-300 font-medium transition-all duration-300 hover:text-white cursor-pointer"
                    >
                      <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.9)] transition-all duration-300 group-hover:scale-150 group-hover:bg-cyan-400" />

                      <span className="transition-all duration-300 group-hover:tracking-wide">
                        {point}
                      </span>
                    </motion.div>
                  ))}
                </div>

                {/* Futuristic CTA Button */}
                <motion.button
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 0 35px rgba(59,130,246,0.45)",
                  }}
                  whileTap={{ scale: 0.96 }}
                  className="relative overflow-hidden px-7 py-3 rounded-full
                  bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500
                  text-white font-semibold tracking-wide
                  transition-all duration-300
                  hover:shadow-[0_0_30px_rgba(59,130,246,0.5)]
                  group"
                >
                  {/* Shine Effect */}
                  <span className="absolute inset-0 overflow-hidden rounded-full">
                    <span
                      className="absolute left-[-120%] top-0 h-full w-[120%]
                      bg-gradient-to-r from-transparent via-white/30 to-transparent
                      skew-x-[-20deg]
                      transition-all duration-1000
                      group-hover:left-[120%]"
                    />
                  </span>

                  <span className="relative z-10 flex items-center gap-2">
                    Learn more

                    <motion.span
                      animate={{ x: [0, 4, 0] }}
                      transition={{
                        repeat: Infinity,
                        duration: 1.5,
                      }}
                    >
                      →
                    </motion.span>
                  </span>
                </motion.button>
              </motion.div>

              {/* Image Content */}
              <motion.div
                initial={imageAnimations[idx].initial}
                whileInView={imageAnimations[idx].whileInView}
                whileHover={{
                  scale: 1.02,
                  rotateX: 3,
                  rotateY: -3,
                }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{
                  duration: 0.7,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="flex-1 [transform-style:preserve-3d]"
                style={{ perspective: "1200px" }}
              >
                <InteractiveCard>
                  <div
                    className="group relative w-full aspect-[4/3]
                    rounded-[2rem] overflow-hidden border border-white/10
                    bg-white/[0.03] backdrop-blur-xl
                    transition-all duration-500
                    hover:-translate-y-2
                    hover:border-blue-500/30
                    hover:shadow-[0_0_50px_rgba(59,130,246,0.18)]"
                  >
                    {/* Gradient Glow */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 via-transparent to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-10" />

                    {/* Floating Badge */}
                    <motion.div
                      animate={{
                        y: [0, -6, 0],
                      }}
                      transition={{
                        repeat: Infinity,
                        duration: 3,
                      }}
                      className="absolute top-5 right-5 z-20 px-4 py-2 rounded-full bg-black/40 border border-white/10 backdrop-blur-xl text-sm text-white font-medium"
                    >
                      {feature.badge}
                    </motion.div>

                    {/* Real UI Mockup Image */}
                    <Image
                      src={feature.image}
                      alt={feature.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover rounded-[2rem] transition-transform duration-1000 group-hover:scale-110 group-hover:-translate-y-2"
                    />

                    {/* Bottom Gradient */}
                    <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/50 to-transparent z-10" />
                  </div>
                </InteractiveCard>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}