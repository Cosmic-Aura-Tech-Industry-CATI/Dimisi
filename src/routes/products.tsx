import { createFileRoute } from "@tanstack/react-router";
import { getPublicWorkData } from "@/lib/work.functions";
import { WorkPage } from "@/pages/work/WorkPage";

export const Route = createFileRoute("/products")({
  loader: async () => {
    return await getPublicWorkData();
  },
  head: () => ({
    meta: [
      { title: "Our Work & Products — DIMISI Technologies" },
      {
        name: "description",
        content:
          "Explore selected case studies and proprietary products engineered by DIMISI Technologies — Rudra Tours, Kalesh, Karyon, AxisCon, and scalable enterprise architectures.",
      },
      { property: "og:title", content: "Our Work & Products — DIMISI Technologies" },
      {
        property: "og:description",
        content:
          "Real challenges, thoughtful solutions, and outcomes that matter. Case studies and software systems built for scale.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: WorkPage,
});
