import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute("/dimisi-admin/overview")({
  head: () => ({
    meta: [
      { title: "Overview — Admin Control Room | DIMISI Technologies" },
      {
        name: "description",
        content:
          "Private DIMISI Technologies admin control room overview for reviewing sign-ups, leads and email notification opt-ins.",
      },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Overview — Admin Control Room | DIMISI Technologies" },
      {
        property: "og:description",
        content: "Private admin overview for the DIMISI Technologies team.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: lazyRouteComponent(() => import("@admin/ui/AdminPanel/AdminPanel"), "AdminPanel"),
});
