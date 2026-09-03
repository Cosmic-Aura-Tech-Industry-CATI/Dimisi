import type { Service } from "@/types";

export const SERVICES: Service[] = [
  {
    id: "ai-strategy",
    title: "AI Strategy & R&D",
    tagline: "From ambition to architecture",
    description:
      "We map your operations, find the highest-leverage intelligence layers and design a roadmap your engineering team can actually ship.",
    capabilities: ["Opportunity audit", "Model selection", "Data readiness", "ROI modelling"],
    price: "from $6,000",
    robotLine: "Start here if you know AI matters but not where it fits.",
  },
  {
    id: "automation",
    title: "Intelligent Automation",
    tagline: "Workflows that think",
    description:
      "Autonomous agents that read, decide and act across your stack — support, billing, ops and reporting run themselves.",
    capabilities: ["Agent orchestration", "Tool calling", "Human-in-the-loop", "Observability"],
    price: "from $9,500",
    robotLine: "My favourite. I was born inside an automation pipeline!",
  },
  {
    id: "immersive",
    title: "Immersive Experiences",
    tagline: "WebGL that sells",
    description:
      "Real-time 3D product worlds, configurators and cinematic launch sites engineered for 60fps on real devices.",
    capabilities: ["React Three Fiber", "Custom shaders", "Scroll cinematography", "Asset pipelines"],
    price: "from $12,000",
    robotLine: "You are standing inside an example right now.",
  },
  {
    id: "vision",
    title: "Computer Vision",
    tagline: "Machines that see",
    description:
      "Detection, inspection and tracking systems trained on your own footage and deployed to edge or cloud.",
    capabilities: ["Dataset curation", "Model training", "Edge deployment", "Quality dashboards"],
    price: "from $14,000",
    robotLine: "The Owl handles this one. Her eyes never blink for long.",
  },
  {
    id: "platforms",
    title: "AI Product Engineering",
    tagline: "Ship the whole thing",
    description:
      "Full-stack delivery of AI-native SaaS — auth, billing, vector search, evals, dashboards and everything between.",
    capabilities: ["RAG systems", "Evals & guardrails", "Scalable infra", "Design systems"],
    price: "from $18,000",
    robotLine: "End to end. You bring the vision, we bring the build.",
  },
  {
    id: "enablement",
    title: "Enablement & Support",
    tagline: "Your team, upgraded",
    description:
      "Workshops, playbooks and embedded engineers so your people own the system long after launch.",
    capabilities: ["Team training", "Prompt libraries", "Runbooks", "24/7 SLA"],
    price: "from $3,500",
    robotLine: "I also make an excellent onboarding buddy.",
  },
];