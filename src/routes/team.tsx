import { createFileRoute } from "@tanstack/react-router";
import { TeamPage } from "@/pages/team/TeamPage";

export const Route = createFileRoute("/team")({
  head: () => ({
    meta: [
      { title: "DIMISI Headquarters — Meet the Team" },
      {
        name: "description",
        content:
          "Walk through DIMISI Headquarters office by office — founders, core engineers and interns building client software and the Kalesh app.",
      },
      { property: "og:title", content: "DIMISI Headquarters — Meet the Team" },
      {
        property: "og:description",
        content:
          "A cinematic office tour of DIMISI Technologies — leadership, core team and the innovation lab.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TeamPage,
});
