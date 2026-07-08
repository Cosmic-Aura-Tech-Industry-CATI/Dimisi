import type { Metadata } from "next";
import AboutPageClient from "./AboutPageClient";

export const metadata: Metadata = {
  title: "About — Dimisi Technologies",
  description:
    "Learn about Dimisi Technologies — our mission, vision, story, team, and culture of innovation.",
  openGraph: {
    title: "About — Dimisi Technologies",
    description:
      "The mission, vision, and people behind Dimisi Technologies.",
  },
};

export default function AboutPage() {
  return <AboutPageClient />;
}
