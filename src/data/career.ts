import type { Job } from "@/types";

export const JOBS: Job[] = [
  {
    id: "wegl",
    role: "Senior WebGL Engineer",
    team: "Immersive",
    location: "Remote / Noida",
    type: "Full-time",
    description: "Own the real-time rendering stack behind our cinematic product worlds.",
  },
  {
    id: "ml",
    role: "Applied ML Engineer",
    team: "Research",
    location: "Remote",
    type: "Full-time",
    description: "Train, evaluate and ship perception models that run on constrained edge hardware.",
  },
  {
    id: "design",
    role: "Product Designer, Motion",
    team: "Design",
    location: "Remote / Bengaluru",
    type: "Full-time",
    description: "Design interfaces that move with intent — from micro-interaction to full scene choreography.",
  },
  {
    id: "platform",
    role: "Platform Engineer",
    team: "Infrastructure",
    location: "Remote",
    type: "Full-time",
    description: "Scale AVIARY across regions and keep cold starts under two seconds.",
  },
  {
    id: "intern",
    role: "AI Engineering Intern",
    team: "Research",
    location: "Noida",
    type: "6-month internship",
    description: "Work beside senior engineers on live agent deployments from day one.",
  },
];

export const HIRING_STEPS = [
  { step: "01", title: "Signal", detail: "Send work you are proud of. A repo, a reel, a shipped product — not a template CV." },
  { step: "02", title: "Conversation", detail: "45 minutes with the team lead about how you think, not trivia questions." },
  { step: "03", title: "Craft", detail: "A paid, scoped challenge drawn from real work. One week, your own pace." },
  { step: "04", title: "Studio Day", detail: "Meet the crew, review your craft together, ask us anything." },
  { step: "05", title: "Offer", detail: "Decision within 48 hours. No ghosting, ever." },
];

export const BENEFITS = [
  { title: "Remote-first", detail: "Work from anywhere with a four-hour overlap window." },
  { title: "Hardware budget", detail: "$3,000 every two years, GPU workstation on request." },
  { title: "Learning fund", detail: "$2,000 a year for courses, conferences and books." },
  { title: "Deep work", detail: "No-meeting Tuesdays and Thursdays. Protected by policy." },
  { title: "Health", detail: "Full family cover plus therapy and fitness stipend." },
  { title: "Equity", detail: "Every full-time role includes meaningful ownership." },
];