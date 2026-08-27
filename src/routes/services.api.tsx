import { createFileRoute } from "@tanstack/react-router";
import { ServiceWorldRoute } from "@/pages/services-api/ServiceWorldRoute";

export const Route = createFileRoute("/services/api")({
  head: () => ({
    meta: [
      { title: "API Integration — DIMISI Technologies Pvt Ltd" },
      { name: "description", content: "REST and GraphQL gateways, payments, messaging and identity behind clean contracts." },
      { property: "og:title", content: "API Integration — DIMISI Technologies Pvt Ltd" },
      { property: "og:description", content: "REST and GraphQL gateways, payments, messaging and identity behind clean contracts." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ServiceWorldRoute,
});
