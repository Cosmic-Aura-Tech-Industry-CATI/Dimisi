import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Send, Youtube } from "lucide-react";

type Col = { title: string; links: { label: string; to: string }[] };

const COLUMNS: Col[] = [
  {
    title: "Company",
    links: [
      { label: "About Us", to: "/about" },
      { label: "Careers", to: "/careers" },
      { label: "Contact", to: "/contact" },
    ],
  },
  {
    title: "Services",
    links: [
      { label: "Offerings", to: "/services" },
      { label: "Solutions", to: "/services" },
      { label: "Consulting", to: "/services" },
    ],
  },
  {
    title: "Products",
    links: [
      { label: "Kalesh", to: "/products" },
      { label: "CarryOn", to: "/products" },
      { label: "Sylon", to: "/products" },
      { label: "Axis Conference Web", to: "/products" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Blogs", to: "/blog" },
      { label: "Case Studies", to: "/case-studies" },
      { label: "Documentation", to: "/blog" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", to: "/contact" },
      { label: "Cookie Policy", to: "/contact" },
      { label: "Terms of Use", to: "/contact" },
      { label: "Sitemap", to: "/contact" },
    ],
  },
];

const SOCIALS = [
  { label: "Instagram", icon: Instagram, href: "https://instagram.com" },
  { label: "Facebook", icon: Facebook, href: "https://facebook.com" },
  { label: "Telegram", icon: Send, href: "https://telegram.org" },
  { label: "YouTube", icon: Youtube, href: "https://youtube.com" },
];

export function Footer() {
  return (
    <footer className="border-t border-foreground/10 bg-[#050505]">
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-3 lg:grid-cols-6">
          <div className="col-span-2 max-w-xs md:col-span-3 lg:col-span-1">
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold tracking-tight text-foreground">Dimisi</span>
              <span className="text-[10px] font-medium tracking-[0.2em] text-foreground/40">
                TECHNOLOGIES
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-foreground/50">
              Building digital products, intelligent solutions, and future-ready technology
              experiences.
            </p>
            <div className="mt-6 flex items-center gap-3">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={s.label}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-foreground/10 text-foreground/60 transition-all hover:border-foreground/30 hover:text-foreground"
                >
                  <s.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {COLUMNS.map((column) => (
            <div key={column.title}>
              <h3 className="text-xs uppercase tracking-[0.2em] text-foreground/40">
                {column.title}
              </h3>
              <ul className="mt-5 space-y-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-foreground/50 transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 border-t border-foreground/10 pt-8">
          <p className="text-xs text-foreground/40">
            © 2026 Dimisi Technologies. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
