import { createFileRoute } from "@tanstack/react-router";
import { ServiceWorldRoute } from "@/pages/services-ui-ux/ServiceWorldRoute";

export const Route = createFileRoute("/services/ui-ux")({
  head: () => ({
    meta: [
      { title: "UI / UX Design — DIMISI Technologies Pvt Ltd" },
      { name: "description", content: "Research-led product design, design systems, prototyping and brand identity." },
      { property: "og:title", content: "UI / UX Design — DIMISI Technologies Pvt Ltd" },
      { property: "og:description", content: "Research-led product design, design systems, prototyping and brand identity." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ServiceWorldRoute,
});
