import { createFileRoute } from "@tanstack/react-router";
import { getPublicCareersData } from "@/lib/careers.functions";
import { CareerPage } from "@/pages/career/CareerPage";

export const Route = createFileRoute("/career")({
  loader: async () => {
    return await getPublicCareersData();
  },
  head: ({ loaderData }) => {
    const hero = loaderData?.hero;
    return {
      meta: [
        { title: `${hero?.heading || "Careers"} — DIMISI Technologies` },
        {
          name: "description",
          content:
            hero?.subline ||
            "Join a curious, innovation-focused team where your work ships and your ideas matter. Open roles for content writers, graphic designers, engineers, and creatives.",
        },
        { property: "og:title", content: "Careers — DIMISI Technologies" },
        {
          property: "og:description",
          content:
            "Remote-first roles for engineers, designers, and creators who build scalable systems and next-generation products.",
        },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: "Careers — DIMISI Technologies" },
      ],
    };
  },
  component: CareerPage,
});
