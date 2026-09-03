import { createFileRoute } from "@tanstack/react-router";
import { AdminPanel } from "@admin/ui/AdminPanel/AdminPanel";

export const Route = createFileRoute("/dimisi-admin")({
  head: () => ({
    meta: [
      { title: "Admin Control Room — DIMISI Technologies" },
      {
        name: "description",
        content:
          "Private DIMISI Technologies admin control room for reviewing sign-ups, leads and email notification opt-ins.",
      },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Admin Control Room — DIMISI Technologies" },
      {
        property: "og:description",
        content: "Private admin area for the DIMISI Technologies team.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminPanel,
});