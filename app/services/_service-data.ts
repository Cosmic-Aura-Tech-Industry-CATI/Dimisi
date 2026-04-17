export type ServiceVariant = "split" | "banner" | "matrix";
export type ServiceAccent = "blue" | "emerald" | "amber";

export type ServiceProfile = {
  slug: string;
  title: string;
  badge: string;
  summary: string;
  heroImage: string;
  variant: ServiceVariant;
  accent: ServiceAccent;
  focusAreas: string[];
  deliverables: string[];
  process: Array<{ step: string; title: string; description: string }>;
  stack: string[];
  outcomes: string[];
  engagement: string[];
  ctaTitle: string;
  ctaText: string;
};

export const SERVICE_SLUGS = [
  "web-development",
  "mobile-app-development",
  "ai-automation",
  "ui-ux-design",
  "software-development",
  "cloud-services",
  "it-consulting",
  "it-support-maintenance",
  "digital-marketing",
  "startup-mentorship",
] as const;

export const SERVICE_PROFILES: Record<string, ServiceProfile> = {
  "web-development": {
    slug: "web-development",
    title: "Web Development",
    badge: "Engineering Services",
    summary:
      "Design and build high-performance web platforms that support growth, simplify operations, and improve user experience.",
    heroImage: "/Features-Image2.png",
    variant: "split",
    accent: "blue",
    focusAreas: ["Business websites", "SaaS platforms", "Customer portals"],
    deliverables: [
      "Architecture planning and technical scoping",
      "Frontend and backend implementation",
      "API integrations with third-party systems",
      "Performance and security optimization",
      "Post-launch maintenance and feature iterations",
    ],
    process: [
      { step: "01", title: "Discovery", description: "We align goals, user journeys, constraints, and success metrics." },
      { step: "02", title: "Design & Build", description: "Design and engineering run in coordinated sprint cycles." },
      { step: "03", title: "Quality Assurance", description: "Testing, audits, and release readiness checks are completed." },
      { step: "04", title: "Launch & Growth", description: "We deploy, monitor, and optimize based on real usage data." },
    ],
    stack: ["Next.js", "React", "TypeScript", "Node.js", "PostgreSQL", "Docker", "AWS", "CI/CD"],
    outcomes: ["Faster releases", "Higher reliability", "Lower maintenance overhead"],
    engagement: ["Fixed-scope projects", "Dedicated engineering squad", "Retained support model"],
    ctaTitle: "Need a reliable web development partner?",
    ctaText: "Share your requirements and receive a practical delivery approach with timeline and team recommendation.",
  },
  "mobile-app-development": {
    slug: "mobile-app-development",
    title: "Mobile App Development",
    badge: "Product Engineering",
    summary:
      "Build iOS and Android applications focused on performance, usability, and long-term maintainability.",
    heroImage: "/Features-Image3.png",
    variant: "banner",
    accent: "emerald",
    focusAreas: ["Consumer apps", "Enterprise mobility", "Cross-platform delivery"],
    deliverables: [
      "Product strategy and feature prioritization",
      "Native or cross-platform app development",
      "API and backend integration",
      "App store readiness and release process",
      "Crash monitoring and post-launch support",
    ],
    process: [
      { step: "01", title: "Product Discovery", description: "Define audience, feature scope, and business KPIs for launch." },
      { step: "02", title: "UX & Prototyping", description: "Validate core workflows with interactive prototypes before development." },
      { step: "03", title: "Implementation", description: "Deliver features in iterations with regular QA and build reviews." },
      { step: "04", title: "Release & Iterate", description: "Launch, track product metrics, and prioritize roadmap improvements." },
    ],
    stack: ["Flutter", "React Native", "Swift", "Kotlin", "Firebase", "Node.js", "PostgreSQL", "AWS"],
    outcomes: ["Better retention", "Lower crash rates", "Faster update cycles"],
    engagement: ["MVP launch package", "Team extension model", "Long-term product support"],
    ctaTitle: "Looking to launch a mobile product with confidence?",
    ctaText: "We help you move from concept to stable releases with clear execution and measurable product outcomes.",
  },
  "ai-automation": {
    slug: "ai-automation",
    title: "AI & Automation",
    badge: "Intelligent Operations",
    summary:
      "Apply AI and workflow automation to reduce repetitive work, increase speed, and improve operational decision-making.",
    heroImage: "/image 1.png",
    variant: "matrix",
    accent: "amber",
    focusAreas: ["Process automation", "AI assistants", "Analytics intelligence"],
    deliverables: [
      "Automation opportunity assessment",
      "LLM and workflow architecture",
      "Integration with existing systems",
      "Governance and reliability controls",
      "Monitoring and performance tuning",
    ],
    process: [
      { step: "01", title: "Opportunity Mapping", description: "Identify workflows where automation delivers immediate value." },
      { step: "02", title: "Solution Design", description: "Design orchestration logic, model usage, and guardrails." },
      { step: "03", title: "Implementation", description: "Deploy automations with measurable baselines and fallback paths." },
      { step: "04", title: "Optimization", description: "Improve quality and throughput through data-driven refinements." },
    ],
    stack: ["Python", "OpenAI APIs", "LangChain", "Vector DB", "Node.js", "Airflow", "PostgreSQL", "Azure"],
    outcomes: ["Reduced manual effort", "Higher processing speed", "Improved decision quality"],
    engagement: ["Pilot automation sprint", "Department rollout plan", "Continuous optimization retainer"],
    ctaTitle: "Want to automate high-impact workflows?",
    ctaText: "Let us identify where AI can produce measurable gains without disrupting your core operations.",
  },
  "ui-ux-design": {
    slug: "ui-ux-design",
    title: "UI/UX Design",
    badge: "Experience Design",
    summary:
      "Create digital experiences that are intuitive, conversion-friendly, and consistent with your brand identity.",
    heroImage: "/Features-Image2.png",
    variant: "split",
    accent: "emerald",
    focusAreas: ["Product UX", "Design systems", "Conversion optimization"],
    deliverables: [
      "User research and journey mapping",
      "Wireframing and interaction design",
      "Visual interface design and prototyping",
      "Design systems and handoff standards",
      "Usability validation and iteration",
    ],
    process: [
      { step: "01", title: "Research", description: "Gather user insights, pain points, and behavior patterns." },
      { step: "02", title: "Flow Design", description: "Map intuitive paths that align user goals with business goals." },
      { step: "03", title: "Interface Craft", description: "Create polished visuals and interaction-ready prototypes." },
      { step: "04", title: "Validation", description: "Run usability tests and refine based on feedback." },
    ],
    stack: ["Figma", "Design Tokens", "Storybook", "Hotjar", "GA4", "Notion", "Jira", "Miro"],
    outcomes: ["Improved usability", "Higher conversion", "Consistent cross-product UX"],
    engagement: ["Design sprint", "Product design retainer", "Design system setup"],
    ctaTitle: "Need a cleaner, conversion-focused product experience?",
    ctaText: "Our design team helps translate your business goals into usable and conversion-ready interfaces.",
  },
  "software-development": {
    slug: "software-development",
    title: "Software Development",
    badge: "Custom Solutions",
    summary:
      "Build secure and scalable custom software tailored to your internal operations and customer workflows.",
    heroImage: "/Features-Image3.png",
    variant: "banner",
    accent: "blue",
    focusAreas: ["Enterprise tools", "Custom SaaS", "Workflow platforms"],
    deliverables: [
      "Requirements engineering",
      "System architecture and implementation",
      "Data modeling and integrations",
      "Testing and release engineering",
      "Long-term support and feature expansion",
    ],
    process: [
      { step: "01", title: "Business Analysis", description: "Translate operational needs into software requirements and roadmap." },
      { step: "02", title: "Architecture", description: "Define scalable architecture and implementation plan." },
      { step: "03", title: "Execution", description: "Build features iteratively with quality gates at each stage." },
      { step: "04", title: "Stabilization", description: "Ensure reliability, observability, and support readiness." },
    ],
    stack: ["TypeScript", "Node.js", "Java", "Python", "PostgreSQL", "Redis", "Docker", "Kubernetes"],
    outcomes: ["Operational efficiency", "Scalable architecture", "Better business visibility"],
    engagement: ["End-to-end product build", "Modernization program", "Support and enhancement"],
    ctaTitle: "Planning a custom software initiative?",
    ctaText: "We help you scope and build software that fits your workflows and scales with your business.",
  },
  "cloud-services": {
    slug: "cloud-services",
    title: "Cloud Services",
    badge: "Cloud & Infrastructure",
    summary:
      "Design, migrate, and operate cloud infrastructure with security, cost control, and reliability at the center.",
    heroImage: "/image 1.png",
    variant: "matrix",
    accent: "blue",
    focusAreas: ["Cloud migration", "DevOps automation", "Infrastructure optimization"],
    deliverables: [
      "Cloud readiness and migration strategy",
      "Infrastructure as code setup",
      "CI/CD and release automation",
      "Monitoring, backup, and disaster recovery",
      "Cost and performance optimization",
    ],
    process: [
      { step: "01", title: "Assessment", description: "Evaluate workloads, dependencies, and migration risks." },
      { step: "02", title: "Architecture", description: "Define secure and scalable cloud target architecture." },
      { step: "03", title: "Migration", description: "Move systems in controlled phases with rollback plans." },
      { step: "04", title: "Optimization", description: "Continuously improve reliability, cost, and performance." },
    ],
    stack: ["AWS", "Azure", "GCP", "Terraform", "Docker", "Kubernetes", "Prometheus", "Grafana"],
    outcomes: ["Lower cloud waste", "Higher uptime", "Faster deployment cycles"],
    engagement: ["Migration project", "DevOps enablement", "Managed cloud support"],
    ctaTitle: "Need cloud infrastructure that stays stable under growth?",
    ctaText: "We plan and execute cloud transformations with practical governance, automation, and cost discipline.",
  },
  "it-consulting": {
    slug: "it-consulting",
    title: "IT Consulting",
    badge: "Strategic Advisory",
    summary:
      "Get actionable technology guidance aligned with business priorities, budgets, and long-term scalability goals.",
    heroImage: "/Features-Image2.png",
    variant: "split",
    accent: "amber",
    focusAreas: ["Technology roadmap", "Architecture advisory", "Operational alignment"],
    deliverables: [
      "Current-state technology assessment",
      "Future-state architecture recommendations",
      "Platform and vendor evaluation",
      "Risk and compliance planning",
      "Implementation roadmap and governance model",
    ],
    process: [
      { step: "01", title: "Stakeholder Discovery", description: "Understand objectives, constraints, and decision criteria." },
      { step: "02", title: "Assessment", description: "Review systems, practices, and gaps in current operations." },
      { step: "03", title: "Recommendations", description: "Present clear options with cost, effort, and risk tradeoffs." },
      { step: "04", title: "Execution Support", description: "Assist your team in implementation and governance rollout." },
    ],
    stack: ["Architecture Reviews", "Security Baselines", "Cost Modeling", "Governance", "Roadmapping", "Workshops", "Audits", "KPI Tracking"],
    outcomes: ["Better decisions", "Reduced technical risk", "Clearer execution plan"],
    engagement: ["Advisory sprint", "Quarterly consulting", "Transformation office support"],
    ctaTitle: "Need clarity before major technology decisions?",
    ctaText: "We provide structured advisory support so your investments stay aligned with business value.",
  },
  "it-support-maintenance": {
    slug: "it-support-maintenance",
    title: "IT Support & Maintenance",
    badge: "Managed IT",
    summary:
      "Keep your systems stable, secure, and up to date with responsive support and preventive maintenance practices.",
    heroImage: "/Features-Image3.png",
    variant: "banner",
    accent: "emerald",
    focusAreas: ["Helpdesk operations", "System maintenance", "Incident response"],
    deliverables: [
      "User support and ticket management",
      "Patch and update management",
      "System monitoring and alerting",
      "Security checks and preventive controls",
      "SLA reporting and service optimization",
    ],
    process: [
      { step: "01", title: "Environment Audit", description: "Document systems, priorities, and support constraints." },
      { step: "02", title: "SLA Setup", description: "Define response windows, escalation matrix, and service metrics." },
      { step: "03", title: "Operational Support", description: "Provide day-to-day issue resolution and maintenance routines." },
      { step: "04", title: "Continuous Improvement", description: "Track patterns and improve service quality over time." },
    ],
    stack: ["Service Desk", "Monitoring", "Endpoint Management", "Backup", "Security Tools", "Documentation", "Automation", "Reporting"],
    outcomes: ["Reduced downtime", "Faster issue resolution", "More predictable IT operations"],
    engagement: ["Monthly support plan", "24/7 managed support", "Hybrid in-house + partner model"],
    ctaTitle: "Need dependable day-to-day IT support?",
    ctaText: "We provide structured support operations that keep teams productive and systems stable.",
  },
  "digital-marketing": {
    slug: "digital-marketing",
    title: "Digital Marketing",
    badge: "Growth Services",
    summary:
      "Run data-driven digital campaigns that improve qualified traffic, lead generation, and conversion consistency.",
    heroImage: "/image 1.png",
    variant: "matrix",
    accent: "amber",
    focusAreas: ["Performance marketing", "SEO strategy", "Conversion funnels"],
    deliverables: [
      "Channel strategy and campaign planning",
      "SEO and content optimization",
      "Paid media setup and management",
      "Landing page and funnel enhancement",
      "Analytics dashboard and reporting",
    ],
    process: [
      { step: "01", title: "Baseline Analysis", description: "Evaluate current acquisition channels and conversion performance." },
      { step: "02", title: "Campaign Design", description: "Build channel plans and creative direction tied to outcomes." },
      { step: "03", title: "Execution", description: "Launch campaigns with budget controls and iterative optimization." },
      { step: "04", title: "Scale", description: "Expand high-performing campaigns and refine underperforming segments." },
    ],
    stack: ["GA4", "Google Ads", "Meta Ads", "Search Console", "CRM", "A/B Testing", "Tag Manager", "Looker Studio"],
    outcomes: ["Improved lead quality", "Lower acquisition cost", "Stronger funnel conversion"],
    engagement: ["Campaign management", "SEO growth program", "Integrated performance retainer"],
    ctaTitle: "Want marketing that ties clearly to revenue outcomes?",
    ctaText: "We focus on measurable growth by connecting channel execution with conversion and retention goals.",
  },
  "startup-mentorship": {
    slug: "startup-mentorship",
    title: "Startup Mentorship",
    badge: "Founder Advisory",
    summary:
      "Support founders with practical guidance across product direction, go-to-market execution, and scaling operations.",
    heroImage: "/Features-Image2.png",
    variant: "split",
    accent: "blue",
    focusAreas: ["MVP strategy", "Go-to-market", "Early-stage scaling"],
    deliverables: [
      "MVP scope and prioritization guidance",
      "Product-market fit checkpoints",
      "Technical and hiring advisory",
      "Investor readiness and roadmap support",
      "Growth planning and operational cadence",
    ],
    process: [
      { step: "01", title: "Founder Goals", description: "Align on stage, constraints, runway, and immediate priorities." },
      { step: "02", title: "Strategy Mapping", description: "Define product, market, and execution milestones." },
      { step: "03", title: "Operating Rhythm", description: "Set practical cadence for delivery, learning, and decision-making." },
      { step: "04", title: "Scale Readiness", description: "Prepare systems and team practices for growth phase." },
    ],
    stack: ["Roadmapping", "MVP Planning", "Market Validation", "Technical Advisory", "Growth Loops", "Analytics", "Team Setup", "Investor Prep"],
    outcomes: ["Clear execution focus", "Faster validation cycles", "Stronger scaling foundation"],
    engagement: ["Founder mentoring program", "Advisory hours model", "Quarterly strategic review"],
    ctaTitle: "Need strategic support to move your startup faster?",
    ctaText: "Get practical mentorship from planning through execution to build with confidence and speed.",
  },
};
