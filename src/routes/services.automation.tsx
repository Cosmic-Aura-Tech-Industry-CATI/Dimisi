import { createFileRoute } from "@tanstack/react-router";
import { ServiceWorldRoute } from "@/pages/services-automation/ServiceWorldRoute";

export const Route = createFileRoute("/services/automation")({
  head: () => ({
    meta: [
      { title: "Automation — DIMISI Technologies Pvt Ltd" },
      { name: "description", content: "Connected pipelines for CRM, messaging, documents and operations with AI in the loop." },
      { property: "og:title", content: "Automation — DIMISI Technologies Pvt Ltd" },
      { property: "og:description", content: "Connected pipelines for CRM, messaging, documents and operations with AI in the loop." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ServiceWorldRoute,
});
