import type { NavLink } from "@/types";

export const COMPANY = {
  name: "DIMISI TECHNOLOGIES PVT LTD",
  shortName: "DIMISI",
  tagline: "Technology Beyond Limits",
  cin: "U62013UP2026PTC246506",
  mcaRegistered: "MCA Registered (India)",
  dpiitNumber: "DIPP283489",
  dpiitValidUpto: "08-04-2036",
  mission:
    "We help businesses build rock-solid software architectures, scale with data-driven digital marketing, and navigate growth through strategic corporate advisory—while creating next-generation consumer social platforms.",
  email: "support@dimisi.tech",
  supportEmail: "support@dimisi.tech",
  hrEmail: "hr@dimisi.tech",
  ceoEmail: "ceo@dimisi.tech",
  ctoEmail: "cto@dimisi.tech",
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

export const STARTUP_RECOGNITIONS = [
  {
    id: "nvidia-inception",
    title: "NVIDIA Inception Program Member",
    badge: "AI & Startup Ecosystem",
    description:
      "DIMISI Technologies Private Limited is a proud member of the NVIDIA Inception Program, a global initiative supporting innovative startups with access to technology resources, developer tools, training, and business growth opportunities.",
    logo: "/images/nvidia-inception-clean.png",
    alt: "NVIDIA Inception Program Member",
    link: "https://www.nvidia.com/en-us/deep-learning-ai/startups/",
    actionText: "Explore NVIDIA Inception",
  },
  {
    id: "startup-india",
    title: "Startup India Recognized",
    badge: "Govt. of India · DPIIT",
    description:
      "Recognized by the Department for Promotion of Industry and Internal Trade (DPIIT), Ministry of Commerce & Industry, Government of India. Valid through April 2036.",
    logo: "/images/startup-india-clean.png",
    alt: "Startup India DPIIT Recognition",
    certNumber: "DIPP283489",
    link: "/documents/dimisi-dpiit-certificate.pdf",
    actionText: "View Recognition Certificate",
  },
] as const;

export const OFFICIAL_EMAILS = [
  {
    role: "Official Support",
    email: "support@dimisi.tech",
    description: "Customer service & general helpdesk",
  },
  {
    role: "Careers & HR",
    email: "hr@dimisi.tech",
    description: "Talent acquisition & recruitment",
  },
  {
    role: "CEO Office",
    email: "ceo@dimisi.tech",
    description: "Executive desk & partnerships",
  },
  {
    role: "CTO Office",
    email: "cto@dimisi.tech",
    description: "Architecture & engineering advisory",
  },
] as const;

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
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/dimisi-technologies-pvt-ltd/",
    ariaLabel: "DIMISI on LinkedIn",
    id: "linkedin",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/dimisi.tech?rpxt=MTFuMnptMTFmcml5YQ==",
    ariaLabel: "DIMISI on Instagram",
    id: "instagram",
  },
  { label: "YouTube", href: "https://youtube.com", ariaLabel: "DIMISI on YouTube", id: "youtube" },
];
