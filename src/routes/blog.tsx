import { createFileRoute } from "@tanstack/react-router";
import { getPublicBlogData } from "@/lib/blog.functions";
import { BlogPage } from "@/pages/blog/BlogPage";

export const Route = createFileRoute("/blog")({
  loader: async () => {
    return await getPublicBlogData();
  },
  head: ({ loaderData }) => {
    const config = loaderData?.config;
    return {
      meta: [
        { title: `${config?.hero_heading || "Ideas, Insights & Updates"} — DIMISI Blog` },
        {
          name: "description",
          content:
            config?.hero_subline ||
            "Thoughts on building software, shipping products, and the technology shaping tomorrow.",
        },
        { property: "og:title", content: "Blog & Editorial — DIMISI Technologies" },
        {
          property: "og:description",
          content: "Essays on AI perception, autonomous agents, shaders, and cloud infrastructure.",
        },
        { property: "og:type", content: "website" },
      ],
    };
  },
  component: BlogPage,
});
