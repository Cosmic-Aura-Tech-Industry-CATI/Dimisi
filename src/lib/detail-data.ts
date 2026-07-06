import {
  Bot,
  Boxes,
  Cpu,
  Gauge,
  Globe,
  Layers,
  Lock,
  MessageSquare,
  Rocket,
  Shield,
  Sparkles,
  Users,
  Workflow,
  Zap,
  type LucideIcon,
} from "lucide-react";

/* Shared, reusable step-flow definitions */
export const developmentProcess = [
  "Requirement Analysis",
  "Planning & Strategy",
  "UI/UX Design",
  "Development",
  "Testing & QA",
  "Deployment",
  "Support",
];

export const recruitmentProcess = [
  "Application",
  "Intro Call",
  "Technical / Portfolio",
  "Team Interview",
  "Offer",
];

/* ---------------------------------- Services ---------------------------------- */

export type ServiceDetail = {
  tagline: string;
  overview: string;
  whoFor: string[];
  problems: string[];
  solutions: string[];
  tech: string[];
  faqs: { question: string; answer: string }[];
};

const commonFaqs = [
  {
    question: "How long does a typical engagement take?",
    answer:
      "Timelines depend on scope, but most projects move from discovery to a first shippable milestone within 4–8 weeks.",
  },
  {
    question: "Do you offer ongoing support after delivery?",
    answer:
      "Yes. We provide maintenance, monitoring, and continuous iteration so your solution keeps improving after launch.",
  },
];

export const serviceDetails: Record<string, ServiceDetail> = {
  "web-development": {
    tagline: "High-performance websites and web apps built to scale.",
    overview:
      "We design and engineer fast, accessible, and scalable web experiences — from marketing sites to complex web applications — using modern frameworks and a performance-first mindset.",
    whoFor: [
      "Startups launching their first product",
      "Businesses modernizing legacy websites",
      "Teams needing a scalable web platform",
    ],
    problems: [
      "Slow, outdated sites that hurt conversions",
      "Poor mobile experience and accessibility gaps",
      "Codebases that are hard to maintain or extend",
    ],
    solutions: [
      "Responsive, SEO-friendly, blazing-fast frontends",
      "Robust APIs and clean, maintainable architecture",
      "Continuous deployment with automated testing",
    ],
    tech: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Node.js"],
    faqs: commonFaqs,
  },
  "mobile-app-development": {
    tagline: "Native and cross-platform apps users love to open.",
    overview:
      "We build polished iOS and Android experiences — native or cross-platform — with smooth performance, offline support, and delightful interaction design.",
    whoFor: [
      "Founders validating a mobile-first idea",
      "Businesses extending their product to mobile",
      "Teams needing a rebuild for performance",
    ],
    problems: [
      "Clunky, slow apps with poor retention",
      "Maintaining separate iOS and Android codebases",
      "Fragile release and update pipelines",
    ],
    solutions: [
      "Cross-platform builds from a single codebase",
      "Native performance and platform-true UX",
      "Automated CI/CD for confident releases",
    ],
    tech: ["React Native", "TypeScript", "Expo", "Firebase", "Node.js"],
    faqs: commonFaqs,
  },
  "ai-automation": {
    tagline: "Intelligent workflows that remove manual, repetitive work.",
    overview:
      "We embed practical AI into your operations — from LLM-powered assistants to automated pipelines — creating real, measurable leverage instead of hype.",
    whoFor: [
      "Teams drowning in repetitive tasks",
      "Support orgs facing high ticket volume",
      "Companies exploring AI-driven products",
    ],
    problems: [
      "Manual processes that don't scale",
      "Knowledge trapped in documents and inboxes",
      "Uncertainty about where AI actually helps",
    ],
    solutions: [
      "LLM assistants grounded in your knowledge base",
      "Automated data pipelines and workflows",
      "Human-in-the-loop safeguards and monitoring",
    ],
    tech: ["OpenAI", "LangChain", "Python", "Vector DBs", "Node.js"],
    faqs: commonFaqs,
  },
  "ui-ux-design": {
    tagline: "User-centered design that turns intent into interfaces.",
    overview:
      "We craft design systems, prototypes, and interfaces that are beautiful, usable, and grounded in real user needs — bridging research and pixel-perfect execution.",
    whoFor: [
      "Products needing a design refresh",
      "Teams building a scalable design system",
      "Founders shaping a new product experience",
    ],
    problems: [
      "Inconsistent, confusing user experiences",
      "No shared design language across the product",
      "Low conversion from unclear flows",
    ],
    solutions: [
      "Research-driven UX and information architecture",
      "Reusable, themeable design systems",
      "High-fidelity prototypes ready for build",
    ],
    tech: ["Figma", "Framer", "Design Systems", "Prototyping", "User Research"],
    faqs: commonFaqs,
  },
  "software-development": {
    tagline: "Custom software and MVPs engineered for scale.",
    overview:
      "From MVPs to enterprise systems, we build reliable, well-architected software tailored to your business logic and built to grow with you.",
    whoFor: [
      "Startups building an MVP",
      "Enterprises modernizing internal tools",
      "Teams needing custom, integrated systems",
    ],
    problems: [
      "Off-the-shelf tools that don't fit",
      "Fragmented systems that don't talk to each other",
      "Technical debt slowing the team down",
    ],
    solutions: [
      "Custom applications built around your workflow",
      "Clean architecture and thorough documentation",
      "Integrations that unify your tooling",
    ],
    tech: ["TypeScript", "Node.js", "Python", "PostgreSQL", "Docker"],
    faqs: commonFaqs,
  },
  "cloud-services": {
    tagline: "Cloud architecture, migration, and DevOps done right.",
    overview:
      "We design resilient cloud infrastructure, migrate workloads safely, and set up DevOps pipelines that make shipping fast, cheap, and reliable.",
    whoFor: [
      "Teams scaling beyond a single server",
      "Businesses migrating to the cloud",
      "Orgs needing reliable DevOps practices",
    ],
    problems: [
      "Fragile infrastructure and manual deploys",
      "Runaway cloud costs",
      "Downtime and scaling bottlenecks",
    ],
    solutions: [
      "Infrastructure-as-code and automation",
      "Cost-optimized, auto-scaling architecture",
      "Observability, backups, and disaster recovery",
    ],
    tech: ["AWS", "Google Cloud", "Docker", "Kubernetes", "Terraform"],
    faqs: commonFaqs,
  },
  "it-consulting": {
    tagline: "Strategic technology advisory aligned to outcomes.",
    overview:
      "We help you make the right technology decisions — from architecture and tooling to roadmaps — so your investments align with business goals.",
    whoFor: [
      "Leaders planning a tech roadmap",
      "Teams evaluating build-vs-buy decisions",
      "Companies facing a major migration",
    ],
    problems: [
      "Unclear technology direction",
      "Costly decisions made without expertise",
      "Roadmaps disconnected from business goals",
    ],
    solutions: [
      "Architecture and technology audits",
      "Actionable, prioritized roadmaps",
      "Hands-on guidance through execution",
    ],
    tech: ["Architecture", "Strategy", "Audits", "Roadmapping", "Best Practices"],
    faqs: commonFaqs,
  },
  "it-support-maintenance": {
    tagline: "Reliable monitoring, support, and continuous improvement.",
    overview:
      "We keep your systems healthy with proactive monitoring, rapid support, and ongoing improvements — so your team can focus on the business.",
    whoFor: [
      "Businesses running production systems",
      "Teams without dedicated ops",
      "Products needing SLAs and reliability",
    ],
    problems: [
      "Unexpected downtime and slow fixes",
      "No visibility into system health",
      "Security patches falling behind",
    ],
    solutions: [
      "24/7 monitoring and alerting",
      "Fast, reliable incident response",
      "Continuous updates and hardening",
    ],
    tech: ["Monitoring", "Incident Response", "CI/CD", "Security", "Backups"],
    faqs: commonFaqs,
  },
  "digital-marketing": {
    tagline: "Growth-focused campaigns backed by data.",
    overview:
      "We drive qualified growth through SEO, content, and analytics-led campaigns — measuring what matters and iterating toward real results.",
    whoFor: [
      "Startups seeking early traction",
      "Businesses growing their pipeline",
      "Teams needing measurable marketing",
    ],
    problems: [
      "Low visibility and organic traffic",
      "Marketing spend with unclear ROI",
      "No analytics to guide decisions",
    ],
    solutions: [
      "SEO and content strategy that compounds",
      "Performance campaigns with clear KPIs",
      "Analytics dashboards and attribution",
    ],
    tech: ["SEO", "Content", "Analytics", "Paid Media", "Automation"],
    faqs: commonFaqs,
  },
  "it-enabled-services": {
    tagline: "Back-office and technical operations, modernized.",
    overview:
      "We power your operations with back-office support, technical services, and process outsourcing built on modern tooling and clear SLAs.",
    whoFor: [
      "Teams scaling operations",
      "Businesses outsourcing technical support",
      "Companies streamlining back-office work",
    ],
    problems: [
      "Manual, error-prone back-office processes",
      "Support that can't keep up with demand",
      "Fragmented tools and workflows",
    ],
    solutions: [
      "Streamlined, tool-driven processes",
      "Reliable technical and customer support",
      "Scalable, SLA-backed operations",
    ],
    tech: ["Automation", "Support Tooling", "Process Design", "Analytics", "CRM"],
    faqs: commonFaqs,
  },
  "startup-mentorship": {
    tagline: "Hands-on guidance from idea to product-market fit.",
    overview:
      "We partner with founders to sharpen ideas, build MVPs, and navigate the path to product-market fit and scale — with practical, been-there guidance.",
    whoFor: [
      "First-time founders",
      "Early teams pre product-market fit",
      "Builders preparing to scale",
    ],
    problems: [
      "Unclear product and go-to-market direction",
      "Building the wrong thing too early",
      "Scaling before the foundations are ready",
    ],
    solutions: [
      "Idea validation and MVP scoping",
      "Product and technical mentorship",
      "Scaling strategy and execution support",
    ],
    tech: ["Product Strategy", "MVP", "Go-to-Market", "Fundraising", "Scaling"],
    faqs: commonFaqs,
  },
};

/* ---------------------------------- Products ---------------------------------- */

export type ProductFeature = { icon: LucideIcon; title: string; description: string };

export type ProductDetail = {
  intro: string;
  overview: string;
  problem: string;
  solution: string;
  features: ProductFeature[];
  benefits: string[];
  audience: string;
  roadmap: { phase: string; title: string; description: string }[];
  cta: string;
};

export const productDetails: Record<string, ProductDetail> = {
  kalesh: {
    intro: "An anonymous discussion platform for honest, open conversation.",
    overview:
      "Kalesh reimagines community by letting people connect, debate, and share ideas freely — without the pressure of identity — while staying safe and moderated.",
    problem:
      "Public social platforms discourage honest expression: people self-censor for fear of judgment, and toxic behavior often goes unchecked.",
    solution:
      "Kalesh combines anonymity with strong moderation and reputation signals, creating space for candid discussion that stays civil and constructive.",
    features: [
      { icon: MessageSquare, title: "Anonymous Threads", description: "Start and join conversations without revealing your identity." },
      { icon: Shield, title: "Smart Moderation", description: "AI-assisted moderation keeps discussions safe and civil." },
      { icon: Users, title: "Communities", description: "Topic-based spaces for the conversations you care about." },
      { icon: Zap, title: "Real-Time", description: "Live, fast-moving threads that feel alive." },
    ],
    benefits: [
      "Express yourself freely and honestly",
      "Discover diverse perspectives",
      "Safe, moderated environment",
    ],
    audience:
      "Communities, curious minds, and anyone who values open, judgment-free conversation.",
    roadmap: [
      { phase: "Phase 1", title: "Core Platform", description: "Anonymous threads, communities, and moderation." },
      { phase: "Phase 2", title: "Reputation System", description: "Trust signals and community-led governance." },
      { phase: "Phase 3", title: "Mobile Apps", description: "Native iOS and Android experiences." },
    ],
    cta: "Join the Waitlist",
  },
  carryon: {
    intro: "Professional networking that connects people who move things forward.",
    overview:
      "CarryOn is a professional networking and logistics companion that connects people who travel with people who need to send — building trust and opportunity along the way.",
    problem:
      "Sending items across cities or countries is expensive and slow, while travelers with spare capacity have no easy way to help or earn.",
    solution:
      "CarryOn matches verified travelers with senders, handling trust, tracking, and payments so both sides benefit from journeys already happening.",
    features: [
      { icon: Globe, title: "Smart Matching", description: "Match senders with travelers on the right routes." },
      { icon: Shield, title: "Verified Trust", description: "Identity verification and ratings build confidence." },
      { icon: Gauge, title: "Live Tracking", description: "Follow items end-to-end in real time." },
      { icon: Zap, title: "Secure Payments", description: "Escrow-backed payments protect everyone." },
    ],
    benefits: [
      "Send faster and cheaper",
      "Earn from trips you're already taking",
      "Trusted, verified community",
    ],
    audience:
      "Frequent travelers, senders, and professionals who value trusted peer-to-peer logistics.",
    roadmap: [
      { phase: "Phase 1", title: "Matching Engine", description: "Traveler and sender matching with trust layer." },
      { phase: "Phase 2", title: "Payments & Tracking", description: "Escrow payments and live tracking." },
      { phase: "Phase 3", title: "Global Expansion", description: "New regions and enterprise partners." },
    ],
    cta: "Join the Waitlist",
  },
  sylon: {
    intro: "A business operations suite for teams that want to move fast.",
    overview:
      "Sylon is an operations and workflow suite that helps small businesses run and scale effortlessly — unifying the everyday tools teams rely on.",
    problem:
      "Small businesses juggle scattered tools for operations, losing time and clarity as they grow.",
    solution:
      "Sylon brings workflows, tasks, and operations into one streamlined, automation-friendly platform tailored to how small teams actually work.",
    features: [
      { icon: Workflow, title: "Unified Workflows", description: "Run operations from one connected hub." },
      { icon: Boxes, title: "Task & Ops", description: "Organize tasks, teams, and processes." },
      { icon: Cpu, title: "Automation", description: "Automate the repetitive, focus on the important." },
      { icon: Gauge, title: "Insights", description: "Dashboards that keep everyone aligned." },
    ],
    benefits: [
      "Fewer tools, less context-switching",
      "Automate repetitive operations",
      "Scale without the chaos",
    ],
    audience: "Small businesses and growing teams that need operational clarity.",
    roadmap: [
      { phase: "Phase 1", title: "Beta Launch", description: "Core workflow and task management." },
      { phase: "Phase 2", title: "Automation", description: "No-code automation and integrations." },
      { phase: "Phase 3", title: "Marketplace", description: "Extensions and third-party apps." },
    ],
    cta: "Request Early Access",
  },
  "access-control-web": {
    intro: "Secure, role-based access management for the web.",
    overview:
      "Axis Conference Web is a web-based access control and identity management platform delivering secure, role-based permissions for organizations of any size.",
    problem:
      "Managing who can access what becomes risky and unmanageable as teams and systems grow.",
    solution:
      "Axis Conference Web centralizes identity and permissions with granular, role-based controls, audit trails, and enterprise-grade security.",
    features: [
      { icon: Lock, title: "Role-Based Access", description: "Granular permissions mapped to real roles." },
      { icon: Shield, title: "Audit Trails", description: "Full visibility into every access event." },
      { icon: Users, title: "Identity Management", description: "Centralized user and team management." },
      { icon: Sparkles, title: "SSO Ready", description: "Integrate with your existing identity providers." },
    ],
    benefits: [
      "Reduce security risk",
      "Simplify permission management",
      "Meet compliance requirements",
    ],
    audience:
      "Organizations that need secure, auditable, role-based access control.",
    roadmap: [
      { phase: "Live", title: "Core Platform", description: "Role-based access and audit logging." },
      { phase: "Next", title: "SSO & SCIM", description: "Enterprise identity provider integrations." },
      { phase: "Future", title: "Advanced Policies", description: "Attribute-based and contextual access." },
    ],
    cta: "Request a Demo",
  },
};

export const featureFallbackIcons: LucideIcon[] = [Rocket, Layers, Bot, Sparkles];
