import type { NavLink } from "@/types";

export const COMPANY = {
  name: "DIMISI TECHNOLOGIES PVT LTD",
  shortName: "DIMISI",
  tagline: "Technology Beyond Limits",
  mission:
    "DIMISI TECHNOLOGIES PVT LTD is a product and services technology company — we build software, web and mobile platforms, cloud systems and automation for businesses worldwide, and we are building our own app, Kalesh.",
  email: "hello@dimisi.in",
  phone: "085450 99251",
  phoneRaw: "08545099251",
  address: "MIG 3/131, Swarn Jayanti Vihar, Koyala Nagar, Kanpur, Uttar Pradesh 208011",
  addressLines: [
    "MIG 3/131,",
    "Swarn Jayanti Vihar,",
    "Koyala Nagar,",
    "Kanpur,",
    "Uttar Pradesh 208011",
  ],
  mapsUrl: "https://maps.google.com/?q=MIG+3/131,+Swarn+Jayanti+Vihar,+Koyala+Nagar,+Kanpur,+Uttar+Pradesh+208011",
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
  { label: "X", href: "https://x.com", ariaLabel: "DIMISI on X", id: "x" },
  { label: "LinkedIn", href: "https://linkedin.com", ariaLabel: "DIMISI on LinkedIn", id: "linkedin" },
  { label: "GitHub", href: "https://github.com", ariaLabel: "DIMISI on GitHub", id: "github" },
  { label: "YouTube", href: "https://youtube.com", ariaLabel: "DIMISI on YouTube", id: "youtube" },
];