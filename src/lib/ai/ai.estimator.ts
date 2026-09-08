/**
 * DIMISI AI — Smart Project Cost & Timeline Estimator Engine
 * Generates preliminary architecture recommendations, timelines, and scope.
 */
import type { ProjectEstimateInput, ProjectEstimateResult } from "./ai.types";

export function calculateProjectEstimate(
  input: ProjectEstimateInput,
): ProjectEstimateResult {
  const { projectType, scale, features, timelineNeed } = input;

  let title = "Custom Digital Engineering Project";
  let techStack: string[] = ["React", "TypeScript", "Node.js", "PostgreSQL"];
  let baseWeeks = 4;
  let complexity: ProjectEstimateResult["complexity"] = "Standard";
  let budgetGuidance = "Custom Quote Scope";

  switch (projectType) {
    case "web":
      title = "High-Performance Web Platform";
      techStack = ["React", "TanStack Start / Next.js", "TypeScript", "TailwindCSS", "Node.js API"];
      baseWeeks = 3;
      break;
    case "mobile":
      title = "Cross-Platform Mobile Application (iOS & Android)";
      techStack = ["React Native / Flutter", "TypeScript", "Fastify / Express", "PostgreSQL", "Redis"];
      baseWeeks = 5;
      break;
    case "ai":
      title = "AI & Autonomous Multi-Agent Intelligence System";
      techStack = ["Python", "FastAPI", "Google Gemini API / LangChain", "Vector DB (pgvector/Pinecone)", "React UI"];
      baseWeeks = 6;
      break;
    case "enterprise":
      title = "Enterprise Cloud & Scalable Core Architecture";
      techStack = ["Microservices", "Docker / Kubernetes", "Go / Node.js", "PostgreSQL / Redis", "GCP / AWS"];
      baseWeeks = 8;
      break;
    default:
      title = "End-to-End Digital Engineering Solution";
      techStack = ["React", "TypeScript", "Node.js", "Cloud Infrastructure"];
      baseWeeks = 4;
  }

  // Feature complexity adjustments
  let featureWeeks = 0;
  if (features.includes("auth")) featureWeeks += 1;
  if (features.includes("payments")) featureWeeks += 1.5;
  if (features.includes("admin")) featureWeeks += 2;
  if (features.includes("ai")) featureWeeks += 2.5;
  if (features.includes("realtime")) featureWeeks += 1.5;

  let totalWeeksMin = Math.round(baseWeeks + featureWeeks);
  let totalWeeksMax = Math.round(totalWeeksMin * 1.5);

  if (scale === "enterprise") {
    totalWeeksMin += 3;
    totalWeeksMax += 5;
    complexity = "Enterprise High";
    budgetGuidance = "Enterprise Custom Scoping";
  } else if (scale === "growth") {
    totalWeeksMin += 1;
    totalWeeksMax += 2;
    complexity = "High";
    budgetGuidance = "Growth Milestone Scoping";
  } else {
    complexity = featureWeeks > 3 ? "Medium" : "Standard";
    budgetGuidance = "Fast MVP Foundation Scope";
  }

  if (timelineNeed === "urgent") {
    totalWeeksMin = Math.max(2, Math.round(totalWeeksMin * 0.75));
    totalWeeksMax = Math.max(3, Math.round(totalWeeksMax * 0.8));
  }

  const timelineStr = `${totalWeeksMin} – ${totalWeeksMax} Weeks`;

  const summary = `Based on your selection (${title}, ${scale.toUpperCase()} scale with ${features.length} core capability modules), DIMISI Technologies recommends a modern, high-throughput tech stack engineered for 99.9% uptime and zero tech debt.`;

  return {
    title,
    summary,
    techStack,
    complexity,
    estimatedTimeline: timelineStr,
    budgetGuidance,
    recommendedNextStep: "Schedule a 15-minute engineering discovery call with DIMISI leadership to receive a formal 48-hour architecture blueprint and finalized quote.",
    disclaimer: "Preliminary estimate only. Final timeline and cost depend on precise functional requirements, third-party integrations, and design fidelity.",
  };
}
