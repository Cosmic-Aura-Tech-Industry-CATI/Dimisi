import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

const TAB_TITLES: Record<string, string> = {
  overview: "Overview",
  services: "Services & Sectors",
  work: "Our Work & Products",
  careers: "Careers & Jobs",
  blog: "Blog & Journal",
  events: "Events & Gallery",
  reviews: "Reviews",
  campaigns: "Campaigns & QR",
  reports: "Moderation Queue",
  analytics: "Analytics",
  logs: "Admin Logs",
  settings: "Notifications",
  leads: "Leads",
  admins: "Admins",
};

export const Route = createFileRoute("/dimisi-admin/$tab")({
  head: ({ params }) => {
    const sectionLabel = TAB_TITLES[params.tab] || params.tab.charAt(0).toUpperCase() + params.tab.slice(1);
    return {
      meta: [
        { title: `${sectionLabel} — Admin Control Room | DIMISI Technologies` },
        {
          name: "description",
          content: `Private DIMISI Technologies admin area for ${sectionLabel}.`,
        },
        { name: "robots", content: "noindex, nofollow" },
        { property: "og:title", content: `${sectionLabel} — Admin Control Room | DIMISI Technologies` },
        {
          property: "og:description",
          content: "Private admin area for the DIMISI Technologies team.",
        },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: lazyRouteComponent(() => import("@admin/ui/AdminPanel/AdminPanel"), "AdminPanel"),
});
