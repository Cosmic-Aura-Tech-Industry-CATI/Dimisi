import { createFileRoute } from "@tanstack/react-router";
import { PrivacyPage } from "@/pages/privacy/PrivacyPage";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — DIMISI Technologies Pvt Ltd" },
      {
        name: "description",
        content:
          "How DIMISI Technologies Pvt Ltd collects, uses, stores and protects personal data across its website, services and the Kalesh app.",
      },
      { property: "og:title", content: "Privacy Policy — DIMISI Technologies Pvt Ltd" },
      { property: "og:description", content: "Our data collection, use and retention practices." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PrivacyPage,
});
