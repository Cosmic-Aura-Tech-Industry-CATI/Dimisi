"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Play, X } from "lucide-react";
import { TypeAnimation } from "react-type-animation";
import CountUp from "react-countup";

export default function Hero() {
  // Mouse Glow Position
  const [mousePosition, setMousePosition] = useState({
    x: 0,
    y: 0,
  });

  const [rotation, setRotation] = useState({
    rotateX: 0,
    rotateY: 0,
  });

  const [videoOpen, setVideoOpen] = useState(false);

  // Mouse Move Handler
  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setMousePosition({
      x,
      y,
    });

    // Rotation calculation
    const rotateY = ((x - rect.width / 2) / rect.width) * 10;

    const rotateX = -((y - rect.height / 2) / rect.height) * 10;

    setRotation({
      rotateX,
      rotateY,
    });
  };

  return (
    <section
      onMouseMove={handleMouseMove}
      className="relative min-h-screen overflow-hidden flex items-center justify-center px-6 pt-32 pb-20"
    >
      {/* Mouse Glow Effect */}
      <div
        className="pointer-events-none absolute inset-0 z-0 transition duration-300"
        style={{
          background: `
            radial-gradient(
              600px circle at ${mousePosition.x}px ${mousePosition.y}px,
              rgba(59,130,246,0.18),
              transparent 40%
            ),
            radial-gradient(
              400px circle at ${mousePosition.x - 200}px ${mousePosition.y - 100}px,
              rgba(168,85,247,0.12),
              transparent 40%
            )
          `,
        }}
      />

      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Static Floating Particles */}

        <div className="absolute top-[10%] left-[15%] w-2 h-2 bg-blue-400/40 rounded-full animate-pulse" />

        <div className="absolute top-[20%] right-[10%] w-1 h-1 bg-purple-400/40 rounded-full animate-ping" />

        <div className="absolute bottom-[25%] left-[20%] w-2 h-2 bg-cyan-400/40 rounded-full animate-pulse" />

        <div className="absolute top-[60%] right-[25%] w-1.5 h-1.5 bg-white/40 rounded-full animate-ping" />

        <div className="absolute bottom-[15%] right-[15%] w-2 h-2 bg-blue-300/40 rounded-full animate-pulse" />

        <div className="absolute top-[35%] left-[40%] w-1 h-1 bg-purple-300/40 rounded-full animate-ping" />

        {/* Floating Particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              delay: i * 0.2,
            }}
            className="absolute rounded-full bg-blue-400"
            style={{
              width: `${Math.random() * 4 + 2}px`,
              height: `${Math.random() * 4 + 2}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: 0.3,
            }}
          />
        ))}

        {/* Animated Stars */}
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={`star-${i}`}
            animate={{
              opacity: [0.2, 1, 0.2],
              scale: [1, 1.4, 1],
            }}
            transition={{
              duration: 2 + i * 0.2,
              repeat: Infinity,
            }}
            className="absolute bg-white rounded-full"
            style={{
              width: "2px",
              height: "2px",
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
          />
        ))}

        {/* Animated Gradient Blob */}
        <motion.div
          animate={{
            x: [0, 40, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
          }}
          className="absolute top-1/4 left-1/3 w-[350px] h-[350px]
  bg-cyan-500/10 blur-[120px] rounded-full"
        />

        <motion.div
          animate={{
            x: [0, -30, 0],
            y: [0, 40, 0],
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
          }}
          className="absolute bottom-0 right-1/4 w-[300px] h-[300px]
  bg-purple-500/10 blur-[120px] rounded-full"
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto text-center">
        {/* Top Badge */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl mb-8"
        >
          <span className="px-2 py-1 rounded-full bg-blue-500 text-white text-xs font-bold">
            NEW
          </span>

          <span className="text-sm text-gray-300">
            Introducing Dimisi Technologies Private Limited
          </span>
        </motion.div>

        {/* Heading */}
        <motion.div initial="hidden" animate="visible" className="space-y-2">
          {/* Line 1 */}
          <motion.h1
            variants={{
              hidden: { opacity: 0, y: 40 },
              visible: {
                opacity: 1,
                y: 0,
                transition: {
                  duration: 0.8,
                  ease: [0.16, 1, 0.3, 1],
                },
              },
            }}
            className="text-5xl md:text-7xl lg:text-8xl font-black leading-tight"
          >
            From Ideas To
          </motion.h1>

          {/* Line 2 */}
          <motion.h1
            variants={{
              hidden: { opacity: 0, y: 50 },
              visible: {
                opacity: 1,
                y: 0,
                transition: {
                  delay: 0.2,
                  duration: 0.9,
                  ease: [0.16, 1, 0.3, 1],
                },
              },
            }}
            className="text-5xl md:text-7xl lg:text-8xl font-black leading-tight"
          >
            <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-400 bg-clip-text text-transparent">
              Intelligent Software
            </span>
          </motion.h1>
        </motion.div>

        {/* Typing Animation */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex justify-center items-center gap-2 text-blue-400 font-semibold text-lg mt-8 mb-6"
        >
          <span>Specialized In</span>

          <TypeAnimation
            sequence={[
              "AI Automation",
              2000,
              "Web Development",
              2000,
              "Cloud Infrastructure",
              2000,
              "Digital Products",
              2000,
            ]}
            wrapper="span"
            speed={50}
            repeat={Infinity}
            className="text-white"
          />
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed mb-8"
        >
          We build scalable web platforms,{" "}
          <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent font-semibold">
            AI-powered systems
          </span>
          , and modern{" "}
          <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-semibold">
            digital products
          </span>{" "}
          that help{" "}
          <span className="bg-gradient-to-r from-cyan-300 to-blue-500 bg-clip-text text-transparent font-semibold">
            modern businesses
          </span>{" "}
          grow faster.
        </motion.p>

        {/* Kalesh Badge */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="mb-12 flex justify-center"
        >
          <span className="px-5 py-2 rounded-full border border-purple-500/20 bg-purple-500/10 text-purple-300 text-sm md:text-base font-medium backdrop-blur-xl shadow-[0_0_25px_rgba(168,85,247,0.2)]">
            🚀 Creator of KALESH — The Open Opinion Platform
          </span>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10"
        >
          {/* Primary CTA */}
          <Link
            href="#contact"
            className="group px-10 py-4 rounded-full font-bold flex items-center gap-2 
            bg-gradient-to-r from-blue-500 to-cyan-400 text-white
            shadow-[0_0_30px_rgba(59,130,246,0.45)]
            hover:shadow-[0_0_40px_rgba(59,130,246,0.7)]
            hover:scale-105 active:scale-95
            transition-all duration-300"
          >
            Book Consultation
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>

          {/* Secondary CTA */}
          {/* Secondary CTA */}
          <button
            onClick={() => setVideoOpen(true)}
            className="px-10 py-4 rounded-full border border-white/10
  bg-white/5 hover:bg-white/10
  backdrop-blur-xl text-white font-bold
  flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
          >
            <Play className="w-4 h-4 fill-current" />
            Watch Reel
          </button>
        </motion.div>

        {/* Product CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex justify-center mb-16"
        >
          <Link
            href="#kalesh"
            className="text-purple-400 hover:text-purple-300 font-semibold transition-colors duration-300"
          >
            🚀 View Kalesh →
          </Link>
        </motion.div>

        {/* Metrics Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.7 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto mb-20"
        >
          {/* Metric 1 */}
          <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 text-center hover:scale-105 transition-all duration-300 shadow-[0_0_30px_rgba(59,130,246,0.08)]">
            <h3 className="text-3xl md:text-4xl font-black text-white mb-2">
              <CountUp end={10} duration={2} />+
            </h3>

            <p className="text-gray-400 text-sm md:text-base">Services</p>
          </div>

          {/* Metric 2 */}
          <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 text-center hover:scale-105 transition-all duration-300 shadow-[0_0_30px_rgba(168,85,247,0.08)]">
            <h3 className="text-3xl md:text-4xl font-black text-white mb-2">
              <CountUp end={5} duration={2} />+
            </h3>

            <p className="text-gray-400 text-sm md:text-base">Products</p>
          </div>

          {/* Metric 3 */}
          <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 text-center hover:scale-105 transition-all duration-300 shadow-[0_0_30px_rgba(34,197,94,0.08)]">
            <h3 className="text-3xl md:text-4xl font-black text-white mb-2">
              24/7
            </h3>

            <p className="text-gray-400 text-sm md:text-base">Support</p>
          </div>

          {/* Metric 4 */}
          <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 text-center hover:scale-105 transition-all duration-300 shadow-[0_0_30px_rgba(236,72,153,0.08)]">
            <h3 className="text-3xl md:text-4xl font-black text-white mb-2">
              <CountUp end={99} duration={2} />%
            </h3>

            <p className="text-gray-400 text-sm md:text-base">
              Client Satisfaction
            </p>
          </div>
        </motion.div>

        {/* Dashboard Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="relative max-w-5xl mx-auto"
        >
          {/* Dashboard Glow */}
          <div className="absolute inset-0 bg-blue-500/10 blur-[100px] rounded-full" />

          {/* Dashboard Container */}
          <div className="relative rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-2xl p-4 shadow-[0_0_80px_rgba(59,130,246,0.15)]">
            {/* Dashboard Image */}
            <Image
              src="/image 1.png"
              alt="Dimisi Dashboard"
              width={1400}
              height={900}
              priority
              className="rounded-[1.5rem] w-full h-auto object-cover"
            />

            {/* Floating Growth Card */}
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ repeat: Infinity, duration: 5 }}
              className="hidden lg:block absolute top-16 -right-20 w-56
  rounded-3xl border border-white/20
  bg-[#0B1220]/90 backdrop-blur-2xl
  p-5 shadow-[0_0_40px_rgba(59,130,246,0.2)]
  z-40"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-400">Revenue Growth</span>

                <span className="text-green-400 font-bold">+24%</span>
              </div>

              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="w-[70%] h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full" />
              </div>

              <p className="text-xs text-gray-500 mt-3">
                Increased business performance
              </p>
            </motion.div>

            {/* Floating AI Card */}
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 4 }}
              className="hidden lg:flex absolute bottom-24 -left-20
  items-center gap-3
  rounded-2xl border border-white/20
  bg-[#0B1220]/90 backdrop-blur-2xl
  px-5 py-4
  shadow-[0_0_40px_rgba(168,85,247,0.2)]
  z-40"
            >
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center text-2xl">
                🤖
              </div>

              <div>
                <p className="text-white font-semibold">AI Enabled</p>

                <p className="text-xs text-gray-400">Intelligent Automation</p>
              </div>
            </motion.div>

            {/* Floating Card - Cloud */}
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 5 }}
              className="hidden md:block absolute bottom-20 -right-16 px-5 py-4 rounded-2xl
              border border-white/20
              bg-[#0B1220]/80
              backdrop-blur-2xl
              shadow-[0_0_40px_rgba(168,85,247,0.15)]
              z-30 hover:scale-105 transition-all duration-300"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">☁️</span>

                <div className="text-left">
                  <p className="text-white font-semibold text-sm">
                    Cloud Infrastructure
                  </p>

                  <p className="text-xs text-gray-400">Secure & Scalable</p>
                </div>
              </div>
            </motion.div>

            {/* Floating Analytics */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 6 }}
              className="hidden lg:block absolute top-1/3 -left-16
  rounded-3xl border border-white/20
  bg-[#0B1220]/90 backdrop-blur-2xl
  p-5 w-48
  shadow-[0_0_40px_rgba(34,197,94,0.2)]
  z-40"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-400">Analytics</span>

                <span className="text-green-400 text-sm">Live</span>
              </div>

              <div className="flex items-end gap-2 h-20">
                <div className="w-4 h-8 bg-blue-500 rounded-md" />
                <div className="w-4 h-12 bg-cyan-400 rounded-md" />
                <div className="w-4 h-16 bg-purple-500 rounded-md" />
                <div className="w-4 h-20 bg-green-400 rounded-md" />
              </div>
            </motion.div>

            {/* Floating Mobile Preview */}
            <motion.div
              animate={{ y: [0, -10, 0], rotate: [0, 2, 0] }}
              transition={{ repeat: Infinity, duration: 5 }}
              className="hidden xl:block absolute -bottom-10 right-32
  w-40 rounded-[2rem]
  border border-white/20
  bg-[#0B1220]/90 backdrop-blur-2xl
  p-2 shadow-[0_0_50px_rgba(59,130,246,0.25)]
  z-50"
            >
              <Image
                src="/mobile-preview.png"
                alt="Mobile UI"
                width={300}
                height={600}
                className="rounded-[1.5rem]"
              />
            </motion.div>

            {/* Floating Card - Uptime */}
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 4.5 }}
              className="hidden md:block absolute -bottom-6 left-20 px-5 py-4 rounded-2xl
              border border-white/20
              bg-[#0B1220]/80
              backdrop-blur-2xl
              shadow-[0_0_40px_rgba(236,72,153,0.15)]
              z-30 hover:scale-105 transition-all duration-300"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚡</span>

                <div className="text-left">
                  <p className="text-white font-semibold text-sm">
                    99.9% Uptime
                  </p>

                  <p className="text-xs text-gray-400">Reliable Systems</p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Trusted Tech Stack */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="relative z-10 mt-24"
        >
          {/* Title */}
          <p className="text-sm uppercase tracking-[0.3em] text-gray-500 mb-10 text-center">
            Powered By Modern Technologies
          </p>

          {/* Stack Container */}
          <div className="flex flex-wrap justify-center items-center gap-5 md:gap-8">
            {[
              "Next.js",
              "React",
              "Node.js",
              "TypeScript",
              "MongoDB",
              "AWS",
              "OpenAI",
              "Tailwind CSS",
            ].map((tech, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.08 }}
                className="px-6 py-3 rounded-2xl
        border border-white/10
        bg-white/5
        backdrop-blur-xl
        text-gray-300 font-semibold
        shadow-[0_0_25px_rgba(255,255,255,0.03)]
        hover:border-blue-400/30
        hover:text-white
        transition-all duration-300"
              >
                {tech}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{
          opacity: [0.4, 1, 0.4],
          y: [0, 10, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
        }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center"
      >
        <span className="text-sm text-gray-400 tracking-wide mb-2">
          Scroll to explore
        </span>

        <div className="w-6 h-10 rounded-full border border-white/20 flex justify-center p-1">
          <motion.div
            animate={{
              y: [0, 12, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
            }}
            className="w-1.5 h-1.5 rounded-full bg-blue-400"
          />
        </div>
      </motion.div>

      {/* Video Modal */}
      <AnimatePresence>
        {videoOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl flex items-center justify-center p-6"
          >
            {/* Close Button */}
            {/* Close Button */}
            <button
              onClick={() => setVideoOpen(false)}
              className="fixed top-28 right-8 z-[9999]
  w-12 h-12 rounded-full
  bg-black/60 hover:bg-red-500/20
  border border-white/10
  backdrop-blur-2xl
  flex items-center justify-center
  text-white hover:text-red-400
  transition-all duration-300
  hover:scale-110 shadow-[0_0_30px_rgba(0,0,0,0.4)]"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Content */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{
                duration: 0.4,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="relative w-full max-w-5xl rounded-[2rem] overflow-hidden border border-white/10 bg-[#0B1220]"
            >
              {/* Video */}
              <video autoPlay controls className="w-full h-full object-cover">
                <source src="/dimisi-reel.mp4" type="video/mp4" />
              </video>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
