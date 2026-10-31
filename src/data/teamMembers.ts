import shikharPhoto from "@/assets/shikhar-dixit.jpg.asset.json";
import swatantraPhoto from "@/assets/swatantra-singh.jpg.asset.json";
import nishkarshPhoto from "@/assets/nishkarsh-mishra.jpg.asset.json";
import sheeluPhoto from "@/assets/sheelu-singh.jpg.asset.json";
import mridulPhoto from "@/assets/mridul-mishra.jpg.asset.json";
import amritPhoto from "@/assets/amrit.jpg.asset.json";
import harshPhoto from "@/assets/harsh-mishra.jpg.asset.json";

export type TeamTier =
  | "Founders & Executive Directors"
  | "Core Engineering & Leads"
  | "Innovation Cohort & Interns"
  | "Alumni & Former Members";

export interface ProjectContribution {
  title: string;
  role: string;
  description: string;
  tags: string[];
}

export interface TeamMemberData {
  id: string;
  slug: string;
  name: string;
  role: string;
  officialDesignation: string;
  tier: TeamTier;
  department: string;
  summary: string;
  bio: string;
  fullStory: string[];
  education: string;
  location: string;
  initials: string;
  photo?: string;
  photoPosition?: string;
  responsibilities: string[];
  keyProjects: ProjectContribution[];
  techStack: string[];
  dimisipediaUrl: string;
  email?: string;
  linkedin?: string;
  github?: string;
  status: string;
  isExEmployee?: boolean;
}

export const TEAM_MEMBERS: TeamMemberData[] = [
  // -------------------------------------------------------------------------
  // 1. FOUNDERS & EXECUTIVE DIRECTORS
  // -------------------------------------------------------------------------
  {
    id: "shikhar-dixit",
    slug: "shikhar-dixit",
    name: "Shikhar Dixit",
    role: "Founder • Director • CEO",
    officialDesignation: "Chief Executive Officer & Whole-Time Director",
    tier: "Founders & Executive Directors",
    department: "Executive Leadership & Product Architecture",
    summary:
      "Founder and Chief Executive Officer of DIMISI Technologies Private Limited. Steers long-term corporate vision, high-concurrency software architectures, and consumer platform engineering.",
    bio:
      "Shikhar Dixit is an Indian technology entrepreneur and software architect who founded DIMISI Technologies Private Limited (incorporated under MCA, CIN: U62013UP2026PTC246506). His early technological momentum originated during an intensive development sprint building a computer vision face recognition system for an Axis College academic showcase ('Gandhigiri'), which evolved into Cosmic Aura Tech Industry (CATI) and subsequently catalyzed the incorporation and expansion of DIMISI Technologies.",
    fullStory: [
      "As Founder and CEO, Shikhar leads DIMISI Technologies with an uncompromising focus on scalable software architectures, autonomous intelligent systems, and disruptive consumer platforms.",
      "His technical leadership was the driving force behind the 'Sand Tank' engineering workspace at Axis College, gathering a close-knit group of core engineers (historically recognized in company lore as the 'Sinister Six') to build enterprise-grade software products and distributed cloud systems.",
      "Under his stewardship, DIMISI Technologies achieved statutory incorporation in April 2026, became an official member of the global NVIDIA Inception Program, earned DPIIT recognition under Startup India, and engineered proprietary platforms including Kalesh, DIMISI-OPS, and Dimisipedia.",
    ],
    education:
      "Bachelor of Technology (B.Tech) in Computer Science & Engineering — Axis Colleges, Kanpur (Affiliated with Dr. A.P.J. Abdul Kalam Technical University - AKTU)",
    location: "DIMISI Headquarters, Kanpur, Uttar Pradesh, India",
    initials: "SD",
    photo: shikharPhoto.url,
    photoPosition: "center 18%",
    responsibilities: [
      "Corporate Strategy & Global Product Roadmaps",
      "Executive Technical Architecture & Distributed Systems Oversight",
      "Statutory & MCA Compliance Governance",
      "Venture Alliances & NVIDIA Inception Ecosystem Interface",
      "Directing Kalesh Core Platform Architecture",
      "Hiring & Cultural Standards for High-Velocity Engineering",
    ],
    keyProjects: [
      {
        title: "Kalesh Platform",
        role: "Primary Product Architect & Strategic Lead",
        description:
          "Architected the product philosophy and high-load backend strategy for Kalesh, an anonymous social polling platform engineered to deliver fearless, unfiltered public engagement without privacy compromises.",
        tags: ["Distributed Systems", "Cloud Architecture", "Privacy Engineering", "Social Polling"],
      },
      {
        title: "DIMISI-OPS",
        role: "System Designer",
        description:
          "Architected internal operations engine managing client milestones, developer workflows, real-time telemetry, and operational intelligence.",
        tags: ["Internal Infrastructure", "Workflow Automation", "Microservices"],
      },
      {
        title: "CATI Khelghar",
        role: "Core Developer",
        description:
          "Engineered a lightweight, offline-first digital playground designed for collective multiplayer mini-games and social campus interaction.",
        tags: ["Offline-First", "WebSockets", "Interactive Gaming"],
      },
      {
        title: "Dimisipedia",
        role: "Initiator & Chief Editor",
        description:
          "Spearheaded DIMISIPEDIA (dimisipedia.me), the public corporate encyclopedia providing verifiable, evidence-backed transparency of DIMISI's technology and journey.",
        tags: ["Knowledge Graph", "Auditability", "Public Registry"],
      },
    ],
    techStack: [
      "Software Architecture",
      "Python",
      "TypeScript",
      "Node.js",
      "Distributed Cloud",
      "Computer Vision",
      "System Design",
      "PostgreSQL",
    ],
    dimisipediaUrl: "https://www.dimisipedia.me",
    email: "ceo@dimisi.tech",
    linkedin: "https://www.linkedin.com/company/dimisi-technologies-pvt-ltd/",
    status: "Verified Record on Dimisipedia",
  },
  {
    id: "swatantra-singh",
    slug: "swatantra-singh",
    name: "Swatantra Singh",
    role: "Co-Founder • Director • CTO",
    officialDesignation: "Chief Technology Officer & Director",
    tier: "Founders & Executive Directors",
    department: "Engineering Systems & Technical Infrastructure",
    summary:
      "Co-Founder and Chief Technology Officer of DIMISI Technologies Private Limited. Directs systems engineering, low-latency API architectures, cloud infrastructure, and technical scalability.",
    bio:
      "Swatantra Singh is a technology executive and software engineer who co-founded DIMISI Technologies and serves as its Chief Technology Officer and Director. His engineering synergy with Shikhar Dixit dates back to early collegiate technical innovations at Axis College. At DIMISI, he commands the end-to-end engineering discipline, ensuring high throughput, real-time responsiveness, and modular maintainability across all product verticals.",
    fullStory: [
      "Swatantra leads the technical vision across DIMISI's core systems, enforcing robust software engineering standards and modern cloud architectures.",
      "As CTO, he oversees backend microservices, real-time WebSocket communication pipelines, container orchestration, and seamless data synchronization between client platforms and core servers.",
      "He actively architects the technical backbone for Kalesh, ensuring high concurrency handling during viral polling events and peak user traffic spikes.",
    ],
    education:
      "Bachelor of Technology (B.Tech) in Computer Science & Engineering — Axis Colleges, Kanpur",
    location: "DIMISI Headquarters, Kanpur, Uttar Pradesh, India",
    initials: "SS",
    photo: swatantraPhoto.url,
    photoPosition: "center 20%",
    responsibilities: [
      "End-to-End Technical Architecture & Scalability",
      "Cloud Infrastructure Orchestration & Reliability",
      "API Performance & Realtime WebSocket Topologies",
      "Security Audits & Database Performance Tuning",
      "Technical Mentorship of Core Engineering Leads",
      "Engineering Delivery Timelines & Code Reviews",
    ],
    keyProjects: [
      {
        title: "Kalesh Realtime Engine",
        role: "Systems Architect & CTO",
        description:
          "Engineered low-latency polling infrastructure capable of processing continuous live vote ingestions with sub-second feedback loops.",
        tags: ["WebSockets", "Node.js", "Redis", "High Throughput"],
      },
      {
        title: "Client Enterprise Software Architecture",
        role: "Lead Architect",
        description:
          "Designed multi-tenant architectures and robust APIs powering enterprise B2B engagements across diverse digital domains.",
        tags: ["Microservices", "REST", "Cloud Deployment", "PostgreSQL"],
      },
      {
        title: "Security & Cloud Hardening",
        role: "Infrastructure Lead",
        description:
          "Implemented zero-trust security postures, JWT authentication protocols, and encrypted data tunnels protecting consumer privacy.",
        tags: ["Cybersecurity", "Data Privacy", "Docker", "Linux"],
      },
    ],
    techStack: [
      "Systems Engineering",
      "TypeScript",
      "Node.js",
      "PostgreSQL",
      "Redis",
      "Docker",
      "Linux",
      "WebSockets",
      "AWS / GCP",
    ],
    dimisipediaUrl: "https://www.dimisipedia.me",
    email: "cto@dimisi.tech",
    linkedin: "https://www.linkedin.com/company/dimisi-technologies-pvt-ltd/",
    status: "Verified Record on Dimisipedia",
  },
  {
    id: "nishkarsh-mishra",
    slug: "nishkarsh-mishra",
    name: "Nishkarsh Mishra",
    role: "Co-Founder • Director • COO & CMO",
    officialDesignation: "Chief Operating Officer, Chief Marketing Officer & Director",
    tier: "Founders & Executive Directors",
    department: "Operations, Corporate Finance & Growth Marketing",
    summary:
      "Co-Founder, Director, Chief Operating Officer and Chief Marketing Officer of DIMISI Technologies Private Limited. Bridges corporate operations, financial governance, and data-driven marketing campaigns.",
    bio:
      "Nishkarsh Mishra (born March 15, 2000) is an Indian technology entrepreneur, operations strategist, and marketing executive. He completed his Diploma in Computer Science & Engineering with first-division honors from Kanpur Institute of Technology (2019–2022) before advancing his B.Tech in CSE at Axis Colleges. At DIMISI, he unites technical comprehension with sharp fiscal discipline, corporate compliance, and viral digital acquisition strategies.",
    fullStory: [
      "Nishkarsh manages DIMISI's core business execution, cross-functional team coordination, client accounts, operational budgets, and growth marketing apparatus.",
      "He orchestrated the nationwide LinkedIn 30-Day Kalesh Promotion & Content Creator Challenge, driving widespread collegiate brand recognition and engagement.",
      "His governance ensures strict statutory alignment with Indian corporate standards, transparent financial allocations, and sustainable organizational growth.",
    ],
    education:
      "Diploma in Computer Science & Engineering (First Division with Honors) — Kanpur Institute of Technology (2019–2022) | B.Tech in CSE — Axis Colleges, Kanpur",
    location: "DIMISI Headquarters, Kanpur, Uttar Pradesh, India",
    initials: "NM",
    photo: nishkarshPhoto.url,
    photoPosition: "center 18%",
    responsibilities: [
      "Company Operations & Agile Sprint Coordination",
      "Financial Budgeting, Expense Allocation & Audit Preparation",
      "Performance Digital Marketing & Campaign Strategy",
      "MCA Regulatory & Corporate Governance Administration",
      "Campus Alliances & Talent Acquisition Operations",
      "Product Go-To-Market Operations for Kalesh",
    ],
    keyProjects: [
      {
        title: "Kalesh 30-Day Growth Campaign",
        role: "Campaign Director",
        description:
          "Orchestrated a highly successful nationwide creator campaign that generated thousands of campus engagements and creator registrations.",
        tags: ["Growth Marketing", "Campus Outreach", "Creator Programs"],
      },
      {
        title: "Corporate Operations & Compliance",
        role: "COO",
        description:
          "Established standardized operational protocols, team sprint workflows, and strict legal-financial filing structures under MCA regulations.",
        tags: ["Operations", "Statutory Compliance", "Fiscal Governance"],
      },
    ],
    techStack: [
      "Operations Strategy",
      "Financial Modeling",
      "Digital Marketing",
      "Campaign Analytics",
      "Project Management",
      "Corporate Law & MCA",
    ],
    dimisipediaUrl: "https://www.dimisipedia.me",
    email: "support@dimisi.tech",
    linkedin: "https://www.linkedin.com/company/dimisi-technologies-pvt-ltd/",
    status: "Verified Record on Dimisipedia",
  },

  // -------------------------------------------------------------------------
  // 2. CORE ENGINEERING & TECHNICAL LEADS
  // -------------------------------------------------------------------------
  {
    id: "sheelu-singh",
    slug: "sheelu-singh",
    name: "Sheelu Singh",
    role: "Android & Flutter Lead",
    officialDesignation: "Lead Mobile Application Engineer (Founding Core Member)",
    tier: "Core Engineering & Leads",
    department: "Mobile Engineering",
    summary:
      "Founding mobile application engineer and Android Lead. Heads cross-platform Flutter development, reactive state pipelines, and high-performance mobile UI delivery for Kalesh.",
    bio:
      "Sheelu Singh is a mobile application engineer who serves as the Android and Flutter Lead at DIMISI Technologies. As a pivotal member of the foundational 'Sinister Six' cohort, he spearheaded the native client architecture of Kalesh, implementing modular state architectures, custom widgets, real-time polling synchronizers, and robust payment and security layers.",
    fullStory: [
      "Sheelu holds a solid background in Computer Science Engineering from Dr. A.P.J. Abdul Kalam Technical University (AKTU).",
      "He drives the architecture of DIMISI's mobile apps using Flutter and Dart, ensuring 60fps rendering, offline caching, and frictionless user experiences.",
      "He acts as a technical mentor for the mobile internship cohort, guiding junior developers on production-grade Dart patterns and Google Play deployment best practices.",
    ],
    education: "B.Tech in Computer Science & Engineering — AKTU",
    location: "DIMISI Headquarters, Kanpur, Uttar Pradesh, India",
    initials: "SH",
    photo: sheeluPhoto.url,
    photoPosition: "center 20%",
    responsibilities: [
      "Kalesh Android & Flutter Architecture",
      "Reactive State Management (Provider / BLoC)",
      "Native Android SDK Interop & Plugins",
      "Mobile Security & Local Data Encryption",
      "App Store / Play Store Release Pipeline",
      "Mobile Intern Mentorship & Code Reviews",
    ],
    keyProjects: [
      {
        title: "Kalesh Android Application",
        role: "Lead Mobile Engineer",
        description:
          "Architected the complete mobile client for Kalesh with high-speed polling cards, real-time vote recalculation, and smooth transition animations.",
        tags: ["Flutter", "Dart", "Firebase", "Android SDK"],
      },
    ],
    techStack: ["Flutter", "Dart", "Android SDK", "Kotlin", "Firebase", "REST APIs", "State Management"],
    dimisipediaUrl: "https://www.dimisipedia.me",
    status: "Verified Record on Dimisipedia",
  },
  {
    id: "mridul-mishra",
    slug: "mridul-mishra",
    name: "Mridul Mishra",
    role: "Founding Engineer • Linux & Backend Lead",
    officialDesignation: "Lead Backend & Infrastructure Engineer (Founding Core Member)",
    tier: "Core Engineering & Leads",
    department: "Platform & Cloud Infrastructure",
    summary:
      "Founding engineer specializing in low-latency backend architectures, Linux server hardening, WebSocket-based real-time communication, and async job queues.",
    bio:
      "Mridul Mishra is a software and backend engineer documented on Dimisipedia as a founding engineer for Kalesh and DIMISI-OPS. A core pillar of the 'Sinister Six' team, Mridul architects mission-critical background queues, Redis caches, high-throughput MongoDB indexes, and reliable server-side microservices.",
    fullStory: [
      "Mridul graduated with a degree in Computer Science & Engineering from Axis Colleges, Kanpur.",
      "His technical expertise spans high-concurrency Node.js microservices, asynchronous task scheduling with BullMQ and Redis, and robust Linux environment administration.",
      "He plays an essential role in maintaining 99.98% platform uptime and implementing automated CI/CD deployment routines for DIMISI's platforms.",
    ],
    education: "B.Tech in Computer Science & Engineering — Axis Colleges, Kanpur",
    location: "DIMISI Headquarters, Kanpur, Uttar Pradesh, India",
    initials: "MM",
    photo: mridulPhoto.url,
    photoPosition: "center 20%",
    responsibilities: [
      "Low-Latency REST & WebSocket API Development",
      "Asynchronous Background Job Queues (BullMQ / Redis)",
      "Database Optimization & MongoDB Aggregations",
      "Linux Server Administration & CI/CD Pipelines",
      "Realtime Concurrency Testing & Load Optimization",
    ],
    keyProjects: [
      {
        title: "Kalesh Real-Time Messaging & Polling Bus",
        role: "Backend Architect",
        description:
          "Designed WebSocket-based pub/sub clusters and Redis caching layers enabling sub-second result broadasting to thousands of active sessions.",
        tags: ["Node.js", "Redis", "BullMQ", "WebSockets"],
      },
      {
        title: "DIMISI-OPS Backend",
        role: "Core Developer",
        description:
          "Engineered the telemetry pipelines, server monitoring routines, and internal data structures supporting company operations.",
        tags: ["Linux", "MongoDB", "Express", "Docker"],
      },
    ],
    techStack: ["Linux", "Node.js", "Express", "MongoDB", "Redis", "BullMQ", "WebSockets", "Docker"],
    dimisipediaUrl: "https://www.dimisipedia.me",
    status: "Verified Record on Dimisipedia",
  },
  {
    id: "siddhant-shekhar",
    slug: "siddhant-shekhar",
    name: "Siddhant Shekhar",
    role: "Web & Platform Developer",
    officialDesignation: "Frontend & Web Systems Engineer (Founding Core Member)",
    tier: "Core Engineering & Leads",
    department: "Web Engineering",
    summary:
      "Founding core engineer and web developer. Instrumental in early Kalesh web deployment and lead developer of KaryON, a doorstep home-services platform.",
    bio:
      "Siddhant Shekhar joined the early technical ranks of DIMISI Technologies and CATI during the foundational 'Sand Tank' engineering workspace sprint as one of the original 'Sinister Six' cohort. He specializes in modern React architectures, component-driven design systems, and rapid web prototyping.",
    fullStory: [
      "Siddhant contributed significantly to the deployment of DIMISI's official web platforms and early web builds of the Kalesh polling interface.",
      "He independently led the development of 'KaryON' — a dedicated platform engineered to streamline professional doorstep home-services.",
      "His technical work centers on clean UI architecture, responsive cross-device layouts, and performant state synchronization.",
    ],
    education: "B.Tech in Computer Science & Engineering — Axis Colleges",
    location: "DIMISI Headquarters, Kanpur, Uttar Pradesh, India",
    initials: "SSh",
    responsibilities: [
      "Frontend Web Engineering with React & TypeScript",
      "Design System & Reusable Component Library Creation",
      "KaryON Platform Architecture & Delivery",
      "Web Performance Audits & Responsive Optimization",
    ],
    keyProjects: [
      {
        title: "KaryON Platform",
        role: "Lead Platform Developer",
        description:
          "Engineered the full frontend workflow for a professional doorstep service platform with booking, dispatch, and review flows.",
        tags: ["React", "TypeScript", "Tailwind CSS", "UI/UX"],
      },
      {
        title: "DIMISI Web Platforms",
        role: "Frontend Engineer",
        description:
          "Assisted in deploying the initial web presence, portfolio showcases, and administrative dashboards for corporate clients.",
        tags: ["Web Architecture", "Responsive Design", "JavaScript"],
      },
    ],
    techStack: ["React", "TypeScript", "JavaScript", "HTML5", "CSS3", "Tailwind CSS", "REST APIs"],
    dimisipediaUrl: "https://www.dimisipedia.me",
    status: "Verified Record on Dimisipedia",
  },
  {
    id: "krishna-tiwari",
    slug: "krishna-tiwari",
    name: "Krishna Tiwari",
    role: "Social Media & Video Production Head",
    officialDesignation: "Head of Digital Media & Visual Production",
    tier: "Core Engineering & Leads",
    department: "Digital Marketing & Creative Production",
    summary:
      "Leads video direction, visual cinematography, editing, and comprehensive social media campaign growth across DIMISI's corporate and product channels.",
    bio:
      "Krishna Tiwari commands the creative media and digital content operations at DIMISI Technologies. He directs end-to-end video shoots, motion editing, and viral short-form storytelling across official brands including @dimisi.tech, @thekaleshofficial, and @thestartupdiarsi_official.",
    fullStory: [
      "Krishna combines cinematography skills with digital marketing algorithms to craft high-retention video stories for product launches.",
      "He played a decisive role in visual coverage for corporate ceremonies, campus outreach programs, and the LinkedIn 30-Day Kalesh Promotion Challenge.",
      "He manages creative brand voice, audience retention metrics, and cross-channel visual assets.",
    ],
    education: "Digital Media, Visual Communication & Cinematography",
    location: "DIMISI Headquarters, Kanpur, Uttar Pradesh, India",
    initials: "KT",
    responsibilities: [
      "Cinematic Video Production & Post-Production",
      "Social Media Growth Strategy across All Brand Channels",
      "Creative Storyboarding for Kalesh & Product Launches",
      "Audio-Visual Editing & Motion Graphic Integration",
    ],
    keyProjects: [
      {
        title: "Kalesh Visual Launch Series",
        role: "Creative Director",
        description:
          "Produced high-impact teaser reels and explainer videos that introduced Kalesh to collegiate audiences across Uttar Pradesh and beyond.",
        tags: ["Video Production", "Premiere Pro", "Social Campaigns"],
      },
      {
        title: "The Startup Diarsi Channel",
        role: "Lead Producer",
        description:
          "Conceptualized and produced storytelling segments documenting student entrepreneurship and tech innovation.",
        tags: ["Digital Media", "Documentary", "Creator Network"],
      },
    ],
    techStack: ["Premiere Pro", "After Effects", "Cinematography", "Social Algorithms", "Content Strategy"],
    dimisipediaUrl: "https://www.dimisipedia.me",
    status: "Verified Record on Dimisipedia",
  },
  {
    id: "somya-tiwari",
    slug: "somya-tiwari",
    name: "Somya Tiwari",
    role: "Full Stack Developer & Client Project Manager",
    officialDesignation: "Full Stack Developer & Commercial Project Manager",
    tier: "Core Engineering & Leads",
    department: "Client Solutions & Web Engineering",
    summary:
      "Full stack developer and client project manager. Leads end-to-end commercial software delivery (notably Rudra Tours & Travels) and secured 3rd position in DIMISI's nationwide 30-Day LinkedIn Challenge.",
    bio:
      "Somya Tiwari is documented on Dimisipedia as a Full Stack Developer and Client Project Manager at DIMISI Technologies Private Limited. She directs end-to-end commercial web software delivery, technical client relationships, and full-stack development. She notably spearheaded the digital transformation and web booking platform for Rudra Tours & Travels, and secured 3rd position in DIMISI's nationwide 30-Day LinkedIn Content Creator Challenge.",
    fullStory: [
      "Somya bridges high-quality software engineering with commercial project execution, leading technical discovery, architecture design, and deployment for corporate clients.",
      "Her flagship commercial delivery was the comprehensive digital transformation and responsive booking portal for Rudra Tours & Travels, which modernized their customer acquisition and booking flows.",
      "She was awarded 3rd position in the 30-Day LinkedIn Content Creator Challenge for her articulate technical writing, product advocacy, and collegiate developer community building.",
      "She collaborates closely with the core engineering team on feature testing and web module rollouts for internal products including The Kalesh.",
    ],
    education: "Computer Science & Engineering Studies",
    location: "DIMISI Headquarters, Kanpur, Uttar Pradesh, India",
    initials: "ST",
    responsibilities: [
      "Client Project Architecture & Commercial Milestone Management",
      "Full-Stack Web Development & API Integration",
      "Leading Commercial Client Deliverables (e.g. Rudra Tours & Travels)",
      "Cross-Browser Optimization & UI/UX Refinement",
      "Developer Advocacy & Tech Content Creation",
    ],
    keyProjects: [
      {
        title: "Rudra Tours & Travels Platform",
        role: "Lead Project Manager & Developer",
        description:
          "Led the complete digital transformation, corporate identity, responsive web portal, and travel booking flows for Rudra Tours & Travels.",
        tags: ["Full Stack", "React", "Node.js", "Client Delivery"],
      },
      {
        title: "The Kalesh Internal Initiatives",
        role: "Developer Contributor",
        description:
          "Participated in internal development sprints, platform feature testing, and user feedback integration for DIMISI's anonymous polling ecosystem.",
        tags: ["The Kalesh", "Platform Engineering", "Testing"],
      },
      {
        title: "30-Day LinkedIn Creator Challenge",
        role: "3rd Position Winner",
        description:
          "Ranked 3rd in the nationwide 30-Day LinkedIn creator challenge organized by DIMISI Technologies, advocating startup culture and software engineering.",
        tags: ["Creator Campaign", "Technical Writing", "Growth"],
      },
    ],
    techStack: ["React", "Node.js", "JavaScript", "TypeScript", "Tailwind CSS", "REST APIs", "Project Management", "Git"],
    dimisipediaUrl: "https://www.dimisipedia.me/people/somya-tiwari",
    status: "Verified Record on Dimisipedia",
  },

  // -------------------------------------------------------------------------
  // 3. INNOVATION COHORT & INTERNS
  // -------------------------------------------------------------------------
  {
    id: "amrit-awasthi",
    slug: "amrit-awasthi",
    name: "Amrit Awasthi",
    role: "Android Developer Intern • KAAND Lead",
    officialDesignation: "Android Developer Intern (Flutter / Dart)",
    tier: "Innovation Cohort & Interns",
    department: "Innovation Lab & Mobile R&D",
    summary:
      "Specializes in Flutter and Dart mobile development. Served as lead application developer for KAAND, and secured 5th position in the LinkedIn 30-Day Kalesh Challenge.",
    bio:
      "Amrit Awasthi is documented on Dimisipedia as an Android developer intern specializing in Flutter and Dart. Under technical mentorship from Sheelu Singh and Mridul Mishra, Amrit served as the lead mobile engineer for 'KAAND' (a mobile-first media and news platform) and gained widespread recognition during the LinkedIn 30-Day Kalesh Promotion Challenge.",
    fullStory: [
      "Amrit joined the early development sprints of the Innovation Lab, focusing on reactive user interfaces, clean Flutter architecture, and mobile news feeds.",
      "His flagship work on the KAAND mobile application demonstrated strong mastery of custom layouts, feed rendering, and API consumption.",
      "He actively tests production commits and collaborates with the core engineering leads on feature prototypes.",
    ],
    education: "Computer Science & Engineering Studies",
    location: "DIMISI Innovation Lab, Kanpur, Uttar Pradesh, India",
    initials: "AA",
    photo: amritPhoto.url,
    photoPosition: "center 20%",
    responsibilities: [
      "Lead Mobile Development for KAAND Application",
      "Flutter UI Component Architecture & Prototyping",
      "State Integration & REST Client Connections",
      "Cross-Device Testing & Bug Resolution",
    ],
    keyProjects: [
      {
        title: "KAAND Application",
        role: "Lead Mobile Developer",
        description:
          "Engineered the mobile client for KAAND, implementing real-time content feeds, smooth card swipes, and low-latency article readers.",
        tags: ["Flutter", "Dart", "Firebase", "Newsfeed Architecture"],
      },
    ],
    techStack: ["Flutter", "Dart", "Android", "Firebase", "Git", "REST APIs"],
    dimisipediaUrl: "https://www.dimisipedia.me",
    status: "Verified Record on Dimisipedia",
  },
  {
    id: "anushka-tripathi",
    slug: "anushka-tripathi",
    name: "Anushka Tripathi",
    role: "Full Stack Web Developer Intern",
    officialDesignation: "Full Stack Web Development Intern",
    tier: "Innovation Cohort & Interns",
    department: "Web Engineering & Platform Development",
    summary:
      "Full stack web developer intern contributing to responsive frontend interfaces, React architectures, and 4th position winner in DIMISI's nationwide 30-Day LinkedIn Challenge.",
    bio:
      "Anushka Tripathi is documented on Dimisipedia as a Full Stack Web Developer Intern at DIMISI Technologies Private Limited, operating from the company's Kanpur headquarters. She specializes in modern web engineering, responsive user interfaces, and software initiatives across DIMISI's ecosystem. During DIMISI's nationwide 30-Day LinkedIn Challenge for the flagship anonymous social polling platform 'The Kalesh', Anushka secured the 4th position among student creators and developers.",
    fullStory: [
      "Anushka contributes to core web platforms and software initiatives at DIMISI Technologies, specializing in component-driven UI engineering and client-side responsiveness.",
      "She actively participated in the 30-Day LinkedIn Challenge, driving tech-oriented narratives and product outreach for the launch of 'The Kalesh', securing the 4th position nationwide.",
      "Her technical work spans modern JavaScript frameworks, full-stack application prototyping, and cross-browser performance optimization.",
    ],
    education: "Computer Science & Engineering Studies",
    location: "DIMISI Headquarters, Kanpur, Uttar Pradesh, India",
    initials: "AT",
    responsibilities: [
      "Frontend Web Engineering with React & Modern Web Standards",
      "Responsive UI Prototyping and CSS/Layout Optimization",
      "Participating in Product Sprint Testing and Component QA",
      "Contributing to Developer Advocacy and Digital Product Awareness",
    ],
    keyProjects: [
      {
        title: "The Kalesh Platform Support",
        role: "Web Developer Intern",
        description:
          "Contributed to web platform development, responsive frontend interfaces, and cross-device testing for DIMISI's anonymous polling platform.",
        tags: ["React", "TypeScript", "Responsive UI", "Web Engineering"],
      },
      {
        title: "30-Day LinkedIn Creator Challenge",
        role: "4th Position Winner",
        description:
          "Awarded 4th place nationwide in the 30-Day LinkedIn creator campaign promoting startup narratives and tech builder culture.",
        tags: ["Content Strategy", "Developer Advocacy", "Social Media"],
      },
    ],
    techStack: ["React", "JavaScript", "HTML5", "CSS3", "Node.js", "Tailwind CSS", "Git"],
    dimisipediaUrl: "https://www.dimisipedia.me/people/anushka-tripathi",
    status: "Verified Record on Dimisipedia",
  },
  {
    id: "nisha-chaudhary",
    slug: "nisha-chaudhary",
    name: "Nisha Chaudhary",
    role: "Market Research & Analysis Intern",
    officialDesignation: "Market Research & Business Intelligence Intern",
    tier: "Innovation Cohort & Interns",
    department: "Market Intelligence & Growth Research",
    summary:
      "Market research and data analysis intern specializing in competitive intelligence, user behavior surveys, demographic trend tracking, and product feedback loops.",
    bio:
      "Nisha Chaudhary is documented on Dimisipedia as a Market Research & Analysis Intern at DIMISI Technologies Private Limited. She specializes in quantitative and qualitative market intelligence, user behavior analysis, and demographic studies that inform product strategies for platforms like The Kalesh and commercial client engagements.",
    fullStory: [
      "Nisha gathers and structures actionable market insights, studying consumer behavior and student engagement patterns across higher education institutions in North India.",
      "She designs survey instruments and synthesizes feedback to help DIMISI's product engineering team identify high-leverage features and friction points.",
      "Her analytical reports provide direct input into go-to-market strategies, campus user acquisition loops, and client digital transformation advisory.",
    ],
    education: "Business Analytics / Market Research Studies",
    location: "DIMISI Headquarters, Kanpur, Uttar Pradesh, India",
    initials: "NC",
    responsibilities: [
      "Conducting User Demographics & Consumer Sentiment Studies",
      "Competitive Intelligence & Market Positioning Benchmarks",
      "Formulating Structured Feedback Surveys for Campus Product Launches",
      "Synthesizing Quantitative Analytics for Product Roadmap Reviews",
    ],
    keyProjects: [
      {
        title: "Market Intelligence & Demographic Survey",
        role: "Lead Research Intern",
        description:
          "Evaluated collegiate user response, privacy perceptions, and anonymous engagement trends to optimize Kalesh feature adoption.",
        tags: ["Market Research", "User Demographics", "Data Analytics"],
      },
      {
        title: "Competitor Landscape Analysis",
        role: "Market Analyst",
        description:
          "Produced structured intelligence reports comparing modern campus networking apps and commercial software service models.",
        tags: ["Competitive Intelligence", "Benchmarking", "Growth Strategy"],
      },
    ],
    techStack: ["Market Research", "Data Analysis", "User Surveys", "Competitive Intelligence", "Product Analytics"],
    dimisipediaUrl: "https://www.dimisipedia.me/people/nisha-chaudhary",
    status: "Verified Record on Dimisipedia",
  },
  {
    id: "harsh-mishra",
    slug: "harsh-mishra",
    name: "Harsh Mishra",
    role: "Video Editor & Digital Media Intern",
    officialDesignation: "Creative Media & Visual Effects Intern",
    tier: "Innovation Cohort & Interns",
    department: "Creative Media & Innovation Lab",
    summary:
      "Focuses on video editing, motion effects, and short-form video creation for product feature demos and social channels.",
    bio:
      "Harsh Mishra is documented on Dimisipedia as a Video Editor and Social Media Marketing intern who joined in February 2026. Working alongside Krishna Tiwari, Harsh crafts engaging reels, motion graphics, and video teasers for DIMISI platforms.",
    fullStory: [
      "Harsh creates dynamic short-form video content designed for viral social reach.",
      "He edits tutorial clips, product feature highlights, and campus promotional videos with modern motion design.",
    ],
    education: "Creative Media & Computer Science Studies",
    location: "DIMISI Innovation Lab, Kanpur, Uttar Pradesh, India",
    initials: "HM",
    photo: harshPhoto.url,
    photoPosition: "center 20%",
    responsibilities: [
      "Short-Form Video Editing (Reels & Shorts)",
      "Motion Graphics & Dynamic Subtitles",
      "Audio Mixing & Visual Pacing",
    ],
    keyProjects: [
      {
        title: "Kalesh Product Feature Shorts",
        role: "Video Editor",
        description:
          "Created visually snappy video demos showcasing anonymous polling and live interactive results.",
        tags: ["Video Editing", "Motion Graphics", "Social Media"],
      },
    ],
    techStack: ["Video Editing", "Motion Graphics", "Premiere Pro", "Creative Media"],
    dimisipediaUrl: "https://www.dimisipedia.me",
    status: "Verified Record on Dimisipedia",
  },
  {
    id: "amit-kumar",
    slug: "amit-kumar",
    name: "Amit Kumar",
    role: "Backend Engineering Intern",
    officialDesignation: "Software Engineering Intern (Platform Infrastructure)",
    tier: "Innovation Cohort & Interns",
    department: "Platform Engineering",
    summary:
      "Backend intern from the February 2026 intake. Works on database indexing, server monitoring routines, and automated unit tests.",
    bio:
      "Amit Kumar is a backend engineering intern who joined DIMISI in February 2026. He assists core engineering leads with server health scripts, unit test harnesses, and database management.",
    fullStory: [
      "Amit works closely with the platform infrastructure team, learning production engineering patterns and maintaining internal developer utilities.",
      "He focuses on automated endpoint tests, code coverage analysis, and log telemetry monitoring.",
    ],
    education: "Computer Science & Engineering Studies",
    location: "DIMISI Innovation Lab, Kanpur, Uttar Pradesh, India",
    initials: "AK",
    responsibilities: [
      "Automated Unit & Integration Testing",
      "Server Telemetry & Log Monitoring",
      "Database Health Checks",
    ],
    keyProjects: [
      {
        title: "Server Telemetry Harness",
        role: "Backend Contributor",
        description:
          "Assisted in configuring automated health-check endpoints for internal microservices.",
        tags: ["Node.js", "Telemetry", "Testing"],
      },
    ],
    techStack: ["Node.js", "Express", "SQL", "MongoDB", "Git"],
    dimisipediaUrl: "https://www.dimisipedia.me",
    status: "Verified Record on Dimisipedia",
  },
  {
    id: "prashant",
    slug: "prashant",
    name: "Prashant",
    role: "Quality Assurance & Testing Intern",
    officialDesignation: "QA & Product Reliability Intern",
    tier: "Innovation Cohort & Interns",
    department: "QA & Reliability",
    summary:
      "Specializes in cross-device manual QA, bug reporting, usability auditing, and release testing across web and mobile builds.",
    bio:
      "Prashant is a dedicated QA intern at DIMISI Technologies. He rigorously validates new features across mobile and web platforms to ensure seamless usability, responsive fidelity, and zero critical regressions prior to release.",
    fullStory: [
      "Prashant acts as the first line of defense for user experience quality at DIMISI.",
      "He designs comprehensive test cases for polling interactions, authentication flows, and network latency handling.",
    ],
    education: "Information Technology & Testing Methodologies",
    location: "DIMISI Innovation Lab, Kanpur, Uttar Pradesh, India",
    initials: "PR",
    responsibilities: [
      "Comprehensive Manual QA Testing",
      "Bug Tracking & Detailed Reproduction Steps",
      "Cross-Platform Usability & Layout Verification",
      "Stress Testing Under Low-Bandwidth Conditions",
    ],
    keyProjects: [
      {
        title: "Kalesh Beta Usability Audit",
        role: "Lead QA Tester",
        description:
          "Tested hundreds of edge-case scenarios including low-connectivity voting, rapid-fire polling, and account transitions.",
        tags: ["Quality Assurance", "Bug Tracking", "Usability"],
      },
    ],
    techStack: ["Manual QA", "Bug Tracking", "Regression Testing", "Usability Testing", "Test Case Design"],
    dimisipediaUrl: "https://www.dimisipedia.me",
    status: "Verified Record on Dimisipedia",
  },

  // -------------------------------------------------------------------------
  // 4. ALUMNI & FORMER TEAM MEMBERS (EX-EMPLOYEES)
  // -------------------------------------------------------------------------
  {
    id: "saumya-shukla",
    slug: "saumya-shukla",
    name: "Saumya Shukla",
    role: "Former Social Media Marketing Intern • Alumni",
    officialDesignation: "Ex-Employee • Former Digital Growth & Content Intern",
    tier: "Alumni & Former Members",
    department: "Digital Marketing & Growth (Alumni)",
    isExEmployee: true,
    summary:
      "Former intern who contributed to social media campaigns, campus outreach, and community engagement for Kalesh during the early 2026 development phase.",
    bio:
      "Saumya Shukla is an alumnus of DIMISI Technologies (February 2026 cohort). She contributed to content writing, trend research, and early youth community building across social channels before moving on to subsequent endeavors.",
    fullStory: [
      "During her tenure at DIMISI, Saumya contributed to campus outreach and digital engagement campaigns for the Kalesh platform.",
      "She assisted in drafting social media content, tracking audience sentiment, and collecting student feedback loops.",
      "DIMISI Technologies acknowledges her valuable contributions to our early growth story.",
    ],
    education: "Computer Science / Media Studies",
    location: "DIMISI Innovation Lab, Kanpur, Uttar Pradesh, India",
    initials: "SS",
    responsibilities: [
      "Social Media Content Drafting & Copywriting (Past)",
      "Audience Interaction & Community Moderation (Past)",
      "Campus Promotional Campaigns for Kalesh (Past)",
    ],
    keyProjects: [
      {
        title: "Campus Engagement Loops",
        role: "Marketing Contributor",
        description:
          "Coordinated localized student feedback loops, gathering user suggestions to refine the Kalesh onboarding experience.",
        tags: ["Community Growth", "User Research", "Copywriting"],
      },
    ],
    techStack: ["Social Marketing", "Copywriting", "Audience Engagement", "Trend Research"],
    dimisipediaUrl: "https://www.dimisipedia.me",
    status: "Alumni Record on Dimisipedia",
  },
  {
    id: "niyati-gupta",
    slug: "niyati-gupta",
    name: "Niyati Gupta",
    role: "Former Backend Engineering Intern • Alumni",
    officialDesignation: "Ex-Employee • Former Software Engineering Intern (Backend Services)",
    tier: "Alumni & Former Members",
    department: "Platform Engineering (Alumni)",
    isExEmployee: true,
    summary:
      "Former backend intern who contributed to API endpoint validations, database queries, and test routines during the early 2026 cohort.",
    bio:
      "Niyati Gupta is an alumnus of DIMISI Technologies (February 2026 cohort). She contributed to backend service testing, data schema validations, and REST endpoint routines under the mentorship of the engineering leads.",
    fullStory: [
      "During her tenure at DIMISI, Niyati assisted in testing server-side logic and validating API responses against contract definitions.",
      "She contributed to regression test suites for internal microservices.",
      "DIMISI Technologies honors and appreciates her contributions to our foundational platform engineering.",
    ],
    education: "Computer Science & Engineering",
    location: "DIMISI Innovation Lab, Kanpur, Uttar Pradesh, India",
    initials: "NG",
    responsibilities: [
      "REST API Endpoint Development & Testing (Past)",
      "Database Schema Validation & Queries (Past)",
      "Bug Verification & Documentation (Past)",
    ],
    keyProjects: [
      {
        title: "Internal Microservice Validation",
        role: "Backend Contributor",
        description:
          "Assisted in testing high-frequency API endpoints to ensure correct payload handling and authentication checks.",
        tags: ["Node.js", "Express", "REST", "Postman"],
      },
    ],
    techStack: ["Node.js", "Express", "MongoDB", "REST APIs", "Postman", "Git"],
    dimisipediaUrl: "https://www.dimisipedia.me",
    status: "Alumni Record on Dimisipedia",
  },
];

export function getTeamMemberBySlug(slug: string): TeamMemberData | undefined {
  return TEAM_MEMBERS.find((m) => m.slug === slug || m.id === slug);
}

export const TEAM_TIERS: TeamTier[] = [
  "Founders & Executive Directors",
  "Core Engineering & Leads",
  "Innovation Cohort & Interns",
  "Alumni & Former Members",
];
