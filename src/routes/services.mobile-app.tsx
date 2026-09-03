import { createFileRoute } from "@tanstack/react-router";
import { ServiceWorldRoute } from "@/pages/services-mobile-app/ServiceWorldRoute";

export const Route = createFileRoute("/services/mobile-app")({
  head: () => ({
    meta: [
      { title: "Mobile App Development — DIMISI Technologies Pvt Ltd" },
      { name: "description", content: "Flutter, React Native and native Android/iOS apps with flagship motion and offline resilience." },
      { property: "og:title", content: "Mobile App Development — DIMISI Technologies Pvt Ltd" },
      { property: "og:description", content: "Flutter, React Native and native Android/iOS apps with flagship motion and offline resilience." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ServiceWorldRoute,
});
