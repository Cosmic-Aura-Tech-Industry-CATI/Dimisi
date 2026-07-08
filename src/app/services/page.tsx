import type { Metadata } from "next";
import ServicesPageClient from "./ServicesPageClient";

export const metadata: Metadata = {
  title: "Services — Dimisi Technologies",
  description: "Full-spectrum technology services from Dimisi Technologies — web, mobile, AI, cloud, design, marketing, mentorship, and more.",
  openGraph: { title: "Services — Dimisi Technologies", description: "End-to-end technology services for startups and enterprises." },
};

export default function ServicesPage() {
  return <ServicesPageClient />;
}
