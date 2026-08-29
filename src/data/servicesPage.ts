export interface ServiceDetail {
  id: string;
  index: string;
  title: string;
  tagline: string;
  description: string;
  features: string[];
  tech: string[];
  /** Visual motif used by the illustration panel. */
  motif: "brain" | "web" | "mobile" | "cloud" | "design" | "automation" | "enterprise" | "api";
}

export const SERVICE_DETAILS: ServiceDetail[] = [
  {
    id: "ai",
    index: "01",
    title: "Artificial Intelligence Solutions",
    tagline: "Machines that reason",
    description:
      "Build intelligent AI systems capable of automating operations, generating insights, understanding human language and powering next-generation digital products.",
    features: [
      "AI Agents",
      "Chatbots",
      "Computer Vision",
      "OCR",
      "NLP",
      "Generative AI",
      "Recommendation Engines",
      "Predictive Analytics",
    ],
    tech: ["Python", "TensorFlow", "PyTorch", "OpenAI", "LangChain"],
    motif: "brain",
  },
  {
    id: "web",
    index: "02",
    title: "Web Development",
    tagline: "Enterprise-grade on the web",
    description:
      "High-performance corporate platforms and internal systems engineered for scale, speed and search — from marketing sites to complex operational portals.",
    features: [
      "Corporate Websites",
      "Enterprise Portals",
      "CRM",
      "ERP",
      "Admin Panel",
      "Landing Pages",
      "CMS",
      "SEO",
    ],
    tech: ["Next.js", "React", "Node", "Express", "MongoDB", "PostgreSQL"],
    motif: "web",
  },
  {
    id: "mobile",
    index: "03",
    title: "Mobile App Development",
    tagline: "Products that live in the pocket",
    description:
      "Native and cross-platform applications with fluid motion, offline resilience and store-ready polish across Android and iOS.",
    features: [
      "Android",
      "iOS",
      "Flutter",
      "React Native",
      "Social Apps",
      "Healthcare",
      "Finance",
      "Food Delivery",
    ],
    tech: ["Flutter", "React Native", "Kotlin", "Swift", "Firebase"],
    motif: "mobile",
  },
  {
    id: "cloud",
    index: "04",
    title: "Cloud & DevOps",
    tagline: "Infrastructure that never blinks",
    description:
      "Cloud architecture, containerised delivery pipelines and observability so releases ship daily without drama and scale without surprises.",
    features: [
      "AWS",
      "Azure",
      "Docker",
      "Kubernetes",
      "CI/CD",
      "Security",
      "Monitoring",
      "Scaling",
    ],
    tech: ["AWS", "Azure", "Docker", "Kubernetes", "Terraform"],
    motif: "cloud",
  },
  {
    id: "design",
    index: "05",
    title: "UI / UX Design",
    tagline: "Interfaces with intent",
    description:
      "Research-led product design, systemised components and brand identity that make complex software feel effortless to use.",
    features: [
      "Research",
      "Wireframes",
      "Prototype",
      "Design System",
      "Brand Identity",
      "User Testing",
    ],
    tech: ["Figma", "Framer", "Motion", "Storybook"],
    motif: "design",
  },
  {
    id: "automation",
    index: "06",
    title: "Automation",
    tagline: "Workflows that run themselves",
    description:
      "Connected pipelines that move data, documents and conversations between your tools — with AI making the judgement calls in between.",
    features: [
      "CRM Automation",
      "WhatsApp",
      "Email",
      "Social Media",
      "Lead Pipeline",
      "Document Automation",
    ],
    tech: ["n8n", "Temporal", "Python", "LangChain", "Redis"],
    motif: "automation",
  },
  {
    id: "enterprise",
    index: "07",
    title: "Enterprise Software",
    tagline: "Run the whole business",
    description:
      "Operational platforms built around your process — inventory, people, money and manufacturing in one governed system with analytics on top.",
    features: [
      "ERP",
      "HRMS",
      "Inventory",
      "Accounting",
      "Manufacturing",
      "Healthcare",
      "Education",
    ],
    tech: ["React", "Node", "PostgreSQL", "Kafka", "Metabase"],
    motif: "enterprise",
  },
  {
    id: "api",
    index: "08",
    title: "API Integration",
    tagline: "Every system, one language",
    description:
      "Secure integration layers that connect payments, messaging, identity and legacy platforms behind clean, documented, versioned contracts.",
    features: [
      "REST",
      "GraphQL",
      "Payment",
      "WhatsApp",
      "Google",
      "ERP",
      "CRM",
      "Authentication",
    ],
    tech: ["REST", "GraphQL", "OAuth", "Stripe", "Twilio"],
    motif: "api",
  },
];

export const TECH_GROUPS: { group: string; items: string[] }[] = [
  { group: "Frontend", items: ["React", "Next.js", "TypeScript", "Motion", "Three.js"] },
  { group: "Backend", items: ["Node", "Express", "Python", "FastAPI", "Go"] },
  { group: "Mobile", items: ["Flutter", "React Native", "Kotlin", "Swift"] },
  { group: "Cloud", items: ["AWS", "Azure", "Docker", "Kubernetes", "Cloudflare"] },
  { group: "AI", items: ["OpenAI", "LangChain", "TensorFlow", "PyTorch", "pgvector"] },
  { group: "Database", items: ["MongoDB Atlas", "PostgreSQL", "Redis", "Elasticsearch"] },
];

export const INDUSTRIES: { name: string; icon: string }[] = [
  { name: "Healthcare", icon: "✚" },
  { name: "Education", icon: "◈" },
  { name: "Finance", icon: "₹" },
  { name: "Real Estate", icon: "▣" },
  { name: "Manufacturing", icon: "⚙" },
  { name: "Travel", icon: "✈" },
  { name: "Hospitality", icon: "☕" },
  { name: "Retail", icon: "🛍" },
  { name: "Agriculture", icon: "🌾" },
  { name: "Logistics", icon: "⛟" },
  { name: "Startups", icon: "◆" },
  { name: "Government", icon: "⚖" },
];

export const DEV_PROCESS: { step: string; title: string; detail: string }[] = [
  { step: "01", title: "Discover", detail: "Goals, constraints and the real problem behind the brief." },
  { step: "02", title: "Research", detail: "Users, competitors, data and technical feasibility." },
  { step: "03", title: "Planning", detail: "Scope, architecture, milestones and a fixed delivery rhythm." },
  { step: "04", title: "Design", detail: "Flows, systemised UI and prototypes signed off before build." },
  { step: "05", title: "Development", detail: "Two-week cycles with working software at the end of each." },
  { step: "06", title: "Testing", detail: "Automated suites, load runs, security review and UAT." },
  { step: "07", title: "Deployment", detail: "Zero-downtime rollout with monitoring wired from day one." },
  { step: "08", title: "Support", detail: "SLAs, iteration and continuous improvement after launch." },
];

export const COMPARISON: { label: string; dimisi: string; others: string }[] = [
  { label: "Innovation", dimisi: "AI-first, research-backed builds", others: "Template-driven delivery" },
  { label: "Scalability", dimisi: "Architected for 100x load", others: "Rebuilt when it grows" },
  { label: "Security", dimisi: "Reviews, RBAC and audit trails", others: "Bolted on later" },
  { label: "Performance", dimisi: "60fps UI, sub-second APIs", others: "Ships and hopes" },
  { label: "Support", dimisi: "Named engineers, SLA response", others: "Ticket queue" },
  { label: "AI Ready", dimisi: "Agents and evals built in", others: "No AI roadmap" },
  { label: "Future Proof", dimisi: "You own code, data and models", others: "Vendor lock-in" },
];

export const ORBIT_ICONS: { label: string; icon: string }[] = [
  { label: "AI Brain", icon: "◉" },
  { label: "Website", icon: "▤" },
  { label: "Mobile", icon: "▯" },
  { label: "Cloud", icon: "☁" },
  { label: "Analytics", icon: "▦" },
  { label: "Automation", icon: "⟳" },
];
