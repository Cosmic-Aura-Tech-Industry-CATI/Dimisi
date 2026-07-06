import {
  ArrowRight,
  Bot,
  Briefcase,
  Cloud,
  Code2,
  Cpu,
  Database,
  GraduationCap,
  Headset,
  HeartPulse,
  Landmark,
  Layers,
  Lightbulb,
  PenTool,
  Rocket,
  Server,
  Settings,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Smartphone,
  Sparkles,
  TrendingUp,
  Building2,
  type LucideIcon,
} from "lucide-react";

export type Service = {
  slug: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

export const services: Service[] = [
  {
    slug: "web-development",
    title: "Web Development",
    description:
      "Scalable, high-performance websites and web applications tailored to your business.",
    icon: Code2,
  },
  {
    slug: "mobile-app-development",
    title: "Mobile App Development",
    description: "Native and cross-platform mobile experiences for iOS and Android.",
    icon: Smartphone,
  },
  {
    slug: "ai-automation",
    title: "AI & Automation",
    description:
      "Intelligent workflows, machine learning, and automation that reduce manual work.",
    icon: Bot,
  },
  {
    slug: "ui-ux-design",
    title: "UI/UX Design",
    description:
      "User-centered interfaces, design systems, and prototypes that delight users.",
    icon: PenTool,
  },
  {
    slug: "software-development",
    title: "Software Development",
    description: "Custom software, MVPs, and enterprise applications built for scale.",
    icon: Cpu,
  },
  {
    slug: "cloud-services",
    title: "Cloud Services",
    description:
      "Cloud architecture, migration, DevOps, and managed infrastructure on leading platforms.",
    icon: Cloud,
  },
  {
    slug: "it-consulting",
    title: "IT Consulting",
    description:
      "Strategic technology advisory to align your roadmap with business outcomes.",
    icon: Briefcase,
  },
  {
    slug: "it-support-maintenance",
    title: "IT Support & Maintenance",
    description:
      "Reliable monitoring, support, and continuous improvement for your tech stack.",
    icon: Settings,
  },
  {
    slug: "digital-marketing",
    title: "Digital Marketing",
    description:
      "Growth-focused campaigns, SEO, content, and analytics to drive qualified leads.",
    icon: TrendingUp,
  },
  {
    slug: "it-enabled-services",
    title: "IT Enabled Services (ITES)",
    description:
      "Back-office, technical support, and process outsourcing powered by modern tooling.",
    icon: Headset,
  },
  {
    slug: "startup-mentorship",
    title: "Startup Mentorship",
    description:
      "Hands-on guidance for founders from idea to product-market fit and scaling.",
    icon: Lightbulb,
  },
];

export type Product = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  category: string;
  status: "Live" | "In Development" | "Beta";
  icon: LucideIcon;
};

export const products: Product[] = [
  {
    slug: "kalesh",
    name: "Kalesh",
    tagline: "Community & social engagement",
    description:
      "A social platform reimagining how communities connect, debate, and share ideas in real time.",
    category: "Social Platform",
    status: "In Development",
    icon: Sparkles,
  },
  {
    slug: "carryon",
    name: "CarryOn",
    tagline: "Travel & logistics, simplified",
    description:
      "Smart travel and delivery companion connecting people who move with people who send.",
    category: "Travel & Logistics",
    status: "In Development",
    icon: Rocket,
  },
  {
    slug: "sylon",
    name: "Sylon",
    tagline: "Business operations suite",
    description:
      "An operations and workflow suite that helps small businesses run and scale effortlessly.",
    category: "Business Software",
    status: "Beta",
    icon: Layers,
  },
  {
    slug: "access-control-web",
    name: "Axis Conference Web",
    tagline: "Secure access management",
    description:
      "Web-based access control and identity management for secure, role-based permissions.",
    category: "Security",
    status: "Live",
    icon: ShieldCheck,
  },
];

export type Industry = {
  name: string;
  description: string;
  icon: LucideIcon;
};

export const industries: Industry[] = [
  {
    name: "Education",
    description: "Learning platforms, LMS, and digital classrooms for modern institutions.",
    icon: GraduationCap,
  },
  {
    name: "Healthcare",
    description: "Secure, compliant systems for patient care, records, and telemedicine.",
    icon: HeartPulse,
  },
  {
    name: "Retail",
    description: "Point-of-sale, inventory, and omnichannel experiences for retailers.",
    icon: ShoppingBag,
  },
  {
    name: "E-Commerce",
    description: "Conversion-focused storefronts, marketplaces, and checkout systems.",
    icon: ShoppingCart,
  },
  {
    name: "Startups",
    description: "MVPs, rapid prototyping, and scalable foundations for founders.",
    icon: Rocket,
  },
  {
    name: "SaaS",
    description: "Multi-tenant products, billing, and analytics-driven platforms.",
    icon: Cloud,
  },
  {
    name: "Enterprise",
    description: "Large-scale systems, integrations, and digital transformation.",
    icon: Building2,
  },
  {
    name: "Finance",
    description: "Fintech apps, dashboards, and secure transaction infrastructure.",
    icon: Landmark,
  },
];

export type TechColumn = {
  title: string;
  icon: LucideIcon;
  items: string[];
};

export const techStack: TechColumn[] = [
  {
    title: "Frontend",
    icon: Code2,
    items: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Framer Motion"],
  },
  {
    title: "Backend",
    icon: Server,
    items: ["Node.js", "Python", "Go", "REST & GraphQL", "Microservices"],
  },
  {
    title: "Database",
    icon: Database,
    items: ["PostgreSQL", "MongoDB", "Redis", "Supabase", "Prisma"],
  },
  {
    title: "Cloud",
    icon: Cloud,
    items: ["AWS", "Google Cloud", "Azure", "Docker", "Kubernetes"],
  },
  {
    title: "AI",
    icon: Bot,
    items: ["OpenAI", "LangChain", "TensorFlow", "Vector DBs", "Automation"],
  },
];

export const whyChoose = [
  {
    title: "Product Thinking",
    description: "We build like product owners — obsessed with outcomes, not just output.",
  },
  {
    title: "Startup-Friendly Approach",
    description: "Lean, fast, and flexible engagements designed for founders and early teams.",
  },
  {
    title: "Scalable Architecture",
    description: "Systems engineered to grow from your first user to your millionth.",
  },
  {
    title: "AI Integration Expertise",
    description: "Practical AI woven into products to create real, measurable leverage.",
  },
  {
    title: "End-to-End Development",
    description: "Strategy, design, engineering, and launch — under one roof.",
  },
  {
    title: "Long-Term Support",
    description: "We stay after launch with monitoring, iteration, and continuous care.",
  },
  {
    title: "Innovation-Focused Culture",
    description: "A team that treats every project as a chance to push what's possible.",
  },
];

export const highlights = [
  { value: "10+", label: "Services" },
  { value: "4+", label: "Products" },
  { value: "Multiple", label: "Technology Domains" },
  { value: "Startup & Enterprise", label: "Support" },
  { value: "Ongoing", label: "Innovation Initiatives" },
];

export type CaseStudy = {
  slug: string;
  title: string;
  category: string;
  overview: string;
  challenge: string;
  solution: string;
  outcome: string;
};

export const caseStudies: CaseStudy[] = [
  {
    slug: "fintech-dashboard",
    title: "Real-Time Fintech Dashboard",
    category: "Finance · Web App",
    overview:
      "A unified analytics dashboard for a growing fintech startup to monitor transactions live.",
    challenge:
      "Fragmented data sources and slow reporting made timely decisions nearly impossible.",
    solution:
      "We built an event-driven pipeline with a real-time dashboard and role-based access.",
    outcome:
      "Reporting time dropped from hours to seconds, unlocking faster, data-driven decisions.",
  },
  {
    slug: "ai-support-automation",
    title: "AI Customer Support Automation",
    category: "SaaS · AI Automation",
    overview:
      "An AI assistant that resolves common support tickets automatically for a SaaS platform.",
    challenge:
      "A small support team was overwhelmed by repetitive, high-volume inbound queries.",
    solution:
      "We deployed an LLM-powered assistant with human handoff and knowledge-base grounding.",
    outcome:
      "Over 60% of tickets auto-resolved, freeing the team to focus on complex cases.",
  },
  {
    slug: "retail-commerce-platform",
    title: "Omnichannel Retail Platform",
    category: "Retail · E-Commerce",
    overview:
      "A scalable commerce platform unifying in-store and online sales for a retail brand.",
    challenge:
      "Disconnected inventory and checkout systems created stockouts and poor experiences.",
    solution:
      "We unified inventory, POS, and storefront into a single cloud-native platform.",
    outcome:
      "Inventory accuracy improved dramatically and online revenue grew significantly.",
  },
];

export type NavItem = { label: string; to: string };

export const offeringsMenu: NavItem[] = services.map((s) => ({
  label: s.title,
  to: "/services",
}));

export const productsMenu: NavItem[] = products.map((p) => ({
  label: p.name,
  to: "/products",
}));

export const primaryNav: NavItem[] = [
  { label: "Industries", to: "/industries" },
  { label: "Our Work", to: "/case-studies" },
  { label: "Blogs", to: "/blog" },
  { label: "Our Team", to: "/our-team" },
  { label: "Careers", to: "/careers" },
];

export { ArrowRight };