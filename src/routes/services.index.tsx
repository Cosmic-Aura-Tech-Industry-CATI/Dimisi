import { createFileRoute } from "@tanstack/react-router";
import { ServicesPage } from "@/pages/services-index/ServicesPage";

export const Route = createFileRoute("/services/")({
  head: () => ({
    meta: [
      { title: "Our Services — Solutions Built for Business Growth | DIMISI Technologies" },
      {
        name: "description",
        content:
          "End-to-end digital engineering and industry solutions across Education, Healthcare, Retail, E-Commerce, Startups, SaaS, Enterprise, and Finance. Web, Mobile, AI, Cloud, and Software.",
      },
      { property: "og:title", content: "Our Services — Solutions Built for Business Growth | DIMISI Technologies" },
      {
        property: "og:description",
        content:
          "Tailored software, AI workflows, and digital architectures engineered for real business outcomes across 8+ strategic industry sectors.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ServicesPage,
});
