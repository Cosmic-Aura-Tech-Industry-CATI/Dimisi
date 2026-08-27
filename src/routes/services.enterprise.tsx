import { createFileRoute } from "@tanstack/react-router";
import { ServiceWorldRoute } from "@/pages/services-enterprise/ServiceWorldRoute";

export const Route = createFileRoute("/services/enterprise")({
  head: () => ({
    meta: [
      { title: "Enterprise Software — DIMISI Technologies Pvt Ltd" },
      { name: "description", content: "ERP, HRMS, inventory and analytics in one governed operational platform." },
      { property: "og:title", content: "Enterprise Software — DIMISI Technologies Pvt Ltd" },
      { property: "og:description", content: "ERP, HRMS, inventory and analytics in one governed operational platform." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ServiceWorldRoute,
});
