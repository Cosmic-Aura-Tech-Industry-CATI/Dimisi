/**
 * Server-side store and repository for DIMISI Dynamic Services & Industries.
 * Pre-seeded with 11 production-grade engineering services and 8 industry sectors.
 */
import {
  type CompanyService,
  type ServiceInput,
  type IndustrySector,
  type IndustryInput,
  type PublicServicesPayload,
  slugifyService,
} from "./services.shared";

const SEED_SERVICES: CompanyService[] = [
  {
    id: "srv-web-development",
    title: "Web Development",
    slug: "web-development",
    category: "Full-Stack Engineering",
    tagline: "Scalable, high-performance websites and web applications tailored to business scale.",
    summary:
      "From high-conversion marketing portals to complex multi-tenant enterprise dashboards, we architect responsive, SEO-optimized web experiences with sub-second page loads.",
    hero_image:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1600&q=80",
    related_images: [
      {
        url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1000&q=80",
        caption: "High-concurrency analytics dashboard architecture with sub-second response times.",
        alt: "Web Application Dashboard",
      },
      {
        url: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1000&q=80",
        caption: "Responsive multi-device viewport design with fluid glassmorphic UI components.",
        alt: "Responsive Web Interface",
      },
      {
        url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=80",
        caption: "Zero-bundle-bloat Next.js & React SSR compilation pipeline with edge caching.",
        alt: "Edge Rendering Pipeline",
      },
    ],
    what_is_it:
      "End-to-end full-stack web engineering that blends cutting-edge frontends (React, TanStack, Next.js) with hyper-resilient microservice backends and distributed databases.",
    who_is_for:
      "Startups building their flagship digital product, fast-scaling SMBs needing custom workflow portals, and enterprises modernizing sluggish legacy web systems.",
    problem_solved:
      "Eliminates slow load speeds, poor mobile responsiveness, broken checkout funnels, and inflexible template-based websites that bottleneck business revenue.",
    why_it_matters:
      "A 1-second improvement in page speed increases conversion rates by up to 27%. We build custom digital experiences engineered for maximum user trust and commercial performance.",
    features: [
      "Custom Full-Stack Web Applications",
      "Corporate Portals & Brand Flagships",
      "Headless E-Commerce & Fast Checkouts",
      "Admin Control Panels & Operational Tools",
      "Core Web Vitals & Technical SEO Excellence",
      "Real-Time WebSockets & Push Infrastructure",
    ],
    process_steps: [
      {
        step: "01",
        title: "Discovery & Requirements",
        description: "We audit user journeys, technical constraints, data schemas, and business goals.",
      },
      {
        step: "02",
        title: "Architecture & UI/UX Wireframing",
        description: "Interactive Figma prototypes and low-latency database modeling.",
      },
      {
        step: "03",
        title: "Sprint-Based Engineering",
        description: "Modern modular TypeScript development with bi-weekly deployable builds.",
      },
      {
        step: "04",
        title: "End-to-End Automated Testing",
        description: "Rigorous unit, integration, accessibility, and performance load tests.",
      },
      {
        step: "05",
        title: "Edge Production Deployment",
        description: "Zero-downtime blue/green rollouts on global CDNs with SSL & DDoS protection.",
      },
      {
        step: "06",
        title: "Continuous SLA Monitoring",
        description: "24/7 telemetry monitoring, database tuning, and proactive dependency upgrades.",
      },
    ],
    benefits: [
      {
        title: "Sub-Second Page Loads",
        description: "Edge-cached SSR rendering achieving 95+ Google Lighthouse scores.",
        metric: "< 400ms TTFB",
      },
      {
        title: "Higher Conversion Rates",
        description: "Frictionless UI micro-interactions that turn visitors into paying customers.",
        metric: "+35% Conversion",
      },
      {
        title: "Zero Tech Debt",
        description: "Strict TypeScript typing and clean modular architecture built to scale.",
        metric: "100% Type-Safe",
      },
      {
        title: "SEO Ranking Leverage",
        description: "Structured schema metadata and automated OpenGraph social previews.",
        metric: "Top SERP Rank",
      },
      {
        title: "Bank-Grade Security",
        description: "OWASP-compliant data sanitization, CSRF tokens, and zero-trust auth.",
        metric: "Zero Leaks",
      },
      {
        title: "Continuous Scalability",
        description: "Engineered to effortlessly absorb sudden 100x traffic surges.",
        metric: "100k+ CCU",
      },
    ],
    faqs: [
      {
        question: "Which web technologies and frameworks do you use?",
        answer:
          "We primarily architect with React, TanStack Start/Router, Next.js, TypeScript, Node.js, PostgreSQL, and Redis, deployed across Vercel, Cloudflare, or AWS.",
      },
      {
        question: "How long does a typical web application project take?",
        answer:
          "High-impact marketing flagships take 2 to 4 weeks. Complex full-stack portals and MVPs typically launch within 4 to 8 weeks in iterative two-week sprint releases.",
      },
      {
        question: "Will our website be mobile-responsive and SEO-optimized?",
        answer:
          "Absolutely. Every web experience is built mobile-first with 100% responsive fluid layouts, optimized Core Web Vitals, dynamic OpenGraph metadata, and structured schema markup.",
      },
      {
        question: "Do you offer post-launch maintenance and support?",
        answer:
          "Yes! We provide SLA-backed maintenance packages including 24/7 uptime monitoring, security updates, database backups, and ongoing feature development sprints.",
      },
    ],
    tech_stack: ["React", "TanStack", "Next.js", "TypeScript", "Node.js", "PostgreSQL", "Tailwind CSS"],
    order_index: 1,
    is_featured: true,
    is_active: true,
    accent_color: "rgba(255, 122, 0, 0.35)",
    created_at: "2026-01-10T10:00:00Z",
    updated_at: "2026-08-26T12:00:00Z",
  },
  {
    id: "srv-mobile-development",
    title: "Mobile App Development",
    slug: "mobile-app",
    category: "Mobile Engineering",
    tagline: "Native and cross-platform mobile experiences for iOS and Android.",
    summary:
      "Engineered with offline resilience, biometric security, real-time push synchronization, and buttery-smooth 60fps animations across all mobile form factors.",
    hero_image:
      "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=1600&q=80",
    related_images: [
      {
        url: "https://images.unsplash.com/photo-1526470608268-f674ce90ebd4?auto=format&fit=crop&w=1000&q=80",
        caption: "Cross-platform mobile UI design with native performance and dark glass aesthetics.",
        alt: "Mobile App Interface",
      },
      {
        url: "https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&w=1000&q=80",
        caption: "Real-time state synchronization and background task worker architecture.",
        alt: "Real-Time Mobile Architecture",
      },
    ],
    what_is_it:
      "Native (Swift, Kotlin) and multi-platform (Flutter, React Native) mobile applications designed for high performance, smooth gestures, and store approval.",
    who_is_for:
      "Consumer tech companies, on-demand marketplaces, healthcare apps, and enterprise field teams needing instant mobile utility.",
    problem_solved:
      "Prevents high app uninstalls caused by stuttery animations, slow startup times, battery drain, and poor offline connectivity.",
    why_it_matters:
      "Over 65% of all digital minutes occur on mobile devices. A polished native experience dramatically boosts daily active users and lifetime customer value.",
    features: [
      "Native iOS (Swift) & Android (Kotlin)",
      "Cross-Platform Flutter & React Native",
      "Biometric FaceID / Fingerprint Authentication",
      "Offline-First SQLite / WatermelonDB Sync",
      "Push Notifications & In-App Messaging",
      "App Store & Google Play Store Submission",
    ],
    process_steps: [
      {
        step: "01",
        title: "Product UX Mapping",
        description: "Mobile-specific user flows, gesture paradigms, and hardware permission audits.",
      },
      {
        step: "02",
        title: "Interactive Prototypes",
        description: "Figma mobile wireframes with micro-animations tested on physical devices.",
      },
      {
        step: "03",
        title: "Native / Cross-Platform Coding",
        description: "Clean architecture with declarative state management and offline sync logic.",
      },
      {
        step: "04",
        title: "Multi-Device Test Matrix",
        description: "Automated test runs across dozens of real iOS and Android screen resolutions.",
      },
      {
        step: "05",
        title: "App Store Publishing",
        description: "Handling Apple TestFlight, Google Play tracks, privacy disclosures, and review approval.",
      },
      {
        step: "06",
        title: "Crashlytics & OTA Updates",
        description: "Real-time crash diagnostics and seamless over-the-air hotfixes.",
      },
    ],
    benefits: [
      {
        title: "60 FPS Fluidity",
        description: "Zero frame drops during complex scrolling and animated transitions.",
        metric: "60 FPS Constant",
      },
      {
        title: "Offline-First Reliability",
        description: "Users can continue working offline; data auto-syncs when online.",
        metric: "100% Offline Mode",
      },
      {
        title: "Fast Store Approval",
        description: "Strict adherence to Apple HIG and Google Material guidelines for zero rejections.",
        metric: "< 48h Approval",
      },
      {
        title: "Battery & Memory Optimization",
        description: "Ultra-lean memory footprint and minimal background drain.",
        metric: "-40% Battery Drain",
      },
      {
        title: "Encrypted Data at Rest",
        description: "Keychain and Keystore hardware encryption for all sensitive user credentials.",
        metric: "Hardware Encrypted",
      },
      {
        title: "High Store Ratings",
        description: "Polished UX designed to capture 4.8+ star app store reviews organically.",
        metric: "4.8+ Avg Rating",
      },
    ],
    faqs: [
      {
        question: "Should we build native or cross-platform with Flutter/React Native?",
        answer:
          "For 90% of business and consumer apps, Flutter or React Native provides native performance with a single codebase that cuts development time and cost by ~40%. For complex AR or hardware-level tools, we build pure native.",
      },
      {
        question: "Do you handle App Store and Google Play submissions?",
        answer:
          "Yes. We handle the entire submission process, including metadata, screenshots, privacy policies, age ratings, and test track deployments until live.",
      },
    ],
    tech_stack: ["Flutter", "React Native", "Swift", "Kotlin", "Firebase", "SQLite", "GraphQL"],
    order_index: 2,
    is_featured: true,
    is_active: true,
    accent_color: "rgba(255, 179, 0, 0.35)",
    created_at: "2026-01-12T10:00:00Z",
    updated_at: "2026-08-26T12:00:00Z",
  },
  {
    id: "srv-ai-automation",
    title: "AI & Automation",
    slug: "ai",
    category: "Autonomous Systems",
    tagline: "Intelligent workflows, machine learning, and automation that reduce manual work.",
    summary:
      "Practical artificial intelligence woven into your operational fabric — automating repetitive overhead, routing complex multi-modal data, and uncovering hidden predictive leverage.",
    hero_image:
      "https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=1600&q=80",
    related_images: [
      {
        url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80",
        caption: "Autonomous agent execution mesh coordinating multi-step document reasoning.",
        alt: "AI Autonomous Agents",
      },
      {
        url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1000&q=80",
        caption: "Private vector embeddings and RAG search pipeline with zero data leakage.",
        alt: "Vector Database Pipeline",
      },
    ],
    what_is_it:
      "Custom AI agents, Retrieval-Augmented Generation (RAG) knowledge bases, computer vision pipelines, and intelligent automated workflows built for enterprise utility.",
    who_is_for:
      "Companies with heavy manual data processing, customer support queues, internal document synthesis needs, or products requiring GenAI capabilities.",
    problem_solved:
      "Replaces hundreds of hours of manual copy-paste work, human data entry errors, and generic halluncination-prone chatbots with deterministic AI workflows.",
    why_it_matters:
      "AI automation lowers operational costs by 40-70% while enabling 24/7 instant responses and unlockable predictive insights from unstructured company data.",
    features: [
      "Autonomous Multi-Agent Systems",
      "Private Enterprise RAG Knowledge Bases",
      "Computer Vision & Document OCR",
      "Predictive Analytics & Anomaly Detection",
      "Custom Small Language Model (SLM) Fine-Tuning",
      "Zero-Data-Leakage Local AI Deployments",
    ],
    process_steps: [
      {
        step: "01",
        title: "AI Feasibility & Data Audit",
        description: "Evaluating data quality, privacy constraints, and high-ROI automation targets.",
      },
      {
        step: "02",
        title: "Model & Architecture Selection",
        description: "Selecting optimal foundation models, embedding vectors, and deterministic guardrails.",
      },
      {
        step: "03",
        title: "Pipeline & Agent Engineering",
        description: "Building LangChain/LlamaIndex agents, memory stores, and API tool integrations.",
      },
      {
        step: "04",
        title: "Evaluation & Hallucination Testing",
        description: "Benchmarking accuracy against gold-standard test datasets with automated evals.",
      },
      {
        step: "05",
        title: "Secure Deployment",
        description: "Deploying with token rate limiting, privacy redacting, and audit logging.",
      },
      {
        step: "06",
        title: "Feedback Loop & Continuous Tuning",
        description: "Fine-tuning on real user corrections to improve precision over time.",
      },
    ],
    benefits: [
      {
        title: "70% Manual Time Saved",
        description: "Automate repetitive data extraction, invoice routing, and report generation.",
        metric: "70% Cost Cut",
      },
      {
        title: "Deterministic Grounding",
        description: "Strict RAG guardrails that prevent AI hallucinations with verifiable citations.",
        metric: "99.4% Accuracy",
      },
      {
        title: "Zero Data Leakage",
        description: "Your proprietary company data is never used to train public models.",
        metric: "100% Private",
      },
      {
        title: "Sub-Second Latency",
        description: "Optimized semantic caching and streaming responses for natural interactions.",
        metric: "< 300ms First Token",
      },
      {
        title: "24/7 Agent Availability",
        description: "Intelligent agents resolve customer and operational queries around the clock.",
        metric: "24/7 Uptime",
      },
      {
        title: "Scalable Token Economics",
        description: "Smart model routing (Flash vs Pro) to minimize monthly API inference costs.",
        metric: "-60% Token Cost",
      },
    ],
    faqs: [
      {
        question: "Is our proprietary business data safe when using AI models?",
        answer:
          "Yes. We configure enterprise agreements and private VPC deployments ensuring zero data retention and zero training on your corporate documents.",
      },
      {
        question: "How do you prevent hallucinations in AI responses?",
        answer:
          "We use strict RAG pipelines with vector cosine similarity thresholds, re-ranking models, and verification layers that require source citation for every factual claim.",
      },
    ],
    tech_stack: ["Python", "PyTorch", "LangChain", "OpenAI", "Gemini", "Pinecone", "Qdrant", "FastAPI"],
    order_index: 3,
    is_featured: true,
    is_active: true,
    accent_color: "rgba(255, 90, 0, 0.35)",
    created_at: "2026-01-14T10:00:00Z",
    updated_at: "2026-08-26T12:00:00Z",
  },
  {
    id: "srv-ui-ux",
    title: "UI/UX Design & 3D Experiences",
    slug: "ui-ux",
    category: "Design & Creative Technology",
    tagline: "User-centered interface design, systems, and prototypes that delight users.",
    summary:
      "Bridging human intuition and high-fidelity aesthetics. We create unforgettable digital brand identities, design systems, interactive 3D WebGL scenes, and clickable prototypes.",
    hero_image:
      "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=1600&q=80",
    related_images: [
      {
        url: "https://images.unsplash.com/photo-1545235617-9465d2a55698?auto=format&fit=crop&w=1000&q=80",
        caption: "Modular design tokens and atomic UI component systems built in Figma.",
        alt: "Figma Design System",
      },
      {
        url: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1000&q=80",
        caption: "3D procedural WebGL canvas rendering with real-time mouse lighting.",
        alt: "3D WebGL Interface",
      },
    ],
    what_is_it:
      "World-class product design combining deep UX research, design systems, micro-animations, and cutting-edge WebGL/Three.js interactive 3D elements.",
    who_is_for:
      "Companies wanting to stand out from generic corporate templates with a memorable, high-converting digital aesthetic.",
    problem_solved:
      "Solves high bounce rates, confusing navigation hierarchies, user drop-offs during onboarding, and outdated visual identities.",
    why_it_matters:
      "First impressions are 94% design-related. An intentional, visually captivating UI establishes instant authority and commands premium pricing.",
    features: [
      "Atomic Design Systems & Token Architecture",
      "Interactive High-Fidelity Prototypes",
      "Interactive 3D WebGL / WebGPU Visuals",
      "Frictionless Checkout & Onboarding UX",
      "Accessibility (WCAG 2.1 AA) Compliance",
      "Micro-Interactions & Motion Design",
    ],
    process_steps: [
      {
        step: "01",
        title: "User Journey & Research",
        description: "Empathy mapping, stakeholder interviews, and competitive spatial analysis.",
      },
      {
        step: "02",
        title: "Information Architecture",
        description: "Wireframing sitemaps and low-fidelity structural screen layouts.",
      },
      {
        step: "03",
        title: "Design System & Visual Language",
        description: "Defining typography, dark-cyber glass tokens, and component states.",
      },
      {
        step: "04",
        title: "High-Fidelity & Motion Prototyping",
        description: "Interactive clickable prototypes with realistic transitions in Figma and Framer.",
      },
      {
        step: "05",
        title: "Design-to-Code Tokens Handoff",
        description: "Pixel-perfect handoff with CSS variable tokens and layout specs.",
      },
      {
        step: "06",
        title: "Usability Testing & QA",
        description: "Heatmap audits and accessibility validation to maximize engagement.",
      },
    ],
    benefits: [
      {
        title: "Instant Brand Authority",
        description: "Aesthetic perfection that makes prospective clients immediately trust your product.",
        metric: "10x Trust Factor",
      },
      {
        title: "Lower Onboarding Friction",
        description: "Intuitive UX flows that cut user drop-offs during registration and checkouts.",
        metric: "-45% Drop-Off",
      },
      {
        title: "Rapid Developer Velocity",
        description: "Re-usable design system tokens that speed up frontend coding by 2x.",
        metric: "2x Dev Speed",
      },
      {
        title: "WCAG AA Accessible",
        description: "Color contrast ratios and keyboard navigation accessible to all users.",
        metric: "100% WCAG AA",
      },
      {
        title: "Unforgettable 3D Motion",
        description: "Hardware-accelerated 3D shaders that captivate enterprise decision makers.",
        metric: "3.5x Dwell Time",
      },
      {
        title: "Future-Proof Scalability",
        description: "Modular components that scale seamlessly as new features are introduced.",
        metric: "Modular Tokens",
      },
    ],
    faqs: [
      {
        question: "Do you deliver files in Figma?",
        answer:
          "Yes! You receive complete, organized Figma files with auto-layout components, variant states, color/typography tokens, and interactive clickable prototypes.",
      },
      {
        question: "Can you design 3D interactive graphics for our website?",
        answer:
          "Yes, we specialize in Three.js and WebGL/WebGPU shaders that run smoothly on both desktop and mobile devices without slowing down page load speeds.",
      },
    ],
    tech_stack: ["Figma", "Three.js", "WebGL", "Framer", "CSS Modules", "Tailwind"],
    order_index: 4,
    is_featured: true,
    is_active: true,
    accent_color: "rgba(255, 200, 50, 0.35)",
    created_at: "2026-01-15T10:00:00Z",
    updated_at: "2026-08-26T12:00:00Z",
  },
  {
    id: "srv-software-dev",
    title: "Software Development",
    slug: "enterprise",
    category: "Custom Software",
    tagline: "Custom software, MVPs, and enterprise applications built for scale.",
    summary:
      "Zero-bloat, robust software engineering engineered to solve complex operational challenges, bridge disparate legacy systems, and power critical business logic.",
    hero_image:
      "https://images.unsplash.com/photo-1571171637578-41bc2dd41cd2?auto=format&fit=crop&w=1600&q=80",
    related_images: [
      {
        url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1000&q=80",
        caption: "Distributed microservices architecture with event-driven Kafka message brokers.",
        alt: "Distributed Backend Architecture",
      },
    ],
    what_is_it:
      "Bespoke backend systems, distributed services, and business software engineered with strict type safety, database concurrency, and automated testing.",
    who_is_for:
      "Businesses with unique operational workflows that off-the-shelf SaaS cannot solve, or teams scaling beyond monolithic prototypes.",
    problem_solved:
      "Eliminates manual workarounds, data sync failures between siloed tools, and unmaintainable legacy codebases.",
    why_it_matters:
      "Custom software creates an enduring competitive advantage by cementing your proprietary business logic into proprietary high-speed software.",
    features: [
      "Custom Enterprise Core Software",
      "High-Velocity MVP Development",
      "Microservices & Event-Driven Backends",
      "Distributed Database Architectures",
      "Legacy Code Refactoring & Modernization",
      "Complex Custom Business Logic",
    ],
    process_steps: [
      {
        step: "01",
        title: "Domain Modeling",
        description: "Mapping entities, relationships, database schemas, and business invariants.",
      },
      {
        step: "02",
        title: "API & Architecture Blueprint",
        description: "Designing REST/gRPC/GraphQL contracts and database isolation levels.",
      },
      {
        step: "03",
        title: "Agile Development",
        description: "Test-Driven Development (TDD) delivering reliable, documented endpoints.",
      },
      {
        step: "04",
        title: "Integration & Security Auditing",
        description: "Static code analysis, vulnerability scanning, and pen-testing.",
      },
      {
        step: "05",
        title: "Data Migration & Go-Live",
        description: "Zero-loss data migration and seamless cutover to the new system.",
      },
      {
        step: "06",
        title: "Ongoing SLA Support",
        description: "Continuous database indexing, latency tuning, and version upgrades.",
      },
    ],
    benefits: [
      {
        title: "100% Tailored to Workflows",
        description: "No generic bloated features; software designed specifically for your exact operations.",
        metric: "100% Custom",
      },
      {
        title: "Sub-Millisecond Query Times",
        description: "Carefully indexed relational and caching layers that execute queries instantly.",
        metric: "< 5ms Queries",
      },
      {
        title: "Full Source Code Ownership",
        description: "You retain 100% intellectual property ownership of all written code.",
        metric: "100% IP Owned",
      },
      {
        title: "Zero Per-Seat SaaS Taxes",
        description: "Own your platform and stop paying exorbitant recurring per-user SaaS license fees.",
        metric: "$0 Per-Seat Fee",
      },
      {
        title: "High Concurrency Support",
        description: "Engineered to process millions of transactions without data corruption.",
        metric: "ACID Compliant",
      },
      {
        title: "Seamless Third-Party Sync",
        description: "Custom connectors to ERP, CRM, payment gateways, and banking APIs.",
        metric: "Unified Data",
      },
    ],
    faqs: [
      {
        question: "Do we own the full source code and intellectual property?",
        answer:
          "Yes, upon completion and milestone settlement, you own 100% of the intellectual property, source code, repositories, and documentation.",
      },
      {
        question: "Can you integrate with our existing legacy systems?",
        answer:
          "Yes, we specialize in building modern API adapter layers and middleware that bridge legacy on-premise systems with modern cloud infrastructure.",
      },
    ],
    tech_stack: ["Go", "Node.js", "Rust", "PostgreSQL", "Redis", "Kafka", "Docker"],
    order_index: 5,
    is_featured: false,
    is_active: true,
    accent_color: "rgba(255, 60, 0, 0.35)",
    created_at: "2026-01-16T10:00:00Z",
    updated_at: "2026-08-26T12:00:00Z",
  },
  {
    id: "srv-cloud-devops",
    title: "Cloud Services & DevOps",
    slug: "cloud",
    category: "Infrastructure & Cloud",
    tagline: "Cloud architecture, migration, DevOps, and managed infrastructure on leading platforms.",
    summary:
      "Reliable multi-cloud architectures across AWS, GCP, Azure, and Cloudflare. We build automated container orchestration, auto-scaling clusters, and 24/7 security monitoring.",
    hero_image:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80",
    related_images: [
      {
        url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1000&q=80",
        caption: "Automated Kubernetes cluster provisioning with Terraform Infrastructure-as-Code.",
        alt: "Kubernetes Cloud Infrastructure",
      },
    ],
    what_is_it:
      "Cloud architecture design, Infrastructure as Code (IaC), automated CI/CD deployment pipelines, and 24/7 reliability engineering.",
    who_is_for:
      "Companies suffering from slow manual deployments, costly cloud bills, security vulnerabilities, or unexpected downtime.",
    problem_solved:
      "Eliminates server outages during traffic spikes, manual deployment mistakes, and bloated monthly cloud hosting bills.",
    why_it_matters:
      "Downtime costs businesses thousands per minute. A modern cloud setup ensures 99.99% uptime and scales automatically with demand.",
    features: [
      "Kubernetes & Docker Containerization",
      "Infrastructure as Code (Terraform / Pulumi)",
      "Automated CI/CD Pipelines (GitHub Actions / GitLab)",
      "Multi-Cloud Migration (AWS, GCP, Azure)",
      "Cloud Cost Optimization (FinOps)",
      "Zero-Downtime Blue/Green Deployments",
    ],
    process_steps: [
      {
        step: "01",
        title: "Infrastructure Audit",
        description: "Analyzing current cloud usage, security risks, bottlenecks, and costs.",
      },
      {
        step: "02",
        title: "Architecture Blueprint",
        description: "Designing high-availability VPC networks, subnets, and auto-scaling rules.",
      },
      {
        step: "03",
        title: "IaC Scripting",
        description: "Writing declarative Terraform code for fully reproducible infrastructure.",
      },
      {
        step: "04",
        title: "CI/CD Automation",
        description: "Building automated test, build, and deploy pipelines triggered on git push.",
      },
      {
        step: "05",
        title: "Zero-Downtime Migration",
        description: "Executing seamless data and DNS cutover without user disruption.",
      },
      {
        step: "06",
        title: "24/7 Monitoring & FinOps",
        description: "Configuring Datadog/Prometheus alerts and cloud cost reduction policies.",
      },
    ],
    benefits: [
      {
        title: "99.99% Uptime",
        description: "High-availability multi-zone clusters that automatically heal failing nodes.",
        metric: "99.99% SLA",
      },
      {
        title: "30-50% Lower Cloud Bills",
        description: "FinOps optimization eliminating idle instances and rightsizing resources.",
        metric: "-40% AWS Bill",
      },
      {
        title: "1-Click Deployments",
        description: "Automated CI/CD pipelines deploying tested code safely in under 5 minutes.",
        metric: "< 5 Min Deploys",
      },
      {
        title: "Zero-Downtime Releases",
        description: "Blue/Green and canary rollouts that upgrade apps with zero user interruption.",
        metric: "0s Downtime",
      },
      {
        title: "Automated Disaster Recovery",
        description: "Point-in-time database backups and multi-region disaster failover.",
        metric: "< 15m RTO / RPO",
      },
      {
        title: "SOC2 & ISO Ready",
        description: "Strict IAM security policies and encrypted networking meeting compliance standards.",
        metric: "Compliance Ready",
      },
    ],
    faqs: [
      {
        question: "Which cloud providers do you support?",
        answer:
          "We have certified expertise across Amazon Web Services (AWS), Google Cloud Platform (GCP), Microsoft Azure, and Cloudflare.",
      },
      {
        question: "Can you help us lower our monthly cloud bill?",
        answer:
          "Yes! Our FinOps audits consistently identify unused resources, unoptimized databases, and architectural inefficiencies, typically reducing bills by 30-50%.",
      },
    ],
    tech_stack: ["AWS", "GCP", "Kubernetes", "Docker", "Terraform", "GitHub Actions", "Prometheus"],
    order_index: 6,
    is_featured: false,
    is_active: true,
    accent_color: "rgba(255, 140, 0, 0.35)",
    created_at: "2026-01-18T10:00:00Z",
    updated_at: "2026-08-26T12:00:00Z",
  },
  {
    id: "srv-it-consulting",
    title: "IT Consulting & Architecture",
    slug: "it-consulting",
    category: "Strategic Advisory",
    tagline: "Strategic technology advisory to align your roadmap with business outcomes.",
    summary:
      "Unbiased technical audits, stack modernization roadmaps, security compliance reviews, and high-level architectural guidance from seasoned engineering leaders.",
    hero_image:
      "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1600&q=80",
    related_images: [
      {
        url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=80",
        caption: "Technical roadmap sprint alignment with executive stakeholders.",
        alt: "Consulting Session",
      },
    ],
    what_is_it:
      "Executive technical advisory, Fractional CTO services, architectural audits, and digital transformation roadmaps.",
    who_is_for:
      "Founders needing senior technical direction, non-technical executives making major technology investments, and enterprise leaders modernizing operations.",
    problem_solved:
      "Prevents costly mistakes choosing the wrong technology stack, hiring the wrong technical talent, or building unscalable systems.",
    why_it_matters:
      "Smart upfront technical strategy saves hundreds of thousands of dollars and months of lost engineering time.",
    features: [
      "Technical Due Diligence & Audits",
      "Legacy Modernization Roadmaps",
      "Security & Compliance Reviews",
      "System Architecture & Scaling Plans",
      "Fractional CTO Advisory",
      "Vendor & Tooling Evaluations",
    ],
    process_steps: [
      {
        step: "01",
        title: "Technical Discovery",
        description: "Reviewing codebases, architectures, engineering velocity, and business targets.",
      },
      {
        step: "02",
        title: "Gap Analysis & Audit",
        description: "Identifying security vulnerabilities, scaling bottlenecks, and tech debt.",
      },
      {
        step: "03",
        title: "Strategic Roadmap",
        description: "Delivering a prioritized, actionable modernization blueprint with ROI estimates.",
      },
      {
        step: "04",
        title: "Architecture Sprints",
        description: "Guiding your internal team or partners through high-stakes technical decisions.",
      },
      {
        step: "05",
        title: "Execution Oversight",
        description: "Providing ongoing code review, architectural governance, and milestone checks.",
      },
      {
        step: "06",
        title: "Outcome Review",
        description: "Measuring performance, security, and velocity gains against baseline metrics.",
      },
    ],
    benefits: [
      {
        title: "Zero Wrong-Stack Blunders",
        description: "Choose proven, future-proof frameworks that protect your company investment.",
        metric: "Risk Elimination",
      },
      {
        title: "Faster Time-to-Market",
        description: "Clarity on architecture allows development teams to ship with 2x velocity.",
        metric: "2x Velocity",
      },
      {
        title: "Fractional CTO Leverage",
        description: "Access top-tier system architecture leadership without the executive salary overhead.",
        metric: "C-Level Insight",
      },
      {
        title: "Investor-Grade Diligence",
        description: "Technical roadmaps and documentation that pass venture capital scrutiny.",
        metric: "VC Ready",
      },
      {
        title: "Security Hardening",
        description: "Fix hidden vulnerabilities before they lead to catastrophic data breaches.",
        metric: "Zero Breach",
      },
      {
        title: "Clear Milestone Tracking",
        description: "Transparent engineering KPIs that align tech output directly with revenue goals.",
        metric: "KPI Alignment",
      },
    ],
    faqs: [
      {
        question: "How does your Fractional CTO / Consulting engagement work?",
        answer:
          "We can engage on a project-basis (e.g. 2-week architectural audit) or as ongoing retained fractional CTO advisors dedicating set weekly hours to your engineering governance.",
      },
    ],
    tech_stack: ["System Design", "Cloud Strategy", "Enterprise Architecture", "Security Audits"],
    order_index: 7,
    is_featured: false,
    is_active: true,
    accent_color: "rgba(255, 110, 0, 0.35)",
    created_at: "2026-01-20T10:00:00Z",
    updated_at: "2026-08-26T12:00:00Z",
  },
  {
    id: "srv-it-support",
    title: "IT Support & Maintenance",
    slug: "it-support",
    category: "Support & Uptime",
    tagline: "Reliable monitoring, support, and continuous improvement.",
    summary:
      "We stay in your corner post-launch. Continuous uptime monitoring, proactive security patching, dependency upgrades, and guaranteed SLA-backed engineering support.",
    hero_image:
      "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1600&q=80",
    related_images: [
      {
        url: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1000&q=80",
        caption: "Continuous telemetry monitoring with automated emergency on-call paging.",
        alt: "IT Support Center",
      },
    ],
    what_is_it:
      "Proactive SLA maintenance, rapid incident response, continuous performance profiling, and ongoing technical upkeep for digital platforms.",
    who_is_for:
      "Businesses running mission-critical web, mobile, or cloud software that cannot afford unexpected downtime or security breaches.",
    problem_solved:
      "Prevents critical server crashes, neglected security vulnerabilities, broken third-party APIs, and slow degradation of user experience.",
    why_it_matters:
      "Software requires ongoing care. Proactive maintenance prevents small bugs from turning into expensive emergency outages.",
    features: [
      "24/7 Real-Time Telemetry & Uptime Monitoring",
      "Proactive Security & Vulnerability Patching",
      "Automated Database Backups & Recovery Testing",
      "Continuous Performance & Speed Profiling",
      "SLA-Guaranteed Bug Fix Turnaround Times",
      "Dedicated Technical Account Manager",
    ],
    process_steps: [
      {
        step: "01",
        title: "Onboarding & Telemetry Setup",
        description: "Installing observability agents, error trackers, and alerting rules.",
      },
      {
        step: "02",
        title: "Baseline Health Audit",
        description: "Benchmarking database query speeds, error logs, and security posture.",
      },
      {
        step: "03",
        title: "Routine Weekly Patching",
        description: "Applying dependency upgrades, security CVE patches, and framework updates.",
      },
      {
        step: "04",
        title: "24/7 Incident Triage",
        description: "Immediate engineer dispatch upon any threshold breach or error spike.",
      },
      {
        step: "05",
        title: "Monthly Optimization Sprints",
        description: "Dedicated hours for minor feature improvements and performance tuning.",
      },
      {
        step: "06",
        title: "Executive Health Reporting",
        description: "Monthly transparent report on uptime, incidents, and resolved tickets.",
      },
    ],
    benefits: [
      {
        title: "15-Minute Critical SLA",
        description: "Guaranteed rapid engineer response times for high-priority incidents.",
        metric: "< 15m Response",
      },
      {
        title: "Zero Security Vulnerabilities",
        description: "Automated daily dependency scanning and immediate CVE patching.",
        metric: "100% Patched",
      },
      {
        title: "Database Peace of Mind",
        description: "Automated offsite backups tested regularly for rapid recovery.",
        metric: "Automated Daily DR",
      },
      {
        title: "Stable Platform Speeds",
        description: "Prevent slow database bloat and memory leaks from degrading user UX.",
        metric: "Constant Speed",
      },
      {
        title: "Predictable Monthly Costs",
        description: "Fixed transparent maintenance retainers with no surprise hourly bills.",
        metric: "Fixed Retainer",
      },
      {
        title: "Continuous Small Upgrades",
        description: "Keep your platform modern and bug-free without large redesign expenses.",
        metric: "Continuous Care",
      },
    ],
    faqs: [
      {
        question: "What is your response time for critical emergencies?",
        answer:
          "For Critical (Severity 1) incidents affecting user transactions, our SLA guarantees an engineer actively investigating within 15 minutes 24/7/365.",
      },
    ],
    tech_stack: ["Datadog", "Sentry", "New Relic", "Grafana", "PagerDuty", "PostgreSQL"],
    order_index: 8,
    is_featured: false,
    is_active: true,
    accent_color: "rgba(255, 170, 0, 0.35)",
    created_at: "2026-01-22T10:00:00Z",
    updated_at: "2026-08-26T12:00:00Z",
  },
  {
    id: "srv-digital-marketing",
    title: "Digital Marketing & Growth",
    slug: "digital-marketing",
    category: "Growth & Search",
    tagline: "Growth-focused campaigns, SEO, content, and analytics to drive qualified leads.",
    summary:
      "Data-driven organic search optimization, page speed audits, technical SEO, conversion rate optimization (CRO), and attribution analytics that turn visitors into loyal customers.",
    hero_image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1600&q=80",
    related_images: [
      {
        url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=80",
        caption: "Conversion funnel analytics and multi-touch attribution modeling.",
        alt: "Marketing Analytics Dashboard",
      },
    ],
    what_is_it:
      "Technical Core Web Vitals SEO, conversion rate optimization (CRO), inbound funnel engineering, and data-driven marketing attribution.",
    who_is_for:
      "Businesses with high-quality products that lack steady inbound qualified leads or struggle to convert organic website traffic.",
    problem_solved:
      "Fixes poor search rankings, wasted ad budgets on unoptimized landing pages, and opaque analytics reporting.",
    why_it_matters:
      "Organic search leads have a 14.6% close rate compared to only 1.7% for outbound leads. Technical SEO creates a permanent customer acquisition flywheel.",
    features: [
      "Technical Core Web Vitals & Search Engine SEO",
      "Conversion Rate Optimization (CRO) & A/B Testing",
      "Content Strategy & High-Intent Landing Pages",
      "Attribution Modeling & Custom Event Tracking",
      "Lead Capture Automation & CRM Pipelines",
      "Local & International Multi-Region SEO",
    ],
    process_steps: [
      {
        step: "01",
        title: "Technical SEO & Speed Audit",
        description: "Crawling every URL for indexing bottlenecks, metadata gaps, and schema issues.",
      },
      {
        step: "02",
        title: "Keyword & Competitor Intelligence",
        description: "Mapping high-intent commercial keywords that prospective buyers search for.",
      },
      {
        step: "03",
        title: "On-Page & Architecture Optimization",
        description: "Fixing semantic HTML, internal linking, schema tags, and Core Web Vitals.",
      },
      {
        step: "04",
        title: "Landing Page CRO Sprints",
        description: "Designing high-converting copy and frictionless forms to maximize lead submissions.",
      },
      {
        step: "05",
        title: "Inbound Content Engine",
        description: "Publishing authoritative technical articles and product comparison guides.",
      },
      {
        step: "06",
        title: "Revenue Tracking & Iteration",
        description: "Transparent analytics connecting search clicks directly to closed business revenue.",
      },
    ],
    benefits: [
      {
        title: "Top 3 Google Rankings",
        description: "Capture high-intent searches from customers actively looking for your solutions.",
        metric: "Top 3 Rankings",
      },
      {
        title: "+40% Conversion Uplift",
        description: "A/B tested landing pages that turn more traffic into qualified business inquiries.",
        metric: "+40% Conversion",
      },
      {
        title: "Lower Customer Acquisition Cost",
        description: "Compound organic search traffic that reduces dependency on expensive Google/Meta ads.",
        metric: "-50% CAC",
      },
      {
        title: "Perfect Analytics Visibility",
        description: "Server-side GA4 and PostHog tracking that captures 100% of conversion events.",
        metric: "100% Attribution",
      },
      {
        title: "Permanent Traffic Asset",
        description: "Unlike paid ads that stop when budget dries up, SEO traffic grows continually over time.",
        metric: "Compounding ROI",
      },
      {
        title: "High-Intent Qualified Leads",
        description: "Attract decision makers looking for custom solutions rather than price-shoppers.",
        metric: "Enterprise Leads",
      },
    ],
    faqs: [
      {
        question: "How long does technical SEO take to show ranking improvements?",
        answer:
          "Technical fixes (Core Web Vitals, indexability, metadata) often produce noticeable ranking improvements within 3 to 6 weeks. Organic keyword dominance compounds over 3 to 6 months.",
      },
    ],
    tech_stack: ["Google Search Console", "Ahrefs", "GA4", "PostHog", "Schema.org", "Next.js"],
    order_index: 9,
    is_featured: false,
    is_active: true,
    accent_color: "rgba(255, 80, 0, 0.35)",
    created_at: "2026-01-24T10:00:00Z",
    updated_at: "2026-08-26T12:00:00Z",
  },
  {
    id: "srv-ites",
    title: "IT-Enabled Services (ITES)",
    slug: "api",
    category: "Digital Enablement",
    tagline: "Digitally enabled operations, data workflows, and technology-driven process efficiency.",
    summary:
      "Optimizing mission-critical repetitive back-office operations through automated data processing, API connectors, and intelligent digitized pipelines.",
    hero_image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1600&q=80",
    related_images: [
      {
        url: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=1000&q=80",
        caption: "Automated ETL processing pipeline with automated schema validation.",
        alt: "ETL Pipeline",
      },
    ],
    what_is_it:
      "Business process automation (BPA), automated data engineering (ETL), document digitizing, and system-to-system API integrations.",
    who_is_for:
      "Enterprises and organizations burdened with manual document processing, disparate software tools, and slow back-office operations.",
    problem_solved:
      "Eliminates human data-entry bottlenecks, manual file transfers, fragmented records, and delayed operational reporting.",
    why_it_matters:
      "Digitally enabled workflows reduce operational turnaround times from days to seconds while eliminating costly human errors.",
    features: [
      "Business Process Automation (BPA)",
      "Automated Data Cleansing & ETL Pipelines",
      "Intelligent Document Processing & Data Extraction",
      "Custom Enterprise Operational Dashboards",
      "System-to-System API Integration Bridges",
      "Automated Regulatory Reporting",
    ],
    process_steps: [
      {
        step: "01",
        title: "Operational Workflow Mapping",
        description: "Documenting manual bottlenecks, spreadsheets, and human handoffs.",
      },
      {
        step: "02",
        title: "Data Pipeline Blueprint",
        description: "Designing automated ingestion, transformation, validation, and loading rules.",
      },
      {
        step: "03",
        title: "API Connector Development",
        description: "Building robust bidirectional webhooks and API sync services.",
      },
      {
        step: "04",
        title: "Automated Data Validation",
        description: "Implementing automated checksums and anomaly alert thresholds.",
      },
      {
        step: "05",
        title: "Pilot Rollout",
        description: "Running parallel shadow verification to guarantee 100% data integrity.",
      },
      {
        step: "06",
        title: "Full Automation & Monitoring",
        description: "Transitioning to hands-off autonomous execution with live dashboarding.",
      },
    ],
    benefits: [
      {
        title: "Instant Turnaround",
        description: "Processes that took days now complete automatically in milliseconds.",
        metric: "< 1s Processing",
      },
      {
        title: "Zero Human Entry Errors",
        description: "Deterministic validation eliminates costly invoicing and data typos.",
        metric: "100% Accurate",
      },
      {
        title: "Unified Single Source of Truth",
        description: "Keep CRM, ERP, accounting, and operational databases in sync in real time.",
        metric: "Real-Time Sync",
      },
      {
        title: "Substantial Operational Savings",
        description: "Scale your transaction volume without hiring armies of manual data operators.",
        metric: "-65% Admin Cost",
      },
      {
        title: "Automated Audit Trails",
        description: "Comprehensive immutable logs of every transaction and data mutation.",
        metric: "Full Audit Logs",
      },
      {
        title: "Live Operational Visibility",
        description: "Real-time dashboards showing operational throughput and queue health.",
        metric: "Real-Time BI",
      },
    ],
    faqs: [
      {
        question: "Can you automate workflows between tools that don't have native integrations?",
        answer:
          "Yes! We build custom API connectors, webhooks, and headless automation scripts that seamlessly bridge any modern or legacy software.",
      },
    ],
    tech_stack: ["Python", "FastAPI", "Apache Airflow", "PostgreSQL", "Kafka", "Redis"],
    order_index: 10,
    is_featured: false,
    is_active: true,
    accent_color: "rgba(255, 190, 0, 0.35)",
    created_at: "2026-01-26T10:00:00Z",
    updated_at: "2026-08-26T12:00:00Z",
  },
  {
    id: "srv-startup-mentorship",
    title: "Startup Mentorship & Incubation",
    slug: "startup-mentorship",
    category: "Ventures & Acceleration",
    tagline: "Technical guidance, MVP validation, and scaling advisory for early-stage founders.",
    summary:
      "Lean, fast-paced technical partnership designed for founders. We build investor-ready functional prototypes, establish clean git foundations, and help you launch within weeks.",
    hero_image:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1600&q=80",
    related_images: [
      {
        url: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1000&q=80",
        caption: "Founder pitch deck technical diligence and architecture validation sprint.",
        alt: "Startup Strategy Sprint",
      },
    ],
    what_is_it:
      "Zero-to-one technical incubation, rapid MVP sprints, pitch deck technical vetting, and founder scaling mentorship.",
    who_is_for:
      "Early-stage founders, domain experts without technical co-founders, and angel-backed startups preparing for seed funding rounds.",
    problem_solved:
      "Prevents burning precious runway on agency fluff, messy offshore codebases, or over-engineered architectures before finding product-market fit.",
    why_it_matters:
      "Speed is a startup's only real unfair advantage. We help you ship an investor-ready, user-delighting product in weeks rather than months.",
    features: [
      "Day-Zero Technical Architectural Blueprint",
      "Investor-Ready Functional MVP Prototypes",
      "High-Velocity 2-4 Week Build Sprints",
      "Pitch Deck Technical Validation & Demo Prep",
      "Technical Hiring & Interviewing Advisory",
      "Post-Funding Scaling & Infrastructure Strategy",
    ],
    process_steps: [
      {
        step: "01",
        title: "Founder Vision & Scope Pruning",
        description: "Distilling the core product to its absolute highest-impact MVP feature set.",
      },
      {
        step: "02",
        title: "Lean Architecture Sprint",
        description: "Selecting fast serverless stacks that cost $0 to run during early validation.",
      },
      {
        step: "03",
        title: "Rapid 3-Week Build",
        description: "Intense engineering sprints with daily founder Slack syncs and live preview builds.",
      },
      {
        step: "04",
        title: "Early User Onboarding",
        description: "Setting up analytics and user recording tools to monitor real user behavior.",
      },
      {
        step: "05",
        title: "Investor Demo Prep",
        description: "Polishing clickthroughs and zero-friction demos ready for VC pitches.",
      },
      {
        step: "06",
        title: "Scale & Transition",
        description: "Helping you hire full-time engineers and seamlessly handing over the clean codebase.",
      },
    ],
    benefits: [
      {
        title: "Launch in 2-4 Weeks",
        description: "From concept to live production URL with working auth, payments, and core logic.",
        metric: "< 4 Weeks to Live",
      },
      {
        title: "Investor-Grade Polish",
        description: "Stunning dark-cyber aesthetics and smooth animations that captivate angel investors.",
        metric: "VC Ready",
      },
      {
        title: "$0 Initial Hosting Costs",
        description: "Cloud architectures built on generous serverless tiers to preserve founder cash.",
        metric: "$0 Idle Cost",
      },
      {
        title: "Clean Transferable Code",
        description: "Strict TypeScript and documentation making it easy for future in-house hires.",
        metric: "100% Documented",
      },
      {
        title: "Founder-Friendly Communication",
        description: "Direct engineering collaboration on Slack/WhatsApp without bureaucratic account managers.",
        metric: "Direct Slack Access",
      },
      {
        title: "Post-Seed Scale Readiness",
        description: "Systems designed to handle sudden viral user spikes without rewriting code.",
        metric: "1M User Scale",
      },
    ],
    faqs: [
      {
        question: "Do you take equity in exchange for development?",
        answer:
          "We offer flexible hybrid arrangements (discounted cash fee + minority equity) for select high-conviction founders with proven domain expertise.",
      },
    ],
    tech_stack: ["Next.js", "MongoDB Atlas", "TanStack", "Stripe", "PostgreSQL", "Vercel", "Tailwind"],
    order_index: 11,
    is_featured: false,
    is_active: true,
    accent_color: "rgba(255, 50, 0, 0.35)",
    created_at: "2026-01-28T10:00:00Z",
    updated_at: "2026-08-26T12:00:00Z",
  },
];

const SEED_INDUSTRIES: IndustrySector[] = [
  {
    id: "ind-education",
    name: "Education",
    slug: "education",
    tagline: "Learning platforms, LMS, and digital classrooms for modern institutions.",
    description:
      "We engineer scalable interactive learning environments, student performance analytics, digital assignment portals, and secure examination systems tailored for schools, universities, and EdTech startups.",
    badge: "EdTech & Learning",
    image_url:
      "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80",
    solutions: [
      "Custom LMS & Course Portals",
      "Interactive Virtual Classrooms",
      "Automated Grading & Assessments",
      "Student Engagement Analytics",
    ],
    accent_glow: "rgba(255, 122, 0, 0.3)",
    order_index: 1,
  },
  {
    id: "ind-healthcare",
    name: "Healthcare",
    slug: "healthcare",
    tagline: "Secure, compliant systems for patient care, records, and telemedicine.",
    description:
      "Building high-compliance digital health platforms, HIPAA-ready patient record repositories, encrypted telemedicine video consoles, and AI-assisted triage workflows for clinics and hospitals.",
    badge: "HealthTech & Telemedicine",
    image_url:
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80",
    solutions: [
      "HIPAA/GDPR Compliant Portals",
      "Encrypted Telemedicine Video",
      "Electronic Health Records (EHR)",
      "Patient Appointment & Queue Systems",
    ],
    accent_glow: "rgba(255, 70, 0, 0.3)",
    order_index: 2,
  },
  {
    id: "ind-retail",
    name: "Retail",
    slug: "retail",
    tagline: "Point-of-sale, inventory, and omnichannel experiences for retailers.",
    description:
      "Unifying physical brick-and-mortar operations with real-time digital sync: smart POS terminals, live multi-warehouse inventory updates, automated supplier replenishment, and customer loyalty engines.",
    badge: "Retail & Omnichannel",
    image_url:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80",
    solutions: [
      "Cloud-Native POS Systems",
      "Real-Time Multi-Store Inventory",
      "Barcode & Scanner Integrations",
      "Loyalty & In-Store Kiosk Terminals",
    ],
    accent_glow: "rgba(255, 180, 0, 0.3)",
    order_index: 3,
  },
  {
    id: "ind-ecommerce",
    name: "E-Commerce",
    slug: "ecommerce",
    tagline: "Conversion-focused storefronts, marketplaces, and checkout systems.",
    description:
      "Architecting headless e-commerce platforms with sub-second checkout speeds, AI product recommendation engines, multi-currency payment routing, and automated shipping integrations.",
    badge: "Digital Commerce",
    image_url:
      "https://images.unsplash.com/photo-1556742049-0a67e5572293?auto=format&fit=crop&w=800&q=80",
    solutions: [
      "Sub-Second Headless Checkouts",
      "Multi-Vendor Marketplace Platforms",
      "AI Recommendation & Upsell Algorithms",
      "Global Multi-Gateway Payment Routing",
    ],
    accent_glow: "rgba(255, 140, 0, 0.3)",
    order_index: 4,
  },
  {
    id: "ind-startups",
    name: "Startups",
    slug: "startups",
    tagline: "MVPs, rapid prototyping, and scalable foundations for founders.",
    description:
      "Empowering early-stage founders to validate product-market fit rapidly with clean, scalable codebases. We deliver high-velocity MVPs built to scale smoothly from user #1 to user #1,000,000.",
    badge: "Founders & Early Stage",
    image_url:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80",
    solutions: [
      "2-4 Week Rapid MVP Sprints",
      "Investor-Ready Functional Demos",
      "Serverless Auto-Scaling Infrastructure",
      "Founder-Friendly Agile Collaboration",
    ],
    accent_glow: "rgba(255, 60, 0, 0.3)",
    order_index: 5,
  },
  {
    id: "ind-saas",
    name: "SaaS",
    slug: "saas",
    tagline: "Multi-tenant products, billing, and analytics-driven platforms.",
    description:
      "Engineered for high gross margins and enterprise compliance: complete multi-tenant tenant isolation, automated subscription billing, usage-based metering, and self-serve onboarding funnels.",
    badge: "B2B & B2C SaaS",
    image_url:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
    solutions: [
      "Multi-Tenant Tenant Isolation",
      "Automated Stripe / Paddle Billing",
      "Usage-Based API Metering",
      "Embedded Analytics & Webhooks",
    ],
    accent_glow: "rgba(255, 200, 50, 0.3)",
    order_index: 6,
  },
  {
    id: "ind-enterprise",
    name: "Enterprise",
    slug: "enterprise",
    tagline: "Large-scale systems, integrations, and digital transformation.",
    description:
      "Modernizing legacy monoliths into distributed microservice architectures with zero operational disruption, enterprise single sign-on (SSO), and bank-grade data security.",
    badge: "Enterprise & Scale",
    image_url:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
    solutions: [
      "Legacy System Modernization",
      "Custom ERP & Enterprise Portals",
      "Zero-Trust IAM & SSO Integrations",
      "High-Throughput Event Streaming",
    ],
    accent_glow: "rgba(255, 110, 0, 0.3)",
    order_index: 7,
  },
  {
    id: "ind-finance",
    name: "Finance",
    slug: "finance",
    tagline: "Fintech apps, dashboards, and secure transaction infrastructure.",
    description:
      "Bank-grade security and sub-millisecond transaction execution: algorithmic fraud detection, automated reconciliation pipelines, ledger encryption, and regulatory audit compliance.",
    badge: "Fintech & Banking",
    image_url:
      "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80",
    solutions: [
      "Encrypted Transaction Processing",
      "Real-Time Fraud Detection Models",
      "Automated Reconciliation Engines",
      "Financial Reporting & Audit Trails",
    ],
    accent_glow: "rgba(255, 160, 0, 0.3)",
    order_index: 8,
  },
];

class MemoryServicesStore {
  private _services: CompanyService[] = [...SEED_SERVICES];
  private _industries: IndustrySector[] = [...SEED_INDUSTRIES];

  get services(): CompanyService[] {
    return [...this._services].sort((a, b) => a.order_index - b.order_index);
  }

  get industries(): IndustrySector[] {
    return [...this._industries].sort((a, b) => a.order_index - b.order_index);
  }

  getPublicPayload(): PublicServicesPayload {
    const activeServices = this._services
      .filter((s) => s.is_active)
      .sort((a, b) => a.order_index - b.order_index);

    const sortedIndustries = [...this._industries].sort((a, b) => a.order_index - b.order_index);

    return {
      services: activeServices,
      industries: sortedIndustries,
      stats: {
        totalServices: activeServices.length,
        totalIndustries: sortedIndustries.length,
        uptimeSla: "99.99%",
        satisfactionScore: "4.9/5",
      },
    };
  }

  getServiceBySlug(slug: string): CompanyService | null {
    const found = this._services.find(
      (s) => s.slug.toLowerCase() === slug.toLowerCase() && s.is_active,
    );
    return found ? { ...found } : null;
  }

  saveService(input: ServiceInput): CompanyService {
    const now = new Date().toISOString();
    const slug = input.slug ? slugifyService(input.slug) : slugifyService(input.title);

    if (input.id) {
      const idx = this._services.findIndex((s) => s.id === input.id);
      if (idx !== -1) {
        const existing = this._services[idx];
        const updated: CompanyService = {
          ...existing,
          title: input.title,
          slug,
          category: input.category || existing.category,
          summary: input.summary,
          tagline: input.tagline || existing.tagline,
          hero_image: input.hero_image,
          related_images: input.related_images || existing.related_images,
          what_is_it: input.what_is_it,
          who_is_for: input.who_is_for,
          problem_solved: input.problem_solved,
          why_it_matters: input.why_it_matters,
          features: input.features || existing.features,
          process_steps: input.process_steps || existing.process_steps,
          benefits: input.benefits || existing.benefits,
          faqs: input.faqs || existing.faqs,
          tech_stack: input.tech_stack || existing.tech_stack,
          order_index:
            typeof input.order_index === "number" ? input.order_index : existing.order_index,
          is_featured:
            typeof input.is_featured === "boolean" ? input.is_featured : existing.is_featured,
          is_active: typeof input.is_active === "boolean" ? input.is_active : existing.is_active,
          accent_color: input.accent_color ?? existing.accent_color,
          updated_at: now,
        };
        this._services[idx] = updated;
        return updated;
      }
    }

    // Create New
    const newService: CompanyService = {
      id: `srv-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: input.title,
      slug,
      category: input.category || "Custom Engineering",
      summary: input.summary,
      tagline: input.tagline || input.summary.slice(0, 80),
      hero_image: input.hero_image,
      related_images: input.related_images || [],
      what_is_it: input.what_is_it,
      who_is_for: input.who_is_for,
      problem_solved: input.problem_solved,
      why_it_matters: input.why_it_matters,
      features: input.features || [],
      process_steps: input.process_steps || [],
      benefits: input.benefits || [],
      faqs: input.faqs || [],
      tech_stack: input.tech_stack || [],
      order_index:
        typeof input.order_index === "number" ? input.order_index : this._services.length + 1,
      is_featured: Boolean(input.is_featured),
      is_active: input.is_active !== false,
      accent_color: input.accent_color ?? "rgba(255, 122, 0, 0.35)",
      created_at: now,
      updated_at: now,
    };

    this._services.push(newService);
    try {
      import("@/server/repositories/content.repository").then(({ contentRepository }) => {
        contentRepository.saveService(newService).catch(() => {});
      });
    } catch {}
    return newService;
  }

  deleteService(id: string): boolean {
    const initLen = this._services.length;
    this._services = this._services.filter((s) => s.id !== id);
    try {
      import("@/server/repositories/content.repository").then(({ contentRepository }) => {
        contentRepository.deleteService(id).catch(() => {});
      });
    } catch {}
    return this._services.length < initLen;
  }

  saveIndustry(input: IndustryInput): IndustrySector {
    const slug = input.slug ? slugifyService(input.slug) : slugifyService(input.name);

    if (input.id) {
      const idx = this._industries.findIndex((i) => i.id === input.id);
      if (idx !== -1) {
        const existing = this._industries[idx];
        const updated: IndustrySector = {
          ...existing,
          name: input.name,
          slug,
          tagline: input.tagline,
          description: input.description,
          badge: input.badge,
          image_url: input.image_url,
          solutions: input.solutions || existing.solutions,
          accent_glow: input.accent_glow ?? existing.accent_glow,
          order_index:
            typeof input.order_index === "number" ? input.order_index : existing.order_index,
        };
        this._industries[idx] = updated;
        return updated;
      }
    }

    const newIndustry: IndustrySector = {
      id: `ind-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: input.name,
      slug,
      tagline: input.tagline,
      description: input.description,
      badge: input.badge,
      image_url: input.image_url,
      solutions: input.solutions || [],
      accent_glow: input.accent_glow ?? "rgba(255, 122, 0, 0.3)",
      order_index:
        typeof input.order_index === "number" ? input.order_index : this._industries.length + 1,
    };

    this._industries.push(newIndustry);
    return newIndustry;
  }

  deleteIndustry(id: string): boolean {
    const initLen = this._industries.length;
    this._industries = this._industries.filter((i) => i.id !== id);
    return this._industries.length < initLen;
  }
}

export const servicesStore = new MemoryServicesStore();
