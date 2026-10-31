import { createFileRoute } from "@tanstack/react-router";
import { ContactPage } from "@/pages/contact/ContactPage";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Engineering Leadership — DIMISI Technologies" },
      {
        name: "description",
        content:
          "Get in touch with Dimisi Technologies. Start a project, request a consultation, or reach support.",
      },
      { property: "og:title", content: "Contact Engineering Leadership — DIMISI Technologies" },
      {
        property: "og:description",
        content:
          "Get in touch with Dimisi Technologies. Start a project, request a consultation, or reach support.",
      },
    ],
    links: [{ rel: "canonical", href: "https://www.dimisi.tech/contact" }],
  }),
  component: ContactPage,
});
