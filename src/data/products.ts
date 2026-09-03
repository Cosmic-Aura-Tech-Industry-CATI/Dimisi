import type { Product } from "@/types";

export const PRODUCTS: Product[] = [
  {
    id: "athena",
    name: "ATHENA Core",
    category: "Agent Platform",
    summary:
      "The reasoning engine behind every DIMISI deployment. Multi-agent orchestration with memory, tools and audit trails.",
    features: ["Multi-agent graphs", "Long-term memory", "Tool sandboxing", "Full audit trail"],
    metrics: [
      { label: "Avg. latency", value: "310ms" },
      { label: "Task success", value: "96.4%" },
      { label: "Deployments", value: "1.2k" },
    ],
    status: "Live",
  },
  {
    id: "nocturne",
    name: "NOCTURNE Vision",
    category: "Computer Vision",
    summary:
      "Owl-grade perception. Low-light detection and tracking that runs on edge hardware without a cloud round trip.",
    features: ["Low-light detection", "Edge inference", "Anomaly alerts", "Zone analytics"],
    metrics: [
      { label: "mAP@50", value: "0.93" },
      { label: "Edge FPS", value: "60" },
      { label: "Power draw", value: "7W" },
    ],
    status: "Live",
  },
  {
    id: "prism",
    name: "PRISM Studio",
    category: "Creative AI",
    summary:
      "Brand-locked generative studio. Images, motion and 3D assets that never drift from your visual identity.",
    features: ["Style locking", "3D asset export", "Motion presets", "Team libraries"],
    metrics: [
      { label: "Assets/day", value: "40k" },
      { label: "Brand match", value: "98%" },
      { label: "Formats", value: "17" },
    ],
    status: "Beta",
  },
  {
    id: "relay",
    name: "RELAY Ops",
    category: "Automation",
    summary:
      "Connects the systems you already pay for and lets autonomous workflows run your back office overnight.",
    features: ["200+ connectors", "Visual flows", "Retry logic", "Cost governor"],
    metrics: [
      { label: "Hours saved", value: "180k" },
      { label: "Connectors", value: "212" },
      { label: "Uptime", value: "99.98%" },
    ],
    status: "Live",
  },
  {
    id: "aviary",
    name: "AVIARY Cloud",
    category: "Infrastructure",
    summary:
      "GPU orchestration built for bursty inference — autoscaling, spot-aware and priced per token, not per promise.",
    features: ["Autoscaling GPUs", "Spot arbitrage", "Model registry", "Per-token billing"],
    metrics: [
      { label: "Cost cut", value: "-63%" },
      { label: "Cold start", value: "1.4s" },
      { label: "Regions", value: "9" },
    ],
    status: "Preview",
  },
];