import { createFileRoute } from "@tanstack/react-router";
import { ServiceWorldRoute } from "@/pages/services-cloud/ServiceWorldRoute";

export const Route = createFileRoute("/services/cloud")({
  head: () => ({
    meta: [
      { title: "Cloud & DevOps — DIMISI Technologies Pvt Ltd" },
      { name: "description", content: "AWS and Azure architecture, Kubernetes delivery pipelines and full-stack observability." },
      { property: "og:title", content: "Cloud & DevOps — DIMISI Technologies Pvt Ltd" },
      { property: "og:description", content: "AWS and Azure architecture, Kubernetes delivery pipelines and full-stack observability." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ServiceWorldRoute,
});
