"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import { ChevronDown, Menu, X } from "lucide-react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-black/60 backdrop-blur-md border-b border-white/10" : "bg-transparent py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center">
            <div className="w-3 h-3 bg-white rounded-sm rotate-45" />
          </div>
          <span className="font-bold text-xl tracking-tight">Demisi</span>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="#features" className="text-sm text-gray-300 hover:text-white transition-colors flex items-center gap-1">
            Features
          </Link>
          <Link href="#usecases" className="text-sm text-gray-300 hover:text-white transition-colors flex items-center gap-1">
            Use cases <ChevronDown className="w-4 h-4 opacity-50" />
          </Link>
          <Link href="#integration" className="text-sm text-gray-300 hover:text-white transition-colors">
            Integration
          </Link>
          <Link href="#pricing" className="text-sm text-gray-300 hover:text-white transition-colors">
            Pricing
          </Link>
          <Link href="#about" className="text-sm text-gray-300 hover:text-white transition-colors flex items-center gap-1">
            About <ChevronDown className="w-4 h-4 opacity-50" />
          </Link>
        </div>

        {/* CTAs */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
            Log In
          </Link>
          <Link href="/signup" className="text-sm font-medium px-4 py-2 rounded-full border border-white/20 hover:bg-white hover:text-black transition-all">
            Start for free
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden text-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden absolute top-full left-0 right-0 bg-black/95 backdrop-blur-lg border-b border-white/10 p-6 flex flex-col gap-4"
        >
          <Link href="#features" className="text-lg">Features</Link>
          <Link href="#usecases" className="text-lg">Use cases</Link>
          <Link href="#integration" className="text-lg">Integration</Link>
          <Link href="#pricing" className="text-lg">Pricing</Link>
          <Link href="#about" className="text-lg">About</Link>
          <hr className="border-white/10 my-2" />
          <Link href="/login" className="text-lg">Log In</Link>
          <Link href="/signup" className="text-lg text-blue-400">Start for free</Link>
        </motion.div>
      )}
    </nav>
  );
}
