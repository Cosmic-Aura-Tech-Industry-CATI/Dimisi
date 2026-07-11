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
  websiteUrl: string;
  overview: string;
  challenge: string;
  solution: string;
  outcome: string;
};

export const caseStudies: CaseStudy[] = [
  {
    slug: "rudra-tours-travels",
    title: "Rudra Tours & Travels",
    category: "Travel · Website",
    websiteUrl: "https://toursbyrudra.com",
    overview:
      "A travel website for India tour packages, car rentals, wedding travel, and city-based trip planning from Kanpur.",
    challenge:
      "Travel customers need a fast way to compare tours, vehicles, destinations, and contact options without getting lost in a large catalog.",
    solution:
      "We structured the site around clear service pages, destination guides, vehicle categories, and direct inquiry flows so visitors can plan trips quickly.",
    outcome:
      "Visitors can move from inspiration to booking or inquiry with less friction, whether they need a package, a car, or wedding travel support.",
  },
  {
    slug: "kalesh",
    title: "Kalesh",
    category: "Social Platform · Website",
    websiteUrl: "https://thekalesh.com",
    overview:
      "An anonymous social platform built around real-time polls, private chats, and authentic opinion sharing.",
    challenge:
      "The product needed a clear way to explain anonymity, community trust, and fast participation without overwhelming first-time visitors.",
    solution:
      "We presented the platform around anonymous profiles, instant polls, and direct community actions so the value is obvious on arrival.",
    outcome:
      "Visitors can quickly understand how to share honest opinions without profile pressure or identity exposure.",
  },
  {
    slug: "karyon",
    title: "Karyon",
    category: "Home Services · Web App",
    websiteUrl: "https://karyon.app",
    overview:
      "A home-services platform for booking verified professionals across plumbing, electrical, cleaning, painting, moving, and more.",
    challenge:
      "Home service customers need a simple way to browse offerings, trust the providers, and book help without friction.",
    solution:
      "We organized the experience around premium services, booking steps, and customer reassurance to make service selection straightforward.",
    outcome:
      "Customers can move from browsing to booking quickly, with a clearer sense of service scope and reliability.",
  },
  {
    slug: "axiscon",
    title: "AxisCon",
    category: "Conference · Website",
    websiteUrl: "https://axiscon.netlify.app/",
    overview:
      "A conference website for ICCIST 2026 highlighting research themes, registration, schedules, and participation details.",
    challenge:
      "The event needed a site that could explain the conference scope, guide registrations, and present academic information cleanly.",
    solution:
      "We structured the pages around key research areas, important dates, schedules, and registration links for easy navigation.",
    outcome:
      "Attendees can understand the event quickly and move into registration or deeper conference details with less effort.",
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