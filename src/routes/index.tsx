import { createFileRoute } from "@tanstack/react-router";
import { Home } from "@/pages/home/Home";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DIMISI Technologies Pvt Ltd — Technology Beyond Limits" },
      {
        name: "description",
        content:
          "DIMISI Technologies engineers autonomous agents, computer vision and cinematic WebGL experiences for teams that refuse ordinary software.",
      },
      { property: "og:title", content: "DIMISI Technologies Pvt Ltd — Technology Beyond Limits" },
      {
        property: "og:description",
        content: "Autonomous agents, computer vision and cinematic WebGL, engineered end to end.",
      },
    ],
  }),
  component: Home,
});
