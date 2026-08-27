import { createFileRoute } from "@tanstack/react-router";
import { ContactPage } from "@/pages/contact/ContactPage";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — DIMISI Technologies" },
      {
        name: "description",
        content:
          "Tell DIMISI Technologies what you are building. Architecture, timeline and a number back — usually within forty-eight hours.",
      },
      { property: "og:title", content: "Contact — DIMISI Technologies" },
      {
        property: "og:description",
        content: "Start a project with DIMISI Technologies — reply within forty-eight hours.",
      },
    ],
  }),
  component: ContactPage,
});
