import { createFileRoute } from "@tanstack/react-router";
import { TeamPage } from "@/pages/team/TeamPage";

export const Route = createFileRoute("/team/")({
  head: () => ({
    meta: [
      { title: "Our Team & Leadership — DIMISI Technologies Pvt Ltd" },
      {
        name: "description",
        content:
          "Meet the visionary founders, directors, core engineering leads, and innovation cohort building next-generation software architectures and the Kalesh platform.",
      },
      { property: "og:title", content: "Our Team & Leadership — DIMISI Technologies Pvt Ltd" },
      {
        property: "og:description",
        content:
          "Founders, directors, core engineering leads, and innovation cohort at DIMISI Technologies.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TeamPage,
});
