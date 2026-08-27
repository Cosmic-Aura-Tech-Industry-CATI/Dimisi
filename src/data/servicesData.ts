import {
  Globe,
  Smartphone,
  Bot,
  Palette,
  Code2,
  Cloud,
  Compass,
  ShieldCheck,
  TrendingUp,
  Cpu,
  Rocket,
  GraduationCap,
  HeartPulse,
  Store,
  ShoppingBag,
  Layers,
  Building2,
  LineChart,
} from "lucide-react";

export interface CoreServiceItem {
  id: string;
  index: string;
  title: string;
  tagline: string;
  description: string;
  features: string[];
  icon: React.ComponentType<{ className?: string }>;
  link: string;
  accentColor: string;
}

export interface IndustryItem {
  id: string;
  title: string;
  tagline: string;
  description: string;
  badge: string;
  solutions: string[];
  icon: React.ComponentType<{ className?: string }>;
  accentGlow: string;
}

export const CORE_SERVICES_DATA: CoreServiceItem[] = [
  {
    id: "web-dev",
    index: "01",
    title: "Web Development",
    tagline: "Scalable, high-performance websites and web applications tailored to business scale.",
    description:
      "From high-conversion marketing portals to complex multi-tenant enterprise dashboards, we architect responsive, SEO-optimized web experiences with sub-second page loads.",
    features: [
      "Custom Web Applications",
      "Corporate & Brand Portals",
      "Headless E-Commerce",
      "High-Performance Dashboards",
      "Search Engine Optimization (SEO)",
      "Progressive Web Apps (PWA)",
    ],
    icon: Globe,
    link: "/services/web-development",
    accentColor: "rgba(255, 122, 0, 0.35)",
  },
  {
    id: "mobile-dev",
    index: "02",
    title: "Mobile App Development",
    tagline: "Native and cross-platform mobile experiences for iOS and Android.",
    description:
      "Engineered with offline resilience, biometric security, real-time push synchronization, and buttery-smooth 60fps animations across all mobile devices.",
    features: [
      "Native iOS (Swift) & Android (Kotlin)",
      "Cross-Platform (Flutter / React Native)",
      "Biometric Security & Offline-First",
      "Real-Time Push & Background Sync",
      "App Store & Play Store Publishing",
      "Enterprise Mobility Solutions",
    ],
    icon: Smartphone,
    link: "/services/mobile-app",
    accentColor: "rgba(255, 179, 0, 0.35)",
  },
  {
    id: "ai-automation",
    index: "03",
    title: "AI & Automation",
    tagline: "Intelligent workflows, machine learning, and automation that reduce manual work.",
    description:
      "Practical artificial intelligence woven into your operational fabric — automating repetitive overhead, routing complex multi-modal data, and uncovering hidden predictive leverage.",
    features: [
      "Autonomous AI Agents",
      "Custom LLM & RAG Pipelines",
      "Computer Vision & Intelligent OCR",
      "Predictive & Anomaly Analytics",
      "Intelligent Process Automation (IPA)",
      "Zero-Data-Leakage Local Models",
    ],
    icon: Bot,
    link: "/services/ai",
    accentColor: "rgba(255, 90, 0, 0.35)",
  },
  {
    id: "ui-ux",
    index: "04",
    title: "UI/UX Design & 3D Experiences",
    tagline: "User-centered interface design, design systems, and prototypes that delight users.",
    description:
      "Bridging human intuition and high-fidelity aesthetics. We create unforgettable digital brand identities, comprehensive design systems, interactive 3D WebGL scenes, and clickable prototypes.",
    features: [
      "Design Systems & Token Systems",
      "Interactive Wireframes & Prototypes",
      "Cinematic 3D WebGL / WebGPU Surfaces",
      "User Journey & Frictionless Checkout UX",
      "Accessibility & WCAG 2.1 Compliance",
      "Design-to-Code Engineering Sprints",
    ],
    icon: Palette,
    link: "/services/ui-ux",
    accentColor: "rgba(255, 200, 50, 0.35)",
  },
  {
    id: "software-dev",
    index: "05",
    title: "Software Development",
    tagline: "Custom software, MVPs, and enterprise applications built for scale.",
    description:
      "Zero-bloat, robust software engineering designed to solve complex operational bottlenecks, bridge disparate legacy systems, and execute critical business logic flawlessly.",
    features: [
      "Custom Enterprise Platforms",
      "Rapid MVP Prototyping",
      "Microservices & Event-Driven Systems",
      "Distributed Database Architectures",
      "High-Concurrency Processing Engines",
      "Legacy Codebase Refactoring",
    ],
    icon: Code2,
    link: "/services/enterprise",
    accentColor: "rgba(255, 60, 0, 0.35)",
  },
  {
    id: "cloud-devops",
    index: "06",
    title: "Cloud Services & DevOps",
    tagline: "Cloud architecture, migration, DevOps, and managed infrastructure on leading platforms.",
    description:
      "Reliable multi-cloud architectures across AWS, GCP, Azure, and Cloudflare. We build automated container orchestration, auto-scaling clusters, and 24/7 security monitoring.",
    features: [
      "Kubernetes & Docker Orchestration",
      "Infrastructure as Code (Terraform)",
      "Automated CI/CD Deployment Pipelines",
      "Multi-Cloud Migration & FinOps",
      "Zero-Downtime Blue/Green Rollouts",
      "24/7 Uptime & Disaster Recovery",
    ],
    icon: Cloud,
    link: "/services/cloud",
    accentColor: "rgba(255, 140, 0, 0.35)",
  },
  {
    id: "it-consulting",
    index: "07",
    title: "IT Consulting & Architecture",
    tagline: "Strategic technology advisory to align your roadmap with business outcomes.",
    description:
      "Unbiased technical audits, stack modernization roadmaps, security compliance reviews, and high-level architectural guidance from seasoned engineering leaders.",
    features: [
      "Technical Due Diligence & Audits",
      "Modernization & Migration Roadmaps",
      "Security & Compliance Reviews",
      "System Architecture & Scaling Plans",
      "Fractional CTO Advisory",
      "Vendor & Tooling Evaluations",
    ],
    icon: Compass,
    link: "/contact?service=consulting",
    accentColor: "rgba(255, 110, 0, 0.35)",
  },
  {
    id: "it-support",
    index: "08",
    title: "IT Support & Maintenance",
    tagline: "Reliable monitoring, support, and continuous improvement.",
    description:
      "We stay in your corner post-launch. Continuous uptime monitoring, proactive security patching, dependency upgrades, and guaranteed SLA-backed engineering support.",
    features: [
      "24/7 Real-Time Incident Response",
      "Proactive Security & Dependency Patches",
      "Database Optimization & Routine Backups",
      "Continuous Performance Profiling",
      "SLA-Guaranteed Bug Fixes",
      "Dedicated Technical Account Support",
    ],
    icon: ShieldCheck,
    link: "/contact?service=support",
    accentColor: "rgba(255, 170, 0, 0.35)",
  },
  {
    id: "digital-marketing",
    index: "09",
    title: "Digital Marketing & Growth",
    tagline: "Growth-focused campaigns, SEO, content, and analytics to drive qualified leads.",
    description:
      "Data-driven technical SEO, Core Web Vitals optimization, conversion rate optimization (CRO), and attribution analytics that turn casual visitors into high-intent inbound inquiries.",
    features: [
      "Technical Core Web Vitals SEO",
      "Conversion Rate Optimization (CRO)",
      "Content Strategy & Inbound Funnels",
      "Performance Marketing & Paid Attribution",
      "Analytics Tracking & Funnel Auditing",
      "Local & International SEO",
    ],
    icon: TrendingUp,
    link: "/contact?service=marketing",
    accentColor: "rgba(255, 80, 0, 0.35)",
  },
  {
    id: "ites",
    index: "10",
    title: "IT-Enabled Services (ITES)",
    tagline: "Digitally enabled operations, data workflows, and technology-driven process efficiency.",
    description:
      "Optimizing mission-critical repetitive back-office operations through automated data processing, API connectors, and intelligent digitized pipelines.",
    features: [
      "Business Process Automation (BPA)",
      "Data Cleansing & Automated ETL",
      "Document Intelligence & Data Extraction",
      "Operational Dashboards & BI Reporting",
      "System-to-System API Integrations",
      "Digital Workflow Orchestration",
    ],
    icon: Cpu,
    link: "/services/api",
    accentColor: "rgba(255, 190, 0, 0.35)",
  },
  {
    id: "startup-mentorship",
    index: "11",
    title: "Startup Mentorship & Incubation",
    tagline: "Technical guidance, MVP validation, and scaling advisory for early-stage founders.",
    description:
      "Lean, fast-paced technical partnership designed for founders. We build investor-ready functional prototypes, establish clean git foundations, and help you launch within weeks.",
    features: [
      "Day-Zero Architectural Strategy",
      "Investor-Ready Functional Prototypes",
      "Rapid 2-4 Week MVP Sprints",
      "Scalable Tech Stack Advisory",
      "Pitch-Deck Technical Validation",
      "Post-Funding Scaling Support",
    ],
    icon: Rocket,
    link: "/contact?service=startup",
    accentColor: "rgba(255, 50, 0, 0.35)",
  },
];

export const INDUSTRIES_DATA: IndustryItem[] = [
  {
    id: "education",
    title: "Education",
    tagline: "Learning platforms, LMS, and digital classrooms for modern institutions.",
    description:
      "We engineer scalable interactive learning environments, student performance analytics, digital assignment portals, and secure examination systems tailored for schools, universities, and EdTech startups.",
    badge: "EdTech & Learning",
    solutions: [
      "Custom LMS & Course Portals",
      "Interactive Virtual Classrooms",
      "Automated Grading & Assessments",
      "Student Engagement Analytics",
    ],
    icon: GraduationCap,
    accentGlow: "rgba(255, 122, 0, 0.3)",
  },
  {
    id: "healthcare",
    title: "Healthcare",
    tagline: "Secure, compliant systems for patient care, records, and telemedicine.",
    description:
      "Building high-compliance digital health platforms, HIPAA-ready patient record repositories, encrypted telemedicine video consoles, and AI-assisted triage workflows for clinics and hospitals.",
    badge: "HealthTech & Telemedicine",
    solutions: [
      "HIPAA/GDPR Compliant Portals",
      "Encrypted Telemedicine Video",
      "Electronic Health Records (EHR)",
      "Patient Appointment & Queue Systems",
    ],
    icon: HeartPulse,
    accentGlow: "rgba(255, 70, 0, 0.3)",
  },
  {
    id: "retail",
    title: "Retail",
    tagline: "Point-of-sale, inventory, and omnichannel experiences for retailers.",
    description:
      "Unifying physical brick-and-mortar operations with real-time digital sync: smart POS terminals, live multi-warehouse inventory updates, automated supplier replenishment, and customer loyalty engines.",
    badge: "Retail & Omnichannel",
    solutions: [
      "Cloud-Native POS Systems",
      "Real-Time Multi-Store Inventory",
      "Barcode & Scanner Integrations",
      "Loyalty & In-Store Kiosk Terminals",
    ],
    icon: Store,
    accentGlow: "rgba(255, 180, 0, 0.3)",
  },
  {
    id: "ecommerce",
    title: "E-Commerce",
    tagline: "Conversion-focused storefronts, marketplaces, and checkout systems.",
    description:
      "Architecting headless e-commerce platforms with sub-second checkout speeds, AI product recommendation engines, multi-currency payment routing, and automated shipping integrations.",
    badge: "Digital Commerce",
    solutions: [
      "Sub-Second Headless Checkouts",
      "Multi-Vendor Marketplace Platforms",
      "AI Recommendation & Upsell Algorithms",
      "Global Multi-Gateway Payment Routing",
    ],
    icon: ShoppingBag,
    accentGlow: "rgba(255, 140, 0, 0.3)",
  },
  {
    id: "startups",
    title: "Startups",
    tagline: "MVPs, rapid prototyping, and scalable foundations for founders.",
    description:
      "Empowering early-stage founders to validate product-market fit rapidly with clean, scalable codebases. We deliver high-velocity MVPs built to scale smoothly from user #1 to user #1,000,000.",
    badge: "Founders & Early Stage",
    solutions: [
      "2-4 Week Rapid MVP Sprints",
      "Investor-Ready Functional Demos",
      "Serverless Auto-Scaling Infrastructure",
      "Founder-Friendly Agile Collaboration",
    ],
    icon: Rocket,
    accentGlow: "rgba(255, 60, 0, 0.3)",
  },
  {
    id: "saas",
    title: "SaaS",
    tagline: "Multi-tenant products, billing, and analytics-driven platforms.",
    description:
      "Engineered for high gross margins and enterprise compliance: complete multi-tenant tenant isolation, automated subscription billing, usage-based metering, and self-serve onboarding funnels.",
    badge: "B2B & B2C SaaS",
    solutions: [
      "Multi-Tenant Tenant Isolation",
      "Automated Stripe / Paddle Billing",
      "Usage-Based API Metering",
      "Embedded Analytics & Webhooks",
    ],
    icon: Layers,
    accentGlow: "rgba(255, 200, 50, 0.3)",
  },
  {
    id: "enterprise",
    title: "Enterprise",
    tagline: "Large-scale systems, integrations, and digital transformation.",
    description:
      "Modernizing legacy monoliths into distributed microservice architectures with zero operational disruption, enterprise single sign-on (SSO), and bank-grade data security.",
    badge: "Enterprise & Scale",
    solutions: [
      "Legacy System Modernization",
      "Custom ERP & Enterprise Portals",
      "Zero-Trust IAM & SSO Integrations",
      "High-Throughput Event Streaming",
    ],
    icon: Building2,
    accentGlow: "rgba(255, 110, 0, 0.3)",
  },
  {
    id: "finance",
    title: "Finance",
    tagline: "Fintech apps, dashboards, and secure transaction infrastructure.",
    description:
      "Bank-grade security and sub-millisecond transaction execution: algorithmic fraud detection, automated reconciliation pipelines, ledger encryption, and regulatory audit compliance.",
    badge: "Fintech & Banking",
    solutions: [
      "Encrypted Transaction Processing",
      "Real-Time Fraud Detection Models",
      "Automated Reconciliation Engines",
      "Financial Reporting & Audit Trails",
    ],
    icon: LineChart,
    accentGlow: "rgba(255, 160, 0, 0.3)",
  },
];
