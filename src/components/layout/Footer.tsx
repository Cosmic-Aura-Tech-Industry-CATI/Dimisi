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
  return (
    <footer className="relative overflow-hidden border-t border-foreground/10">
      <div className="mx-auto max-w-7xl px-4 pt-12 pb-[220px] md:px-6 md:pb-[300px] lg:pb-[360px]">
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
        {/* Full-width bottom artwork: spans the footer width and sits at the very bottom. */}
        {/* Artwork sits above the bottom text; offset the artwork up so it doesn't overlap the copyright */}
        <div className="pointer-events-none absolute left-0 right-0 bottom-6 md:bottom-8 lg:bottom-10 w-full z-0">
          <div className="relative h-[200px] md:h-[260px] lg:h-[320px] w-full">
            <Image
              src="/Footer Bhootdev.svg"
              alt="DIMISI + Bhootdev"
              fill
              sizes="100vw"
              className="object-contain object-center w-full h-full"
              priority={false}
            />
          </div>
        </div>

        {/* Copyright pinned to the very bottom, centered, no bottom margin */}
        <div className="absolute inset-x-0 bottom-1 md:bottom-2 lg:bottom-3 flex justify-center pointer-events-auto z-10">
          <p className="text-center text-xs text-foreground/40">
            © 2026 Dimisi Technologies. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
