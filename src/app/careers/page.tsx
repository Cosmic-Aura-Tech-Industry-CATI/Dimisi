import type { Metadata } from "next";
import CareersPageClient from "./CareersPageClient";

export const metadata: Metadata = {
  title: "Careers — Dimisi Technologies",
  description:
    "Join Dimisi Technologies. Explore open roles in engineering, design, AI, marketing, and customer success.",
  openGraph: {
    title: "Careers — Dimisi Technologies",
    description:
      "Build the future with us — explore open positions at Dimisi Technologies.",
  },
};

export default function CareersPage() {
  return <CareersPageClient />;
}
