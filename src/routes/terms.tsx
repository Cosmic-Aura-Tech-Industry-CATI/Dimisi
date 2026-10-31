import { createFileRoute } from "@tanstack/react-router";
import { TermsPage } from "@/pages/terms/TermsPage";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — DIMISI Technologies" },
      {
        name: "description",
        content:
          "The terms that govern use of the DIMISI Technologies Pvt Ltd website, our software services and the Kalesh app.",
      },
      { property: "og:title", content: "Terms of Service — DIMISI Technologies" },
      { property: "og:description", content: "Website, services and product terms of use." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://www.dimisi.tech/terms" }],
  }),
  component: TermsPage,
});
