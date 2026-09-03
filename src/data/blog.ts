import type { BlogPost } from "@/types";

export const BLOG_POSTS: BlogPost[] = [
  {
    id: "owl-protocol",
    title: "The Owl Protocol: designing perception systems that see in the dark",
    excerpt:
      "Why low-light vision is the hardest unsolved problem in applied CV, and the sensor-fusion stack we use to beat it.",
    category: "Research",
    readTime: "9 min",
    date: "2026-07-14",
    author: "Dr. Ira Mehta",
  },
  {
    id: "agents-in-production",
    title: "Agents in production: what actually breaks after week three",
    excerpt:
      "Twelve deployments, one honest post-mortem. Memory bloat, tool loops, and the guardrails that saved us.",
    category: "Engineering",
    readTime: "12 min",
    date: "2026-06-28",
    author: "Kabir Rao",
  },
  {
    id: "cinematic-web",
    title: "Shipping cinematic WebGL without destroying your Lighthouse score",
    excerpt:
      "Budgeting draw calls, deferring canvases and the exact moment you should refuse to add another particle.",
    category: "Craft",
    readTime: "7 min",
    date: "2026-06-09",
    author: "Naina Sethi",
  },
  {
    id: "eval-first",
    title: "Eval-first development: treat your prompts like production code",
    excerpt:
      "A practical harness for regression-testing model behaviour before your customers do it for you.",
    category: "Engineering",
    readTime: "10 min",
    date: "2026-05-22",
    author: "Kabir Rao",
  },
  {
    id: "brand-of-machines",
    title: "The brand of machines: giving an AI product a face people trust",
    excerpt:
      "How we designed DIMISI Technologies — the robot — and why a guide character outperforms a tooltip every single time.",
    category: "Design",
    readTime: "6 min",
    date: "2026-05-03",
    author: "Naina Sethi",
  },
  {
    id: "gpu-economics",
    title: "GPU economics for teams who are not hyperscalers",
    excerpt:
      "Spot instances, batching windows and quantisation: three levers that cut our inference bill by 63 percent.",
    category: "Infrastructure",
    readTime: "8 min",
    date: "2026-04-18",
    author: "Dr. Ira Mehta",
  },
];

export const BLOG_CATEGORIES = ["All", "Research", "Engineering", "Craft", "Design", "Infrastructure"];