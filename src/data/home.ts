import type { Faq, Stat } from "@/types";

export const STATS: Stat[] = [
  { label: "Models deployed", value: 428, suffix: "+" },
  { label: "Hours automated", value: 180, suffix: "k" },
  { label: "Client retention", value: 97, suffix: "%" },
  { label: "Countries served", value: 21, suffix: "" },
];

export const FEATURES = [
  { title: "Owl-grade perception", detail: "Systems that read signal where everyone else sees noise." },
  { title: "Autonomous execution", detail: "Agents that finish the task, not just describe it." },
  { title: "Cinematic interfaces", detail: "Real-time 3D surfaces that make software feel inevitable." },
  { title: "Measured intelligence", detail: "Every model shipped behind evals, guardrails and dashboards." },
];

export const TECHNOLOGIES = [
  "PyTorch", "CUDA", "ONNX", "React Three Fiber", "WebGPU", "GSAP",
  "Rust", "TypeScript", "Postgres", "pgvector", "Kubernetes", "Triton",
];

export const PROCESS = [
  { step: "01", title: "Discover", detail: "We audit your data, workflows and constraints before writing a line of code." },
  { step: "02", title: "Design", detail: "Architecture, interface and model strategy agreed in one shared document." },
  { step: "03", title: "Build", detail: "Two-week cycles with working software at the end of each one." },
  { step: "04", title: "Deploy", detail: "Rollout behind evals and monitoring, with your team in the cockpit." },
  { step: "05", title: "Evolve", detail: "Continuous tuning as the data — and your business — changes." },
];

export const CASE_STUDIES = [
  {
    client: "Rudra Tours & Travels",
    category: "TRAVEL & TOURISM · WEB PLATFORM",
    result: "Frictionless Booking & Inquiries",
    detail:
      "A travel website for India tour packages, car rentals, wedding travel, and city-based trip planning from Kanpur. Visitors can move from inspiration to booking or inquiry with less friction, whether they need a package, a car, or wedding travel support.",
    tags: ["Tour Packages", "Car Rentals", "Wedding Travel", "Kanpur"],
  },
  {
    client: "Kalesh",
    category: "SOCIAL PLATFORM · WEBSITE",
    result: "Zero-Profile Anonymous Sphere",
    detail:
      "An anonymous social platform built around real-time polls, private chats, and authentic opinion sharing. Visitors can quickly understand how to share honest opinions without profile pressure or identity exposure.",
    tags: ["Real-Time Polls", "Private Chats", "Anonymous Feed", "High-Concurrency"],
  },
  {
    client: "Karyon",
    category: "HOME SERVICES · WEB APP",
    result: "Instant Verified Dispatch",
    detail:
      "A home-services platform for booking verified professionals across plumbing, electrical, cleaning, painting, moving, and more. Customers can move from browsing to booking quickly, with a clearer sense of service scope and reliability.",
    tags: ["On-Demand Booking", "Verified Pros", "Electrical & Plumbing", "Live Tracking"],
  },
];

export const TESTIMONIALS = [
  { quote: "They shipped in eleven weeks what our vendor had been scoping for a year.", name: "Ananya Kulkarni", role: "CTO, Vantage Logistics" },
  { quote: "The only agency where the demo was slower than the production build.", name: "Marcus Feld", role: "VP Engineering, Northline" },
  { quote: "It stopped feeling like software and started feeling like a colleague.", name: "Rhea Dsouza", role: "Head of Ops, Kite Robotics" },
];

export const PARTNERS = ["NVIDIA", "Vercel", "MongoDB Atlas", "Hugging Face", "Cloudflare", "Stripe"];

export const FAQS: Faq[] = [
  { q: "How fast can you start?", a: "Discovery usually begins within ten days of the first call. Urgent engagements can start inside a week." },
  { q: "Do you work with our existing engineers?", a: "Almost always. We embed with your team, document everything and hand over full ownership at the end." },
  { q: "Who owns the models and code?", a: "You do. All IP, weights and repositories transfer to you on final delivery." },
  { q: "Can you work with sensitive data?", a: "Yes. We support on-prem and VPC deployments, and sign DPAs before any data touches our systems." },
  { q: "What does a typical engagement cost?", a: "Focused builds start around $9,500. Full product engineering programmes run from $18,000 upward." },
];