import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute("/dimisi-admin/logs")({
  head: () => ({
    meta: [
      { title: "Admin Logs — DIMISI Control Room" },
      {
        name: "description",
        content: "Private administrative audit and compliance activity logs.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: lazyRouteComponent(() => import("@admin/ui/AdminPanel/AdminPanel"), "AdminPanel"),
});
