import { createFileRoute } from "@tanstack/react-router";
import { AboutPage } from "@/pages/about/AboutPage";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — DIMISI Technologies Pvt Ltd" },
      {
        name: "description",
        content:
          "DIMISI Technologies Pvt Ltd is a technology company delivering software services for businesses and building its own app, Kalesh.",
      },
      { property: "og:title", content: "About Us — DIMISI Technologies Pvt Ltd" },
      {
        property: "og:description",
        content: "Who we are, what we build and how we work.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AboutPage,
});
