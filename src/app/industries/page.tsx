import type { Metadata } from "next";
import IndustriesPageClient from "./IndustriesPageClient";

export const metadata: Metadata = {
  title: "Industries — Dimisi Technologies",
  description: "Dimisi Technologies delivers solutions across education, healthcare, retail, e-commerce, startups, SaaS, enterprise, and finance.",
  openGraph: { title: "Industries — Dimisi Technologies", description: "Tailored technology solutions for every industry." },
};

export default function IndustriesPage() {
  return <IndustriesPageClient />;
}
