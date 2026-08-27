import shikharPhoto from "@/assets/shikhar-dixit.jpg.asset.json";
import swatantraPhoto from "@/assets/swatantra-singh.jpg.asset.json";
import nishkarshPhoto from "@/assets/nishkarsh-mishra.jpg.asset.json";
import sheeluPhoto from "@/assets/sheelu-singh.jpg.asset.json";
import mridulPhoto from "@/assets/mridul-mishra.jpg.asset.json";
import amritPhoto from "@/assets/amrit.jpg.asset.json";
import harshPhoto from "@/assets/harsh-mishra.jpg.asset.json";

export interface Office {
  no: string;
  name: string;
  role: string;
  subtitle: string;
  department: string;
  description: string;
  responsibilities: string[];
  focus: string;
  initials: string;
  photo?: string;
  wing: "Leadership" | "Core Team" | "Internship Wing";
}

export const OFFICES: Office[] = [
  {
    no: "01",
    name: "Shikhar Dixit",
    role: "Founder • Director • CEO",
    subtitle: "Visionary Entrepreneur & Strategic Leader",
    department: "Executive",
    description:
      "Leads DIMISI Technologies with a long-term vision focused on innovation, product excellence, and sustainable growth. Oversees business strategy, partnerships, company culture, and future expansion while ensuring every product reflects the company's mission.",
    responsibilities: [
      "Company Vision",
      "Strategic Planning",
      "Business Development",
      "Investor Relations",
      "Leadership",
    ],
    focus: "Scaling DIMISI into a global product and services company.",
    initials: "SD",
    photo: shikharPhoto.url,
    wing: "Leadership",
  },
  {
    no: "02",
    name: "Swatantra Singh",
    role: "Co-Founder • Director • CTO",
    subtitle: "Technology Architect & Product Engineering Lead",
    department: "Engineering",
    description:
      "Drives the complete technology ecosystem of DIMISI. Responsible for software architecture, AI integration, engineering standards, technical innovation, and product scalability across all platforms.",
    responsibilities: [
      "Software Architecture",
      "AI Systems",
      "Full Stack Engineering",
      "Cloud Infrastructure",
      "Product Engineering",
    ],
    focus: "Platform architecture for the Kalesh app and client systems.",
    initials: "SS",
    photo: swatantraPhoto.url,
    wing: "Leadership",
  },
  {
    no: "03",
    name: "Nishkarsh Mishra",
    role: "Co-Founder • Director • CFO",
    subtitle: "Finance Strategy & Operations",
    department: "Finance & Operations",
    description:
      "Manages financial planning, budgeting, operational efficiency, legal compliance, investment planning, and sustainable business growth.",
    responsibilities: ["Finance", "Budget", "Compliance", "Operations", "Business Planning"],
    focus: "Sustainable growth planning and operational efficiency.",
    initials: "NM",
    photo: nishkarshPhoto.url,
    wing: "Leadership",
  },
  {
    no: "04",
    name: "Sheelu Singh",
    role: "Android Developer",
    subtitle: "Mobile Application Engineer",
    department: "Mobile Engineering",
    description:
      "Builds modern Android applications focused on performance, usability, security, and seamless user experiences.",
    responsibilities: ["Android", "Kotlin", "Performance", "App Security", "Release Delivery"],
    focus: "Kalesh Android builds and release quality.",
    initials: "SH",
    photo: sheeluPhoto.url,
    wing: "Core Team",
  },
  {
    no: "05",
    name: "Mridule Mishra",
    role: "Foundation Engineer",
    subtitle: "Platform Infrastructure Specialist",
    department: "Platform",
    description:
      "Creates and maintains the technical foundation that powers DIMISI products, ensuring reliability, scalability, and engineering quality.",
    responsibilities: ["Core Platform", "Reliability", "Scalability", "Tooling", "Code Quality"],
    focus: "Internal platform services and engineering standards.",
    initials: "MM",
    photo: mridulPhoto.url,
    wing: "Core Team",
  },
  {
    no: "06",
    name: "Amrit",
    role: "Android Developer Intern",
    subtitle: "Learning Mobile Engineering",
    department: "Innovation Lab",
    description:
      "Contributes to Android application development while learning production-grade mobile engineering practices.",
    responsibilities: ["Android Features", "UI Work", "Debugging", "Code Reviews"],
    focus: "Shipping first production Android features.",
    initials: "AM",
    photo: amritPhoto.url,
    wing: "Internship Wing",
  },
  {
    no: "07",
    name: "Harsh Mishra",
    role: "Web Developer Intern",
    subtitle: "Frontend & Web Development",
    department: "Innovation Lab",
    description:
      "Builds responsive web interfaces, reusable UI components, and interactive digital experiences.",
    responsibilities: ["React", "Responsive UI", "Components", "Animation", "Accessibility"],
    focus: "Component library and marketing web surfaces.",
    initials: "HM",
    photo: harshPhoto.url,
    wing: "Internship Wing",
  },
  {
    no: "08",
    name: "Prashant",
    role: "Web & App Tester",
    subtitle: "Quality Assurance Intern",
    department: "Innovation Lab",
    description:
      "Ensures product quality through manual testing, bug reporting, usability validation, and performance verification.",
    responsibilities: ["Manual QA", "Bug Reports", "Usability", "Performance Checks"],
    focus: "Release testing across web and mobile builds.",
    initials: "PR",
    wing: "Internship Wing",
  },
];

export const WINGS = ["Leadership", "Core Team", "Internship Wing"] as const;

export const WING_INTRO: Record<string, { eyebrow: string; title: string; text: string }> = {
  Leadership: {
    eyebrow: "Level 01 — Executive Floor",
    title: "Leadership offices",
    text: "The corridor opens on the executive floor — vision, engineering and finance behind three smart-glass doors.",
  },
  "Core Team": {
    eyebrow: "Level 02 — Build Floor",
    title: "Core team offices",
    text: "Where the products are actually built. Long desks, warm light, permanent focus mode.",
  },
  "Internship Wing": {
    eyebrow: "Level 03 — Innovation Lab",
    title: "Internship wing",
    text: "A brighter, louder lab. Prototypes on the whiteboard and first production commits on the screen.",
  },
};