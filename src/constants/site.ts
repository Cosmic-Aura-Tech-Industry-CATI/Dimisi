import type { NavLink } from "@/types";

export const COMPANY = {
  name: "DIMISI TECHNOLOGIES PVT LTD",
  shortName: "DIMISI",
  tagline: "Technology Beyond Limits",
  mission:
    "DIMISI TECHNOLOGIES PVT LTD is a product and services technology company — we build software, web and mobile platforms, cloud systems and automation for businesses worldwide, and we are building our own app, Kalesh.",
  email: "hello@dimisi.in",
  phone: "+91 90000 12345",
  address: "Sector 62, Noida, India · Remote-first worldwide",
} as const;

export const NAV_LINKS: NavLink[] = [
  { label: "Home", to: "/" },
  { label: "Services", to: "/services" },
  { label: "Our Work", to: "/work" },
  { label: "Reviews", to: "/reviews" },
  { label: "Team", to: "/team" },
  { label: "Blog", to: "/blog" },
  { label: "Events & Gallery", to: "/events" },
  { label: "Career", to: "/career" },
  { label: "Contact Us", to: "/contact" },
];

export const LEGAL_LINKS: NavLink[] = [
  { label: "About Us", to: "/about" },
  { label: "Client Reviews", to: "/reviews" },
  { label: "Leave a Review", to: "/review" },
  { label: "Privacy Policy", to: "/privacy" },
  { label: "Terms & Conditions", to: "/terms" },
];

export const SOCIALS = [
  { label: "X", href: "https://x.com" },
  { label: "LinkedIn", href: "https://linkedin.com" },
  { label: "GitHub", href: "https://github.com" },
  { label: "YouTube", href: "https://youtube.com" },
];