"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { Linkedin, Instagram, Youtube } from "lucide-react";

// Footer.tsx — Global site footer component displaying brand tagline, grouped resource columns, and copyright notice.
const COLUMNS = [
  {
    title: "Company",
    links: ["About Us", "Careers", "Contact"],
  },
  {
    title: "Services",
    links: ["Offerings", "Solutions", "Consulting"],
  },
  {
    title: "Products",
    links: ["Kalesh"],
  },
  {
    title: "Resources",
    links: ["Blogs", "Case Studies", "Documentation"],
  },
];

export function Footer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: -1000, y: -1000 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <footer 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative overflow-hidden border-t border-foreground/10 bg-background"
    >
      <div className="mx-auto max-w-7xl px-4 pt-12 pb-[160px] md:px-6 md:pb-[200px] lg:pb-[240px] relative z-10">
        <div className="grid items-center grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="flex flex-col items-center text-center sm:col-span-2 sm:items-center sm:text-center lg:col-span-1">
            <div className="relative h-8 w-[180px] mx-auto sm:mx-0 mb-2">
              <Image
                src="/Dimisi%20logo%20horizon.svg"
                alt="Dimisi Technologies"
                fill
                sizes="180px"
                className="object-contain object-center"
              />
            </div>

            <div className="mt-0 flex items-center justify-center gap-6">
              <a
                href="https://www.linkedin.com/company/dimisi-technologies-pvt-ltd/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="text-foreground/60 hover:text-foreground transition-colors"
              >
                <Linkedin size={20} />
              </a>

              <a
                href="https://www.instagram.com/thestartupdiariesofficial?igsh=MXA1cDA3MW1kNDJjNQ=="
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-foreground/60 hover:text-foreground transition-colors"
              >
                <Instagram size={20} />
              </a>

              <a
                href="https://youtube.com/@thestartupdiariesofficial?si=tgKAPRqRwftqDHp5"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="text-foreground/60 hover:text-foreground transition-colors"
              >
                <Youtube size={20} />
              </a>
            </div>
          </div>

          {COLUMNS.map((column) => (
            <div key={column.title} className="flex flex-col items-center text-center sm:items-start sm:text-left">
              <h3 className="text-xs uppercase tracking-[0.2em] text-foreground/40">
                {column.title}
              </h3>
              <ul className="mt-5 space-y-3">
                {column.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="block text-sm text-foreground/50 transition-colors hover:text-foreground sm:text-left"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 border-t border-foreground/10 pt-8" />

        {/* Copyright pinned cleanly above the background watermark */}
        <div className="flex justify-center pt-2">
          <p className="text-center text-xs text-foreground/40">
            © 2026 Dimisi Technologies. All Rights Reserved.
          </p>
        </div>
      </div>

      {/* Full-Screen Continuous Edge-to-Edge Watermark (No letter gaps) */}
      <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden pointer-events-none z-0 select-none leading-none translate-y-[35%]">
        
        {/* Base Ghost Layer: Continuous single word stretched edge-to-edge */}
        <span 
          className="block w-full text-center font-black uppercase tracking-tighter text-[36vw] text-foreground/[0.03] blur-[1px] whitespace-nowrap"
          style={{
            maskImage: "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
          }}
        >
          DIMISI
        </span>

        {/* Interactive Spotlight & Blur Reveal Layer */}
        <span 
          className="absolute inset-0 block w-full text-center font-black uppercase tracking-tighter text-[36vw] text-foreground whitespace-nowrap transition-opacity duration-300"
          style={{
            opacity: isHovered ? 1 : 0,
            maskImage: `radial-gradient(circle 350px at ${mousePosition.x}px ${mousePosition.y}px, black 0%, transparent 100%), linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)`,
            WebkitMaskImage: `radial-gradient(circle 350px at ${mousePosition.x}px ${mousePosition.y}px, black 0%, transparent 100%), linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)`,
            maskComposite: "intersect",
            WebkitMaskComposite: "source-in",
          }}
        >
          DIMISI
        </span>
      </div>
    </footer>
  );
}