import type { Metadata } from "next";
import BlogPageClient from "./BlogPageClient";

export const metadata: Metadata = {
  title: "Blog — Dimisi Technologies",
  description:
    "Insights on web, mobile, AI, cloud, startups, and technology trends from the Dimisi Technologies team.",
  openGraph: {
    title: "Blog — Dimisi Technologies",
    description: "Ideas and insights from the Dimisi Technologies team.",
  },
};

export default function BlogPage() {
  return <BlogPageClient />;
}
