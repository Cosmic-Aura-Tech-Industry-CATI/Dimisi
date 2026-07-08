import type { Metadata } from "next";
import CaseStudiesPageClient from "./CaseStudiesPageClient";

export const metadata: Metadata = {
  title: "Case Studies — Dimisi Technologies",
  description: "See how Dimisi Technologies turns complex challenges into measurable outcomes across finance, SaaS, retail, and more.",
  openGraph: { title: "Case Studies — Dimisi Technologies", description: "Selected work and outcomes from Dimisi Technologies." },
};

export default function CaseStudiesPage() {
  return <CaseStudiesPageClient />;
}
