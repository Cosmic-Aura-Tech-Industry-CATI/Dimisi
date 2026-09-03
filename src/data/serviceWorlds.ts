export type WorldMotif =
  | "ai"
  | "web"
  | "mobile"
  | "cloud"
  | "automation"
  | "uiux"
  | "enterprise"
  | "api";

export interface WorldSection {
  eyebrow: string;
  title: string;
  description: string;
  items: { title: string; text: string }[];
}

export interface ServiceWorld {
  slug: string;
  motif: WorldMotif;
  index: string;
  glyph: string;
  name: string;
  title: string;
  tagline: string;
  hero: string;
  environment: string;
  solutions: WorldSection;
  technologies: string[];
  workflow: { step: string; title: string; detail: string }[];
  caseStudy: { client: string; challenge: string; outcome: string; metrics: { k: string; v: string }[] };
}

const wf = (a: string, b: string, c: string, d: string) => [
  { step: "01", title: "Discover", detail: a },
  { step: "02", title: "Design", detail: b },
  { step: "03", title: "Engineer", detail: c },
  { step: "04", title: "Scale", detail: d },
];

export const SERVICE_WORLDS: ServiceWorld[] = [
  {
    slug: "ai",
    motif: "ai",
    index: "01",
    glyph: "◉",
    name: "AI",
    title: "Artificial Intelligence",
    tagline: "Machines that reason",
    hero: "Step inside the DIMISI AI Lab — neural cores, agentic pipelines and vision systems engineered to make your operations think for themselves.",
    environment: "Neural Core",
    solutions: {
      eyebrow: "AI Solutions",
      title: "Intelligence, engineered end to end",
      description: "From a single agent to a full reasoning platform with evals, guardrails and observability baked in.",
      items: [
        { title: "AI Agents", text: "Tool-calling agents that read, decide and act across your stack." },
        { title: "Computer Vision", text: "Detection, OCR and inspection trained on your own footage." },
        { title: "Generative AI", text: "RAG systems, copilots and content engines grounded in your data." },
        { title: "Predictive Analytics", text: "Forecasting and recommendation models wired to live dashboards." },
      ],
    },
    technologies: ["Python", "PyTorch", "TensorFlow", "OpenAI", "LangChain", "pgvector", "Triton"],
    workflow: wf(
      "Opportunity audit, data readiness and ROI modelling.",
      "Model selection, prompt and evaluation design.",
      "Training, fine-tuning and secure deployment.",
      "Monitoring, drift detection and continuous retraining.",
    ),
    caseStudy: {
      client: "National insurance group",
      challenge: "Twelve thousand claim documents a week reviewed by hand.",
      outcome: "An OCR plus reasoning pipeline now triages every claim in under nine seconds.",
      metrics: [
        { k: "Faster triage", v: "94%" },
        { k: "Accuracy", v: "99.2%" },
        { k: "Annual saving", v: "$1.8M" },
      ],
    },
  },
  {
    slug: "web-development",
    motif: "web",
    index: "02",
    glyph: "▤",
    name: "Web",
    title: "Web Development",
    tagline: "Enterprise-grade on the web",
    hero: "A software studio where interfaces assemble themselves — corporate platforms, portals and commerce engineered for scale, speed and search.",
    environment: "Build Studio",
    solutions: {
      eyebrow: "Web Solutions",
      title: "Platforms that carry the business",
      description: "Marketing sites through to operational portals, all on one performance and design system.",
      items: [
        { title: "Corporate Platforms", text: "Brand-grade sites with sub-second loads and perfect SEO." },
        { title: "Enterprise Portals", text: "Role-based dashboards, CRM and ERP front-ends." },
        { title: "Headless Commerce", text: "Catalogue, checkout and payments wired to your stack." },
        { title: "Design Systems", text: "Componentised UI your team can extend for years." },
      ],
    },
    technologies: ["React", "Next.js", "TypeScript", "Node", "PostgreSQL", "Redis", "Cloudflare"],
    workflow: wf(
      "Audience, journeys, content model and technical audit.",
      "Systemised UI, prototypes and performance budgets.",
      "Typed full-stack build with automated testing.",
      "Edge delivery, analytics and iteration cycles.",
    ),
    caseStudy: {
      client: "Manufacturing conglomerate",
      challenge: "Nine disconnected microsites and a four-second load time.",
      outcome: "One governed platform on the edge with a shared design system.",
      metrics: [
        { k: "LCP", v: "0.8s" },
        { k: "Organic traffic", v: "+212%" },
        { k: "Lighthouse", v: "98" },
      ],
    },
  },
  {
    slug: "mobile-app",
    motif: "mobile",
    index: "03",
    glyph: "▯",
    name: "Mobile",
    title: "Mobile App Development",
    tagline: "Products that live in the pocket",
    hero: "Floating glass devices, gesture-driven interfaces and store-ready builds — native and cross-platform apps that feel effortless.",
    environment: "Device Lab",
    solutions: {
      eyebrow: "Mobile Solutions",
      title: "One codebase, flagship feel",
      description: "Offline resilience, 60fps motion and release pipelines that ship weekly.",
      items: [
        { title: "Cross-Platform", text: "Flutter and React Native builds for Android and iOS." },
        { title: "Native Modules", text: "Kotlin and Swift where raw performance matters." },
        { title: "Realtime Apps", text: "Chat, tracking and payments with offline sync." },
        { title: "Store Delivery", text: "CI, phased rollout, crash analytics and ASO." },
      ],
    },
    technologies: ["Flutter", "React Native", "Kotlin", "Swift", "Firebase", "Fastlane"],
    workflow: wf(
      "Platform strategy, device matrix and feature mapping.",
      "Motion-led prototypes tested on real hardware.",
      "Modular build with automated device farms.",
      "Store release, monitoring and growth loops.",
    ),
    caseStudy: {
      client: "Food delivery startup",
      challenge: "Two separate teams shipping divergent Android and iOS apps.",
      outcome: "A single Flutter codebase with shared design tokens and weekly releases.",
      metrics: [
        { k: "Release cycle", v: "7 days" },
        { k: "Crash-free", v: "99.8%" },
        { k: "Rating", v: "4.8★" },
      ],
    },
  },
  {
    slug: "cloud",
    motif: "cloud",
    index: "04",
    glyph: "☁",
    name: "Cloud",
    title: "Cloud & DevOps",
    tagline: "Infrastructure that never blinks",
    hero: "A living datacentre — fibre routes, blinking racks and a digital earth moving your traffic without drama.",
    environment: "Infrastructure Grid",
    solutions: {
      eyebrow: "Cloud Solutions",
      title: "Ship daily, sleep nightly",
      description: "Architecture, pipelines and observability designed for 100x load.",
      items: [
        { title: "Cloud Architecture", text: "AWS and Azure landing zones with cost guardrails." },
        { title: "Containerisation", text: "Docker and Kubernetes with progressive delivery." },
        { title: "CI/CD", text: "Zero-downtime pipelines and instant rollback." },
        { title: "Observability", text: "Traces, metrics, alerts and on-call runbooks." },
      ],
    },
    technologies: ["AWS", "Azure", "Docker", "Kubernetes", "Terraform", "Grafana", "Cloudflare"],
    workflow: wf(
      "Workload review, cost and risk assessment.",
      "Reference architecture and IaC blueprints.",
      "Automated pipelines and environment parity.",
      "Autoscaling, DR drills and FinOps tuning.",
    ),
    caseStudy: {
      client: "Fintech scale-up",
      challenge: "Manual deploys and a monthly outage during traffic peaks.",
      outcome: "Kubernetes with automated canaries and full tracing.",
      metrics: [
        { k: "Uptime", v: "99.99%" },
        { k: "Deploys", v: "40/wk" },
        { k: "Cloud cost", v: "-38%" },
      ],
    },
  },
  {
    slug: "automation",
    motif: "automation",
    index: "05",
    glyph: "⟳",
    name: "Automation",
    title: "Automation",
    tagline: "Workflows that run themselves",
    hero: "A workflow factory — conveyors of data, robotic arms of logic and pipelines that never stop moving.",
    environment: "Workflow Factory",
    solutions: {
      eyebrow: "Automation Solutions",
      title: "Remove the manual middle",
      description: "Connected pipelines with AI making the judgement calls in between.",
      items: [
        { title: "CRM Automation", text: "Lead capture, scoring, routing and follow-up." },
        { title: "Messaging", text: "WhatsApp, email and social sequences on autopilot." },
        { title: "Document Flows", text: "Extraction, validation and approvals without humans." },
        { title: "Ops Pipelines", text: "Reconciliations, reporting and alerting on schedule." },
      ],
    },
    technologies: ["n8n", "Temporal", "Python", "LangChain", "Redis", "Kafka"],
    workflow: wf(
      "Process mining and manual-hour mapping.",
      "Pipeline design with human-in-the-loop checkpoints.",
      "Integration build, retries and idempotency.",
      "Throughput tuning and exception dashboards.",
    ),
    caseStudy: {
      client: "Logistics operator",
      challenge: "Six staff copying shipment data between four systems.",
      outcome: "An event-driven pipeline with AI exception handling.",
      metrics: [
        { k: "Hours saved", v: "310/mo" },
        { k: "Error rate", v: "-91%" },
        { k: "Payback", v: "4 mo" },
      ],
    },
  },
  {
    slug: "ui-ux",
    motif: "uiux",
    index: "06",
    glyph: "◈",
    name: "UI / UX",
    title: "UI / UX Design",
    tagline: "Interfaces with intent",
    hero: "A design studio in mid-air — wireframes, palettes and prototypes assembling themselves on a floating board.",
    environment: "Design Studio",
    solutions: {
      eyebrow: "Design Solutions",
      title: "Complex software, effortless to use",
      description: "Research-led product design and brand systems that scale with the roadmap.",
      items: [
        { title: "Product Research", text: "Interviews, journeys and usability benchmarks." },
        { title: "Design Systems", text: "Tokens, components and documentation in Storybook." },
        { title: "Prototyping", text: "High-fidelity motion prototypes tested before build." },
        { title: "Brand Identity", text: "Logo, typography and a full visual language." },
      ],
    },
    technologies: ["Figma", "Framer", "Motion", "Storybook", "Maze"],
    workflow: wf(
      "Stakeholder and user research synthesis.",
      "Information architecture and wireframes.",
      "Visual system, motion spec and prototype.",
      "Usability testing and design QA in build.",
    ),
    caseStudy: {
      client: "Healthcare SaaS",
      challenge: "Clinicians needed eleven clicks to complete a routine record.",
      outcome: "A redesigned workflow with a shared clinical design system.",
      metrics: [
        { k: "Task time", v: "-64%" },
        { k: "Adoption", v: "+3.2x" },
        { k: "SUS score", v: "88" },
      ],
    },
  },
  {
    slug: "enterprise",
    motif: "enterprise",
    index: "07",
    glyph: "▦",
    name: "Enterprise",
    title: "Enterprise Software",
    tagline: "Run the whole business",
    hero: "A corporate command deck — analytics walls, live world maps and governed systems running the entire operation.",
    environment: "Command Deck",
    solutions: {
      eyebrow: "Enterprise Solutions",
      title: "One governed system of record",
      description: "Inventory, people, money and manufacturing with analytics on top.",
      items: [
        { title: "ERP", text: "Procurement, production and finance in one ledger." },
        { title: "HRMS", text: "Hiring, payroll, attendance and performance." },
        { title: "Inventory", text: "Multi-warehouse stock with real-time reconciliation." },
        { title: "Analytics", text: "Executive dashboards and self-serve reporting." },
      ],
    },
    technologies: ["React", "Node", "PostgreSQL", "Kafka", "Metabase", "Keycloak"],
    workflow: wf(
      "Process mapping across every department.",
      "Domain model, RBAC and audit design.",
      "Modular rollout, module by module.",
      "Training, SLAs and continuous improvement.",
    ),
    caseStudy: {
      client: "Multi-plant manufacturer",
      challenge: "Spreadsheets across four plants with no shared truth.",
      outcome: "A unified ERP with real-time production and stock visibility.",
      metrics: [
        { k: "Close time", v: "-70%" },
        { k: "Stock accuracy", v: "99.4%" },
        { k: "Plants live", v: "4" },
      ],
    },
  },
  {
    slug: "api",
    motif: "api",
    index: "08",
    glyph: "⇄",
    name: "API",
    title: "API Integration",
    tagline: "Every system, one language",
    hero: "A living network — gateways pulsing, requests firing between nodes and every legacy system finally speaking the same protocol.",
    environment: "Network Gateway",
    solutions: {
      eyebrow: "Integration Solutions",
      title: "Clean contracts between everything",
      description: "Secure, versioned integration layers with documentation your partners enjoy.",
      items: [
        { title: "REST & GraphQL", text: "Typed, versioned contracts with generated SDKs." },
        { title: "Payments", text: "Stripe, Razorpay and bank rails with reconciliation." },
        { title: "Messaging", text: "WhatsApp, SMS and email providers behind one interface." },
        { title: "Identity", text: "OAuth, SSO and fine-grained authorisation." },
      ],
    },
    technologies: ["REST", "GraphQL", "OAuth", "Stripe", "Twilio", "Kong"],
    workflow: wf(
      "System inventory and contract discovery.",
      "Schema design, versioning and auth model.",
      "Gateway build with retries and rate limits.",
      "Monitoring, SLAs and partner onboarding.",
    ),
    caseStudy: {
      client: "Travel marketplace",
      challenge: "Fourteen supplier APIs, each with a bespoke integration.",
      outcome: "A single normalised gateway with caching and failover.",
      metrics: [
        { k: "Latency", v: "-58%" },
        { k: "Suppliers", v: "14→1 API" },
        { k: "Uptime", v: "99.98%" },
      ],
    },
  },
];

export const worldBySlug = (slug: string) => SERVICE_WORLDS.find((w) => w.slug === slug);
