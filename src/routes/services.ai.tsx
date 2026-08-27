import { createFileRoute } from "@tanstack/react-router";
import { ServiceWorldRoute } from "@/pages/services-ai/ServiceWorldRoute";

export const Route = createFileRoute("/services/ai")({
  head: () => ({
    meta: [
      { title: "Artificial Intelligence — DIMISI Technologies Pvt Ltd" },
      { name: "description", content: "AI agents, computer vision, generative AI and predictive analytics engineered by DIMISI Technologies." },
      { property: "og:title", content: "Artificial Intelligence — DIMISI Technologies Pvt Ltd" },
      { property: "og:description", content: "AI agents, computer vision, generative AI and predictive analytics engineered by DIMISI Technologies." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ServiceWorldRoute,
});
