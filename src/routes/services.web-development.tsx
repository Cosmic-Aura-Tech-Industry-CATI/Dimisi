import { createFileRoute } from "@tanstack/react-router";
import { ServiceWorldRoute } from "@/pages/services-web-development/ServiceWorldRoute";

export const Route = createFileRoute("/services/web-development")({
  head: () => ({
    meta: [
      { title: "Web Development — DIMISI Technologies Pvt Ltd" },
      { name: "description", content: "Corporate platforms, enterprise portals and headless commerce built for scale, speed and search." },
      { property: "og:title", content: "Web Development — DIMISI Technologies Pvt Ltd" },
      { property: "og:description", content: "Corporate platforms, enterprise portals and headless commerce built for scale, speed and search." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ServiceWorldRoute,
});
